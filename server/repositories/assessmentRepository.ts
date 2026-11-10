/**
 * CropLens AI - Assessment Repository
 * Implements strict tenant-isolated Firestore persistence:
 * Path: users/{uid}/assessments/{assessmentId}
 * Subcollection: users/{uid}/assessments/{assessmentId}/images/{imageId}
 */

import { getFirebaseAdmin } from '../firebase/admin';
import { AssessmentRecord, AssessmentImage } from '../../src/types';
import { QueryDocumentSnapshot, DocumentSnapshot, FieldValue } from 'firebase-admin/firestore';

// In-memory fallback if Firestore credentials are not configured in local environment
const localAssessmentStore = new Map<string, AssessmentRecord>();

export class AssessmentRepository {
  private getDb() {
    return getFirebaseAdmin().db;
  }

  async createAssessment(assessment: AssessmentRecord): Promise<AssessmentRecord> {
    const db = this.getDb();
    if (db) {
      try {
        const userAssessmentRef = db
          .collection('users')
          .doc(assessment.userId)
          .collection('assessments')
          .doc(assessment.assessmentId);

        // Store primary assessment document (excluding raw images array to prevent document size bloat)
        const { images, ...assessmentDocData } = assessment;
        await userAssessmentRef.set({
          ...assessmentDocData,
          createdAtServer: FieldValue.serverTimestamp(),
          updatedAtServer: FieldValue.serverTimestamp(),
        });

        // Store each image as a subcollection document
        const imagesCollectionRef = userAssessmentRef.collection('images');
        const batch = db.batch();
        for (const img of images) {
          const imgDocRef = imagesCollectionRef.doc(img.imageId);
          batch.set(imgDocRef, img);
        }
        await batch.commit();
        console.log(`[AssessmentRepository] Saved assessment ${assessment.assessmentId} to Firestore.`);
      } catch (err) {
        console.warn(`[AssessmentRepository] Firestore write error for ${assessment.assessmentId}:`, err);
      }
    }

    // Always keep in local fallback store
    localAssessmentStore.set(assessment.assessmentId, assessment);
    return assessment;
  }

  async getAssessment(
    assessmentId: string,
    requestingUid: string,
    isAdmin = false
  ): Promise<AssessmentRecord | null> {
    const db = this.getDb();
    if (db) {
      try {
        if (isAdmin) {
          // Admin can query collectionGroup to access assessment across users
          const groupQuery = await db
            .collectionGroup('assessments')
            .where('assessmentId', '==', assessmentId)
            .limit(1)
            .get();

          if (!groupQuery.empty) {
            const doc: DocumentSnapshot = groupQuery.docs[0];
            const data = doc.data() as AssessmentRecord;
            // Fetch images subcollection
            const imagesSnap = await doc.ref.collection('images').get();
            const images = imagesSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as AssessmentImage);
            return { ...data, images };
          }
        } else {
          const docRef = db
            .collection('users')
            .doc(requestingUid)
            .collection('assessments')
            .doc(assessmentId);
          const doc = await docRef.get();
          if (doc.exists) {
            const data = doc.data() as AssessmentRecord;
            const imagesSnap = await docRef.collection('images').get();
            const images = imagesSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as AssessmentImage);
            return { ...data, images };
          }
        }
      } catch (err) {
        console.warn(`[AssessmentRepository] Firestore query error for ${assessmentId}:`, err);
      }
    }

    // Local fallback check
    const local = localAssessmentStore.get(assessmentId);
    if (!local) return null;
    if (local.userId !== requestingUid && !isAdmin) {
      return null;
    }
    return local;
  }

  async listAssessmentsForUser(userId: string): Promise<AssessmentRecord[]> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db
          .collection('users')
          .doc(userId)
          .collection('assessments')
          .orderBy('createdAt', 'desc')
          .get();

        const results: AssessmentRecord[] = [];
        for (const doc of snapshot.docs) {
          const data = doc.data() as AssessmentRecord;
          const imagesSnap = await doc.ref.collection('images').get();
          const images = imagesSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as AssessmentImage);
          results.push({ ...data, images });
        }
        return results;
      } catch (err) {
        console.warn(`[AssessmentRepository] Firestore list error for ${userId}:`, err);
      }
    }

    // Local fallback
    const list: AssessmentRecord[] = [];
    for (const asm of localAssessmentStore.values()) {
      if (asm.userId === userId) {
        list.push(asm);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteAssessment(
    assessmentId: string,
    requestingUid: string,
    isAdmin = false
  ): Promise<{ success: boolean; imagePaths: string[] }> {
    const existing = await this.getAssessment(assessmentId, requestingUid, isAdmin);
    if (!existing) {
      return { success: false, imagePaths: [] };
    }

    const imagePaths = existing.images.map((img) => img.storagePath).filter(Boolean);

    const db = this.getDb();
    if (db) {
      try {
        const assessmentRef = db
          .collection('users')
          .doc(existing.userId)
          .collection('assessments')
          .doc(assessmentId);

        // Delete images subcollection
        const imagesSnap = await assessmentRef.collection('images').get();
        const batch = db.batch();
        imagesSnap.docs.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));
        batch.delete(assessmentRef);
        await batch.commit();
      } catch (err) {
        console.warn(`[AssessmentRepository] Firestore delete error for ${assessmentId}:`, err);
      }
    }

    localAssessmentStore.delete(assessmentId);
    return { success: true, imagePaths };
  }

  async getGlobalAssessmentStats(): Promise<{
    totalAssessments: number;
    conditionDistribution: Record<string, number>;
    recentAssessments: Array<{
      assessmentId: string;
      userId: string;
      condition: string;
      category: string;
      district?: string;
      createdAt: string;
    }>;
  }> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db.collectionGroup('assessments').get();
        const distribution: Record<string, number> = {};
        const all: AssessmentRecord[] = [];

        snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
          const asm = doc.data() as AssessmentRecord;
          all.push(asm);
          const cid = asm.primaryCondition?.id || 'UNKNOWN';
          distribution[cid] = (distribution[cid] || 0) + 1;
        });

        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
          totalAssessments: all.length,
          conditionDistribution: distribution,
          recentAssessments: all.slice(0, 5).map((a) => ({
            assessmentId: a.assessmentId,
            userId: a.userId,
            condition: a.primaryCondition?.name || a.primaryCondition?.id || 'Unknown',
            category: a.primaryCondition?.category || 'unclear',
            district: a.district,
            createdAt: a.createdAt,
          })),
        };
      } catch (err) {
        console.warn('[AssessmentRepository] Error querying collectionGroup assessments:', err);
      }
    }

    // Local fallback
    const distribution: Record<string, number> = {};
    const all = Array.from(localAssessmentStore.values());
    for (const asm of all) {
      const cid = asm.primaryCondition?.id || 'UNKNOWN';
      distribution[cid] = (distribution[cid] || 0) + 1;
    }

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      totalAssessments: all.length,
      conditionDistribution: distribution,
      recentAssessments: all.slice(0, 5).map((a) => ({
        assessmentId: a.assessmentId,
        userId: a.userId,
        condition: a.primaryCondition?.name || a.primaryCondition?.id || 'Unknown',
        category: a.primaryCondition?.category || 'unclear',
        district: a.district,
        createdAt: a.createdAt,
      })),
    };
  }
}

export const assessmentRepository = new AssessmentRepository();

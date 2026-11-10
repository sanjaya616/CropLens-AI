/**
 * CropLens AI - Assessment Repository
 * Implements strict tenant-isolated Cloud Firestore persistence:
 * Document: users/{uid}/assessments/{assessmentId}
 * Subcollection: users/{uid}/assessments/{assessmentId}/images/{imageId}
 */

import { getFirebaseAdmin } from '../firebase/admin';
import { AssessmentRecord, AssessmentImage } from '../../src/types';
import { QueryDocumentSnapshot, DocumentSnapshot, FieldValue } from 'firebase-admin/firestore';

export class AssessmentRepository {
  private getDb() {
    const db = getFirebaseAdmin().db;
    if (!db) {
      throw new Error(
        'Cloud Firestore database is not initialized on the server. Please check FIREBASE_PROJECT_ID configuration.'
      );
    }
    return db;
  }

  async createAssessment(assessment: AssessmentRecord): Promise<AssessmentRecord> {
    const db = this.getDb();
    const userAssessmentRef = db
      .collection('users')
      .doc(assessment.userId)
      .collection('assessments')
      .doc(assessment.assessmentId);

    const { images, ...assessmentDocData } = assessment;

    try {
      const batch = db.batch();

      // Store primary assessment document with server timestamps
      batch.set(userAssessmentRef, {
        ...assessmentDocData,
        createdAtServer: FieldValue.serverTimestamp(),
        updatedAtServer: FieldValue.serverTimestamp(),
      });

      // Store image metadata inside nested subcollection
      const imagesCollectionRef = userAssessmentRef.collection('images');
      for (const img of images) {
        const imgDocRef = imagesCollectionRef.doc(img.imageId);
        batch.set(imgDocRef, {
          ...img,
          createdAtServer: FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(`[AssessmentRepository] Saved assessment ${assessment.assessmentId} to Firestore.`);
      return assessment;
    } catch (err: unknown) {
      console.error(`[AssessmentRepository] Firestore transaction failed for ${assessment.assessmentId}:`, err);
      throw new Error(
        `Database persistence failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async getAssessment(
    assessmentId: string,
    requestingUid: string,
    isAdmin = false
  ): Promise<AssessmentRecord | null> {
    const db = this.getDb();

    try {
      if (isAdmin) {
        // Administrator queries collectionGroup across all plantations
        const groupQuery = await db
          .collectionGroup('assessments')
          .where('assessmentId', '==', assessmentId)
          .limit(1)
          .get();

        if (groupQuery.empty) {
          return null;
        }

        const doc: DocumentSnapshot = groupQuery.docs[0];
        const data = doc.data() as AssessmentRecord;
        const imagesSnap = await doc.ref.collection('images').get();
        const images = imagesSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as AssessmentImage);
        return { ...data, images };
      }

      // Farmer queries their own tenant partition strictly
      const docRef = db
        .collection('users')
        .doc(requestingUid)
        .collection('assessments')
        .doc(assessmentId);

      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as AssessmentRecord;
      const imagesSnap = await docRef.collection('images').get();
      const images = imagesSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as AssessmentImage);
      return { ...data, images };
    } catch (err: unknown) {
      console.error(`[AssessmentRepository] Firestore query error for ${assessmentId}:`, err);
      throw new Error(`Failed to retrieve assessment: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async listAssessmentsForUser(userId: string): Promise<AssessmentRecord[]> {
    const db = this.getDb();

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
    } catch (err: unknown) {
      console.error(`[AssessmentRepository] Firestore list error for user ${userId}:`, err);
      throw new Error(`Failed to list user assessments: ${err instanceof Error ? err.message : String(err)}`);
    }
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

    try {
      const assessmentRef = db
        .collection('users')
        .doc(existing.userId)
        .collection('assessments')
        .doc(assessmentId);

      const imagesSnap = await assessmentRef.collection('images').get();
      const batch = db.batch();

      imagesSnap.docs.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));
      batch.delete(assessmentRef);
      await batch.commit();

      console.log(`[AssessmentRepository] Deleted assessment ${assessmentId} from Firestore.`);
      return { success: true, imagePaths };
    } catch (err: unknown) {
      console.error(`[AssessmentRepository] Firestore delete error for ${assessmentId}:`, err);
      throw new Error(`Failed to delete assessment record: ${err instanceof Error ? err.message : String(err)}`);
    }
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
    } catch (err: unknown) {
      console.error('[AssessmentRepository] Error querying collectionGroup assessments:', err);
      return {
        totalAssessments: 0,
        conditionDistribution: {},
        recentAssessments: [],
      };
    }
  }
}

export const assessmentRepository = new AssessmentRepository();

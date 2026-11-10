import { getFirebaseAdmin } from '../firebase/admin';
import { UserFeedback } from '../../src/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

const localFeedbackStore: UserFeedback[] = [];

export class FeedbackRepository {
  private getDb() {
    return getFirebaseAdmin().db;
  }

  async addFeedback(feedback: UserFeedback): Promise<UserFeedback> {
    const db = this.getDb();
    if (db) {
      try {
        await db.collection('feedback').doc(feedback.feedbackId).set({
          ...feedback,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn(`[FeedbackRepository] Firestore write error for ${feedback.feedbackId}:`, err);
      }
    }

    localFeedbackStore.unshift(feedback);
    return feedback;
  }

  async listFeedback(): Promise<UserFeedback[]> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db.collection('feedback').orderBy('createdAt', 'desc').limit(50).get();
        if (!snapshot.empty) {
          return snapshot.docs.map((d: QueryDocumentSnapshot) => d.data() as UserFeedback);
        }
      } catch (err) {
        console.warn('[FeedbackRepository] Firestore list error:', err);
      }
    }
    return localFeedbackStore;
  }

  async countFeedback(): Promise<number> {
    const db = this.getDb();
    if (db) {
      try {
        const countSnap = await db.collection('feedback').count().get();
        return countSnap.data().count;
      } catch {
        const snap = await db.collection('feedback').get();
        return snap.size;
      }
    }
    return localFeedbackStore.length;
  }
}

export const feedbackRepository = new FeedbackRepository();

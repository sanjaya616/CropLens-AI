import { getFirebaseAdmin } from '../firebase/admin';
import { VerifiedGuidance } from '../../src/types';
import { VERIFIED_CONDITIONS_CATALOG } from '../../src/constants/conditions';
import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';

const localConditionStore = new Map<string, VerifiedGuidance>();

// Initialize default condition catalog with PENDING_REVIEW status (strictly per Priority 6)
for (const [id, guidance] of Object.entries(VERIFIED_CONDITIONS_CATALOG)) {
  localConditionStore.set(id, {
    ...guidance,
    reviewStatus: 'pending_review', // Strictly moved to PENDING_REVIEW until explicitly approved by an administrator
  });
}

export class ConditionRepository {
  private getDb() {
    return getFirebaseAdmin().db;
  }

  async listConditions(onlyApproved = false): Promise<VerifiedGuidance[]> {
    const db = this.getDb();
    if (db) {
      try {
        let query: Query = db.collection('conditions');
        if (onlyApproved) {
          query = query.where('reviewStatus', '==', 'approved');
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          return snapshot.docs.map((d: QueryDocumentSnapshot) => d.data() as VerifiedGuidance);
        }
      } catch (err) {
        console.warn('[ConditionRepository] Firestore query error:', err);
      }
    }

    const all = Array.from(localConditionStore.values());
    if (onlyApproved) {
      return all.filter((c) => c.reviewStatus === 'approved');
    }
    return all;
  }

  async getConditionById(id: string, onlyApproved = false): Promise<VerifiedGuidance | null> {
    const db = this.getDb();
    if (db) {
      try {
        const doc = await db.collection('conditions').doc(id).get();
        if (doc.exists) {
          const data = doc.data() as VerifiedGuidance;
          if (!onlyApproved || data.reviewStatus === 'approved') {
            return data;
          }
          return null;
        }
      } catch (err) {
        console.warn(`[ConditionRepository] Firestore get error for ${id}:`, err);
      }
    }

    const local = localConditionStore.get(id);
    if (!local) return null;
    if (onlyApproved && local.reviewStatus !== 'approved') return null;
    return local;
  }

  async upsertCondition(guidance: VerifiedGuidance): Promise<VerifiedGuidance> {
    const db = this.getDb();
    const clean: VerifiedGuidance = {
      ...guidance,
      lastReviewed: new Date().toISOString().split('T')[0],
    };

    if (db) {
      try {
        await db.collection('conditions').doc(guidance.conditionId).set(clean, { merge: true });
      } catch (err) {
        console.warn(`[ConditionRepository] Firestore write error for ${guidance.conditionId}:`, err);
      }
    }

    localConditionStore.set(guidance.conditionId, clean);
    return clean;
  }

  async deleteCondition(conditionId: string): Promise<boolean> {
    const db = this.getDb();
    if (db) {
      try {
        await db.collection('conditions').doc(conditionId).delete();
      } catch (err) {
        console.warn(`[ConditionRepository] Firestore delete error for ${conditionId}:`, err);
      }
    }

    return localConditionStore.delete(conditionId);
  }
}

export const conditionRepository = new ConditionRepository();

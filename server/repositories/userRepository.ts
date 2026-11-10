import { getFirebaseAdmin } from '../firebase/admin';
import { UserProfile } from '../../src/types';

// In-memory cache/fallback store
const localUserStore = new Map<string, UserProfile>();

export class UserRepository {
  private getDb() {
    return getFirebaseAdmin().db;
  }

  async getUser(uid: string): Promise<UserProfile | null> {
    const db = this.getDb();
    if (db) {
      try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
          return doc.data() as UserProfile;
        }
        return null;
      } catch (err) {
        console.warn(`[UserRepository] Firestore read error for ${uid}, checking local store:`, err);
      }
    }
    return localUserStore.get(uid) || null;
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
        if (!snapshot.empty) {
          return snapshot.docs[0].data() as UserProfile;
        }
      } catch (err) {
        console.warn(`[UserRepository] Firestore query error for ${email}:`, err);
      }
    }
    for (const u of localUserStore.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async upsertUser(user: UserProfile): Promise<UserProfile> {
    const db = this.getDb();
    const cleanUser = {
      ...user,
      email: user.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await db.collection('users').doc(user.uid).set(cleanUser, { merge: true });
      } catch (err) {
        console.warn(`[UserRepository] Firestore write error for ${user.uid}:`, err);
      }
    }

    localUserStore.set(user.uid, cleanUser);
    return cleanUser;
  }

  async countUsers(): Promise<number> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db.collection('users').count().get();
        return snapshot.data().count;
      } catch {
        const snapshot = await db.collection('users').get();
        return snapshot.size;
      }
    }
    return localUserStore.size;
  }
}

export const userRepository = new UserRepository();

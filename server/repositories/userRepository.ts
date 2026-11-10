import { getFirebaseAdmin } from '../firebase/admin';
import { UserProfile } from '../../src/types';
import { FieldValue } from 'firebase-admin/firestore';

export class UserRepository {
  private getDb() {
    const db = getFirebaseAdmin().db;
    if (!db) {
      throw new Error(
        'Cloud Firestore database is not initialized on the server. Please check FIREBASE_PROJECT_ID configuration.'
      );
    }
    return db;
  }

  async getUser(uid: string): Promise<UserProfile | null> {
    const db = this.getDb();
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data() as UserProfile;
      }
      return null;
    } catch (err: unknown) {
      console.error(`[UserRepository] Firestore read error for user ${uid}:`, err);
      throw new Error(`Failed to load user profile: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const db = this.getDb();
    try {
      const snapshot = await db
        .collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as UserProfile;
      }
      return null;
    } catch (err: unknown) {
      console.error(`[UserRepository] Firestore query error for email ${email}:`, err);
      throw new Error(`Failed to query user by email: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async upsertUser(user: UserProfile): Promise<UserProfile> {
    const db = this.getDb();
    const cleanUser = {
      ...user,
      email: user.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
      updatedAtServer: FieldValue.serverTimestamp(),
    };

    try {
      await db.collection('users').doc(user.uid).set(cleanUser, { merge: true });
      return cleanUser;
    } catch (err: unknown) {
      console.error(`[UserRepository] Firestore write error for user ${user.uid}:`, err);
      throw new Error(`Failed to save user profile: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async countUsers(): Promise<number> {
    const db = this.getDb();
    try {
      const snapshot = await db.collection('users').count().get();
      return snapshot.data().count;
    } catch {
      const snapshot = await db.collection('users').get();
      return snapshot.size;
    }
  }
}

export const userRepository = new UserRepository();

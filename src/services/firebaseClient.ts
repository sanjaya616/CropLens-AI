/**
 * CropLens AI - Client Firebase Service
 * Handles Firebase Auth & Firestore client connection with graceful local adapter fallback.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY' &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization error, using local fallback:', err);
  }
}

export { auth, googleProvider };

export async function signInWithGoogleClient() {
  if (auth) {
    return signInWithPopup(auth, googleProvider);
  }
  // Local fallback mock user for immediate zero-config demo experience
  return {
    user: {
      uid: 'user-farmer-01',
      displayName: 'Sunil Wickramasinghe',
      email: 'farmer.sunil@croplens.lk',
      getIdToken: async () => 'demo-token-user-farmer-01',
    },
  };
}

export async function signInWithEmailClient(email: string, pass: string) {
  if (auth) {
    return signInWithEmailAndPassword(auth, email, pass);
  }
  // Local fallback demo authentication
  const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase() === 'sanjayalasnan327@gmail.com';
  const uid = isAdmin ? 'user-admin-01' : `user-${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`;
  return {
    user: {
      uid,
      displayName: isAdmin ? 'Sanjaya Lasnan (TRI Admin)' : email.split('@')[0],
      email,
      getIdToken: async () => `demo-token-${uid}`,
    },
  };
}

export async function registerWithEmailClient(email: string, pass: string, displayName?: string) {
  if (auth) {
    return createUserWithEmailAndPassword(auth, email, pass);
  }
  const uid = `user-${Date.now()}`;
  return {
    user: {
      uid,
      displayName: displayName || email.split('@')[0],
      email,
      getIdToken: async () => `demo-token-${uid}`,
    },
  };
}

export async function signOutClient() {
  if (auth) {
    return signOut(auth);
  }
}

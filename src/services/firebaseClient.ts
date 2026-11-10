/**
 * CropLens AI - Client Firebase Service
 * Direct client Firebase Authentication & Cloud Firestore connection.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAgp5tuTtkiGOak2_4uBQvEmvDbNJDmQQU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "croplens-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "croplens-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "croplens-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "407527902882",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:407527902882:web:f56b7bd2f8181f6ca951fb",
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
    console.warn('[Firebase Client] Initialization notice:', err);
  }
}

export { auth, googleProvider };

export async function signInWithGoogleClient() {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please configure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment.'
    );
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmailClient(email: string, pass: string) {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please configure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment.'
    );
  }
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmailClient(email: string, pass: string) {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please configure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment.'
    );
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  // Send email verification if supported
  try {
    await sendEmailVerification(userCredential.user);
  } catch (err) {
    console.warn('[Firebase Client] Notice sending verification email:', err);
  }
  return userCredential;
}

export async function resetPasswordClient(email: string) {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please configure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment.'
    );
  }
  return sendPasswordResetEmail(auth, email);
}

export async function signOutClient() {
  if (auth) {
    return signOut(auth);
  }
}

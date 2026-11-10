/**
 * CropLens AI - Firebase Admin SDK Initialization
 * Configures Firebase Admin Auth, Firestore, and Storage using modular v14 API.
 */

import { getApps, initializeApp, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import fs from 'fs';

let isInitialized = false;
let appInstance: App | null = null;
let firestoreDb: Firestore | null = null;
let authAdmin: Auth | null = null;
let storageBucket: ReturnType<Storage['bucket']> | null = null;

export function initializeFirebaseAdmin() {
  if (isInitialized && appInstance) {
    return {
      app: appInstance,
      db: firestoreDb,
      auth: authAdmin,
      bucket: storageBucket,
      isLive: true,
    };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      appInstance = existingApps[0];
      isInitialized = true;
      firestoreDb = getFirestore(appInstance);
      authAdmin = getAuth(appInstance);
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;
      const storage = getStorage(appInstance);
      storageBucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
      return { app: appInstance, db: firestoreDb, auth: authAdmin, bucket: storageBucket, isLive: true };
    }

    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'croplens-ai';
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || 'croplens-ai.firebasestorage.app';

    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      appInstance = initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id,
        storageBucket: bucketName || `${serviceAccount.project_id}.firebasestorage.app`,
      });
      console.log('[CropLens AI Firebase Admin] Initialized with Service Account JSON.');
    } else if (projectId) {
      try {
        // Use Application Default Credentials (e.g. on Google Cloud Run or GCP environment)
        appInstance = initializeApp({
          credential: applicationDefault(),
          projectId,
          storageBucket: bucketName || `${projectId}.firebasestorage.app`,
        });
        console.log(`[CropLens AI Firebase Admin] Initialized with Application Default Credentials for project: ${projectId}`);
      } catch (adcErr) {
        console.warn(
          `[CropLens AI Firebase Admin] ADC not present in local runtime (${adcErr instanceof Error ? adcErr.message : adcErr}). Operating in local repository fallback mode.`
        );
        return { app: null, db: null, auth: null, bucket: null, isLive: false };
      }
    } else {
      console.warn(
        '[CropLens AI Firebase Admin] Warning: Neither GOOGLE_APPLICATION_CREDENTIALS nor FIREBASE_PROJECT_ID configured. Operating in local repository fallback mode.'
      );
      return { app: null, db: null, auth: null, bucket: null, isLive: false };
    }

    isInitialized = true;
    firestoreDb = getFirestore(appInstance);
    authAdmin = getAuth(appInstance);
    const storage = getStorage(appInstance);
    storageBucket = bucketName ? storage.bucket(bucketName) : storage.bucket();

    return {
      app: appInstance,
      db: firestoreDb,
      auth: authAdmin,
      bucket: storageBucket,
      isLive: true,
    };
  } catch (error) {
    console.warn('[CropLens AI Firebase Admin] Initialization notice:', error instanceof Error ? error.message : error);
    return { app: null, db: null, auth: null, bucket: null, isLive: false };
  }
}

export const getFirebaseAdmin = () => initializeFirebaseAdmin();

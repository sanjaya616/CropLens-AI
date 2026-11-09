# CropLens AI - Production Deployment Guide

## 1. Google Cloud Run Deployment

CropLens AI is engineered to run seamlessly as a containerized Express + React application on Google Cloud Run:

### 1.1 Prerequisites
- Google Cloud Project with Cloud Run API and Artifact Registry enabled.
- Firebase Project provisioned for Firebase Authentication, Cloud Firestore, and Firebase Storage.
- Gemini API Key configured in Google Cloud Secret Manager or AI Studio environment.

### 1.2 Environment Variables
Configure the following environment variables in the Cloud Run service:

```bash
# Gemini Vision Model Configuration
GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"
GEMINI_MODEL="gemini-3.8-flash"

# Server Port
PORT=3000
NODE_ENV="production"

# Firebase Client Environment Variables
VITE_FIREBASE_API_KEY="<FIREBASE_WEB_API_KEY>"
VITE_FIREBASE_AUTH_DOMAIN="<PROJECT_ID>.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="<PROJECT_ID>"
VITE_FIREBASE_STORAGE_BUCKET="<PROJECT_ID>.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="<SENDER_ID>"
VITE_FIREBASE_APP_ID="<APP_ID>"

# Administrator Authorization (Comma-separated admin emails)
ADMIN_EMAILS="sanjayalasnan327@gmail.com,admin@croplens.lk"
```

### 1.3 Firebase Console Activation Steps
1. **Firebase Authentication**: Enable Google Sign-In and Email/Password providers in the Firebase Console under `Build > Authentication > Sign-in method`.
2. **Cloud Firestore**: Create a Firestore database in Native Mode. Deploy `firestore.rules` via Firebase CLI (`firebase deploy --only firestore:rules`).
3. **Firebase Storage**: If Firebase Storage is not already initialized, open `Build > Storage` in the Firebase Console and click **Get Started** in Production mode. Deploy `storage.rules` via Firebase CLI (`firebase deploy --only storage`).

### 1.4 Build & Container Run
```bash
# 1. Install dependencies
npm install

# 2. Compile frontend and check TypeScript
npm run build

# 3. Start production server
npm run start
```
The server will bind to `0.0.0.0:3000`, serving the compiled React frontend from `/dist` and mounting all authenticated `/api/*` endpoints.

# CropLens AI - Production Deployment Guide

## 1. Google Cloud Run Deployment

CropLens AI is engineered to run seamlessly as a containerized Express + React application on Google Cloud Run:

### 1.1 Prerequisites
- Google Cloud Project with Cloud Run API, Cloud Build, and Artifact Registry enabled.
- Firebase Project provisioned for Firebase Authentication, Cloud Firestore, and Firebase Storage.
- Gemini API Key configured in Google Cloud Secret Manager or AI Studio environment secrets.

### 1.2 Environment Variables
Configure the following environment variables in the Cloud Run service or `.env`:

```bash
# Gemini Vision Model Configuration
GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"
GEMINI_MODEL="gemini-3.8-flash"

# Server Port
PORT=3000
NODE_ENV="production"
APP_URL="https://croplens-ai-service-<hash>-uc.a.run.app"

# Firebase Client Environment Variables (Frontend Web SDK)
VITE_FIREBASE_API_KEY="<FIREBASE_WEB_API_KEY>"
VITE_FIREBASE_AUTH_DOMAIN="<PROJECT_ID>.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="<PROJECT_ID>"
VITE_FIREBASE_STORAGE_BUCKET="<PROJECT_ID>.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="<SENDER_ID>"
VITE_FIREBASE_APP_ID="<APP_ID>"

# Server-Side Firebase Admin Configuration
FIREBASE_PROJECT_ID="<PROJECT_ID>"
FIREBASE_STORAGE_BUCKET="<PROJECT_ID>.appspot.com"

# Administrator Authorization (Comma-separated authorized Firebase UIDs)
ADMIN_UIDS="<FIREBASE_USER_UID_1>,<FIREBASE_USER_UID_2>"
```

### 1.3 Firebase Console Activation Steps (Step-by-Step)
1. **Firebase Authentication**:
   - Open Firebase Console -> **Build** -> **Authentication** -> **Sign-in method**.
   - Enable **Email/Password** provider (enable email link optional).
   - Enable **Google** sign-in provider (select project support email).
   - In **Settings** -> **Authorized domains**, ensure your Cloud Run custom domain and `localhost` are listed.

2. **Cloud Firestore**:
   - Open Firebase Console -> **Build** -> **Firestore Database**.
   - Click **Create database**, choose **Production mode**, and select a region (e.g., `asia-south1` or `asia-southeast1`).
   - Deploy security rules via Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```
   - Deploy composite indexes:
     ```bash
     firebase deploy --only firestore:indexes
     ```

3. **Firebase Storage**:
   - Open Firebase Console -> **Build** -> **Storage**.
   - Click **Get Started** in Production mode.
   - Deploy storage security rules via Firebase CLI:
     ```bash
     firebase deploy --only storage
     ```

4. **Assigning Administrator Claims**:
   - To grant administrator access to a tea researcher or estate administrator, either:
     - Add their Firebase user UID to the `ADMIN_UIDS` environment variable in Cloud Run, OR
     - Set the custom claim `{ admin: true }` via the Firebase Admin SDK.

### 1.4 Build & Container Run
```bash
# 1. Install dependencies
npm install

# 2. Run automated validation tests
npm test

# 3. Compile frontend bundle
npm run build

# 4. Start production server
npm run start
```
The server binds to `0.0.0.0:3000`, serving the compiled React frontend from `/dist` and mounting all authenticated `/api/*` endpoints.

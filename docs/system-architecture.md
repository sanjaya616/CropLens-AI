# CropLens AI - System Architecture

## 1. High-Level Architecture Overview

CropLens AI is engineered as a full-stack web application designed for Google Cloud Run deployment:

```
[ Client Browser (React + TypeScript + Tailwind) ]
               │
               ▼
[ Node.js Express Application Server (server.ts) ]
    ├── Token Verification Middleware (requireAuth, requireAdmin)
    ├── Magic-Bytes Image Signature & Size Validator (validation.ts)
    ├── Multimodal Gemini Vision Gateway (geminiService.ts)
    │        └── Google Gemini API (gemini-3.8-flash)
    └── Data Store / Firestore Connector (db.ts)
             ├── Cloud Firestore (Metadata, Assessments, Knowledge)
             └── Cloud Storage (Private Leaf Photographs)
```

## 2. Component Layers

### 2.1 Frontend Presentation Layer (React SPA)
- **Framework**: React 19 + TypeScript on Vite.
- **Styling**: Tailwind CSS adhering to universal frontend design guidelines (forest green `#0e3820`, leaf green `#16a34a`, amber `#d97706`).
- **State & Context**: `AuthContext` managing user authentication, role switching for testing, and profile synchronization.
- **Navigation**: PushState-enabled client router supporting `/`, `/dashboard`, `/assessment/new`, `/assessment/:id`, `/conditions`, `/dataset`, and `/admin`.

### 2.2 Backend Application Layer (Express Server)
- **Runtime**: Node.js + Express with TypeScript execution (`tsx server.ts`).
- **Security Middleware**: Authenticated Bearer token extraction supporting Firebase ID tokens with server-side role validation.
- **Image Processing**: Validates buffer headers (JPEG, PNG, WebP) and handles base64 payload transfer up to 15MB.
- **AI Orchestrator**: Bridges grower image binaries and field context with Google GenAI SDK.

### 2.3 Emerging Technology Integrations
- **Multimodal AI**: Direct image part encoding via `GoogleGenAI.generateContent` with structured JSON schema constraints.
- **Firebase Authentication & Firestore**: Secure document hierarchy partitioned by user UID (`users/{uid}/assessments/{assessmentId}`).
- **Verified Guidance Repository**: Decoupled official knowledge store grounded in Tea Research Institute of Sri Lanka circulars.

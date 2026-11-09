# CropLens AI - Database Design & Data Models

## 1. Cloud Firestore Document Hierarchy

CropLens AI structures data to guarantee strict multi-tenant isolation where each grower's assessments and photographs remain private to their authenticated Firebase UID:

```
databases/(default)/documents
├── users/{userId}                                 # User Profiles
│   └── assessments/{assessmentId}                 # User's Private Leaf Assessments
│       └── images/{imageId}                       # Image Metadata
├── conditions/{conditionId}                       # TRI Verified Agricultural Guidance
└── feedback/{feedbackId}                          # User Evaluation Survey Feedback
```

## 2. Collection Schemas

### 2.1 Users Collection (`users/{userId}`)
```typescript
interface UserProfile {
  uid: string;                 // Firebase Auth UID
  name: string;                // User full name
  email: string;               // Registered email
  role: 'farmer' | 'admin';    // Role (admin validated on server)
  preferredLanguage: 'en' | 'si' | 'ta';
  district?: string;           // Primary planting district in Sri Lanka
  createdAt: string;           // ISO timestamp
}
```

### 2.2 Assessments Collection (`users/{userId}/assessments/{assessmentId}`)
```typescript
interface AssessmentRecord {
  assessmentId: string;
  userId: string;
  cropType: 'TEA';
  district?: string;
  plantationArea?: string;
  plantStage?: 'NURSERY' | 'YOUNG_TEA' | 'MATURE_BUSH' | 'PRUNED_BUSH' | 'UNKNOWN';
  symptomDescription?: string;
  symptomDuration?: string;
  affectedArea?: string;
  weatherConditions?: string;
  primaryCondition: {
    id: SupportedConditionId | SystemOutcomeId;
    name: string;
    category: 'disease' | 'pest' | 'healthy' | 'unclear';
    matchLevel: 'strong' | 'possible' | 'weak' | 'insufficient';
    confidenceDescription?: string;
  };
  alternativeConditions: Array<{
    id: ConditionId;
    name: string;
    category: ConditionCategory;
    matchLevel: MatchLevel;
    reasonForDoubt: string;
  }>;
  visualObservations: string[];
  possibleSymptoms: string[];
  contextConsiderations: string[];
  followUpQuestions: string[];
  unknownFactors: string[];
  photoQuality: {
    usable: boolean;
    problems: string[];
    retakeRecommended: boolean;
  };
  expertReviewRecommended: boolean;
  guidance?: VerifiedGuidance;
  guidanceIds: string[];
  disclaimer: string;
  images: Array<{
    imageId: string;
    storagePath: string;
    downloadUrl: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 Conditions Collection (`conditions/{conditionId}`)
```typescript
interface VerifiedGuidance {
  conditionId: ConditionId;
  name: string;
  category: 'disease' | 'pest' | 'healthy' | 'unclear';
  scientificName: string;
  visibleSymptoms: string[];
  additionalInformation: string;
  monitoringGuidance: string[];
  preventionInformation: string[];
  officialSourceTitle: string;
  officialSourceUrl: string;
  publicationDate?: string;
  lastReviewed: string;
  reviewStatus: 'approved' | 'pending_review' | 'archived';
  exampleImageUrl?: string;
}
```

### 2.4 Feedback Collection (`feedback/{feedbackId}`)
```typescript
interface UserFeedback {
  feedbackId: string;
  userId: string;
  userEmail?: string;
  assessmentId: string;
  conditionId: ConditionId;
  rating: number; // 1 to 5
  comments: string;
  createdAt: string;
}
```

## 3. Storage Architecture
Leaf photographs are stored in private Cloud Storage buckets under:
`users/{userId}/assessments/{assessmentId}/leaf-image-XX.jpg`
Direct Base64 binary strings are NEVER stored in Firestore documents.
Access rules require `request.auth.uid == userId`.

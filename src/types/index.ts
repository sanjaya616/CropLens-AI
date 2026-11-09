/**
 * CropLens AI - Core TypeScript Definitions
 * Centralized schema for conditions, assessments, users, and AI responses.
 */

// Exactly the 6 dataset condition categories
export type SupportedConditionId =
  | 'ALGAL_LEAF_SPOT'
  | 'BLACK_BLIGHT'
  | 'BLISTER_BLIGHT'
  | 'GRAY_BLIGHT'
  | 'SPIDER_MITES'
  | 'HEALTHY';

// System outcome categories
export type SystemOutcomeId =
  | 'UNKNOWN'
  | 'NOT_TEA'
  | 'POOR_IMAGE';

export type ConditionId = SupportedConditionId | SystemOutcomeId;

export type ConditionCategory = 'disease' | 'pest' | 'healthy' | 'unclear';

// Qualitative match levels (no uncalibrated numerical percentages)
export type MatchLevel =
  | 'strong'
  | 'possible'
  | 'weak'
  | 'insufficient';

export type UserRole = 'farmer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  preferredLanguage: 'en' | 'si' | 'ta';
  district?: string;
  createdAt: string;
}

export type PlantStage = 'NURSERY' | 'YOUNG_TEA' | 'MATURE_BUSH' | 'PRUNED_BUSH' | 'UNKNOWN';

export interface FieldContext {
  district?: string;
  plantationArea?: string;
  plantStage?: PlantStage;
  symptomDuration?: string;
  affectedArea?: string; // number of affected leaves or bushes
  symptomDescription?: string;
  weatherConditions?: string;
}

export interface PhotoQualityAssessment {
  usable: boolean;
  problems: string[];
  retakeRecommended: boolean;
}

export interface PrimaryConditionAssessment {
  id: ConditionId;
  name: string;
  category: ConditionCategory;
  matchLevel: MatchLevel;
  confidenceDescription?: string;
}

export interface AlternativeConditionAssessment {
  id: ConditionId;
  name: string;
  category: ConditionCategory;
  matchLevel: MatchLevel;
  reasonForDoubt: string;
}

export interface GeminiAnalysisResponse {
  cropSupported: boolean;
  isTeaLeaf: boolean;
  imageQuality: 'good' | 'acceptable' | 'poor';
  primaryCondition: PrimaryConditionAssessment;
  alternativeConditions: AlternativeConditionAssessment[];
  visualObservations: string[];
  possibleSymptoms: string[];
  contextConsiderations: string[];
  followUpQuestions: string[];
  unknownFactors: string[];
  photoQuality: PhotoQualityAssessment;
  expertReviewRecommended: boolean;
  guidanceIds: string[];
  disclaimer: string;
}

export interface VerifiedGuidance {
  conditionId: ConditionId;
  name: string;
  category: ConditionCategory;
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

export interface AssessmentImage {
  imageId: string;
  storagePath: string;
  downloadUrl: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface AssessmentRecord {
  assessmentId: string;
  userId: string;
  cropType: 'TEA';
  district?: string;
  plantationArea?: string;
  plantStage?: PlantStage;
  symptomDescription?: string;
  symptomDuration?: string;
  affectedArea?: string;
  weatherConditions?: string;
  primaryCondition: PrimaryConditionAssessment;
  alternativeConditions: AlternativeConditionAssessment[];
  visualObservations: string[];
  possibleSymptoms: string[];
  contextConsiderations: string[];
  followUpQuestions: string[];
  unknownFactors: string[];
  photoQuality: PhotoQualityAssessment;
  expertReviewRecommended: boolean;
  guidance?: VerifiedGuidance;
  guidanceIds: string[];
  disclaimer: string;
  images: AssessmentImage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserFeedback {
  feedbackId: string;
  userId: string;
  userEmail?: string;
  assessmentId: string;
  conditionId: ConditionId;
  rating: number; // 1 to 5
  comments: string;
  createdAt: string;
}

export interface DatasetSample {
  id: string;
  groundTruthLabel: SupportedConditionId;
  commonName: string;
  category: ConditionCategory;
  scientificName: string;
  imageUrl: string;
  sourceDataset: string;
  description: string;
}

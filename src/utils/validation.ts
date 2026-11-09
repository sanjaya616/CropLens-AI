import {
  ConditionId,
  ConditionCategory,
  MatchLevel,
  GeminiAnalysisResponse,
  PrimaryConditionAssessment,
  AlternativeConditionAssessment,
} from '../types';

export const ALLOWED_CONDITION_IDS: readonly ConditionId[] = [
  'ALGAL_LEAF_SPOT',
  'BLACK_BLIGHT',
  'BLISTER_BLIGHT',
  'GRAY_BLIGHT',
  'SPIDER_MITES',
  'HEALTHY',
  'UNKNOWN',
  'NOT_TEA',
  'POOR_IMAGE',
] as const;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates browser/uploaded image file constraints (Max 5MB, JPG/PNG/WebP).
 */
export function validateImageFile(file: { size: number; type: string; name?: string }): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No image file provided' };
  }

  const normalizedType = file.type.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalizedType)) {
    // Check extension fallback if MIME is generic
    const ext = file.name?.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!ext || !allowedExts.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file format (${file.type || ext}). Only JPG, JPEG, PNG, and WebP are supported.`,
      };
    }
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Image size (${sizeMb} MB) exceeds maximum allowed limit of 5.0 MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Image file is empty (0 bytes).' };
  }

  return { valid: true };
}

/**
 * Validates real magic numbers / binary header signatures of the uploaded buffer.
 * Rejects disguised or corrupted binaries.
 */
export function validateImageSignature(bytes: Uint8Array): { valid: boolean; mimeType?: string; error?: string } {
  if (!bytes || bytes.length < 12) {
    return { valid: false, error: 'Image buffer too small or corrupted' };
  }

  // JPEG / JPG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png' };
  }

  // WebP: RIFF ... WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  return {
    valid: false,
    error: 'Invalid file signature. File header does not match a verified JPEG, PNG, or WebP image.',
  };
}

/**
 * Resolves the strict biological category for a condition ID.
 * Enforces: Spider Mites is a PEST, not a disease!
 */
export function getCategoryForConditionId(id: ConditionId): ConditionCategory {
  if (id === 'SPIDER_MITES') return 'pest';
  if (id === 'HEALTHY') return 'healthy';
  if (id === 'UNKNOWN' || id === 'NOT_TEA' || id === 'POOR_IMAGE') return 'unclear';
  return 'disease';
}

/**
 * Resolves canonical human-readable name for a condition ID.
 */
export function getDisplayNameForConditionId(id: ConditionId): string {
  switch (id) {
    case 'ALGAL_LEAF_SPOT':
      return 'Algal Leaf Spot';
    case 'BLACK_BLIGHT':
      return 'Black Blight (Black Rot)';
    case 'BLISTER_BLIGHT':
      return 'Blister Blight';
    case 'GRAY_BLIGHT':
      return 'Gray Blight';
    case 'SPIDER_MITES':
      return 'Spider Mites (Pest)';
    case 'HEALTHY':
      return 'Healthy Tea Leaf';
    case 'NOT_TEA':
      return 'Non-Tea Specimen Detected';
    case 'POOR_IMAGE':
      return 'Unusable Photograph Quality';
    case 'UNKNOWN':
    default:
      return 'Inconclusive / Mixed Symptoms';
  }
}

/**
 * Validates and normalizes qualitative match level.
 */
export function normalizeMatchLevel(level: unknown): MatchLevel {
  if (typeof level === 'string') {
    const l = level.toLowerCase();
    if (l.includes('strong')) return 'strong';
    if (l.includes('possible')) return 'possible';
    if (l.includes('weak')) return 'weak';
    if (l.includes('insufficient')) return 'insufficient';
  }
  return 'possible';
}

/**
 * Validates and sanitizes AI JSON output against strict schema and allowed IDs.
 * Rejects hallucinated IDs or fabricated percentages.
 */
export function validateAndSanitizeAiResponse(raw: unknown): GeminiAnalysisResponse {
  const fallbackResponse: GeminiAnalysisResponse = {
    cropSupported: true,
    isTeaLeaf: true,
    imageQuality: 'good',
    primaryCondition: {
      id: 'UNKNOWN',
      name: 'Inconclusive / Mixed Symptoms',
      category: 'unclear',
      matchLevel: 'insufficient',
      confidenceDescription: 'Insufficient evidence to confirm specific category.',
    },
    alternativeConditions: [],
    visualObservations: ['Visual inspection did not detect conclusive pathogen characteristics.'],
    possibleSymptoms: ['Non-specific leaf appearance'],
    contextConsiderations: ['User field context reviewed.'],
    followUpQuestions: ['Has this symptom spread across neighboring tea bushes?'],
    unknownFactors: ['Microscopic fungal structures cannot be confirmed from photo alone.'],
    photoQuality: {
      usable: true,
      problems: [],
      retakeRecommended: false,
    },
    expertReviewRecommended: true,
    guidanceIds: ['UNKNOWN'],
    disclaimer: 'Preliminary AI screening only. This is not a confirmed laboratory diagnosis.',
  };

  if (!raw || typeof raw !== 'object') {
    return fallbackResponse;
  }

  const obj = raw as Record<string, unknown>;

  // Check Primary Condition ID
  let conditionId: ConditionId = 'UNKNOWN';
  if (obj.primaryCondition && typeof obj.primaryCondition === 'object') {
    const rawId = (obj.primaryCondition as Record<string, unknown>).id;
    if (typeof rawId === 'string' && ALLOWED_CONDITION_IDS.includes(rawId as ConditionId)) {
      conditionId = rawId as ConditionId;
    }
  } else if (typeof obj.conditionId === 'string' && ALLOWED_CONDITION_IDS.includes(obj.conditionId as ConditionId)) {
    conditionId = obj.conditionId as ConditionId;
  }

  // Strictly enforce category: SPIDER_MITES must be 'pest', HEALTHY must be 'healthy'
  const primaryCategory = getCategoryForConditionId(conditionId);
  const primaryName = getDisplayNameForConditionId(conditionId);

  const rawMatchLevel =
    obj.primaryCondition && typeof obj.primaryCondition === 'object'
      ? (obj.primaryCondition as Record<string, unknown>).matchLevel
      : 'possible';
  const matchLevel = normalizeMatchLevel(rawMatchLevel);

  const primaryCondition: PrimaryConditionAssessment = {
    id: conditionId,
    name: primaryName,
    category: primaryCategory,
    matchLevel,
    confidenceDescription:
      matchLevel === 'strong'
        ? 'Strong visual similarity observed for characteristic symptoms.'
        : matchLevel === 'possible'
        ? 'Possible visual similarity noted; secondary factors present.'
        : matchLevel === 'weak'
        ? 'Weak visual evidence; atypical manifestation.'
        : 'Insufficient visual evidence for positive confirmation.',
  };

  // Alternative conditions
  const rawAlternatives = Array.isArray(obj.alternativeConditions) ? obj.alternativeConditions : [];
  const alternativeConditions: AlternativeConditionAssessment[] = [];

  for (const item of rawAlternatives) {
    if (item && typeof item === 'object') {
      const altId = item.id;
      if (typeof altId === 'string' && ALLOWED_CONDITION_IDS.includes(altId as ConditionId) && altId !== conditionId) {
        alternativeConditions.push({
          id: altId as ConditionId,
          name: getDisplayNameForConditionId(altId as ConditionId),
          category: getCategoryForConditionId(altId as ConditionId),
          matchLevel: normalizeMatchLevel(item.matchLevel || 'weak'),
          reasonForDoubt: typeof item.reasonForDoubt === 'string' ? item.reasonForDoubt : 'Similar foliar necrosis pattern.',
        });
      }
    }
  }

  // Clean arrays of strings
  const toStringArray = (val: unknown, fallback: string[]): string[] => {
    if (Array.isArray(val) && val.length > 0) {
      return val.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    return fallback;
  };

  const visualObservations = toStringArray(obj.visualObservations, ['Observed leaf blade and visible coloration.']);
  const possibleSymptoms = toStringArray(obj.possibleSymptoms, ['Symptom patterns inspected.']);
  const contextConsiderations = toStringArray(obj.contextConsiderations, ['Field location and weather conditions evaluated.']);
  const followUpQuestions = toStringArray(obj.followUpQuestions, [
    'How many bushes are affected in this immediate block?',
    'Did symptoms appear following recent monsoon rain or dry spells?',
  ]);
  const unknownFactors = toStringArray(obj.unknownFactors, [
    'Microscopic spore morphology cannot be determined from photograph.',
    'Underlying soil root pathology cannot be assessed from foliar imagery.',
  ]);

  // Photo quality check
  const rawPhotoQuality = (obj.photoQuality && typeof obj.photoQuality === 'object' ? obj.photoQuality : {}) as Record<
    string,
    unknown
  >;
  const photoUsable = conditionId !== 'POOR_IMAGE' && rawPhotoQuality.usable !== false;
  const problems = Array.isArray(rawPhotoQuality.problems)
    ? rawPhotoQuality.problems.filter((p): p is string => typeof p === 'string')
    : [];

  const isTeaLeaf = conditionId !== 'NOT_TEA';

  return {
    cropSupported: isTeaLeaf,
    isTeaLeaf,
    imageQuality: conditionId === 'POOR_IMAGE' ? 'poor' : photoUsable ? 'good' : 'acceptable',
    primaryCondition,
    alternativeConditions,
    visualObservations,
    possibleSymptoms,
    contextConsiderations,
    followUpQuestions,
    unknownFactors,
    photoQuality: {
      usable: photoUsable,
      problems,
      retakeRecommended: !photoUsable || conditionId === 'POOR_IMAGE',
    },
    expertReviewRecommended: true,
    guidanceIds: [conditionId],
    disclaimer:
      'Preliminary AI screening only. This is not a confirmed plant disease diagnosis. Consult Tea Research Institute (TRI) extension officers before taking management actions.',
  };
}

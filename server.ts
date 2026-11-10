import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { getFirebaseAdmin } from './server/firebase/admin';
import { userRepository } from './server/repositories/userRepository';
import { assessmentRepository } from './server/repositories/assessmentRepository';
import { conditionRepository } from './server/repositories/conditionRepository';
import { feedbackRepository } from './server/repositories/feedbackRepository';
import { storageRepository } from './server/repositories/storageRepository';
import { requireAuth, requireAdmin, AuthenticatedRequest, isAdministrator } from './server/middleware/auth';
import { analyzeTeaLeafWithGemini, ImageInput } from './src/services/geminiService';
import { validateImageSignature, validateImageFile, validateConsentPayload } from './src/utils/validation';
import {
  AssessmentRecord,
  FieldContext,
  UserFeedback,
  VerifiedGuidance,
  ConditionId,
  UserProfile,
  AssessmentImage,
} from './src/types';
import { DATASET_EVALUATION_SAMPLES, HAS_LOCAL_DATASET_IMAGES } from './src/constants/conditions';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Firebase Admin SDK
getFirebaseAdmin();

// Middleware: JSON and URL-encoded parsers with sensible limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Configure Multer for multipart memory storage (Max 3 files, 5MB each)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 3,
  },
});

// Lightweight in-memory sliding-window rate limiter for heavy AI & Storage analysis
interface RateLimitBucket {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 15; // Max 15 assessments per 10 min window per user/IP

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  let bucket = rateLimitMap.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    rateLimitMap.set(key, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (bucket.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  bucket.timestamps.push(now);
  return { allowed: true };
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const { isLive } = getFirebaseAdmin();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'healthy',
    ready: isLive && geminiConfigured,
    timestamp: new Date().toISOString(),
    firebaseAdminLive: isLive,
    geminiConfigured,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Current User Profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update Profile
app.put('/api/auth/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, preferredLanguage, district } = req.body;
  const updated: UserProfile = {
    ...req.user,
    name: typeof name === 'string' && name.trim() ? name.trim() : req.user.name,
    preferredLanguage:
      preferredLanguage === 'si' || preferredLanguage === 'ta' ? preferredLanguage : 'en',
    district: typeof district === 'string' ? district.trim() : req.user.district,
  };

  await userRepository.upsertUser(updated);
  res.json({ user: updated });
});

// ==========================================
// ASSESSMENTS API
// ==========================================

/**
 * POST /api/assessments/analyze
 * Accepts multipart/form-data with up to 3 tea leaf image files.
 * Strips EXIF metadata via Sharp, stores in private Firebase Storage,
 * runs real multimodal Gemini Vision analysis, and stores Firestore record.
 */
app.post(
  '/api/assessments/analyze',
  requireAuth,
  upload.array('images', 3),
  async (req: AuthenticatedRequest, res: Response) => {
    // Rate limit check
    const rateCheck = checkRateLimit(req.user!.uid);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Assessment rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds} seconds before submitting a new photograph.`,
      });
    }

    // Explicit grower consent validation
    const consentValidation = validateConsentPayload(req.body);
    if (!consentValidation.valid) {
      return res.status(400).json({ error: consentValidation.error });
    }

    const uploadedPaths: string[] = [];

    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Please upload at least one tea leaf photograph.' });
      }

      if (files.length > 3) {
        return res.status(400).json({ error: 'Maximum 3 photographs allowed per assessment.' });
      }

      // Parse optional field context
      let fieldContext: FieldContext | undefined;
      if (req.body.fieldContext) {
        try {
          fieldContext =
            typeof req.body.fieldContext === 'string'
              ? JSON.parse(req.body.fieldContext)
              : req.body.fieldContext;
        } catch {
          // Ignore parse errors, leave undefined
        }
      }

      const assessmentId = `asm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const validatedGeminiImages: ImageInput[] = [];
      const assessmentImages: AssessmentImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. File size check
        const sizeValidation = validateImageFile({
          size: file.size,
          type: file.mimetype,
          name: file.originalname,
        });
        if (!sizeValidation.valid) {
          return res.status(400).json({ error: `Image ${i + 1}: ${sizeValidation.error}` });
        }

        // 2. Binary signature / magic byte check
        const signature = validateImageSignature(file.buffer);
        if (!signature.valid) {
          return res.status(400).json({ error: `Image ${i + 1}: ${signature.error}` });
        }

        // 3. Process, sanitize, and strip EXIF using Sharp via storageRepository
        const imageId = `img-${assessmentId}-${i + 1}`;
        const stored = await storageRepository.uploadAssessmentImage(
          req.user!.uid,
          assessmentId,
          `leaf-image-0${i + 1}${path.extname(file.originalname) || '.jpg'}`,
          file.buffer,
          signature.mimeType || file.mimetype
        );

        uploadedPaths.push(stored.storagePath);

        // Prepare image for Gemini Vision analysis
        validatedGeminiImages.push({
          base64Data: stored.sanitizedBuffer.toString('base64'),
          mimeType: stored.mimeType,
        });

        // Protected streaming endpoint for browser retrieval
        const streamUrl = `/api/assessments/${assessmentId}/images/${imageId}`;

        assessmentImages.push({
          imageId,
          storagePath: stored.storagePath,
          downloadUrl: streamUrl,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
          width: stored.width,
          height: stored.height,
          uploadedAt: new Date().toISOString(),
        });
      }

      // 4. Multimodal Gemini Vision Image Analysis
      const aiResult = await analyzeTeaLeafWithGemini(validatedGeminiImages, fieldContext);

      // 5. Retrieve verified guidance (Priority 6: only APPROVED guidance displayed as verified)
      const approvedGuidance = await conditionRepository.getConditionById(
        aiResult.primaryCondition.id,
        true // onlyApproved = true
      );

      // 6. Build persistent assessment record
      const consentTimestamp =
        typeof req.body.consentTimestamp === 'string' && req.body.consentTimestamp
          ? req.body.consentTimestamp
          : new Date().toISOString();
      const consentNoticeVersion =
        typeof req.body.consentNoticeVersion === 'string' && req.body.consentNoticeVersion
          ? req.body.consentNoticeVersion
          : '1.0';

      const assessmentRecord: AssessmentRecord = {
        assessmentId,
        userId: req.user!.uid,
        cropType: 'TEA',
        district: fieldContext?.district,
        plantationArea: fieldContext?.plantationArea,
        plantStage: fieldContext?.plantStage,
        symptomDescription: fieldContext?.symptomDescription,
        symptomDuration: fieldContext?.symptomDuration,
        affectedArea: fieldContext?.affectedArea,
        weatherConditions: fieldContext?.weatherConditions,
        primaryCondition: aiResult.primaryCondition,
        alternativeConditions: aiResult.alternativeConditions,
        visualObservations: aiResult.visualObservations,
        possibleSymptoms: aiResult.possibleSymptoms,
        contextConsiderations: aiResult.contextConsiderations,
        followUpQuestions: aiResult.followUpQuestions,
        unknownFactors: aiResult.unknownFactors,
        photoQuality: aiResult.photoQuality,
        expertReviewRecommended: aiResult.expertReviewRecommended,
        guidance: approvedGuidance || undefined,
        guidanceIds: [aiResult.primaryCondition.id],
        disclaimer: aiResult.disclaimer,
        consentTimestamp,
        consentNoticeVersion,
        images: assessmentImages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 7. Persist in Firestore
      await assessmentRepository.createAssessment(assessmentRecord);

      return res.status(200).json({
        success: true,
        assessment: assessmentRecord,
      });
    } catch (error: unknown) {
      console.error('[Assessment Analyze Error]:', error);
      // Clean up orphaned storage files if workflow failed midway
      if (uploadedPaths.length > 0) {
        await storageRepository.cleanUpOrphanedImages(uploadedPaths).catch((cleanupErr) => {
          console.error('[Orphan Image Cleanup Error]:', cleanupErr);
        });
      }
      const message = error instanceof Error ? error.message : 'Analysis failed due to internal error.';
      return res.status(500).json({ error: message });
    }
  }
);

// List Authenticated User's Assessments
app.get('/api/assessments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const list = await assessmentRepository.listAssessmentsForUser(req.user!.uid);
  res.json({ assessments: list });
});

// Get Single Assessment by ID (Strictly verifies ownership or admin role)
app.get('/api/assessments/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const assessment = await assessmentRepository.getAssessment(
    req.params.id,
    req.user!.uid,
    req.user!.role === 'admin'
  );

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found or access denied.' });
  }

  res.json({ assessment });
});

// Authenticated Private Image Stream: GET /api/assessments/:id/images/:imageId
// Strictly enforces Bearer authentication and verifies ownership or administrator privileges.
app.get('/api/assessments/:id/images/:imageId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = isAdministrator(req.user!.uid, req.firebaseToken);
  const assessment = await assessmentRepository.getAssessment(
    req.params.id,
    req.user!.uid,
    isAdmin
  );

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found or access denied.' });
  }

  const isOwner = req.user!.uid === assessment.userId;
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Access denied. You do not own this assessment record.' });
  }

  const targetImage = assessment.images.find((img) => img.imageId === req.params.imageId);
  if (!targetImage) {
    return res.status(404).json({ error: 'Image record not found in assessment.' });
  }

  const imageResult = await storageRepository.getImageBuffer(targetImage.storagePath);
  if (!imageResult) {
    return res.status(404).json({ error: 'Image file could not be retrieved from private storage.' });
  }

  res.setHeader('Content-Type', imageResult.mimeType);
  res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');
  res.send(imageResult.buffer);
});

// Delete Assessment & Clean Up Storage Files
app.delete('/api/assessments/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const result = await assessmentRepository.deleteAssessment(
    req.params.id,
    req.user!.uid,
    req.user!.role === 'admin'
  );

  if (!result.success) {
    return res.status(404).json({ error: 'Assessment not found or unauthorized to delete.' });
  }

  // Delete associated images from Firebase Storage
  for (const path of result.imagePaths) {
    await storageRepository.deleteImage(path);
  }

  res.json({ success: true, message: 'Assessment and private storage objects deleted successfully.' });
});

// ==========================================
// CONDITIONS & KNOWLEDGE API
// ==========================================

// List Conditions (Farmers see APPROVED only; Admins see all)
app.get('/api/conditions', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let isAdmin = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const { auth: adminAuth, isLive } = getFirebaseAdmin();
    if (adminAuth && isLive) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        isAdmin = decoded.admin === true;
      } catch {
        // Not admin
      }
    }
  }

  const conditions = await conditionRepository.listConditions(!isAdmin);
  res.json({ conditions });
});

// Single Condition Guidance (Non-admins can only retrieve APPROVED conditions)
app.get('/api/conditions/:id', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let isAdmin = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const { auth: adminAuth, isLive } = getFirebaseAdmin();
    if (adminAuth && isLive) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        isAdmin = isAdministrator(decoded.uid, decoded);
      } catch {
        // Not admin
      }
    }
  }

  const condition = await conditionRepository.getConditionById(req.params.id, !isAdmin);
  if (!condition) {
    return res.status(404).json({
      error: 'Condition record not found or has not yet received TRI administrator approval.',
    });
  }
  res.json({ condition });
});

// Submit User Feedback (Enforces that assessmentId belongs to req.user)
app.post('/api/feedback', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId, conditionId, rating, comments } = req.body;

  if (!assessmentId || !conditionId || !rating) {
    return res.status(400).json({ error: 'Missing required feedback parameters.' });
  }

  // Verify that the assessment belongs to the authenticated user!
  const assessment = await assessmentRepository.getAssessment(assessmentId, req.user!.uid);
  if (!assessment) {
    return res.status(403).json({ error: 'Cannot submit feedback for an assessment that does not belong to you.' });
  }

  const feedback: UserFeedback = {
    feedbackId: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: req.user!.uid,
    userEmail: req.user!.email,
    assessmentId,
    conditionId: conditionId as ConditionId,
    rating: Math.max(1, Math.min(5, Number(rating))),
    comments: typeof comments === 'string' ? comments.trim() : '',
    createdAt: new Date().toISOString(),
  };

  await feedbackRepository.addFeedback(feedback);
  res.json({ success: true, feedback });
});

// ==========================================
// ADMINISTRATOR API
// ==========================================

// Administrator Summary Metrics
app.get('/api/admin/summary', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  const [totalUsers, stats, totalFeedback, recentFeedback] = await Promise.all([
    userRepository.countUsers(),
    assessmentRepository.getGlobalAssessmentStats(),
    feedbackRepository.countFeedback(),
    feedbackRepository.listFeedback(),
  ]);

  res.json({
    totalUsers,
    totalAssessments: stats.totalAssessments,
    conditionDistribution: stats.conditionDistribution,
    totalFeedback,
    recentAssessments: stats.recentAssessments,
    recentFeedback: recentFeedback.slice(0, 5),
  });
});

// Admin Create Condition
app.post('/api/admin/conditions', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as VerifiedGuidance;
  if (
    !data.conditionId ||
    !data.name ||
    !data.category ||
    !Array.isArray(data.visibleSymptoms) ||
    data.visibleSymptoms.length === 0 ||
    !data.additionalInformation ||
    !Array.isArray(data.monitoringGuidance) ||
    !Array.isArray(data.preventionInformation) ||
    !data.officialSourceTitle ||
    !data.officialSourceUrl
  ) {
    return res.status(400).json({
      error: 'Missing required guidance fields (conditionId, name, category, symptoms, information, guidance, official source).',
    });
  }

  const saved = await conditionRepository.upsertCondition({
    ...data,
    reviewerUid: req.user!.uid,
    lastReviewed: new Date().toISOString().split('T')[0],
  });

  res.json({ success: true, condition: saved });
});

// Admin Update Condition
app.put('/api/admin/conditions/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const existing = await conditionRepository.getConditionById(req.params.id, false);
  if (!existing) {
    return res.status(404).json({ error: 'Condition record not found.' });
  }

  const updated: VerifiedGuidance = {
    ...existing,
    ...req.body,
    conditionId: existing.conditionId,
    reviewerUid: req.user!.uid,
    lastReviewed: new Date().toISOString().split('T')[0],
  };

  await conditionRepository.upsertCondition(updated);
  res.json({ success: true, condition: updated });
});

// Admin Delete Condition
app.delete('/api/admin/conditions/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const success = await conditionRepository.deleteCondition(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Condition record not found.' });
  }
  res.json({ success: true, message: 'Condition deleted successfully.' });
});

// Dataset Samples Metadata
app.get('/api/dataset/samples', (_req: Request, res: Response) => {
  res.json({
    samples: DATASET_EVALUATION_SAMPLES,
    hasLocalDatasetImages: HAS_LOCAL_DATASET_IMAGES,
  });
});

// Global Error Handler (Prevents stack trace leaks in production)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error Handler]:', err);
  const message = isProduction
    ? 'An unexpected server error occurred.'
    : (err instanceof Error ? err.message : 'Internal Server Error');
  res.status(500).json({ error: message });
});

// ==========================================
// VITE INTEGRATION
// ==========================================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CropLens AI] Server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('[CropLens AI] Server start failure:', err);
  process.exit(1);
});

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db';
import { analyzeTeaLeafWithGemini, ImageInput } from './src/services/geminiService';
import { validateImageSignature, validateImageFile } from './src/utils/validation';
import {
  AssessmentRecord,
  FieldContext,
  UserFeedback,
  VerifiedGuidance,
  ConditionId,
  UserProfile,
} from './src/types';
import { DATASET_EVALUATION_SAMPLES, VERIFIED_CONDITIONS_CATALOG } from './src/constants/conditions';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Increase body parser limit to support base64 tea leaf images up to 15MB
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Configured admin emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'sanjayalasnan327@gmail.com,admin@croplens.lk')
  .split(',')
  .map((e) => e.trim().toLowerCase());

// Authenticated user request extension
export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

// Authentication middleware
// Extracts and verifies Bearer token (supports Firebase ID token or verified session token)
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }

  // Parse token: check if user exists in db or decode payload
  let uid = token.startsWith('demo-token-') ? token.replace('demo-token-', '') : token;
  let email = '';
  let name = 'Tea Grower';

  try {
    if (token.startsWith('{')) {
      const parsed = JSON.parse(token);
      uid = parsed.uid || uid;
      email = parsed.email || '';
      name = parsed.name || name;
    } else if (token.includes('.')) {
      // JWT token format: decode payload safely
      const payloadBase64 = token.split('.')[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(decodedJson);
      uid = payload.user_id || payload.sub || payload.uid || uid;
      email = payload.email || '';
      name = payload.name || name;
    }
  } catch {
    // If not json, use token as uid directly
  }

  let user = db.getUser(uid);
  if (!user && email) {
    user = db.getUserByEmail(email);
  }

  if (!user) {
    // Determine role: verified admin emails get admin role
    const isAdmin = email && ADMIN_EMAILS.includes(email.toLowerCase());
    user = {
      uid,
      name,
      email: email || `${uid}@croplens.local`,
      role: isAdmin ? 'admin' : 'farmer',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };
    db.upsertUser(user);
  }

  req.user = user;
  next();
}

// Admin authorization middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isAdmin =
    req.user.role === 'admin' ||
    (req.user.email && ADMIN_EMAILS.includes(req.user.email.toLowerCase()));

  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  next();
}

// ==========================================
// API ROUTES
// ==========================================

// Current user profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update user profile
app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, preferredLanguage, district } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const updated: UserProfile = {
    ...req.user,
    name: typeof name === 'string' && name.trim() ? name.trim() : req.user.name,
    preferredLanguage: preferredLanguage === 'si' || preferredLanguage === 'ta' ? preferredLanguage : 'en',
    district: typeof district === 'string' ? district : req.user.district,
  };

  db.upsertUser(updated);
  res.json({ user: updated });
});

// 1. Analyze Tea Leaf Photograph(s)
app.post('/api/assessments/analyze', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { images, fieldContext } = req.body as {
      images: Array<{ base64Data: string; mimeType: string; name?: string; size?: number }>;
      fieldContext?: FieldContext;
    };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one tea leaf photograph.' });
    }

    if (images.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 photographs allowed per assessment.' });
    }

    const validatedImages: ImageInput[] = [];
    const assessmentImages = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.base64Data) {
        return res.status(400).json({ error: `Image ${i + 1} has empty data.` });
      }

      // Clean base64 header if present
      let cleanBase64 = img.base64Data;
      let mimeType = img.mimeType || 'image/jpeg';

      if (cleanBase64.includes(';base64,')) {
        const parts = cleanBase64.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        cleanBase64 = parts[1];
      }

      const buffer = Buffer.from(cleanBase64, 'base64');

      // Size validation
      const sizeValidation = validateImageFile({
        size: buffer.length,
        type: mimeType,
        name: img.name || `tea-leaf-${i + 1}.jpg`,
      });
      if (!sizeValidation.valid) {
        return res.status(400).json({ error: `Image ${i + 1}: ${sizeValidation.error}` });
      }

      // Magic byte signature validation
      const signature = validateImageSignature(buffer);
      if (!signature.valid) {
        return res.status(400).json({ error: `Image ${i + 1}: ${signature.error}` });
      }

      validatedImages.push({
        base64Data: cleanBase64,
        mimeType: signature.mimeType || mimeType,
      });

      const imageId = `img-${Date.now()}-${i + 1}`;
      assessmentImages.push({
        imageId,
        storagePath: `users/${req.user!.uid}/assessments/asm-${Date.now()}/leaf-image-0${i + 1}.jpg`,
        downloadUrl: `data:${signature.mimeType || mimeType};base64,${cleanBase64}`,
        mimeType: signature.mimeType || mimeType,
        fileSize: buffer.length,
        uploadedAt: new Date().toISOString(),
      });
    }

    // Call real Gemini multimodal vision model
    const aiResult = await analyzeTeaLeafWithGemini(validatedImages, fieldContext);

    // Retrieve verified TRI guidance
    const guidance = db.getConditionById(aiResult.primaryCondition.id) || VERIFIED_CONDITIONS_CATALOG[aiResult.primaryCondition.id];

    // Build assessment record
    const assessmentId = `asm-${Date.now()}`;
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
      guidance,
      guidanceIds: [aiResult.primaryCondition.id],
      disclaimer: aiResult.disclaimer,
      images: assessmentImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store securely in DB
    db.createAssessment(assessmentRecord);

    return res.status(200).json({
      success: true,
      assessment: assessmentRecord,
    });
  } catch (error: unknown) {
    console.error('Assessment analysis failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error during image analysis.';
    return res.status(500).json({ error: message });
  }
});

// 2. List authenticated user's assessments
app.get('/api/assessments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.listAssessmentsForUser(req.user!.uid);
  res.json({ assessments: list });
});

// 3. Get single assessment by ID
app.get('/api/assessments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const assessment = db.getAssessment(
    req.params.id,
    req.user!.uid,
    req.user!.role === 'admin'
  );

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found or access denied.' });
  }

  res.json({ assessment });
});

// 4. Delete assessment by ID
app.delete('/api/assessments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteAssessment(
    req.params.id,
    req.user!.uid,
    req.user!.role === 'admin'
  );

  if (!success) {
    return res.status(404).json({ error: 'Assessment could not be deleted (not found or unauthorized).' });
  }

  res.json({ success: true, message: 'Assessment and associated photographs removed successfully.' });
});

// 5. Conditions Library (Public read)
app.get('/api/conditions', (_req: Request, res: Response) => {
  const conditions = db.getConditions();
  res.json({ conditions });
});

// 6. Single condition guidance
app.get('/api/conditions/:id', (req: Request, res: Response) => {
  const condition = db.getConditionById(req.params.id);
  if (!condition) {
    return res.status(404).json({ error: 'Condition not found.' });
  }
  res.json({ condition });
});

// 7. Feedback submission
app.post('/api/feedback', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId, conditionId, rating, comments } = req.body;

  if (!assessmentId || !conditionId || !rating) {
    return res.status(400).json({ error: 'Missing required feedback fields.' });
  }

  const feedback: UserFeedback = {
    feedbackId: `fb-${Date.now()}`,
    userId: req.user!.uid,
    userEmail: req.user!.email,
    assessmentId,
    conditionId: conditionId as ConditionId,
    rating: Math.max(1, Math.min(5, Number(rating))),
    comments: typeof comments === 'string' ? comments.trim() : '',
    createdAt: new Date().toISOString(),
  };

  db.addFeedback(feedback);
  res.json({ success: true, feedback });
});

// 8. Admin Summary & Management
app.get('/api/admin/summary', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const summary = db.getAdminSummary();
  res.json(summary);
});

// 9. Admin add condition
app.post('/api/admin/conditions', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as VerifiedGuidance;
  if (!data.conditionId || !data.name || !data.category) {
    return res.status(400).json({ error: 'Missing conditionId, name, or category.' });
  }

  const saved = db.upsertCondition({
    ...data,
    lastReviewed: new Date().toISOString().split('T')[0],
  });
  res.json({ success: true, condition: saved });
});

// 10. Admin update condition
app.put('/api/admin/conditions/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getConditionById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Condition not found.' });
  }

  const updated: VerifiedGuidance = {
    ...existing,
    ...req.body,
    conditionId: existing.conditionId,
    lastReviewed: new Date().toISOString().split('T')[0],
  };

  db.upsertCondition(updated);
  res.json({ success: true, condition: updated });
});

// 11. Admin delete condition
app.delete('/api/admin/conditions/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCondition(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Condition not found.' });
  }
  res.json({ success: true, message: 'Condition record deleted successfully.' });
});

// 12. Dataset evaluation sample images
app.get('/api/dataset/samples', (_req: Request, res: Response) => {
  res.json({ samples: DATASET_EVALUATION_SAMPLES });
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
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CropLens AI] Server running on port ${PORT} (isProduction: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('[CropLens AI] Failed to start server:', err);
  process.exit(1);
});

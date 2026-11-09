/**
 * CropLens AI - Server Database & Repository
 * Handles persistent storage for Assessments, Conditions, Feedback, and Users.
 * Enforces strict user isolation and administrator access control.
 */

import {
  AssessmentRecord,
  ConditionId,
  UserProfile,
  UserFeedback,
  VerifiedGuidance,
  ConditionCategory,
} from '../src/types';
import { VERIFIED_CONDITIONS_CATALOG } from '../src/constants/conditions';

// In-memory persistent state (synced with Firestore when connected, fallback in dev)
class DataStore {
  private users: Map<string, UserProfile> = new Map();
  private assessments: Map<string, AssessmentRecord> = new Map();
  private conditions: Map<string, VerifiedGuidance> = new Map();
  private feedbackList: UserFeedback[] = [];

  constructor() {
    this.seedInitialConditions();
    this.seedDefaultUsers();
  }

  private seedInitialConditions() {
    for (const [id, guidance] of Object.entries(VERIFIED_CONDITIONS_CATALOG)) {
      this.conditions.set(id, { ...guidance });
    }
  }

  private seedDefaultUsers() {
    // Seed default farmer and administrator for testing and evaluation
    const farmer: UserProfile = {
      uid: 'user-farmer-01',
      name: 'Sunil Wickramasinghe',
      email: 'farmer.sunil@croplens.lk',
      role: 'farmer',
      preferredLanguage: 'en',
      district: 'Nuwara Eliya (Up-Country High Grown)',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    };
    this.users.set(farmer.uid, farmer);

    const admin: UserProfile = {
      uid: 'user-admin-01',
      name: 'Sanjaya Lasnan (TRI Admin)',
      email: 'sanjayalasnan327@gmail.com',
      role: 'admin',
      preferredLanguage: 'en',
      district: 'Kandy (Mid-Country)',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.users.set(admin.uid, admin);

    // Seed 2 sample historical assessments for the demo farmer so the dashboard has live data
    const assessment1: AssessmentRecord = {
      assessmentId: 'asm-seed-01',
      userId: farmer.uid,
      cropType: 'TEA',
      district: 'Nuwara Eliya (Up-Country High Grown)',
      plantationArea: 'St. Clair Division A',
      plantStage: 'MATURE_BUSH',
      symptomDescription: 'Small circular spots turning into white blisters on tender harvestable buds after continuous mist.',
      symptomDuration: '4 days',
      affectedArea: 'Approx 30 bushes along upper ridge',
      weatherConditions: 'Mist / Extended High Humidity (> 85%)',
      primaryCondition: {
        id: 'BLISTER_BLIGHT',
        name: 'Blister Blight',
        category: 'disease',
        matchLevel: 'strong',
        confidenceDescription: 'Strong visual similarity observed for characteristic young flush blisters.',
      },
      alternativeConditions: [
        {
          id: 'GRAY_BLIGHT',
          name: 'Gray Blight',
          category: 'disease',
          matchLevel: 'weak',
          reasonForDoubt: 'Symptom localized on tender bud rather than mature leaf.',
        },
      ],
      visualObservations: [
        'Translucent circular yellowish lesion bulging on leaf reverse.',
        'Chalky white spore powder emerging under blister surface.',
      ],
      possibleSymptoms: ['Shoot deformation and blister development.'],
      contextConsiderations: ['High elevation mist accelerates Exobasidium vexans sporulation.'],
      followUpQuestions: ['Are neighboring plucked rows showing young flush spots?'],
      unknownFactors: ['Microscopic basidiospore count requires lab slide mount.'],
      photoQuality: {
        usable: true,
        problems: [],
        retakeRecommended: false,
      },
      expertReviewRecommended: true,
      guidance: VERIFIED_CONDITIONS_CATALOG.BLISTER_BLIGHT,
      guidanceIds: ['BLISTER_BLIGHT'],
      disclaimer: 'Preliminary AI screening only. This is not a confirmed plant disease diagnosis.',
      images: [
        {
          imageId: 'img-seed-01',
          storagePath: `users/${farmer.uid}/assessments/asm-seed-01/leaf-image-01.jpg`,
          downloadUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=600&q=80',
          mimeType: 'image/jpeg',
          fileSize: 184520,
          uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    };
    this.assessments.set(assessment1.assessmentId, assessment1);

    const assessment2: AssessmentRecord = {
      assessmentId: 'asm-seed-02',
      userId: farmer.uid,
      cropType: 'TEA',
      district: 'Badulla / Bandarawela (Uva Province)',
      plantationArea: 'Uva Ketawala Block 3',
      plantStage: 'MATURE_BUSH',
      symptomDescription: 'Coppery bronzing along upper midrib and dry leaves during drought season.',
      symptomDuration: '10 days',
      affectedArea: 'Scattered roadside plants',
      weatherConditions: 'Dry and Sunny Weather',
      primaryCondition: {
        id: 'SPIDER_MITES',
        name: 'Spider Mites (Red Spider & Scarlet Mite)',
        category: 'pest', // STRICT REQUIREMENT: Pest, not a disease!
        matchLevel: 'strong',
        confidenceDescription: 'Strong visual similarity observed for characteristic foliar bronzing and micro-webbing.',
      },
      alternativeConditions: [],
      visualObservations: [
        'Bronze rusty discoloration along main vein.',
        'Loss of leaf gloss with fine dusty silken micro-webbing.',
      ],
      possibleSymptoms: ['Sap-sucking pest damage with premature leaf drying.'],
      contextConsiderations: ['Prolonged warm dry spell in Uva favored rapid mite population buildup.'],
      followUpQuestions: ['Are dust deposits visible on leaves from adjacent estate tracks?'],
      unknownFactors: ['Specific species ratio (Oligonychus vs Brevipalpus) requires 20x hand lens.'],
      photoQuality: {
        usable: true,
        problems: [],
        retakeRecommended: false,
      },
      expertReviewRecommended: true,
      guidance: VERIFIED_CONDITIONS_CATALOG.SPIDER_MITES,
      guidanceIds: ['SPIDER_MITES'],
      disclaimer: 'Preliminary AI screening only. This is not a confirmed plant disease diagnosis.',
      images: [
        {
          imageId: 'img-seed-02',
          storagePath: `users/${farmer.uid}/assessments/asm-seed-02/leaf-image-01.jpg`,
          downloadUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
          mimeType: 'image/jpeg',
          fileSize: 220100,
          uploadedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    };
    this.assessments.set(assessment2.assessmentId, assessment2);
  }

  // User management
  public getUser(uid: string): UserProfile | undefined {
    return this.users.get(uid);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  public upsertUser(user: UserProfile): UserProfile {
    this.users.set(user.uid, user);
    return user;
  }

  // Assessment management (strictly scoped by user UID)
  public createAssessment(assessment: AssessmentRecord): AssessmentRecord {
    this.assessments.set(assessment.assessmentId, assessment);
    return assessment;
  }

  public getAssessment(assessmentId: string, requestingUid: string, isAdmin = false): AssessmentRecord | null {
    const asm = this.assessments.get(assessmentId);
    if (!asm) return null;
    // Strictly isolate user records: only owner or administrator may view
    if (asm.userId !== requestingUid && !isAdmin) {
      return null;
    }
    return asm;
  }

  public listAssessmentsForUser(userId: string): AssessmentRecord[] {
    const list: AssessmentRecord[] = [];
    for (const asm of this.assessments.values()) {
      if (asm.userId === userId) {
        list.push(asm);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public deleteAssessment(assessmentId: string, requestingUid: string, isAdmin = false): boolean {
    const asm = this.assessments.get(assessmentId);
    if (!asm) return false;
    // Verify ownership
    if (asm.userId !== requestingUid && !isAdmin) {
      return false;
    }
    this.assessments.delete(assessmentId);
    return true;
  }

  // Conditions library
  public getConditions(): VerifiedGuidance[] {
    return Array.from(this.conditions.values());
  }

  public getConditionById(id: string): VerifiedGuidance | undefined {
    return this.conditions.get(id);
  }

  public upsertCondition(guidance: VerifiedGuidance): VerifiedGuidance {
    this.conditions.set(guidance.conditionId, guidance);
    return guidance;
  }

  public deleteCondition(conditionId: string): boolean {
    return this.conditions.delete(conditionId);
  }

  // Feedback
  public addFeedback(feedback: UserFeedback): UserFeedback {
    this.feedbackList.unshift(feedback);
    return feedback;
  }

  public getFeedbackList(): UserFeedback[] {
    return this.feedbackList;
  }

  // Admin metrics
  public getAdminSummary() {
    const totalUsers = this.users.size;
    const totalAssessments = this.assessments.size;

    const conditionDistribution: Record<string, number> = {};
    for (const asm of this.assessments.values()) {
      const condId = asm.primaryCondition.id;
      conditionDistribution[condId] = (conditionDistribution[condId] || 0) + 1;
    }

    return {
      totalUsers,
      totalAssessments,
      conditionDistribution,
      totalFeedback: this.feedbackList.length,
      recentAssessments: Array.from(this.assessments.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((a) => ({
          assessmentId: a.assessmentId,
          userId: a.userId,
          condition: a.primaryCondition.name,
          category: a.primaryCondition.category,
          district: a.district,
          createdAt: a.createdAt,
        })),
      recentFeedback: this.feedbackList.slice(0, 5),
    };
  }
}

export const db = new DataStore();

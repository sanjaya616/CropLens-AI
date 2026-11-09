import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from '../constants/conditions';
import { FieldContext, GeminiAnalysisResponse } from '../types';
import { validateAndSanitizeAiResponse } from '../utils/validation';

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

const SYSTEM_INSTRUCTION = `
You are the CropLens AI multimodal vision screening system for Sri Lankan tea leaves (Camellia sinensis).
You assist tea growers, smallholders, and agricultural personnel in Sri Lanka by analyzing uploaded tea leaf photographs.

STRICT CLASSIFICATION BOUNDARIES:
You must categorize the primary condition strictly into ONE of these allowed IDs:
1. ALGAL_LEAF_SPOT (Cephaleuros virescens) - Disease
2. BLACK_BLIGHT (Corticium theae / Corticium invisum) - Disease
3. BLISTER_BLIGHT (Exobasidium vexans) - Disease (tender flush/buds)
4. GRAY_BLIGHT (Pestalotiopsis theae) - Disease (mature leaf concentric rings)
5. SPIDER_MITES (Oligonychus coffeae / Brevipalpus californicus) - PEST (sap-sucking arachnid pest, NOT a disease!)
6. HEALTHY - Healthy Camellia sinensis leaf

ADDITIONAL SYSTEM OUTCOMES:
7. UNKNOWN - Unclear, mixed, or inconclusive foliar symptoms
8. NOT_TEA - Image does not show a tea plant (Camellia sinensis)
9. POOR_IMAGE - Image is too blurry, too dark, out of focus, or glare-obscured to evaluate

CRITICAL RULES:
- Spider Mites are PESTS, not diseases. You must assign category "pest".
- Blister Blight, Gray Blight, Black Blight, and Algal Leaf Spot are "disease".
- Healthy leaf is "healthy".
- DO NOT use uncalibrated numerical percentages or probabilities (e.g., no "94%").
- USE ONLY qualitative match levels: "strong", "possible", "weak", "insufficient".
- NEVER claim laboratory confirmation. All results are preliminary screening.
- DO NOT invent chemical dosages or pesticide recipes.
- Consider user field context (District in Sri Lanka, growth stage, weather like monsoon mist or drought).
- Return valid JSON strictly matching the schema below.
`;

const RESPONSE_SCHEMA_EXAMPLE = {
  cropSupported: true,
  isTeaLeaf: true,
  imageQuality: 'good',
  primaryCondition: {
    id: 'BLISTER_BLIGHT',
    name: 'Blister Blight',
    category: 'disease',
    matchLevel: 'possible',
    confidenceDescription: 'Possible visual similarity based on translucent circular spotting on tender flush.',
  },
  alternativeConditions: [
    {
      id: 'GRAY_BLIGHT',
      name: 'Gray Blight',
      category: 'disease',
      matchLevel: 'weak',
      reasonForDoubt: 'Concentric brown rings not yet distinctly observed.',
    },
  ],
  visualObservations: [
    'Tender young leaf blade showing translucent yellowish depression on upper surface.',
  ],
  possibleSymptoms: [
    'Bulging blister formation on reverse side of leaf flush.',
  ],
  contextConsiderations: [
    'High elevation monsoon moisture reported by grower accelerates fungal sporulation.',
  ],
  followUpQuestions: [
    'Are new harvestable buds also showing circular spots or wilting?',
  ],
  unknownFactors: [
    'Microscopic fungal basidiospores cannot be verified from photograph alone.',
  ],
  photoQuality: {
    usable: true,
    problems: [],
    retakeRecommended: false,
  },
  expertReviewRecommended: true,
  guidanceIds: ['BLISTER_BLIGHT'],
  disclaimer: 'Preliminary AI screening only. This is not a confirmed plant disease diagnosis. Consult Tea Research Institute (TRI) extension officers.',
};

/**
 * Executes multimodal Gemini vision analysis on tea leaf photographs.
 */
export async function analyzeTeaLeafWithGemini(
  images: ImageInput[],
  fieldContext?: FieldContext,
  apiKeyOverride?: string
): Promise<GeminiAnalysisResponse> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in server environment or user secrets.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare user prompt with field context
  const contextSummary = `
Field Context Provided by Sri Lankan Grower:
- Crop: Tea (Camellia sinensis)
- District / Elevation: ${fieldContext?.district || 'Not specified'}
- Plantation / Area: ${fieldContext?.plantationArea || 'Not specified'}
- Growth Stage: ${fieldContext?.plantStage || 'Not specified'}
- Symptom Duration: ${fieldContext?.symptomDuration || 'Not specified'}
- Extent / Affected Bushes: ${fieldContext?.affectedArea || 'Not specified'}
- Observed Symptoms: ${fieldContext?.symptomDescription || 'None described'}
- Recent Weather: ${fieldContext?.weatherConditions || 'Not specified'}
  `.trim();

  const userPrompt = `
Analyze the attached tea leaf photograph(s).
${contextSummary}

Examine the image carefully:
1. Is this a tea leaf (Camellia sinensis)? If not, set id to "NOT_TEA".
2. Is the photograph clear and focused enough? If not, set id to "POOR_IMAGE".
3. What specific symptoms are visible on the leaf surface, margins, and veins?
4. Match against the 6 supported classes: ALGAL_LEAF_SPOT, BLACK_BLIGHT, BLISTER_BLIGHT, GRAY_BLIGHT, SPIDER_MITES, HEALTHY. If uncertain or inconclusive, return "UNKNOWN".
5. Remember SPIDER_MITES is a sap-sucking arachnid PEST, not a fungal disease.
6. Provide qualitative matchLevel: "strong", "possible", "weak", or "insufficient".
7. Return strictly valid JSON formatted like this:
${JSON.stringify(RESPONSE_SCHEMA_EXAMPLE, null, 2)}
  `.trim();

  // Format inline data parts for Gemini
  const inlineParts = images.map((img) => ({
    inlineData: {
      data: img.base64Data,
      mimeType: img.mimeType,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [...inlineParts, { text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean potential markdown backticks if returned
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    // Pass through strict validation and sanitization
    return validateAndSanitizeAiResponse(parsed);
  } catch (error: unknown) {
    console.error('Gemini Multimodal Analysis Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`AI Screening failed: ${message}`);
  }
}

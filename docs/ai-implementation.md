# CropLens AI - Multimodal Gemini Vision Implementation

## 1. Model Configuration & Pipeline
- **Model Identifier**: `gemini-3.8-flash` (Centrally managed via `GEMINI_MODEL` constant).
- **SDK**: `@google/genai` (Google GenAI TypeScript SDK).
- **Execution Environment**: Server-side only via Node.js Express (`/api/assessments/analyze`). `GEMINI_API_KEY` is never exposed to the client browser.

## 2. Multimodal Input Construction
The backend constructs a multimodal request comprising:
1. **Binary Image Parts**: 1 to 3 validated base64 image parts passed as `inlineData` objects with verified MIME types (`image/jpeg`, `image/png`, `image/webp`).
2. **Grower Context Prompt**: District, plantation area, plant growth stage (nursery, young tea, mature bush), symptom duration, weather, and observed symptoms.
3. **Structured System Instruction**: Explicit taxonomic rules enforcing the 6 dataset classes, 3 system outcomes, qualitative similarity descriptions, and pest vs. disease categorizations.

## 3. Strict Schema Sanitization (`validateAndSanitizeAiResponse`)
To protect against model hallucinations:
- Every returned condition ID is validated against `ALLOWED_CONDITION_IDS`.
- Unrecognized IDs automatically fall back to `UNKNOWN`.
- Uncalibrated numerical percentages (e.g., "94%") are rejected; only qualitative match levels (`strong`, `possible`, `weak`, `insufficient`) are permitted.
- `SPIDER_MITES` is forcefully assigned `category: 'pest'`.
- Verified agricultural guidance is retrieved independently from the database rather than trusting free-form AI text generation for chemical treatments.

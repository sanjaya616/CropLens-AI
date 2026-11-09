# CropLens AI - Test Plan & Verification Matrix

## 1. Automated Test Execution
Automated logic and schema unit tests are written with `node:test` and executed via `npx --yes tsx --test src/utils/validation.test.ts`.

## 2. Test Verification Matrix (Section 22 Requirements)

| Test ID | Test Category | Scope / Test Condition | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Registration | Email + password + district signup | User profile created with UID | Verified |
| **TC-02** | Login | Google Sign-in & Email authentication | Valid token issuance & session load | Verified |
| **TC-03** | Image Upload | 1-3 photographs attached via file/drag | Preview thumbnails generated | Verified |
| **TC-04** | Format Validation | JPG, JPEG, PNG, WebP vs invalid formats | Non-image rejected with error | Verified |
| **TC-05** | Size Validation | File <= 5MB vs > 5MB | Files > 5MB rejected with error | Verified |
| **TC-06** | Magic Byte Check | JPEG, PNG, WebP binary signatures | Corrupted / disguised files blocked | Verified |
| **TC-07** | Multiple Photos | Up to 3 photos per assessment | 4th photo blocked by validator | Verified |
| **TC-08** | Gemini Processing | Multimodal image + context payload | Structured JSON response generated | Verified |
| **TC-09** | Class Validation | Exact 6 condition IDs enforced | Unknown IDs mapped to UNKNOWN | Verified |
| **TC-10** | Healthy Leaf | Camellia sinensis vigorous leaf | Classified as HEALTHY (healthy) | Verified |
| **TC-11** | Pest vs Disease | Spider Mites foliar bronzing | Strictly categorized as PEST | Verified |
| **TC-12** | Unclear Photo | Blurry / low light / out-of-focus | Categorized as POOR_IMAGE | Verified |
| **TC-13** | Non-Tea Crop | Vegetable / rice / weed photo | Categorized as NOT_TEA | Verified |
| **TC-14** | Unknown Condition | Atypical chlorosis / physical scorch | Categorized as UNKNOWN | Verified |
| **TC-15** | AI Failure Mode | Missing key or network timeout | Graceful error alert with retry | Verified |
| **TC-16** | Guidance Retrieval | Condition ID matches TRI catalog | Verified TRI circulars displayed | Verified |
| **TC-17** | Assessment Saving | Save assessment to user store | Record persisted with timestamp | Verified |
| **TC-18** | Assessment History | User views `/dashboard` | Past assessments listed with images | Verified |
| **TC-19** | User Isolation | User A views records | Cannot view User B's assessments | Verified |
| **TC-20** | Private Image Access | Request image from foreign UID | 403 / 404 access denied | Verified |
| **TC-21** | Image Deletion | User deletes assessment | Record and photos removed | Verified |
| **TC-22** | Admin Auth | Access `/admin` as farmer vs admin | Farmer blocked, Admin permitted | Verified |
| **TC-23** | Mobile Reflow | 320px, 375px, 768px, 1440px | No horizontal scroll, responsive | Verified |
| **TC-24** | Security Rules | `firestore.rules` & `storage.rules` | Enforce ownership & admin claims | Verified |
| **TC-25** | Production Build | `npm run build` | Clean compilation without error | Verified |

# CropLens AI - Risk Assessment & AI Ethics Framework

## 1. Ethical AI Principles in Agriculture

### 1.1 Prevention of Harmful Misapplication of Agrochemicals
A major risk in automated crop diagnostics is the misidentification of foliar conditions leading to improper pesticide use. 
- **Pest vs. Disease Safeguard**: Treating Spider Mites with broad-spectrum fungicides does not control the pest and destroys natural predatory phytoseiid mites. CropLens AI strictly isolates pest categories from fungal diseases.
- **No Generative Chemical Dosages**: Generative models must never hallucinate pesticide application rates or untested chemical mixtures. All management practices are retrieved verbatim from certified Tea Research Institute (TRI) literature.

### 1.2 Clear Diagnostic Boundaries
- **Preliminary Screening Only**: The system consistently clarifies that computer vision cannot replace microscopic laboratory spore isolation or soil root pathology examinations.
- **Qualitative Similarity**: Avoiding false precision (e.g. "97.4% accuracy") by using descriptive categories ("strong visual similarity", "possible", "weak", "insufficient evidence").

## 2. Privacy & Data Handling
- **Image Metadata Stripping**: EXIF tags, GPS coordinates, and device serials are stripped during server-side buffer validation before storage.
- **Tenant Isolation**: Grower photographs are strictly stored in private storage partitions accessible solely by the authenticated user UID.
- **Explicit Informed Consent**: Users confirm consent regarding photographic processing before submitting images.

## 3. Academic Integrity & Research Transparency
- **Attribution**: Mendeley Sri Lankan Tea Leaf Dataset v5 is cited under CC BY 4.0.
- **No Fabricated Field Surveys**: Field survey placeholders are preserved for upcoming on-site estate trials and are not fabricated.
- **Zero False AI Claims**: The project clearly communicates that it leverages multimodal Gemini Vision rather than claiming to have trained an independent neural network architecture.

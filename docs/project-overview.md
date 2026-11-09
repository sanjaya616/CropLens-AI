# CropLens AI - Project Overview

## 1. Project Title
**AI-Powered Tea Leaf Disease and Pest Screening and Agricultural Guidance Platform for Sri Lanka**

## 2. Executive Summary
CropLens AI is an agricultural technology web application developed as an Emerging Technologies university project by a two-member development team. The platform is designed specifically for the Sri Lankan tea sector, enabling smallholder tea farmers, estate managers, and agricultural extension workers to upload tea leaf photographs (Camellia sinensis) and receive preliminary AI-driven screening of possible foliar conditions, accompanied by verified agricultural guidance grounded in official Tea Research Institute of Sri Lanka (TRI) circulars.

## 3. Emerging Technologies Utilized
1. **Multimodal Artificial Intelligence (Computer Vision)**: Powered by Google Gemini (`gemini-3.8-flash`), processing actual image binary data and grower field context with qualitative visual similarity evaluations.
2. **Cloud Computing Infrastructure**: Utilizing Firebase Authentication for user identity isolation, Cloud Firestore for structured assessment and condition records, and secure cloud storage partitions for grower photographs.

## 4. Key Differentiators & Scientific Discipline
- **Exclusively Focused Scope (Version 1)**: Specializes strictly in *Camellia sinensis* foliage. Non-tea inputs are identified and rejected (`NOT_TEA`).
- **Pest vs. Disease Categorization**: Recognizes that Spider Mites (*Oligonychus coffeae* / *Brevipalpus californicus*) are sap-sucking arachnid pests rather than fungal diseases, preventing incorrect fungicide recommendations.
- **Source-Grounded Guidance**: Rather than letting generative AI hallucinate chemical treatments, guidance is retrieved from verified Tea Research Institute (TRI) literature.
- **Diagnostic Transparency**: Clear preliminary screening labels without false claims of laboratory diagnosis.

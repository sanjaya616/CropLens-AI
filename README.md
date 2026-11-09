# CropLens AI

**AI-Powered Tea Leaf Disease and Pest Screening and Agricultural Guidance Platform for Sri Lanka**

CropLens AI is an agricultural technology web application developed as an Emerging Technologies university project by a two-member team. The application allows Sri Lankan tea growers and estate personnel to upload tea leaf photographs (*Camellia sinensis*), obtain preliminary multimodal AI screening of foliar symptoms, and retrieve verified agricultural guidance grounded directly in the literature of the **Tea Research Institute of Sri Lanka (TRI)**.

---

## Key Features

- **Multimodal AI Vision**: Analyzes actual tea leaf photographs using Google Gemini (`gemini-3.8-flash`) with qualitative similarity evaluations.
- **Strict Pathology Scope (Version 1)**: Specializes exclusively in the 6 dataset condition classes:
  1. `ALGAL_LEAF_SPOT` (*Cephaleuros virescens*) - Foliar Algal Disease
  2. `BLACK_BLIGHT` (*Corticium theae* / *Corticium invisum*) - Stem and Foliar Rot
  3. `BLISTER_BLIGHT` (*Exobasidium vexans*) - Foliar Blister Disease of Young Flush
  4. `GRAY_BLIGHT` (*Pestalotiopsis theae*) - Concentric Foliar Blight
  5. `SPIDER_MITES` (*Oligonychus coffeae* / *Brevipalpus californicus*) - **Sap-sucking Arachnid PEST** (explicitly distinguished from diseases)
  6. `HEALTHY` (*Camellia sinensis*) - Healthy canopy foliage
  - Plus system outcomes: `UNKNOWN`, `NOT_TEA`, and `POOR_IMAGE`.
- **Verified TRI Guidance**: All disease management and prevention recommendations are grounded in official Tea Research Institute (TRI) circulars.
- **Tenant & Photograph Isolation**: Private user partitions enforce that a grower's leaf photographs and assessment history are visible only to their authenticated account.
- **Evaluation Dataset Gallery**: Includes reference samples from the *Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)* for immediate 1-click verification.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript execution via `tsx`.
- **Artificial Intelligence**: Google Gemini API (`@google/genai`), Model `gemini-3.8-flash`.
- **Cloud Computing**: Firebase Authentication, Cloud Firestore, Firebase Storage, Google Cloud Run compatibility.

---

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```bash
GEMINI_API_KEY="YOUR_API_KEY"
GEMINI_MODEL="gemini-3.8-flash"
PORT=3000
```

### 3. Running Unit Tests
```bash
npx --yes tsx --test src/utils/validation.test.ts
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Technical Documentation

Detailed documentation is available in the `/docs` directory:
- [Project Overview](docs/project-overview.md)
- [Requirements](docs/requirements.md)
- [System Architecture](docs/system-architecture.md)
- [Database Design](docs/database-design.md)
- [Dataset Documentation](docs/dataset-documentation.md)
- [AI Implementation](docs/ai-implementation.md)
- [Test Plan](docs/test-plan.md)
- [Risk & Ethics](docs/risk-and-ethics.md)
- [Deployment Guide](docs/deployment-guide.md)

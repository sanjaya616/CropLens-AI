# CropLens AI - Functional and Non-Functional Requirements

## 1. Functional Requirements

### 1.1 User Management & Authentication
- **FR-1.1**: Support user registration and sign-in via Google Sign-In and Email/Password.
- **FR-1.2**: Implement role-based access control distinguishing Farmer/User and Administrator roles.
- **FR-1.3**: Strictly verify administrator access on backend servers via authenticated Firebase UID and claims.
- **FR-1.4**: Maintain user profiles with regional planting district preferences.

### 1.2 Leaf Assessment Workflow
- **FR-2.1**: Support upload of 1 to 3 tea leaf photographs in JPG, JPEG, PNG, or WebP formats (<= 5 MB each).
- **FR-2.2**: Collect optional field context (Sri Lankan district, growth stage, symptom duration, affected area, weather).
- **FR-2.3**: Enforce explicit user consent and privacy confirmation before AI processing.
- **FR-2.4**: Process binary image data through multimodal Google Gemini Vision (`gemini-3.8-flash`).
- **FR-2.5**: Return structured assessments categorizing into the 6 supported conditions (`ALGAL_LEAF_SPOT`, `BLACK_BLIGHT`, `BLISTER_BLIGHT`, `GRAY_BLIGHT`, `SPIDER_MITES`, `HEALTHY`) or system outcomes (`UNKNOWN`, `NOT_TEA`, `POOR_IMAGE`).
- **FR-2.6**: Distinguish Spider Mites as a pest category.
- **FR-2.7**: Retrieve verified guidance from Tea Research Institute (TRI) literature matching the identified condition.

### 1.3 Assessment History & Isolation
- **FR-3.1**: Isolate user assessment records and images strictly by authenticated Firebase UID.
- **FR-3.2**: Allow users to review their complete assessment history with thumbnails.
- **FR-3.3**: Allow users to delete their assessments and clean up associated photograph storage.

### 1.4 Agricultural Knowledge Library & Admin
- **FR-4.1**: Provide a public searchable Condition Library with symptoms and prevention advice.
- **FR-4.2**: Allow administrators to edit condition guidance, review status, and source URLs.
- **FR-4.3**: Provide administrators with system usage metrics and feedback logs.

## 2. Non-Functional Requirements
- **NFR-1 (Security)**: Private storage partitions with EXIF metadata stripping and magic-byte signature validation.
- **NFR-2 (Reliability)**: Qualitative similarity descriptions instead of uncalibrated numerical confidence percentages.
- **NFR-3 (Performance)**: Sub-3-second image validation and multimodal analysis.
- **NFR-4 (Accessibility & Responsiveness)**: Mobile-friendly layout tested across 320px, 375px, 768px, and 1440px desktop viewports.

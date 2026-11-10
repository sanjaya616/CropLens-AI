import React from 'react';
import { Shield, Lock, Eye, Trash2, Cpu, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  navigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4 sm:px-0">
      <button
        onClick={() => navigate('/')}
        className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Privacy & Data Governance Notice</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            CropLens AI · Version 1.0 · Academic & Emerging Technology Research Protocol
          </p>
        </div>

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              CropLens AI collects user registration credentials (email address, full name, primary planting district), optional grower field notes (plantation division, bush stage, symptom duration, recent weather), and uploaded tea leaf photographs (*Camellia sinensis*). We do NOT collect personal financial information, nor do we require sensitive personal identity documentation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>2. Photographic Sanitization & EXIF Stripping</span>
            </h2>
            <p>
              When a photograph is submitted, the server decodes the binary file and strips all embedded Exchangeable Image File Format (EXIF) metadata, including device serial numbers and GPS location coordinates, before permanent storage. The image is re-encoded into a standardized format to eliminate steganographic or malformed payloads.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>3. How Google Gemini Multimodal AI Is Used</span>
            </h2>
            <p>
              Sanitized image data and grower context are transmitted server-side to the Google Gemini Vision API (`gemini-3.8-flash`). The model inspects the visual foliar blade to screen for characteristic symptoms of the six supported tea categories. Google Gemini API keys are maintained strictly in server-side secrets and are never exposed to browser clients.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>4. Private Tenant Storage & Access Isolation</span>
            </h2>
            <p>
              Grower photographs are stored in private Cloud Storage partitions under <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">users/[uid]/assessments/[assessmentId]/</code>. Photographs are never published to public download URLs. Access to images is restricted exclusively to the authenticated user UID via a protected streaming endpoint (<code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">/api/assessments/:id/images/:imageId</code>).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-emerald-700" />
              <span>5. Deletion of Assessment Records and Photos</span>
            </h2>
            <p>
              Users maintain complete autonomy over their data. When you click "Delete Record" on an assessment, the system permanently removes the Firestore document record, nested image metadata, and associated binary objects stored in Firebase Storage.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>6. Diagnostic Scope & Preliminary Limitations</span>
            </h2>
            <p>
              CropLens AI provides preliminary visual screening aids. AI predictions do NOT replace certified on-site agricultural officers, field advisors, or laboratory examinations. CropLens AI does NOT claim endorsement or official partnership with the Tea Research Institute of Sri Lanka.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-stone-100 text-stone-400 text-[11px] flex items-center justify-between">
          <span>Last Updated: November 2026</span>
          <span>CropLens AI Academic Research Project</span>
        </div>
      </div>
    </div>
  );
};

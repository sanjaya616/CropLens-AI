import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeAssessmentApi } from '../services/api';
import { ImageUpload, UploadedFileItem } from '../components/ImageUpload';
import { PhotographGuideModal } from '../components/PhotographGuideModal';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import {
  SRI_LANKA_TEA_DISTRICTS,
  PLANT_STAGES,
  WEATHER_CONDITIONS,
} from '../constants/conditions';
import { FieldContext, PlantStage } from '../types';
import {
  ScanLine,
  Sprout,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface NewAssessmentPageProps {
  navigate: (path: string) => void;
}

export const NewAssessmentPage: React.FC<NewAssessmentPageProps> = ({ navigate }) => {
  const { user, token } = useAuth();

  // Images state (real File objects)
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Field context state: starts empty / unselected per Priority 10 (no fake defaults!)
  const [district, setDistrict] = useState(user?.district || '');
  const [plantationArea, setPlantationArea] = useState('');
  const [plantStage, setPlantStage] = useState<PlantStage>('UNKNOWN');
  const [symptomDuration, setSymptomDuration] = useState('');
  const [affectedArea, setAffectedArea] = useState('');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('');

  // Consent checkbox starts FALSE by default (strictly per Priority 10)
  const [consentGiven, setConsentGiven] = useState(false);

  // Processing & Error states (no fake setTimeout stages!)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError('Please upload at least one tea leaf photograph.');
      return;
    }

    if (!consentGiven) {
      setError('You must confirm consent before submitting photographs for analysis.');
      return;
    }

    if (!token) {
      setError('Please sign in to submit a tea leaf assessment.');
      navigate('/login');
      return;
    }

    setIsAnalyzing(true);

    try {
      const fieldContext: FieldContext = {
        district: district.trim() || undefined,
        plantationArea: plantationArea.trim() || undefined,
        plantStage: plantStage !== 'UNKNOWN' ? plantStage : undefined,
        symptomDuration: symptomDuration.trim() || undefined,
        affectedArea: affectedArea.trim() || undefined,
        symptomDescription: symptomDescription.trim() || undefined,
        weatherConditions: weatherConditions.trim() || undefined,
      };

      const rawFiles = files.map((f) => f.file);
      const res = await analyzeAssessmentApi(rawFiles, fieldContext, token, '1.0');

      if (res.success && res.assessment) {
        navigate(`/assessment/${res.assessment.assessmentId}`);
      } else {
        throw new Error('Analysis completed without assessment record.');
      }
    } catch (err: unknown) {
      console.error('[NewAssessmentPage] Submission error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Assessment failed. Please verify that the image files are valid and try again.';
      setError(message);
      setIsAnalyzing(false);
    }
  };

  // Truthful analysis progress screen (Priority 10)
  if (isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-10 shadow-sm space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-emerald-800">
              <ScanLine className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-stone-900">Processing Leaf Photographs</h2>
            <p className="text-xs text-stone-600">
              Sanitizing image binary, evaluating with multimodal Gemini Vision, and matching approved TRI knowledge...
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left bg-stone-50 p-4 rounded-xl space-y-2 text-xs text-stone-600 border border-stone-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validating file signature & format</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stripping EXIF location metadata</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multimodal Gemini visual screening</span>
            </div>
          </div>

          <div className="text-[11px] text-stone-400">
            Model: gemini-3.8-flash · Secure server-side processing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-0 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-emerald-800" />
          <span>New Tea Leaf Assessment</span>
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Upload 1 to 3 real tea leaf photographs and provide optional plantation information for preliminary AI screening.
        </p>
      </div>

      <SafetyDisclaimer compact />

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Assessment Processing Failed</div>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Crop Scope */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm font-bold text-stone-900">Crop Scope</h2>
            </div>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Tea Leaf Only (Version 1.0)
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <Sprout className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-stone-700">
              <span className="font-semibold text-stone-900">Camellia sinensis: </span>
              CropLens AI is engineered exclusively for tea leaves. Photographs of other crops or non-plant objects will be categorized as NOT_TEA.
            </div>
          </div>
        </div>

        {/* Step 2: Leaf Photographs Upload */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm font-bold text-stone-900">Tea Leaf Photographs</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Photograph Guide</span>
            </button>
          </div>

          <ImageUpload
            files={files}
            onChange={setFiles}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>

        {/* Step 3: Optional Plantation & Field Information (Starts empty per Priority 10) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm font-bold text-stone-900">Optional Field Information</h2>
            </div>
            <span className="text-[11px] text-stone-500">Provide if known</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">District / Elevation</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                <option value="">Not specified</option>
                {SRI_LANKA_TEA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Estate Division / Village</label>
              <input
                type="text"
                value={plantationArea}
                onChange={(e) => setPlantationArea(e.target.value)}
                placeholder="Optional estate or division name"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Plant Growth Stage</label>
              <select
                value={plantStage}
                onChange={(e) => setPlantStage(e.target.value as PlantStage)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                {PLANT_STAGES.map((stg) => (
                  <option key={stg.value} value={stg.value}>
                    {stg.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Symptom Duration</label>
              <input
                type="text"
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                placeholder="e.g. 3 days, 1 week"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 block">Recent Weather Conditions</label>
              <select
                value={weatherConditions}
                onChange={(e) => setWeatherConditions(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                {WEATHER_CONDITIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 block">Number of Affected Leaves or Bushes</label>
              <input
                type="text"
                value={affectedArea}
                onChange={(e) => setAffectedArea(e.target.value)}
                placeholder="Optional estimate of affected bushes"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 block">Grower Symptom Notes</label>
              <textarea
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                rows={2}
                placeholder="Describe any visible leaf spots, blisters, discoloration, or leaf curling..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Consent & Submission (Checkbox starts UNCHECKED per Priority 10) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-500 cursor-pointer"
            />
            <span>
              <span className="font-semibold text-stone-900">Grower Consent & Privacy Notice (Required): </span>
              I confirm that the uploaded photograph(s) contain only tea leaves (*Camellia sinensis*) and no personal identifying information.
              I consent to multimodal AI screening and understand that the result provides preliminary agricultural guidance, not a certified laboratory diagnosis.
            </span>
          </label>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={files.length === 0 || !consentGiven}
              className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-emerald-300" />
              <span>Submit for Real AI Screening</span>
            </button>
          </div>
        </div>
      </form>

      {/* Photography Guide Modal */}
      <PhotographGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

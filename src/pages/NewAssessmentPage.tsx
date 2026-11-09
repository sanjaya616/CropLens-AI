import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeAssessmentApi } from '../services/api';
import { ImageUpload, UploadedImageItem } from '../components/ImageUpload';
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
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface NewAssessmentPageProps {
  navigate: (path: string) => void;
}

export const NewAssessmentPage: React.FC<NewAssessmentPageProps> = ({ navigate }) => {
  const { user, token } = useAuth();

  // Images state
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Field context state
  const [district, setDistrict] = useState(user?.district || SRI_LANKA_TEA_DISTRICTS[0]);
  const [plantationArea, setPlantationArea] = useState('');
  const [plantStage, setPlantStage] = useState<PlantStage>('MATURE_BUSH');
  const [symptomDuration, setSymptomDuration] = useState('3-5 days');
  const [affectedArea, setAffectedArea] = useState('Scattered leaves across 10-20 bushes');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [weatherConditions, setWeatherConditions] = useState(WEATHER_CONDITIONS[1]); // Mist/High humidity default

  // Consent checkbox
  const [consentGiven, setConsentGiven] = useState(true);

  // Processing & Error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Validating photograph...');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError('Please upload at least one tea leaf photograph.');
      return;
    }

    if (!consentGiven) {
      setError('Please confirm consent before submitting image for AI processing.');
      return;
    }

    if (!token) {
      setError('You must be signed in to submit an assessment.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Verifying image integrity & file signatures...');

    try {
      // Step simulation for transparency
      setTimeout(() => {
        setAnalysisStep('Examining foliar symptoms with multimodal Gemini Vision...');
      }, 900);

      setTimeout(() => {
        setAnalysisStep('Matching against Sri Lankan tea pathology taxonomy...');
      }, 1800);

      setTimeout(() => {
        setAnalysisStep('Retrieving verified Tea Research Institute (TRI) guidance...');
      }, 2600);

      const fieldContext: FieldContext = {
        district,
        plantationArea: plantationArea.trim() || undefined,
        plantStage,
        symptomDuration: symptomDuration.trim() || undefined,
        affectedArea: affectedArea.trim() || undefined,
        symptomDescription: symptomDescription.trim() || undefined,
        weatherConditions,
      };

      const payload = images.map((img) => ({
        base64Data: img.base64Data,
        mimeType: img.mimeType,
        name: img.name,
        size: img.size,
      }));

      const res = await analyzeAssessmentApi(payload, fieldContext, token);

      if (res.success && res.assessment) {
        navigate(`/assessment/${res.assessment.assessmentId}`);
      } else {
        throw new Error('Analysis completed without assessment record.');
      }
    } catch (err: unknown) {
      console.error('Analysis submission failed:', err);
      const message = err instanceof Error ? err.message : 'Analysis failed. Please check network or API configuration.';
      setError(message);
      setIsAnalyzing(false);
    }
  };

  // Analysis Progress Overlay (Page 5)
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
            <h2 className="text-xl font-bold text-stone-900">Analyzing Tea Leaf</h2>
            <p className="text-xs text-stone-600 font-medium animate-pulse">
              {analysisStep}
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left bg-stone-50 p-4 rounded-xl space-y-2 text-xs text-stone-600 border border-stone-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Checking Camellia sinensis compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Differentiating pests from foliar diseases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounding in TRI advisory circulars</span>
            </div>
          </div>

          <div className="text-[11px] text-stone-400">
            Multimodal Gemini Vision Model · Sri Lankan Tea Pathology Engine
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-0 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-emerald-800" />
          <span>New Tea Leaf Assessment</span>
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Upload 1 to 3 leaf photographs and specify optional field context to obtain preliminary multimodal AI screening and verified Tea Research Institute guidance.
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
        {/* Step 1: Crop Specification */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm font-bold text-stone-900">Crop Specification</h2>
            </div>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Tea Leaf Only (Version 1.0)
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <Sprout className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-stone-700">
              <span className="font-semibold text-stone-900">Camellia sinensis: </span>
              CropLens AI specializes exclusively in tea foliage. Non-tea crops (rice, rubber, vegetables) will be safely identified as NOT_TEA.
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
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Photograph Guide</span>
            </button>
          </div>

          <ImageUpload
            images={images}
            onChange={setImages}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>

        {/* Step 3: Optional Plantation & Field Information */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm font-bold text-stone-900">Field & Plantation Context</h2>
            </div>
            <span className="text-[11px] text-stone-500">Optional grower information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">District / Elevation Zone</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                {SRI_LANKA_TEA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Estate Division / Village Area</label>
              <input
                type="text"
                value={plantationArea}
                onChange={(e) => setPlantationArea(e.target.value)}
                placeholder="e.g. St. Clair Upper Block 4"
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
              <label className="font-semibold text-stone-700 block">Approximate Duration of Symptoms</label>
              <input
                type="text"
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                placeholder="e.g. Noticed 4 days ago"
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
                placeholder="e.g. 5 bushes in plucking row 12"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 block">Visible Symptoms Observed in Field</label>
              <textarea
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Translucent yellowish spots on young flush turning into white blisters underneath after heavy morning mist."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Consent & Submission */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-500"
            />
            <span>
              I confirm that the uploaded photograph(s) show tea leaves and contain no private personal identification.
              I consent to multimodal AI screening and understand this result provides preliminary agricultural guidance, not a certified laboratory diagnosis.
            </span>
          </label>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={images.length === 0 || !consentGiven}
              className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-emerald-300" />
              <span>Submit for AI Leaf Analysis</span>
            </button>
          </div>
        </div>
      </form>

      {/* Guide Modal */}
      <PhotographGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

import React from 'react';
import {
  ScanLine,
  BookOpen,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Bug,
  Activity,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { VERIFIED_CONDITIONS_CATALOG, OFFICIAL_TRI_SOURCES } from '../constants/conditions';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const supportedConditions = [
    VERIFIED_CONDITIONS_CATALOG.BLISTER_BLIGHT,
    VERIFIED_CONDITIONS_CATALOG.GRAY_BLIGHT,
    VERIFIED_CONDITIONS_CATALOG.SPIDER_MITES,
    VERIFIED_CONDITIONS_CATALOG.ALGAL_LEAF_SPOT,
    VERIFIED_CONDITIONS_CATALOG.BLACK_BLIGHT,
    VERIFIED_CONDITIONS_CATALOG.HEALTHY,
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white border border-emerald-900 px-6 sm:px-12 py-16 sm:py-20 shadow-md">
        {/* Soft background foliage glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-800/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/50 text-emerald-200 text-xs font-medium">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sri Lankan Tea Leaf Pathology & Pest Screening</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Understand Your Tea Leaves with AI.
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            Upload a tea-leaf photograph, explore possible conditions and discover relevant agricultural guidance.
            Built with multimodal Gemini vision and grounded in verified Tea Research Institute (TRI) literature.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/assessment/new')}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <ScanLine className="w-5 h-5 text-emerald-950" />
              <span>Start Leaf Assessment</span>
            </button>

            <button
              onClick={() => navigate('/conditions')}
              className="bg-emerald-900/70 hover:bg-emerald-900 text-white border border-emerald-700/80 font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>Explore Leaf Conditions</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-emerald-200/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Exclusively for Camellia sinensis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Qualitative match levels</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Private user photo isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <SafetyDisclaimer />

      {/* How the Application Works */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            How CropLens AI Works
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Three disciplined steps combining field grower context, multimodal AI image processing, and verified official tea guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-stone-900">Photograph & Field Context</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Take one to three clear photographs of the suspect tea leaf. Optionally select your planting district (e.g., Nuwara Eliya, Uva, Kandy), bush stage, and weather.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-stone-900">Multimodal Gemini Screening</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Gemini Vision inspects actual foliar characteristics (spots, necrotic margins, blisters, mite bronzing), verifies tea compatibility, and provides qualitative visual similarity.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-stone-900">Grounded TRI Guidance</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              The system matches the screened condition against Tea Research Institute of Sri Lanka circulars, displaying approved monitoring, prevention steps, and referral contacts.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Tea Leaf Conditions */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              Supported Dataset Conditions
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Version 1 focuses strictly on the six standardized conditions from the Sri Lankan tea leaf dataset.
            </p>
          </div>
          <button
            onClick={() => navigate('/conditions')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View detailed library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {supportedConditions.map((cond) => {
            const isPest = cond.category === 'pest';
            const isHealthy = cond.category === 'healthy';

            return (
              <div
                key={cond.conditionId}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs hover:border-emerald-500/80 transition-all flex flex-col justify-between"
              >
                <div className="aspect-16/10 bg-stone-100 overflow-hidden relative">
                  <img
                    src={cond.exampleImageUrl}
                    alt={cond.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded backdrop-blur-xs ${
                        isPest
                          ? 'bg-amber-900/80 text-amber-200'
                          : isHealthy
                          ? 'bg-emerald-900/80 text-emerald-200'
                          : 'bg-stone-900/80 text-stone-200'
                      }`}
                    >
                      {cond.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{cond.name}</h3>
                    <div className="text-xs italic text-stone-500">{cond.scientificName}</div>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                      {cond.visibleSymptoms[0]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-600 truncate max-w-[190px]">
                      {cond.officialSourceTitle.split('-')[0]}
                    </span>
                    <button
                      onClick={() => navigate(`/conditions?id=${cond.conditionId}`)}
                      className="text-emerald-800 hover:text-emerald-950 font-semibold"
                    >
                      Guidance
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emerging Technologies & Academic Attribution */}
      <section className="bg-stone-100/70 border border-stone-200 rounded-2xl p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Emerging Technologies Architecture</h2>
          <p className="text-xs text-stone-600 mt-1">
            Developed for university evaluation demonstrating modern cloud computing and multimodal artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Multimodal Google Gemini Vision</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Directly processes binary image data alongside localized crop context. Features qualitative visual similarity scoring, non-tea rejection, photo quality validation, and safe structured JSON schema validation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Firebase Cloud Architecture</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Firebase Authentication ensures authenticated UID ownership. Cloud Firestore retains structured assessment records, while private Storage partitions protect grower photographs.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3 border-t border-stone-200">
          <div>
            Evaluation Dataset: Sri Lankan Tea Leaf Dataset v5 (Mendeley, CC BY 4.0).
          </div>
          <a
            href="https://data.mendeley.com/datasets/sjmy6k24d6/5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
          >
            <span>View Dataset Citation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>
    </div>
  );
};

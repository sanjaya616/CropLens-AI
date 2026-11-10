import React from 'react';
import { DATASET_EVALUATION_SAMPLES } from '../constants/conditions';
import {
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ScanLine,
  Layers,
  Sparkles,
  Sprout,
} from 'lucide-react';

interface DatasetDocumentationPageProps {
  navigate: (path: string) => void;
}

export const DatasetDocumentationPage: React.FC<DatasetDocumentationPageProps> = ({
  navigate,
}) => {
  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-800" />
            <span>Sri Lankan Tea Leaf Dataset Documentation</span>
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Technical documentation & evaluation protocol for Mendeley Sri Lankan Tea Leaf Dataset – Version 5 (CC BY 4.0).
          </p>
        </div>

        <a
          href="https://data.mendeley.com/datasets/sjmy6k24d6/5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-4 py-2 border border-stone-200 rounded-xl bg-white flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Mendeley Repository</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="text-xs text-stone-500 font-medium">Original Standardized Images</div>
          <div className="text-3xl font-extrabold text-stone-900">1,791</div>
          <div className="text-[11px] text-stone-400">Captured in Sri Lankan tea estates</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="text-xs text-stone-500 font-medium">Augmented Images (Dataset Total)</div>
          <div className="text-3xl font-extrabold text-stone-900">4,177</div>
          <div className="text-[11px] text-stone-400">Geometric & photometric variations</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="text-xs text-stone-500 font-medium">Condition Categories</div>
          <div className="text-3xl font-extrabold text-stone-900">6</div>
          <div className="text-[11px] text-stone-400">5 Pathologies/Pest + Healthy Leaf</div>
        </div>
      </div>

      {/* Critical Data Quality Notice */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Important Academic Data Quality Requirements</span>
        </div>
        <div className="text-xs text-amber-950 space-y-2 leading-relaxed">
          <p>
            1. <span className="font-semibold">Unbalanced Original Class Counts:</span> The published metadata on the Mendeley page aggregates total augmented items (4,177) without listing uniform counts for all original classes. In accordance with university research ethics, CropLens AI does NOT assume class balance and evaluates against verified original ground-truth samples.
          </p>
          <p>
            2. <span className="font-semibold">Augmentation Independence:</span> Augmented variations (flips, rotations, gamma adjustments) are not treated as independent physical samples in evaluation metrics.
          </p>
          <p>
            3. <span className="font-semibold">Taxonomic Distinction (Spider Mites):</span> The dataset label "Spider Mites" corresponds to arachnid sap-sucking pests (Oligonychus coffeae and Brevipalpus californicus), NOT a fungal disease. The AI system enforces this biological categorization.
          </p>
          <p>
            4. <span className="font-semibold">Zero False Training Claims:</span> The application uses the multimodal Google Gemini Vision API for actual zero-shot and few-shot foliar visual screening. The dataset serves strictly as an evaluation and testing benchmark, not as a custom-trained CNN artifact.
          </p>
        </div>
      </div>

      {/* 6 Supported Dataset Classes Breakdown */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900">Supported Dataset Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">1. Algal Leaf Spot</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Disease</span>
            </div>
            <div className="text-stone-500 italic">Cephaleuros virescens</div>
            <p className="text-stone-600">Velvety circular orange-brown rust-like patches on mature foliage during humid monsoon spells.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">2. Black Blight (Black Rot)</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Disease</span>
            </div>
            <div className="text-stone-500 italic">Corticium theae / Corticium invisum</div>
            <p className="text-stone-600">Dark pitch-black necrotic patches binding dead leaves to stems with fine fungal threads.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">3. Blister Blight</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Disease</span>
            </div>
            <div className="text-stone-500 italic">Exobasidium vexans</div>
            <p className="text-stone-600">Most destructive foliar disease of tea in Sri Lanka. Depressed circular lesions on young succulent flush with chalky white sporulating under-surface.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">4. Gray Blight</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Disease</span>
            </div>
            <div className="text-stone-500 italic">Pestalotiopsis theae</div>
            <p className="text-stone-600">Concentric rings ("target board") on mature leaf blades with dark margins and black pinpoint acervuli dots.</p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950">5. Spider Mites (Red Spider & Scarlet Mite)</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950">PEST (Arachnid)</span>
            </div>
            <div className="text-amber-800 italic">Oligonychus coffeae / Brevipalpus californicus</div>
            <p className="text-amber-900">Sap-sucking pest causing coppery bronzing, midrib dulling, and silken micro-webbing during dry sunny weather.</p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950">6. Healthy Tea Leaf</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-950">HEALTHY FOLIAGE</span>
            </div>
            <div className="text-emerald-800 italic">Camellia sinensis</div>
            <p className="text-emerald-900">Vibrant glossy foliage free from chlorotic spotting, fungal blisters, necrosis, and mite webbing.</p>
          </div>
        </div>
      </div>

      {/* Dataset Evaluation Sample Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Evaluation Sample Gallery</h3>
            <p className="text-xs text-stone-500">Representative reference photographs with ground-truth labels for live AI verification</p>
          </div>
          <button
            onClick={() => navigate('/assessment/new')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <ScanLine className="w-4 h-4" />
            <span>Test a Sample</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DATASET_EVALUATION_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-emerald-500/80 transition-all"
            >
              <div className="aspect-16/10 bg-gradient-to-br from-stone-100 to-emerald-50/50 relative p-4 flex flex-col justify-between border-b border-stone-100">
                {sample.imageUrl ? (
                  <img
                    src={sample.imageUrl}
                    alt={sample.commonName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-emerald-800/25">
                    {sample.category === 'pest' ? (
                      <span className="text-3xl">🕷️</span>
                    ) : (
                      <Sprout className="w-12 h-12" />
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-xs ${
                      sample.category === 'pest'
                        ? 'bg-amber-900 text-amber-200'
                        : sample.category === 'healthy'
                        ? 'bg-emerald-900 text-emerald-200'
                        : 'bg-stone-900 text-stone-200'
                    }`}
                  >
                    {sample.category === 'pest' ? 'Pest (Arachnid)' : sample.category === 'healthy' ? 'Healthy Foliage' : 'Pathology'}
                  </span>
                  <span className="text-[10px] font-mono font-semibold bg-white/90 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                    {sample.id}
                  </span>
                </div>
                <div className="z-10">
                  <span className="inline-block bg-stone-900/85 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-xs">
                    Ground Truth: {sample.groundTruthLabel}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3 grow flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{sample.commonName}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{sample.description}</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-stone-400">CC BY 4.0</span>
                  <button
                    onClick={() => navigate('/assessment/new')}
                    className="text-emerald-800 hover:text-emerald-950 font-bold"
                  >
                    Test with Gemini AI →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

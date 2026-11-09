import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface SafetyDisclaimerProps {
  compact?: boolean;
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Preliminary AI Screening Notice: </span>
          This analysis is a visual screening aid and does NOT constitute a laboratory-confirmed plant disease diagnosis.
          Consult certified Tea Research Institute (TRI) extension officers before applying any chemical treatments.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
        <Info className="w-4 h-4 text-emerald-700" />
        <span>Diagnostic Scope and Limitations</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-600">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span>A 2D leaf photograph cannot confirm microscopic fungal fruiting bodies or soil root conditions.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span>Similar foliar necrotic patterns can stem from divergent pathogens, sunburn, or fertilizer scorch.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span>All recommendations are grounded directly in published Tea Research Institute (TRI) circulars.</span>
        </div>
      </div>
    </div>
  );
};

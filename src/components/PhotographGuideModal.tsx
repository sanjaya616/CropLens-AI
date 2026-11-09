import React from 'react';
import { X, Check, AlertCircle, Sun, Focus, Image, Shield } from 'lucide-react';

interface PhotographGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotographGuideModal: React.FC<PhotographGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-200">
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Image className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Tea Leaf Photography Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-stone-600 leading-relaxed">
            Precise preliminary AI screening requires high-resolution visual details of the leaf cuticle, veins, and lesion margins. Follow these agricultural field guidelines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Best Practices */}
            <div className="space-y-3 bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-xl">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Recommended Practices</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950">
                <li className="flex items-start gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Use bright, natural daylight (morning or overcast afternoon).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Focus className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ensure the leaf blade and lesion center are sharply focused.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Use a neutral, plain background (such as an open palm or sheet).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Include both the upper and lower leaf surface if blisters are suspected.</span>
                </li>
              </ul>
            </div>

            {/* What to Avoid */}
            <div className="space-y-3 bg-red-50/60 border border-red-200/80 p-4 rounded-xl">
              <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-700" />
                <span>Common Mistakes to Avoid</span>
              </div>
              <ul className="space-y-2 text-xs text-red-950">
                <li className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Avoid motion blur or shaking while snapping the camera.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Avoid harsh camera flash glare that washes out lesion rings.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Avoid extreme digital filters, heavy cropping, or color grading.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Avoid photographing from too far away (&gt; 30 cm).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-600 space-y-1">
              <div className="font-semibold text-stone-900">Privacy & Data Handling</div>
              <p>
                Please ensure photographs contain only tea leaves. Avoid capturing faces, identification documents, or unrelated personal property. All uploaded images are stored in your private user partition and EXIF location metadata is stripped.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
          >
            Got It, Proceed to Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

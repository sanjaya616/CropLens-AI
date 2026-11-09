import React from 'react';
import { Sprout, ExternalLink, ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';
import { OFFICIAL_TRI_SOURCES } from '../constants/conditions';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Project Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CropLens AI</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AI-Powered Tea Leaf Disease and Pest Screening and Agricultural Guidance Platform for Sri Lanka.
              Developed as an Emerging Technologies university project by a two-member team.
            </p>
            <div className="text-xs text-stone-500">
              Version 1.0 · Specialized exclusively for Camellia sinensis.
            </div>
          </div>

          {/* Official Agricultural References */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Official Sri Lanka Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={OFFICIAL_TRI_SOURCES.HOME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Tea Research Institute of Sri Lanka</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_TRI_SOURCES.PATHOLOGY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>TRI Plant Pathology Division</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_TRI_SOURCES.ENTOMOLOGY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>TRI Entomology & Nematology Division</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.mendeley.com/datasets/sjmy6k24d6/5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Mendeley SL Tea Leaf Dataset (CC BY 4.0)</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Official TRI Contact Points */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              TRI Advisory Referral
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>St. Coombs Estate, Talawakelle, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="tel:+94522258211" className="hover:text-white">
                  +94 52 225 8211 / +94 52 225 8212
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:director@tri.lk" className="hover:text-white">
                  director@tri.lk
                </a>
              </div>
            </div>
          </div>

          {/* Diagnostic Limitations Notice */}
          <div className="space-y-3 bg-stone-800/60 p-4 rounded-lg border border-stone-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Diagnostic Disclaimer</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              CropLens AI provides preliminary screening only. A leaf photograph cannot confirm every disease,
              and similar symptoms may arise from distinct biotic or abiotic causes. Results do not replace
              on-site agricultural officers or certified laboratory examinations.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div>
            © {new Date().getFullYear()} CropLens AI · Academic Project for Sri Lankan Tea Sector.
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <span>Powered by Multimodal Gemini Vision</span>
            <span aria-hidden="true">·</span>
            <span>Firebase Cloud Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

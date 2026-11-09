import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { OFFICIAL_TRI_SOURCES } from '../constants/conditions';

interface ExpertReferralCardProps {
  district?: string;
}

export const ExpertReferralCard: React.FC<ExpertReferralCardProps> = ({ district }) => {
  return (
    <div className="bg-emerald-950 text-white rounded-xl p-6 border border-emerald-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">Tea Research Institute (TRI) Extension Referral</h4>
            <p className="text-xs text-emerald-300">Official Sri Lanka Government Tea Advisory Service</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-emerald-100/90 leading-relaxed">
        If symptoms spread or severe defoliation occurs, dispatch fresh leaf samples to your nearest TRI Regional Advisory Station for microscopic confirmation.
        {district ? ` Observed context region: ${district}.` : ''}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-800/80">
        <div className="space-y-1.5">
          <div className="font-semibold text-emerald-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Headquarters & Advisory Division</span>
          </div>
          <div className="text-emerald-100 text-[11px]">
            Tea Research Institute of Sri Lanka, St. Coombs, Talawakelle.
          </div>
          <div className="text-emerald-300 text-[11px] flex items-center gap-1.5 pt-0.5">
            <Phone className="w-3 h-3" />
            <a href="tel:+94522258211" className="hover:underline">
              {OFFICIAL_TRI_SOURCES.ADVISORY_TEL}
            </a>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="font-semibold text-emerald-200 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Research Portals</span>
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            <a
              href={OFFICIAL_TRI_SOURCES.PATHOLOGY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-200 hover:text-white flex items-center gap-1"
            >
              <span>Plant Pathology Division Advisory</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href={OFFICIAL_TRI_SOURCES.ENTOMOLOGY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-200 hover:text-white flex items-center gap-1"
            >
              <span>Entomology & Nematology (Mites & Pests)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

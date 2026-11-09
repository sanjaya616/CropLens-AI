import React, { useState, useEffect } from 'react';
import { VerifiedGuidance, ConditionCategory } from '../types';
import { getConditionsApi } from '../services/api';
import { VERIFIED_CONDITIONS_CATALOG, OFFICIAL_TRI_SOURCES } from '../constants/conditions';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Bug,
  Sprout,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ConditionLibraryPageProps {
  navigate: (path: string) => void;
  selectedId?: string;
}

export const ConditionLibraryPage: React.FC<ConditionLibraryPageProps> = ({
  navigate,
  selectedId,
}) => {
  const [conditions, setConditions] = useState<VerifiedGuidance[]>(
    Object.values(VERIFIED_CONDITIONS_CATALOG)
  );
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ConditionCategory>('all');
  const [activeCondition, setActiveCondition] = useState<VerifiedGuidance | null>(null);

  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = async () => {
    try {
      const res = await getConditionsApi();
      if (res.conditions && res.conditions.length > 0) {
        setConditions(res.conditions);
      }
    } catch (err) {
      console.warn('Using built-in conditions catalog:', err);
    }
  };

  useEffect(() => {
    if (selectedId) {
      const found = conditions.find((c) => c.conditionId === selectedId);
      if (found) {
        setActiveCondition(found);
      }
    }
  }, [selectedId, conditions]);

  const filtered = conditions.filter((c) => {
    // Hide system outcomes from general condition browser unless explicitly searched
    if (['UNKNOWN', 'NOT_TEA', 'POOR_IMAGE'].includes(c.conditionId) && !search) {
      return false;
    }

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      c.visibleSymptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-800" />
            <span>Sri Lankan Tea Condition Library</span>
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Verified foliar symptoms and agricultural guidance grounded directly in Tea Research Institute (TRI) literature.
          </p>
        </div>

        <button
          onClick={() => navigate('/assessment/new')}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          Scan a Tea Leaf
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search condition name, scientific name, or symptom..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-stone-50"
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-emerald-900 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setCategoryFilter('disease')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              categoryFilter === 'disease'
                ? 'bg-emerald-900 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Foliar Diseases
          </button>
          <button
            onClick={() => setCategoryFilter('pest')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              categoryFilter === 'pest'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Mite Pests
          </button>
          <button
            onClick={() => setCategoryFilter('healthy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              categoryFilter === 'healthy'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Healthy Foliage
          </button>
        </div>
      </div>

      {/* Condition Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cond) => {
          const isPest = cond.category === 'pest';
          const isHealthy = cond.category === 'healthy';

          return (
            <div
              key={cond.conditionId}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div className="aspect-16/10 bg-stone-100 relative overflow-hidden">
                <img
                  src={cond.exampleImageUrl || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'}
                  alt={cond.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded backdrop-blur-xs ${
                      isPest
                        ? 'bg-amber-900/90 text-amber-200'
                        : isHealthy
                        ? 'bg-emerald-900/90 text-emerald-200'
                        : 'bg-stone-900/90 text-stone-200'
                    }`}
                  >
                    {isPest ? 'PEST (NOT DISEASE)' : isHealthy ? 'HEALTHY LEAF' : 'DISEASE'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{cond.name}</h3>
                    <div className="text-xs italic text-stone-500">{cond.scientificName}</div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {cond.additionalInformation}
                  </p>

                  <div className="space-y-1 pt-2">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                      Diagnostic Symptoms:
                    </span>
                    <ul className="text-xs text-stone-600 space-y-1">
                      {cond.visibleSymptoms.slice(0, 2).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">·</span>
                          <span className="line-clamp-2">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 truncate max-w-[170px]">{cond.officialSourceTitle.split('-')[0]}</span>
                    <a
                      href={cond.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
                    >
                      <span>TRI Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => setActiveCondition(cond)}
                    className="w-full py-2 bg-stone-50 hover:bg-emerald-50 text-emerald-900 font-semibold rounded-xl text-xs border border-stone-200 hover:border-emerald-300 transition-colors"
                  >
                    View Full Agricultural Guidance
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal Drawer for Selected Condition */}
      {activeCondition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800">
                  {activeCondition.category === 'pest' ? 'Tea Pest Profile' : activeCondition.category === 'healthy' ? 'Tea Foliage Profile' : 'Tea Pathology Profile'}
                </span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-0.5">{activeCondition.name}</h2>
                <div className="text-xs italic text-stone-500">{activeCondition.scientificName}</div>
              </div>
              <button
                onClick={() => setActiveCondition(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900">Background & Epidemiology:</span>
                <p className="leading-relaxed text-stone-600">{activeCondition.additionalInformation}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Visible Foliar Symptoms:
                </span>
                <ul className="space-y-1.5">
                  {activeCondition.visibleSymptoms.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="font-bold text-emerald-950">Field Monitoring Practice</div>
                  <ul className="space-y-1.5 text-emerald-900">
                    {activeCondition.monitoringGuidance.map((m, i) => (
                      <li key={i}>· {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="font-bold text-emerald-950">Approved Prevention Practice</div>
                  <ul className="space-y-1.5 text-emerald-900">
                    {activeCondition.preventionInformation.map((p, i) => (
                      <li key={i}>· {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-[11px] text-stone-500">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">Official TRI Reference:</span>
                  <a
                    href={activeCondition.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Visit Official TRI Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>{activeCondition.officialSourceTitle}</div>
                <div>Last Reviewed: {activeCondition.lastReviewed} ({activeCondition.reviewStatus})</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveCondition(null)}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

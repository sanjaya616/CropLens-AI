import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AssessmentRecord } from '../types';
import { getAssessmentsApi, deleteAssessmentApi } from '../services/api';
import {
  ScanLine,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  BookOpen,
  Sprout,
  TrendingUp,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    loadAssessments();
  }, [token]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await getAssessmentsApi(token!);
      setAssessments(res.assessments || []);
    } catch (err) {
      console.error('Failed to load user assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Delete this assessment and its saved leaf photographs? This action is irreversible.')) {
      return;
    }

    try {
      await deleteAssessmentApi(id, token);
      setAssessments((prev) => prev.filter((a) => a.assessmentId !== id));
    } catch (err) {
      console.error('Failed to delete assessment:', err);
      alert('Could not delete assessment. Please try again.');
    }
  };

  // Compute live distribution from actual records
  const conditionCounts: Record<string, number> = {};
  assessments.forEach((asm) => {
    const name = asm.primaryCondition.name;
    conditionCounts[name] = (conditionCounts[name] || 0) + 1;
  });

  const latestAssessment = assessments[0];

  return (
    <div className="space-y-8 py-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Grower Dashboard
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Welcome back, <span className="font-semibold text-stone-900">{user?.name || 'Tea Grower'}</span>
            {user?.district ? ` · ${user.district}` : ''}
          </p>
        </div>

        <button
          onClick={() => navigate('/assessment/new')}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <ScanLine className="w-4 h-4 text-emerald-300" />
          <span>New Leaf Assessment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Total Saved Screenings</div>
          <div className="text-3xl font-extrabold text-stone-900 mt-2">
            {loading ? '-' : assessments.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
            <Sprout className="w-3 h-3 text-emerald-600" />
            <span>Tea leaf foliar records</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Primary Condition Detected</div>
          <div className="text-lg font-bold text-emerald-900 mt-2 truncate">
            {loading
              ? '-'
              : latestAssessment
              ? latestAssessment.primaryCondition.name
              : 'No records yet'}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            {latestAssessment ? `Screened on ${new Date(latestAssessment.createdAt).toLocaleDateString()}` : 'Start first assessment'}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Diagnostic Limitations</div>
          <div className="text-xs text-amber-800 mt-2 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Preliminary AI Screening</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Always confirm with TRI advisory
          </div>
        </div>
      </div>

      {/* Condition distribution breakdown */}
      {Object.keys(conditionCounts).length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Observed Condition Distribution (From Your Saved Records)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(conditionCounts).map(([name, count]) => (
              <div key={name} className="bg-white p-3 rounded-xl border border-stone-200/80">
                <div className="font-semibold text-stone-900 truncate">{name}</div>
                <div className="text-emerald-700 font-bold text-base mt-1">
                  {count} <span className="text-xs font-normal text-stone-400">assessments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assessments Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Your Assessment History</h2>
          <span className="text-xs text-stone-500">
            {assessments.length} {assessments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            Loading assessment records...
          </div>
        ) : assessments.length === 0 ? (
          /* Useful Empty State */
          <div className="text-center py-12 px-4 bg-white border border-dashed border-stone-300 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <ScanLine className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-base font-bold text-stone-900">No leaf assessments yet</h3>
              <p className="text-xs text-stone-500">
                You haven't scanned any tea leaves yet. Take a photograph of suspect foliage in your plantation to receive preliminary AI screening and TRI guidance.
              </p>
            </div>
            <button
              onClick={() => navigate('/assessment/new')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Scan First Tea Leaf</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((asm) => {
              const mainImg = asm.images?.[0]?.downloadUrl || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80';
              const isPest = asm.primaryCondition.category === 'pest';
              const isHealthy = asm.primaryCondition.category === 'healthy';

              return (
                <div
                  key={asm.assessmentId}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-emerald-500/80 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-16/10 bg-stone-100 relative overflow-hidden">
                    <img
                      src={mainImg}
                      alt={asm.primaryCondition.name}
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
                        {asm.primaryCondition.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(asm.createdAt).toLocaleDateString()}
                        </span>
                        {asm.district && <span className="truncate max-w-[140px]">{asm.district.split('(')[0]}</span>}
                      </div>

                      <h3 className="font-bold text-sm text-stone-900 mt-1">
                        {asm.primaryCondition.name}
                      </h3>

                      <div className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {asm.visualObservations?.[0] || 'Visual foliar observation recorded.'}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/assessment/${asm.assessmentId}`)}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Result</span>
                      </button>

                      <button
                        onClick={() => handleDelete(asm.assessmentId)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information Reference Link */}
      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-stone-900">Tea Research Institute Condition Library</div>
            <div className="text-xs text-stone-500">Explore official identification keys and prevention circulars</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/conditions')}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 border border-stone-300 rounded-lg bg-white self-stretch sm:self-auto text-center"
        >
          Open Condition Library
        </button>
      </div>
    </div>
  );
};

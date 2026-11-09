import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminSummaryApi, updateAdminConditionApi, getConditionsApi } from '../services/api';
import { VerifiedGuidance, UserFeedback } from '../types';
import {
  ShieldCheck,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Edit,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { isAdmin, token, user } = useAuth();
  const [summary, setSummary] = useState<{
    totalUsers: number;
    totalAssessments: number;
    conditionDistribution: Record<string, number>;
    totalFeedback: number;
    recentAssessments: Array<{
      assessmentId: string;
      userId: string;
      condition: string;
      category: string;
      district?: string;
      createdAt: string;
    }>;
    recentFeedback: UserFeedback[];
  } | null>(null);

  const [conditions, setConditions] = useState<VerifiedGuidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit condition modal state
  const [editingCondition, setEditingCondition] = useState<VerifiedGuidance | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isAdmin || !token) return;
    loadAdminData();
  }, [isAdmin, token]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, condRes] = await Promise.all([
        getAdminSummaryApi(token!),
        getConditionsApi(),
      ]);
      setSummary(sumRes);
      setConditions(condRes.conditions || []);
    } catch (err: unknown) {
      console.error('Failed to load admin data:', err);
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin metrics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCondition || !token) return;

    try {
      await updateAdminConditionApi(
        editingCondition.conditionId,
        editingCondition,
        token
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setEditingCondition(null);
      loadAdminData();
    } catch (err) {
      console.error('Failed to update condition:', err);
      alert('Failed to save condition changes.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Administrator Access Required</h2>
          <p className="text-xs text-stone-600">
            This dashboard is restricted to authorized Tea Research Institute administrators (configured via backend administrator UIDs/claims).
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-800" />
            <span>Administrator Control Portal</span>
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Verified as <span className="font-semibold text-stone-900">{user?.email}</span> · System monitoring & TRI guidance management
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 border border-stone-200 rounded-xl bg-white flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
          Loading administrator metrics and conditions...
        </div>
      ) : summary ? (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Total Registered Users</span>
                <Users className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{summary.totalUsers}</div>
              <div className="text-[11px] text-stone-400 mt-1">Growers & personnel</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Leaf Assessments</span>
                <FileText className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{summary.totalAssessments}</div>
              <div className="text-[11px] text-stone-400 mt-1">Processed with Gemini AI</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Grower Feedback</span>
                <MessageSquare className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{summary.totalFeedback}</div>
              <div className="text-[11px] text-stone-400 mt-1">Evaluation survey records</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">TRI Guidance Records</span>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{conditions.length}</div>
              <div className="text-[11px] text-stone-400 mt-1">Verified taxonomy entries</div>
            </div>
          </div>

          {/* Condition Distribution from actual records */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>Assessment Condition Distribution Across Sri Lankan Plantations</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {Object.entries(summary.conditionDistribution).map(([condId, count]) => (
                <div key={condId} className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="font-semibold text-stone-900 truncate">{condId.replace(/_/g, ' ')}</div>
                  <div className="text-emerald-700 font-bold text-lg mt-1">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Condition Guidance Management */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Verified Condition Information Management</h3>
                <p className="text-xs text-stone-500">Edit visible symptoms, approved prevention measures, and review status</p>
              </div>
              {saveSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Changes Published</span>
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Condition Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Scientific Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Reviewed</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {conditions.map((c) => (
                    <tr key={c.conditionId} className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{c.name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.category === 'pest'
                              ? 'bg-amber-100 text-amber-900'
                              : c.category === 'healthy'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {c.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 italic text-stone-600">{c.scientificName}</td>
                      <td className="py-2.5 px-3 capitalize text-emerald-700 font-medium">{c.reviewStatus}</td>
                      <td className="py-2.5 px-3 text-stone-500">{c.lastReviewed}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setEditingCondition(c)}
                          className="px-2.5 py-1 text-xs text-emerald-800 hover:text-emerald-950 font-semibold border border-stone-200 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Feedback Log */}
          {summary.recentFeedback && summary.recentFeedback.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900">Recent Grower Feedback Submissions</h3>
              <div className="space-y-2 text-xs">
                {summary.recentFeedback.map((fb) => (
                  <div key={fb.feedbackId} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        <span>{fb.conditionId}</span>
                        <span className="text-amber-600 font-bold">★ {fb.rating}/5</span>
                      </div>
                      <p className="text-stone-600 mt-1 italic">"{fb.comments || 'No comment text provided'}"</p>
                    </div>
                    <div className="text-[11px] text-stone-400 self-end sm:self-auto">
                      {new Date(fb.createdAt).toLocaleDateString()} · {fb.userEmail || 'Anonymous'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Edit Condition Modal */}
      {editingCondition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                Edit Condition: {editingCondition.name}
              </h3>
              <button
                onClick={() => setEditingCondition(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCondition} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Condition Name</label>
                <input
                  type="text"
                  value={editingCondition.name}
                  onChange={(e) =>
                    setEditingCondition({ ...editingCondition, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Scientific Name</label>
                <input
                  type="text"
                  value={editingCondition.scientificName}
                  onChange={(e) =>
                    setEditingCondition({ ...editingCondition, scientificName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Epidemiology & Information</label>
                <textarea
                  value={editingCondition.additionalInformation}
                  onChange={(e) =>
                    setEditingCondition({ ...editingCondition, additionalInformation: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Review Status</label>
                <select
                  value={editingCondition.reviewStatus}
                  onChange={(e) =>
                    setEditingCondition({
                      ...editingCondition,
                      reviewStatus: e.target.value as 'approved' | 'pending_review' | 'archived',
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                >
                  <option value="approved">Approved & Published</option>
                  <option value="pending_review">Requires Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Official TRI Source Title</label>
                <input
                  type="text"
                  value={editingCondition.officialSourceTitle}
                  onChange={(e) =>
                    setEditingCondition({ ...editingCondition, officialSourceTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Official TRI Source URL</label>
                <input
                  type="url"
                  value={editingCondition.officialSourceUrl}
                  onChange={(e) =>
                    setEditingCondition({ ...editingCondition, officialSourceUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingCondition(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Save & Publish Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

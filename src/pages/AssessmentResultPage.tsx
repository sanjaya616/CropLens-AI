import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AssessmentRecord, UserFeedback } from '../types';
import {
  getAssessmentByIdApi,
  deleteAssessmentApi,
  submitFeedbackApi,
} from '../services/api';
import { ExpertReferralCard } from '../components/ExpertReferralCard';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Bug,
  Trash2,
  Star,
  Send,
  Sparkles,
} from 'lucide-react';

interface AssessmentResultPageProps {
  assessmentId: string;
  navigate: (path: string) => void;
}

export const AssessmentResultPage: React.FC<AssessmentResultPageProps> = ({
  assessmentId,
  navigate,
}) => {
  const { token, user } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback form state
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !assessmentId) return;

    loadAssessment();
  }, [assessmentId, token]);

  const loadAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssessmentByIdApi(assessmentId, token!);
      setAssessment(res.assessment);
    } catch (err: unknown) {
      console.error('Failed to load assessment:', err);
      const msg = err instanceof Error ? err.message : 'Failed to retrieve assessment details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !assessment) return;
    if (!window.confirm('Delete this assessment and associated photos permanently?')) {
      return;
    }

    try {
      await deleteAssessmentApi(assessment.assessmentId, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete assessment.');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !assessment) return;

    setFeedbackSubmitting(true);
    try {
      await submitFeedbackApi(
        {
          assessmentId: assessment.assessmentId,
          conditionId: assessment.primaryCondition.id,
          rating,
          comments,
        },
        token
      );
      setFeedbackSent(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      alert('Could not submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-stone-500">
        Loading assessment screening record...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-stone-900">Assessment Unavailable</h2>
          <p className="text-xs text-stone-600">{error || 'Record could not be found or you do not have permission.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const primary = assessment.primaryCondition;
  const isPest = primary.category === 'pest';
  const isHealthy = primary.category === 'healthy';
  const guidance = assessment.guidance;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 px-4 sm:px-0">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Delete this record"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete Record</span>
          </button>
        </div>
      </div>

      {/* Main Banner: Primary Condition Result */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900">Crop: Tea (Camellia sinensis)</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(assessment.createdAt).toLocaleDateString()}
              </span>
            </div>

            {assessment.district && (
              <div className="flex items-center gap-1 text-emerald-800 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{assessment.district}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Primary Photograph */}
            <div className="md:col-span-5 space-y-2">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                <img
                  src={assessment.images?.[0]?.downloadUrl}
                  alt={primary.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md shadow-xs ${
                      isPest
                        ? 'bg-amber-950/90 text-amber-200'
                        : isHealthy
                        ? 'bg-emerald-950/90 text-emerald-200'
                        : 'bg-stone-950/90 text-stone-200'
                    }`}
                  >
                    {isPest ? 'PEST IDENTIFICATION' : isHealthy ? 'HEALTHY FOLIAGE' : 'PLANT PATHOLOGY DISEASE'}
                  </span>
                </div>
              </div>

              {assessment.images.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {assessment.images.slice(1).map((img, i) => (
                    <div
                      key={img.imageId}
                      className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200"
                    >
                      <img
                        src={img.downloadUrl}
                        alt={`Additional view ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Condition Header Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
                  Primary Screening Outcome
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-0.5">
                  {primary.name}
                </h1>
                {guidance?.scientificName && (
                  <div className="text-xs italic text-stone-600 mt-1">
                    Causal Agent: {guidance.scientificName}
                  </div>
                )}
              </div>

              {/* Qualitative similarity badge */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">Visual Similarity Level:</span>
                  <span
                    className={`font-bold capitalize ${
                      primary.matchLevel === 'strong'
                        ? 'text-emerald-800'
                        : primary.matchLevel === 'possible'
                        ? 'text-amber-700'
                        : 'text-stone-700'
                    }`}
                  >
                    {primary.matchLevel} visual similarity
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {primary.confidenceDescription || 'Descriptive qualitative AI screening assessment.'}
                </p>
              </div>

              {/* Distinction reminder for Spider Mites */}
              {isPest && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Bug className="w-4 h-4 text-amber-700" />
                    <span>Important Distinction: Arachnid Pest</span>
                  </div>
                  <p className="text-[11px] text-amber-950 leading-relaxed">
                    Spider Mites are sap-sucking pests (Oligonychus / Brevipalpus), NOT a fungal disease. Fungicides will not control spider mites and may harm beneficial predatory mite populations.
                  </p>
                </div>
              )}

              {/* Alternative conditions */}
              {assessment.alternativeConditions && assessment.alternativeConditions.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Alternative Conditions Considered
                  </span>
                  <div className="space-y-1.5">
                    {assessment.alternativeConditions.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-stone-900">{alt.name}</span>
                          <span className="text-[11px] text-stone-500 ml-2">({alt.matchLevel} similarity)</span>
                        </div>
                        <span className="text-[11px] text-stone-500 italic max-w-xs truncate">{alt.reasonForDoubt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: What the AI Observed */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
            1
          </div>
          <h3>What the AI Observed from the Photograph</h3>
        </div>
        <ul className="space-y-2 text-xs text-stone-700">
          {assessment.visualObservations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SECTION 2: What the AI Considers Possible */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
            2
          </div>
          <h3>What the AI Considers Possible (Taxonomy & Symptoms)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-900">Symptom Compatibility:</span>
            <ul className="space-y-1 text-stone-600 mt-1">
              {assessment.possibleSymptoms?.map((sym, i) => (
                <li key={i}>· {sym}</li>
              ))}
            </ul>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-900">Grower Context Considered:</span>
            <ul className="space-y-1 text-stone-600 mt-1">
              {assessment.contextConsiderations?.map((ctx, i) => (
                <li key={i}>· {ctx}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3: What Cannot Be Confirmed */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
            3
          </div>
          <h3>What Cannot Be Confirmed from Photograph Alone</h3>
        </div>
        <div className="space-y-2 text-xs text-stone-700">
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
            <span className="font-semibold text-amber-950">Diagnostic Limitations:</span>
            <ul className="space-y-1 text-amber-900 mt-1">
              {assessment.unknownFactors?.map((fac, i) => (
                <li key={i}>· {fac}</li>
              ))}
            </ul>
          </div>

          {assessment.followUpQuestions && assessment.followUpQuestions.length > 0 && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="font-semibold text-stone-900">Follow-Up Questions for Grower:</span>
              <ul className="space-y-1 text-stone-600 mt-1">
                {assessment.followUpQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: What Official Guidance Says */}
      {guidance && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h3>What Official TRI Agricultural Guidance Says</h3>
            </div>
            <a
              href={guidance.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>{guidance.officialSourceTitle.split('-')[0]}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-2">
              <div className="font-bold text-emerald-950">Verified Monitoring Practice</div>
              <ul className="space-y-1.5 text-emerald-900">
                {guidance.monitoringGuidance.map((m, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">·</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-2">
              <div className="font-bold text-emerald-950">Verified Prevention Practice</div>
              <ul className="space-y-1.5 text-emerald-900">
                {guidance.preventionInformation.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <span>Official Reference: {guidance.officialSourceTitle}</span>
            <span>Reviewed Status: {guidance.reviewStatus} ({guidance.lastReviewed})</span>
          </div>
        </div>
      )}

      {/* SECTION 5: What the User Should Consider Doing Next */}
      <div className="space-y-4">
        <ExpertReferralCard district={assessment.district} />
      </div>

      <SafetyDisclaimer />

      {/* Feedback Submission Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Grower Screening Feedback</span>
          </div>
          <span className="text-xs text-stone-500">Helps refine Sri Lankan evaluation records</span>
        </div>

        {feedbackSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Thank you! Your feedback has been recorded for the research evaluation log.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700">Visual Agreement Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-stone-300 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Comments on symptom alignment or field observations (optional)..."
              rows={2}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 bg-white"
            />

            <button
              type="submit"
              disabled={feedbackSubmitting}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{feedbackSubmitting ? 'Submitting...' : 'Submit Evaluation Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

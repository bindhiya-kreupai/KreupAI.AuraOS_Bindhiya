'use client';

import React, { useEffect, useState } from 'react';
import { PerformanceReviewService, ReviewCycleService } from '../core/services';
import { AlertCircle, CheckCircle2, Loader2, Save, Send, Star, UserCheck } from 'lucide-react';

type FormState = {
  achievements: string;
  improvements: string;
  rating: number;
};

const emptyForm: FormState = {
  achievements: '',
  improvements: '',
  rating: 0,
};

export default function SelfAssessmentPage() {
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cycles, reviews] = await Promise.all([
          ReviewCycleService.getCycles({ isActive: true }),
          PerformanceReviewService.getReviews(),
        ]);
        if (cycles.length > 0) setActiveCycle(cycles[0]);

        const selfReview = reviews.find(
          (r: any) => r.status === 'self_assessment' || r.status === 'not_started'
        );
        if (selfReview) {
          setActiveReview(selfReview);
          const sa = (selfReview as any).selfAssessment || {};
          setForm({
            achievements: sa.achievements || '',
            improvements: sa.challenges || sa.improvements || '',
            rating: Number(sa.overallRating || 0),
          });
        }
      } catch (error: any) {
        console.error('Failed to load self-assessment data:', error);
        setStatus({ kind: 'error', text: error?.message || 'Failed to load.' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const persist = async (action: 'draft' | 'submit') => {
    if (!activeReview?.id) {
      setStatus({
        kind: 'error',
        text: 'No active review found. Wait for HR to start a review cycle for you.',
      });
      return;
    }
    if (action === 'submit') {
      if (!form.achievements.trim() || !form.improvements.trim() || !form.rating) {
        setStatus({
          kind: 'error',
          text: 'Please fill in all questions and give yourself a rating before submitting.',
        });
        return;
      }
    }

    const setter = action === 'submit' ? setSubmitting : setSaving;
    setter(true);
    setStatus(null);
    try {
      await PerformanceReviewService.updateReview(activeReview.id, {
        selfAssessment: {
          overallRating: form.rating,
          achievements: form.achievements,
          challenges: form.improvements,
          learnings: '',
          submittedDate: new Date().toISOString(),
        },
        status: action === 'submit' ? 'manager_review' : 'self_assessment',
      } as any);
      if (action === 'submit') {
        await PerformanceReviewService.submitReview(activeReview.id);
      }
      setStatus({
        kind: 'success',
        text: action === 'submit' ? 'Self-assessment submitted.' : 'Draft saved.',
      });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: 'error', text: e?.message || 'Failed to save.' });
    } finally {
      setter(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-500" />
            Self Assessment
          </h1>
          <p className="text-slate-500 text-sm">
            Reflect on your achievements and areas for growth.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => persist('draft')}
            disabled={saving || submitting}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => persist('submit')}
            disabled={saving || submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`max-w-4xl mx-auto rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-indigo-100">
            {activeCycle ? activeCycle.cycleName || activeCycle.name : 'Self Assessment'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {activeCycle
              ? `Please complete your self-evaluation for the ${activeCycle.cycleType || activeCycle.type || 'review'} cycle${activeCycle.startDate ? ` (${new Date(activeCycle.startDate).toLocaleDateString()} - ${new Date(activeCycle.endDate).toLocaleDateString()})` : ''}.`
              : 'No active review cycle. Once HR starts a review, this form will save against your record.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block font-bold mb-2">
              1. What were your key achievements this year?
            </label>
            <textarea
              value={form.achievements}
              onChange={(e) => setForm({ ...form, achievements: e.target.value })}
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Describe your major accomplishments..."
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block font-bold mb-2">
              2. Which areas do you believe you need to improve?
            </label>
            <textarea
              value={form.improvements}
              onChange={(e) => setForm({ ...form, improvements: e.target.value })}
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Identify areas for development..."
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block font-bold mb-4">
              3. How would you rate your overall performance?
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setForm({ ...form, rating })}
                  className={`flex-1 py-3 rounded-xl border font-bold transition-all focus:ring-2 focus:ring-indigo-500 ${
                    form.rating === rating
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{rating}</div>
                  <div className="flex justify-center">
                    <Star
                      className={`w-4 h-4 ${
                        form.rating >= rating
                          ? 'fill-current text-amber-400'
                          : 'fill-current text-slate-300'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
              <span>Needs Improvement</span>
              <span>Exceeds Expectations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

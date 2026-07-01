'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Clock, Play, CheckCircle, Loader2, X, Send } from 'lucide-react';
import { SurveyService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

export default function SurveysPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const surveys = await SurveyService.getSurveys();
      setData(surveys);
    } catch {
      setToast({ type: 'error', msg: 'Failed to load surveys.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmitResponse = async () => {
    if (!activeSurvey || !user) return;
    try {
      setSubmitting(true);
      await SurveyService.submitResponse({
        surveyId: activeSurvey.id,
        answers: { rating, comment },
        sentiment: rating,
        isAnonymous: Boolean(activeSurvey.isAnonymous),
      });
      showToast('success', 'Response submitted. Thank you!');
      setActiveSurvey(null);
      setComment('');
      setRating(5);
      await fetchData();
    } catch {
      showToast('error', 'Failed to submit response.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const activeSurveys = data.filter(
    (s: any) => s.status === 'active' || s.status === 'ACTIVE' || s.status === 'open'
  );
  const completedSurveys = data.filter(
    (s: any) => s.status === 'closed' || s.status === 'completed' || s.status === 'COMPLETED'
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`absolute top-2 right-2 z-50 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-500" />
            Company Surveys
          </h1>
          <p className="text-slate-500 text-sm">
            Detailed feedback forms and organizational studies.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ClipboardList className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No surveys available yet.</p>
          <p className="text-sm">Company surveys will appear here once created.</p>
        </div>
      ) : (
        <>
          {activeSurveys.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSurveys.map((survey: any, i: number) => (
                <div
                  key={survey.id || i}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-all group border-l-4 border-l-slate-400 dark:border-l-slate-600 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
                  <h3 className="font-bold text-xl mb-2 pr-8">{survey.title}</h3>
                  <div className="flex gap-3 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {survey.time || '~10 mins'}
                    </span>
                    {survey.deadline && (
                      <span className="font-bold text-rose-500">Due: {survey.deadline}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveSurvey(survey)}
                    className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 bg-indigo-600"
                  >
                    Start Survey <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {completedSurveys.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Completed Surveys</h3>
              <div className="space-y-4">
                {completedSurveys.map((sur: any, i: number) => (
                  <div
                    key={sur.id || i}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h4 className="font-bold">{sur.title}</h4>
                        {sur.id && <div className="text-xs text-slate-500">ID: {sur.id}</div>}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-500">
                      {sur.completedOn ? `Submitted on ${sur.completedOn}` : 'Completed'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveSurvey(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-1">{activeSurvey.title}</h2>
            <p className="text-sm text-slate-500 mb-6">Share your feedback with the team.</p>

            <label className="text-xs font-bold text-slate-500 mb-2 block">
              Overall rating: {rating}/10
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value, 10))}
              className="w-full mb-4"
            />

            <label className="text-xs font-bold text-slate-500 mb-1 block">Comments</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional feedback..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4"
            />

            <button
              onClick={handleSubmitResponse}
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

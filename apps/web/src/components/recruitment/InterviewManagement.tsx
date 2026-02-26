'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Phone,
  Users,
  Calendar,
  CheckCircle2,
  Star,
  RefreshCw,
  Plus,
  ChevronRight,
  Target,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import type {
  Interview,
  InterviewFeedback,
  Candidate,
  InterviewType,
  RecruitmentAnalytics,
} from '@/services/recruitmentService';
import { RecruitmentService } from '@/services/recruitmentService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'upcoming' | 'feedback' | 'scorecards' | 'analytics';

interface FeedbackForm {
  interviewId: string;
  candidateId: string;
  technicalSkills: 1 | 2 | 3 | 4 | 5;
  communication: 1 | 2 | 3 | 4 | 5;
  cultureFit: 1 | 2 | 3 | 4 | 5;
  problemSolving: 1 | 2 | 3 | 4 | 5;
  leadership: 1 | 2 | 3 | 4 | 5;
  strengths: string;
  weaknesses: string;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  additionalNotes: string;
}

interface DashboardState {
  interviews: Interview[];
  candidates: Candidate[];
  analytics: RecruitmentAnalytics | null;
  loading: boolean;
  activeTab: Tab;
  selectedInterview: Interview | null;
  feedbackForm: FeedbackForm | null;
  feedbackSubmitting: boolean;
  feedbackSubmitted: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const INTERVIEW_TYPE_ICONS: Record<InterviewType, React.ReactNode> = {
  phone: <Phone size={14} />,
  video: <Video size={14} />,
  onsite: <Users size={14} />,
  technical: <Target size={14} />,
  panel: <Users size={14} />,
};

const INTERVIEW_TYPE_COLORS: Record<InterviewType, string> = {
  phone: 'bg-sky-100 text-sky-700',
  video: 'bg-purple-100 text-purple-700',
  onsite: 'bg-slate-100 text-slate-700',
  technical: 'bg-amber-100 text-amber-700',
  panel: 'bg-emerald-100 text-emerald-700',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-amber-100 text-amber-700',
};

const RECOMMENDATION_COLORS = {
  strong_hire: 'bg-emerald-600 text-white',
  hire: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
  no_hire: 'bg-red-100 text-red-700',
  strong_no_hire: 'bg-red-600 text-white',
};

const RECOMMENDATION_LABELS = {
  strong_hire: 'Strong Hire',
  hire: 'Hire',
  neutral: 'Neutral',
  no_hire: 'No Hire',
  strong_no_hire: 'Strong No Hire',
};

const RATING_DIMENSIONS = [
  { key: 'technicalSkills', label: 'Technical Skills' },
  { key: 'communication', label: 'Communication' },
  { key: 'cultureFit', label: 'Culture Fit' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'leadership', label: 'Leadership' },
] as const;

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
            value === n
              ? 'bg-slate-800 text-white border-slate-800'
              : 'border-slate-200 text-slate-600 hover:border-slate-400'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 w-8 text-right">
        {score}/{max}
      </span>
    </div>
  );
}

// ── Upcoming Interviews Tab ────────────────────────────────────────────────────

function UpcomingInterviewsTab({
  interviews,
  onSelectInterview,
}: {
  interviews: Interview[];
  onSelectInterview: (i: Interview) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<InterviewType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = interviews.filter((i) => {
    const type = typeFilter === 'All' || i.type === typeFilter;
    const status = statusFilter === 'All' || i.status === statusFilter;
    return type && status;
  });

  // Sort by date
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as InterviewType | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Types</option>
          {(['phone', 'video', 'onsite', 'technical', 'panel'] as InterviewType[]).map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {['scheduled', 'completed', 'cancelled', 'rescheduled'].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
          <Plus size={14} />
          Schedule Interview
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((interview) => {
          const isToday =
            new Date(interview.scheduledDate).toDateString() === new Date().toDateString();
          return (
            <div
              key={interview.id}
              className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all cursor-pointer ${
                isToday ? 'border-sky-300 bg-sky-50/30' : 'border-slate-200 hover:border-slate-400'
              }`}
              onClick={() => onSelectInterview(interview)}
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${INTERVIEW_TYPE_COLORS[interview.type]}`}
                >
                  {INTERVIEW_TYPE_ICONS[interview.type]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800">{interview.candidateName}</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${INTERVIEW_TYPE_COLORS[interview.type]}`}
                    >
                      {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                    </span>
                    {isToday && (
                      <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{interview.jobTitle}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {interview.interviewers.map((i) => i.name).join(', ')}
                  </p>
                </div>

                {/* Date/Time */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(interview.scheduledDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {interview.startTime} — {interview.endTime}
                  </p>
                  <p className="text-xs text-slate-400">{interview.duration} min</p>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[interview.status] || 'bg-slate-100 text-slate-500'}`}
                  >
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                </div>
              </div>

              {interview.meetingLink && (
                <div className="mt-2 text-xs text-sky-600">{interview.meetingLink}</div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-400">No interviews found.</div>
        )}
      </div>
    </div>
  );
}

// ── Feedback Tab ───────────────────────────────────────────────────────────────

function FeedbackTab({
  interviews,
  form,
  setForm,
  onSubmit,
  submitting,
  submitted,
}: {
  interviews: Interview[];
  form: FeedbackForm | null;
  setForm: (f: FeedbackForm | null) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  submitted: boolean;
}) {
  const completedInterviews = interviews.filter((i) => i.status === 'completed');

  function initForm(interview: Interview) {
    setForm({
      interviewId: interview.id,
      candidateId: interview.candidateId,
      technicalSkills: 3,
      communication: 3,
      cultureFit: 3,
      problemSolving: 3,
      leadership: 3,
      strengths: '',
      weaknesses: '',
      recommendation: 'neutral',
      additionalNotes: '',
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Feedback Submitted</h3>
        <p className="text-sm text-slate-500 mt-1">Your interview feedback has been recorded.</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 font-medium">
          Select a completed interview to submit feedback:
        </p>
        {completedInterviews.map((interview) => {
          const hasFeedback = interview.feedback && interview.feedback.length > 0;
          return (
            <button
              key={interview.id}
              onClick={() => initForm(interview)}
              disabled={hasFeedback}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                hasFeedback
                  ? 'border-emerald-200 bg-emerald-50/40 opacity-60 cursor-default'
                  : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-slate-800">{interview.candidateName}</p>
                <p className="text-xs text-slate-400">
                  {interview.jobTitle} &bull;{' '}
                  {new Date(interview.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium ${INTERVIEW_TYPE_COLORS[interview.type]}`}
              >
                {interview.type}
              </span>
              {hasFeedback ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Submitted
                </span>
              ) : (
                <ChevronRight size={16} className="text-slate-300" />
              )}
            </button>
          );
        })}
        {completedInterviews.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No completed interviews requiring feedback.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Submit Interview Feedback</h3>
        <button
          onClick={() => setForm(null)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>
      </div>

      {/* Rating Dimensions */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Rating Dimensions (1=Poor, 5=Excellent)
        </h4>
        <div className="space-y-4">
          {RATING_DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 w-36 flex-shrink-0">
                {label}
              </label>
              <RatingInput
                value={form[key] as number}
                onChange={(v) => setForm({ ...form, [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Text Feedback */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Strengths</label>
          <textarea
            value={form.strengths}
            onChange={(e) => setForm({ ...form, strengths: e.target.value })}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
            placeholder="Candidate's key strengths..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Areas for Improvement
          </label>
          <textarea
            value={form.weaknesses}
            onChange={(e) => setForm({ ...form, weaknesses: e.target.value })}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
            placeholder="Areas of concern or development..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Additional Notes
          </label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
            placeholder="Any other observations..."
          />
        </div>
      </div>

      {/* Recommendation */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Hiring Recommendation</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RECOMMENDATION_LABELS) as (keyof typeof RECOMMENDATION_LABELS)[]).map(
            (rec) => (
              <button
                key={rec}
                onClick={() => setForm({ ...form, recommendation: rec })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.recommendation === rec
                    ? RECOMMENDATION_COLORS[rec]
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {RECOMMENDATION_LABELS[rec]}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-slate-800 text-white text-sm rounded-xl hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}

// ── Scorecards Tab ─────────────────────────────────────────────────────────────

function ScorecardsTab({
  interviews,
  candidates,
}: {
  interviews: Interview[];
  candidates: Candidate[];
}) {
  const candidatesWithFeedback = candidates.filter((c) => {
    const cInterviews = interviews.filter((i) => i.candidateId === c.id);
    return cInterviews.some((i) => i.feedback && i.feedback.length > 0);
  });

  if (candidatesWithFeedback.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No scorecards available yet. Submit feedback to generate scorecards.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {candidatesWithFeedback.map((candidate) => {
        const cInterviews = interviews.filter(
          (i) => i.candidateId === candidate.id && i.feedback && i.feedback.length > 0
        );
        const allFeedback = cInterviews.flatMap((i) => i.feedback || []);

        // Aggregate scores
        const aggScores = RATING_DIMENSIONS.reduce(
          (acc, dim) => {
            const scores = allFeedback
              .map((f: InterviewFeedback) => (f as any)[dim.key] || 0)
              .filter((s: number) => s > 0);
            acc[dim.key] =
              scores.length > 0
                ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
                : 0;
            return acc;
          },
          {} as Record<string, number>
        );

        const overallScore =
          Object.values(aggScores).reduce((a, b) => a + b, 0) / RATING_DIMENSIONS.length;

        return (
          <div key={candidate.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: candidate.avatarColor || '#64748b' }}
              >
                {candidate.avatarInitials}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{candidate.fullName}</p>
                <p className="text-sm text-slate-500">{candidate.jobTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-800">{overallScore.toFixed(1)}/5</p>
                <p className="text-xs text-slate-400">{allFeedback.length} feedback(s)</p>
              </div>
            </div>

            <div className="space-y-2">
              {RATING_DIMENSIONS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-36 flex-shrink-0">{label}</span>
                  <ScoreBar score={aggScores[key]} />
                </div>
              ))}
            </div>

            {/* Per-interviewer breakdown */}
            {allFeedback.length > 1 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">Interviewer Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {allFeedback.map((f, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-slate-50 border border-slate-100 rounded-lg px-2 py-1"
                    >
                      <p className="font-medium text-slate-700">{f.interviewerName}</p>
                      <p className="text-slate-400">Overall: {f.overallRating.toFixed(1)}</p>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${RECOMMENDATION_COLORS[f.recommendation] || 'bg-slate-100 text-slate-500'}`}
                      >
                        {RECOMMENDATION_LABELS[f.recommendation]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Interview Analytics Tab ────────────────────────────────────────────────────

function InterviewAnalyticsTab({
  interviews,
  analytics,
}: {
  interviews: Interview[];
  analytics: RecruitmentAnalytics | null;
}) {
  const totalScheduled = interviews.length;
  const totalCompleted = interviews.filter((i) => i.status === 'completed').length;
  const completionRate =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const avgInterviewers =
    interviews.length > 0
      ? (interviews.reduce((a, b) => a + b.interviewers.length, 0) / interviews.length).toFixed(1)
      : 0;

  // By type breakdown
  const byType = (['phone', 'video', 'onsite', 'technical', 'panel'] as InterviewType[])
    .map((type) => ({
      type,
      count: interviews.filter((i) => i.type === type).length,
    }))
    .filter((t) => t.count > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar size={18} className="text-slate-600" />}
          label="Total Interviews"
          value={totalScheduled}
          color="bg-slate-100"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Completed"
          value={totalCompleted}
          sub={`${completionRate}% rate`}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<Users size={18} className="text-sky-600" />}
          label="Avg Interviewers"
          value={avgInterviewers}
          sub="per interview"
          color="bg-sky-100"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-amber-600" />}
          label="Offer Acceptance"
          value={analytics ? `${analytics.offerAcceptanceRate.toFixed(0)}%` : '—'}
          color="bg-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Interview by Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Interviews by Type</h3>
          <div className="space-y-3">
            {byType.map(({ type, count }) => (
              <div key={type} className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${INTERVIEW_TYPE_COLORS[type]}`}>
                  {INTERVIEW_TYPE_ICONS[type]}
                </div>
                <span className="text-sm text-slate-600 w-24 flex-shrink-0 capitalize">{type}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-700 h-2 rounded-full"
                    style={{ width: `${(count / totalScheduled) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time-to-Hire by Stage */}
        {analytics && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Pipeline Conversion</h3>
            <div className="space-y-3">
              {analytics.pipelineFunnel.slice(0, 6).map(({ label, count, conversionRate }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-28 flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-24 text-right">
                    {count} ({conversionRate.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interviewer Calibration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Interviewer Activity</h3>
        {interviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 font-semibold text-slate-600">Interviewer</th>
                  <th className="text-right pb-3 font-semibold text-slate-600">Interviews</th>
                  <th className="text-right pb-3 font-semibold text-slate-600">Feedback Rate</th>
                  <th className="text-right pb-3 font-semibold text-slate-600">Avg Rating Given</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  interviews.reduce((acc, interview) => {
                    interview.interviewers.forEach((interviewer) => {
                      const existing = acc.get(interviewer.id) || {
                        name: interviewer.name,
                        count: 0,
                        feedbackCount: 0,
                        totalRating: 0,
                      };
                      existing.count++;
                      const feedback = interview.feedback?.find(
                        (f) => f.interviewerId === interviewer.id
                      );
                      if (feedback) {
                        existing.feedbackCount++;
                        existing.totalRating += feedback.overallRating;
                      }
                      acc.set(interviewer.id, existing);
                    });
                    return acc;
                  }, new Map<string, { name: string; count: number; feedbackCount: number; totalRating: number }>())
                )
                  .slice(0, 8)
                  .map(([id, data]) => (
                    <tr key={id} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-800">{data.name}</td>
                      <td className="py-3 text-right text-slate-600">{data.count}</td>
                      <td className="py-3 text-right text-slate-600">
                        {data.count > 0
                          ? `${Math.round((data.feedbackCount / data.count) * 100)}%`
                          : '—'}
                      </td>
                      <td className="py-3 text-right text-slate-600">
                        {data.feedbackCount > 0
                          ? (data.totalRating / data.feedbackCount).toFixed(1)
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No interviewer data available.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function InterviewManagement() {
  const [state, setState] = useState<DashboardState>({
    interviews: [],
    candidates: [],
    analytics: null,
    loading: true,
    activeTab: 'upcoming',
    selectedInterview: null,
    feedbackForm: null,
    feedbackSubmitting: false,
    feedbackSubmitted: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [interviewsResult, candidatesResult, analytics] = await Promise.all([
        RecruitmentService.getInterviews ? RecruitmentService.getInterviews() : Promise.resolve([]),
        RecruitmentService.getCandidates(),
        RecruitmentService.getAnalytics(),
      ]);
      setState((s) => ({
        ...s,
        interviews: interviewsResult.interviews || interviewsResult,
        candidates: candidatesResult.candidates || candidatesResult,
        analytics,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFeedbackSubmit = useCallback(async () => {
    const { feedbackForm } = state;
    if (!feedbackForm) return;
    setState((s) => ({ ...s, feedbackSubmitting: true }));
    try {
      await RecruitmentService.submitFeedback?.(feedbackForm);
      setState((s) => ({ ...s, feedbackSubmitting: false, feedbackSubmitted: true }));
    } catch {
      setState((s) => ({ ...s, feedbackSubmitting: false }));
    }
  }, [state]);

  const {
    interviews,
    candidates,
    analytics,
    loading,
    activeTab,
    feedbackForm,
    feedbackSubmitting,
    feedbackSubmitted,
  } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming Interviews' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'scorecards', label: 'Scorecards' },
    { id: 'analytics', label: 'Interview Analytics' },
  ];

  const todayInterviews = interviews.filter(
    (i) => new Date(i.scheduledDate).toDateString() === new Date().toDateString()
  );
  const pendingFeedback = interviews.filter(
    (i) => i.status === 'completed' && (!i.feedback || i.feedback.length === 0)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading interviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interview Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Scheduling, feedback, scorecards, and calibration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
            <Plus size={14} />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar size={18} className="text-slate-600" />}
          label="Total Scheduled"
          value={interviews.length}
          color="bg-slate-100"
        />
        <StatCard
          icon={<Star size={18} className="text-amber-600" />}
          label="Today's Interviews"
          value={todayInterviews.length}
          color="bg-amber-100"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-red-600" />}
          label="Feedback Pending"
          value={pendingFeedback}
          color="bg-red-100"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Completed"
          value={interviews.filter((i) => i.status === 'completed').length}
          color="bg-emerald-100"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id, feedbackSubmitted: false }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'upcoming' && (
          <UpcomingInterviewsTab
            interviews={interviews}
            onSelectInterview={(i) => setState((s) => ({ ...s, selectedInterview: i }))}
          />
        )}
        {activeTab === 'feedback' && (
          <FeedbackTab
            interviews={interviews}
            form={feedbackForm}
            setForm={(f) => setState((s) => ({ ...s, feedbackForm: f }))}
            onSubmit={handleFeedbackSubmit}
            submitting={feedbackSubmitting}
            submitted={feedbackSubmitted}
          />
        )}
        {activeTab === 'scorecards' && (
          <ScorecardsTab interviews={interviews} candidates={candidates} />
        )}
        {activeTab === 'analytics' && (
          <InterviewAnalyticsTab interviews={interviews} analytics={analytics} />
        )}
      </div>
    </div>
  );
}

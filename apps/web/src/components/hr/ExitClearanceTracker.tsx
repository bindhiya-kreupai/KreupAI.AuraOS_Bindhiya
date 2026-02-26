'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  FileText,
  MessageSquare,
  RefreshCw,
  Download,
  ArrowRight,
  Lock,
  Info,
  User,
  CalendarDays,
} from 'lucide-react';
import type {
  ExitProcess,
  ClearanceItem,
  ClearanceItemStatus,
  ExitInterviewResponse,
} from '@/services/exitService';
import { ExitService } from '@/services/exitService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ClearanceItemStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <Clock size={14} className="text-amber-500" />,
  },
  Cleared: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
  },
  Blocked: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-300',
    icon: <XCircle size={14} className="text-rose-500" />,
  },
  NA: {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    icon: <Lock size={14} className="text-slate-400" />,
  },
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

// ---------------------------------------------------------------------------
// Clearance Item Row
// ---------------------------------------------------------------------------

function ClearanceItemRow({
  item,
  onStatusChange,
}: {
  item: ClearanceItem;
  onStatusChange: (id: string, status: ClearanceItemStatus, notes: string) => void;
}) {
  const config = STATUS_CONFIG[item.status];
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(item.resolution);
  const [selectedStatus, setSelectedStatus] = useState<ClearanceItemStatus>(item.status);

  function handleSave() {
    onStatusChange(item.id, selectedStatus, notes);
    setEditing(false);
  }

  return (
    <div className={`border rounded-xl p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-800">{item.itemTitle}</p>
              {item.isMandatory && (
                <span className="text-xs px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded border border-rose-200">
                  Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="font-medium">{item.department}</span> &bull;{' '}
              {item.responsiblePersonName}
            </p>
            {item.status === 'Cleared' && item.clearedDate && (
              <p className="text-xs text-emerald-600 mt-0.5">Cleared on {item.clearedDate}</p>
            )}
            {item.status === 'Blocked' && item.blockReason && (
              <p className="text-xs text-rose-600 mt-0.5">Block reason: {item.blockReason}</p>
            )}
            {item.resolution && item.status !== 'Blocked' && (
              <p className="text-xs text-slate-500 italic mt-0.5">{item.resolution}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span
            className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
          >
            {item.status}
          </span>
          {item.status !== 'Cleared' && item.status !== 'NA' && (
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              {editing ? 'Cancel' : 'Update'}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          <div className="flex gap-2 flex-wrap">
            {(['Cleared', 'Pending', 'Blocked', 'NA'] as ClearanceItemStatus[]).map((s) => {
              const sc = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedStatus === s
                      ? `${sc.bg} ${sc.text} ${sc.border} ring-2 ring-offset-1 ring-slate-800`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {(selectedStatus === 'Blocked' || selectedStatus === 'Cleared') && (
            <textarea
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs resize-none h-16 focus:outline-none focus:ring-2 focus:ring-slate-800"
              placeholder={
                selectedStatus === 'Blocked'
                  ? 'Reason for block...'
                  : 'Optional resolution notes...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exit Interview Form
// ---------------------------------------------------------------------------

function ExitInterviewSection({
  exitId,
  interview,
  onSubmit,
}: {
  exitId: string;
  interview: ExitProcess['exitInterview'];
  onSubmit: () => void;
}) {
  const questions = ExitService.getExitInterviewQuestions();
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(
      questions.map((q) => [
        q.questionId,
        interview?.responses.find((r) => r.questionId === q.questionId)?.rating ?? 0,
      ])
    )
  );
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(
      questions.map((q) => [
        q.questionId,
        interview?.responses.find((r) => r.questionId === q.questionId)?.comment ?? '',
      ])
    )
  );
  const [overallScore, setOverallScore] = useState(interview?.overallSatisfactionScore ?? 0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(
    interview?.wouldRecommendEmployer ?? null
  );
  const [openComments, setOpenComments] = useState(interview?.openComments ?? '');
  const [saving, setSaving] = useState(false);

  if (interview?.isCompleted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Exit Interview Completed
        </h4>
        <p className="text-xs text-emerald-700">Conducted on: {interview.conductedDate}</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-700">
              {interview.overallSatisfactionScore}/5
            </p>
            <p className="text-xs text-emerald-600">Overall Score</p>
          </div>
          <div>
            <p className="text-xs text-emerald-700">
              Would recommend employer:{' '}
              <strong>{interview.wouldRecommendEmployer ? 'Yes' : 'No'}</strong>
            </p>
            {interview.openComments && (
              <p className="text-xs text-slate-600 mt-1 italic">
                &quot;{interview.openComments}&quot;
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const responses: ExitInterviewResponse[] = questions.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      rating: ratings[q.questionId] || null,
      comment: comments[q.questionId] || '',
      category: q.category,
    }));
    await ExitService.submitExitInterview(
      exitId,
      responses,
      overallScore,
      wouldRecommend ?? false,
      openComments
    );
    setSaving(false);
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"
    >
      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
        <MessageSquare size={16} className="text-sky-500" />
        Exit Interview
      </h4>

      {questions.map((q) => (
        <div key={q.questionId} className="space-y-2">
          <p className="text-sm font-medium text-slate-700">{q.question}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRatings((prev) => ({ ...prev, [q.questionId]: r }))}
                className={`w-9 h-9 rounded-xl border text-sm font-bold transition-all ${
                  ratings[q.questionId] === r
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500'
                }`}
              >
                {r}
              </button>
            ))}
            <span className="text-xs text-slate-400 self-center ml-1">
              {ratings[q.questionId]
                ? ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][ratings[q.questionId]]
                : ''}
            </span>
          </div>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none h-14 focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-600"
            placeholder="Optional comment..."
            value={comments[q.questionId]}
            onChange={(e) => setComments((prev) => ({ ...prev, [q.questionId]: e.target.value }))}
          />
        </div>
      ))}

      {/* Overall */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-700">Overall Satisfaction (1-5)</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setOverallScore(r)}
              className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all ${
                overallScore === r
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-sky-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">
          Would you recommend this company as an employer?
        </p>
        <div className="flex gap-3">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setWouldRecommend(v)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                wouldRecommend === v
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500'
              }`}
            >
              {v ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">Open Comments</p>
        <textarea
          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-slate-800"
          placeholder="Any additional feedback about your experience..."
          value={openComments}
          onChange={(e) => setOpenComments(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={saving || overallScore === 0}
        className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Submitting...' : 'Submit Exit Interview'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface ExitClearanceTrackerProps {
  exitId: string;
  onBack?: () => void;
}

export default function ExitClearanceTracker({ exitId, onBack }: ExitClearanceTrackerProps) {
  const [exitProcess, setExitProcess] = useState<ExitProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'clearance' | 'interview' | 'documents'>(
    'clearance'
  );
  const [generatingDoc, setGeneratingDoc] = useState<'experience' | 'relieving' | null>(null);

  useEffect(() => {
    loadData();
  }, [exitId]);

  async function loadData() {
    setLoading(true);
    const process = await ExitService.getExitProcess(exitId);
    setExitProcess(process);
    setLoading(false);
  }

  async function handleClearanceUpdate(itemId: string, status: ClearanceItemStatus, notes: string) {
    await ExitService.updateClearanceItem(itemId, status, notes);
    await loadData();
  }

  async function handleGenerateLetter(type: 'experience' | 'relieving') {
    setGeneratingDoc(type);
    const result = await ExitService.generateExperienceLetter(exitId, type);
    setGeneratingDoc(null);
    await loadData();
    // In production: open the document URL
    alert(
      `${type === 'experience' ? 'Experience' : 'Relieving'} letter generated: ${result.documentId}`
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!exitProcess) {
    return <div className="text-center py-16 text-slate-400">Exit process not found.</div>;
  }

  const clearanceItems = exitProcess.clearanceItems.sort((a, b) => a.order - b.order);
  const totalItems = clearanceItems.length;
  const clearedItems = clearanceItems.filter(
    (ci) => ci.status === 'Cleared' || ci.status === 'NA'
  ).length;
  const blockedItems = clearanceItems.filter((ci) => ci.status === 'Blocked').length;
  const clearancePct = totalItems > 0 ? Math.round((clearedItems / totalItems) * 100) : 0;
  const daysLeft = daysUntil(exitProcess.lastWorkingDay);

  const departments = [...new Set(clearanceItems.map((ci) => ci.department))];

  return (
    <div className="space-y-5">
      {/* Back */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Exit Dashboard
        </button>
      )}

      {/* Employee Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{exitProcess.employeeName}</h3>
              <p className="text-sm text-slate-500">
                {exitProcess.designation} &bull; {exitProcess.department}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-lg">
                  {exitProcess.exitType}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg">
                  {exitProcess.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <CalendarDays size={14} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                Last Day: {exitProcess.lastWorkingDay}
              </p>
            </div>
            <p
              className={`text-xl font-bold mt-1 ${
                daysLeft < 0
                  ? 'text-slate-400'
                  : daysLeft <= 3
                    ? 'text-rose-600'
                    : daysLeft <= 7
                      ? 'text-amber-600'
                      : 'text-sky-600'
              }`}
            >
              {daysLeft < 0 ? 'Left the company' : `${daysLeft} days remaining`}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice: {exitProcess.noticePeriodServed}/{exitProcess.noticePeriodDays} days served
            </p>
          </div>
        </div>
      </div>

      {/* Clearance Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800 text-sm">Overall Clearance Progress</h4>
          <span
            className={`text-2xl font-bold ${clearancePct === 100 ? 'text-emerald-600' : clearancePct > 50 ? 'text-sky-600' : 'text-amber-600'}`}
          >
            {clearancePct}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${clearancePct === 100 ? 'bg-emerald-400' : clearancePct > 50 ? 'bg-sky-400' : 'bg-amber-400'}`}
            style={{ width: `${clearancePct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-emerald-600">{clearedItems} cleared</span>
          <span className="text-xs text-amber-600">
            {totalItems - clearedItems - blockedItems} pending
          </span>
          {blockedItems > 0 && (
            <span className="text-xs text-rose-600">{blockedItems} blocked</span>
          )}
        </div>
      </div>

      {/* Alerts */}
      {blockedItems > 0 && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <p>
            <strong>
              {blockedItems} clearance item{blockedItems > 1 ? 's' : ''}
            </strong>{' '}
            are blocked. These must be resolved before final settlement can be processed.
          </p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(
          [
            ['clearance', 'Clearance Checklist'],
            ['interview', 'Exit Interview'],
            ['documents', 'Documents'],
          ] as const
        ).map(([sec, label]) => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeSection === sec
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            {sec === 'clearance' && blockedItems > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">
                {blockedItems}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Clearance Checklist */}
      {activeSection === 'clearance' && (
        <div className="space-y-4">
          {departments.map((dept) => {
            const deptItems = clearanceItems.filter((ci) => ci.department === dept);
            const deptCleared = deptItems.filter(
              (ci) => ci.status === 'Cleared' || ci.status === 'NA'
            ).length;
            return (
              <div key={dept}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-700">{dept} Department</h4>
                  <span
                    className={`text-xs font-medium ${deptCleared === deptItems.length ? 'text-emerald-600' : 'text-slate-500'}`}
                  >
                    {deptCleared}/{deptItems.length} cleared
                  </span>
                </div>
                <div className="space-y-2">
                  {deptItems.map((item) => (
                    <ClearanceItemRow
                      key={item.id}
                      item={item}
                      onStatusChange={handleClearanceUpdate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exit Interview */}
      {activeSection === 'interview' && exitProcess.exitInterview && (
        <ExitInterviewSection
          exitId={exitId}
          interview={exitProcess.exitInterview}
          onSubmit={loadData}
        />
      )}

      {/* Documents */}
      {activeSection === 'documents' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Experience Letter */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={20} className="text-sky-500" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Experience Letter</p>
                  <p className="text-xs text-slate-400">Confirms employment period and role</p>
                </div>
              </div>
              {exitProcess.experienceLetterGenerated ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 size={14} />
                  Generated — ready to download
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateLetter('experience')}
                  disabled={generatingDoc !== null || clearancePct < 80}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  {generatingDoc === 'experience' ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {clearancePct < 80 ? 'Clear 80%+ items first' : 'Generate Letter'}
                </button>
              )}
            </div>

            {/* Relieving Letter */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={20} className="text-emerald-500" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Relieving Letter</p>
                  <p className="text-xs text-slate-400">Formal release from employment</p>
                </div>
              </div>
              {exitProcess.relievingLetterGenerated ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 size={14} />
                  Generated — ready to download
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateLetter('relieving')}
                  disabled={generatingDoc !== null || clearancePct < 100}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {generatingDoc === 'relieving' ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {clearancePct < 100 ? 'Complete all clearances' : 'Generate Letter'}
                </button>
              )}
            </div>
          </div>

          {/* Final Settlement Link */}
          {exitProcess.ffsReference ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Final Settlement Processing
                </p>
                <p className="text-xs text-emerald-600">
                  F&F Reference: {exitProcess.ffsReference}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-amber-800">Final Settlement (F&F)</p>
                <p className="text-xs text-amber-600">
                  Initiate final settlement calculation once clearance is complete
                </p>
              </div>
              <button
                disabled={clearancePct < 100}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                <ArrowRight size={12} />
                Go to F&F
              </button>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              Per UAE Labour Law, the Relieving Letter must be issued within 14 days of last working
              day. The Final Settlement payment must be made within 14 days of termination or end of
              notice period.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Plus,
  FileText,
  User,
  Users,
  MessageSquare,
  Paperclip,
  Activity,
  Shield,
  XCircle,
  ArrowRight,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import type {
  ERCase,
  ERCaseStatus,
  CaseNote,
  ActionItem,
} from '@/services/employeeRelationsService';
import { EmployeeRelationsService } from '@/services/employeeRelationsService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_PILL: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-300',
  High: 'bg-rose-100 text-rose-700 border-rose-300',
  Critical: 'bg-red-100 text-red-800 border-red-500 font-bold',
};

const TYPE_PILL: Record<string, string> = {
  Grievance: 'bg-sky-100 text-sky-700 border-sky-300',
  Disciplinary: 'bg-orange-100 text-orange-700 border-orange-300',
  Harassment: 'bg-rose-100 text-rose-700 border-rose-300',
  Discrimination: 'bg-red-100 text-red-700 border-red-300',
  'Policy Violation': 'bg-amber-100 text-amber-700 border-amber-300',
  'Workplace Conflict': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Whistleblower: 'bg-purple-100 text-purple-700 border-purple-300',
  'Performance Improvement': 'bg-slate-100 text-slate-600 border-slate-300',
};

const STATUS_TRANSITIONS: Record<ERCaseStatus, ERCaseStatus[]> = {
  Open: ['Under Investigation', 'Withdrawn'],
  'Under Investigation': ['Pending Review', 'Escalated', 'Resolved'],
  'Pending Review': ['Resolved', 'Under Investigation', 'Escalated'],
  Resolved: ['Closed'],
  Closed: [],
  Escalated: ['Under Investigation', 'Resolved'],
  Withdrawn: [],
};

// ---------------------------------------------------------------------------
// Timeline Event
// ---------------------------------------------------------------------------

function TimelineItem({ event }: { event: ERCase['timeline'][0] }) {
  const iconMap: Record<string, React.ReactNode> = {
    'Case Opened': <Plus size={14} className="text-sky-600" />,
    'Note Added': <MessageSquare size={14} className="text-slate-500" />,
    'Status Changed': <Activity size={14} className="text-purple-600" />,
    'Investigator Assigned': <User size={14} className="text-emerald-600" />,
    'Document Added': <Paperclip size={14} className="text-slate-500" />,
    'Interview Conducted': <Users size={14} className="text-sky-600" />,
    'Action Item Created': <CheckCircle2 size={14} className="text-amber-600" />,
    'Resolution Submitted': <CheckCircle2 size={14} className="text-emerald-600" />,
    'Case Closed': <Shield size={14} className="text-slate-600" />,
    Escalated: <AlertTriangle size={14} className="text-rose-600" />,
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
          {iconMap[event.eventType] ?? <Activity size={14} className="text-slate-500" />}
        </div>
        <div className="w-px flex-1 bg-slate-200 my-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-800">{event.eventType}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {event.isConfidential && <Lock size={11} className="text-slate-400" />}
            <span className="text-xs text-slate-400">
              {new Date(event.timestamp).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
        <p className="text-xs text-slate-400">by {event.performedBy}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action Item Row
// ---------------------------------------------------------------------------

function ActionItemRow({ item }: { item: ActionItem }) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = item.status !== 'Completed' && item.dueDate < today;

  const statusStyle = {
    Pending: 'bg-slate-100 text-slate-500',
    'In Progress': 'bg-sky-100 text-sky-600',
    Completed: 'bg-emerald-100 text-emerald-600',
    Overdue: 'bg-rose-100 text-rose-600',
  }[isOverdue ? 'Overdue' : item.status];

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${statusStyle}`}
      >
        {item.status === 'Completed' ? (
          <CheckCircle2 size={13} />
        ) : isOverdue ? (
          <AlertTriangle size={13} />
        ) : (
          <Clock size={13} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{item.title}</p>
        <p className="text-xs text-slate-500">Assigned to: {item.assignedToName}</p>
        {item.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{item.notes}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-xs font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
          {isOverdue ? 'OVERDUE' : `Due: ${item.dueDate}`}
        </p>
        <span
          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}
        >
          {isOverdue ? 'Overdue' : item.status}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resolution Form
// ---------------------------------------------------------------------------

function ResolutionForm({
  caseId,
  onSubmit,
}: {
  caseId: string;
  onSubmit: (resolution: ERCase['resolution']) => void;
}) {
  const [form, setForm] = useState({
    findings: '',
    outcomeType: 'Substantiated' as ERCase['resolution'] extends null
      ? never
      : NonNullable<ERCase['resolution']>['outcomeType'],
    actionsTaken: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const resolution: ERCase['resolution'] = {
      findings: form.findings,
      outcomeType: form.outcomeType as any,
      actionsTaken: form.actionsTaken.split('\n').filter(Boolean),
      followUpRequired: form.followUpRequired,
      followUpDate: form.followUpRequired ? form.followUpDate : null,
      followUpNotes: form.followUpNotes,
      resolvedBy: 'HR Admin',
      resolvedDate: new Date().toISOString().slice(0, 10),
    };
    await EmployeeRelationsService.updateCaseStatus(caseId, 'Resolved');
    onSubmit(resolution);
    setSaving(false);
  }

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
    >
      <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
        <CheckCircle2 size={16} />
        Resolution Form
      </h4>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Outcome</label>
        <select
          className={inputClass}
          value={form.outcomeType}
          onChange={(e) => setForm({ ...form, outcomeType: e.target.value as any })}
        >
          {[
            'Substantiated',
            'Partially Substantiated',
            'Unsubstantiated',
            'Inconclusive',
            'Withdrawn',
          ].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Findings</label>
        <textarea
          className={`${inputClass} h-24 resize-none`}
          placeholder="Summary of investigation findings..."
          value={form.findings}
          onChange={(e) => setForm({ ...form, findings: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Actions Taken (one per line)
        </label>
        <textarea
          className={`${inputClass} h-20 resize-none`}
          placeholder="List actions taken..."
          value={form.actionsTaken}
          onChange={(e) => setForm({ ...form, actionsTaken: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-slate-800"
          checked={form.followUpRequired}
          onChange={(e) => setForm({ ...form, followUpRequired: e.target.checked })}
        />
        <span className="text-sm text-slate-700">Follow-up required</span>
      </label>
      {form.followUpRequired && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              className={inputClass}
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Notes</label>
            <input
              className={inputClass}
              placeholder="Follow-up instructions..."
              value={form.followUpNotes}
              onChange={(e) => setForm({ ...form, followUpNotes: e.target.value })}
            />
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Submitting...' : 'Submit Resolution'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface ERCaseDetailProps {
  caseId: string;
  onBack?: () => void;
}

export default function ERCaseDetail({ caseId, onBack }: ERCaseDetailProps) {
  const [erCase, setErCase] = useState<ERCase | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'timeline' | 'actions' | 'documents' | 'notes' | 'resolution'
  >('timeline');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    loadData();
  }, [caseId]);

  async function loadData() {
    setLoading(true);
    const [c, n] = await Promise.all([
      EmployeeRelationsService.getCase(caseId),
      EmployeeRelationsService.getNotes(caseId),
    ]);
    setErCase(c);
    setNotes(n);
    setLoading(false);
  }

  async function handleStatusChange(status: ERCaseStatus) {
    if (!erCase) return;
    setSavingStatus(true);
    await EmployeeRelationsService.updateCaseStatus(caseId, status);
    await loadData();
    setSavingStatus(false);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    await EmployeeRelationsService.addNote(caseId, {
      content: newNote,
      addedBy: 'HR Admin',
      isConfidential: true,
    });
    setNewNote('');
    setShowNoteForm(false);
    await loadData();
    setSavingNote(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!erCase) {
    return (
      <div className="text-center py-16">
        <XCircle size={40} className="text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500">Case not found</p>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[erCase.status] ?? [];
  const overdueItems = erCase.actionItems.filter(
    (ai) => ai.status !== 'Completed' && ai.dueDate < new Date().toISOString().slice(0, 10)
  );

  return (
    <div className="space-y-5">
      {/* Confidentiality Banner */}
      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
        <Lock size={14} className="flex-shrink-0" />
        <p>
          This case is <strong>CONFIDENTIAL</strong>. Access is restricted to HR personnel and the
          assigned investigator.
        </p>
      </div>

      {/* Back + Header */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Cases
        </button>
      )}

      {/* Case Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{erCase.caseNumber}</span>
              <span
                className={`px-2 py-0.5 rounded-lg border text-xs font-medium ${TYPE_PILL[erCase.type] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                {erCase.type}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg border text-xs font-medium ${SEVERITY_PILL[erCase.severity]}`}
              >
                {erCase.severity}
              </span>
              {erCase.isConfidential && <Lock size={12} className="text-slate-400" />}
              {erCase.isAnonymous && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200">
                  Anonymous
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{erCase.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Opened: {erCase.openedDate} &bull; {erCase.daysOpen} days open &bull; Target:{' '}
              {erCase.targetResolutionDate}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl border text-sm font-medium ${
                erCase.status === 'Escalated'
                  ? 'bg-red-100 text-red-700 border-red-400'
                  : erCase.status === 'Resolved' || erCase.status === 'Closed'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-amber-100 text-amber-700 border-amber-300'
              }`}
            >
              {erCase.status}
            </span>
            {erCase.assignedInvestigatorName && (
              <p className="text-xs text-slate-500">
                Investigator: <strong>{erCase.assignedInvestigatorName}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-700">{erCase.description}</p>
        </div>
      </div>

      {/* Parties */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Complainant
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{erCase.complainantName}</p>
              <p className="text-xs text-slate-500">{erCase.complainantDepartment}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Respondent
          </p>
          {erCase.respondentName ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{erCase.respondentName}</p>
                <p className="text-xs text-slate-500">{erCase.respondentDepartment}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Not specified</p>
          )}
        </div>
      </div>

      {/* Overdue alert */}
      {overdueItems.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <p>
            {overdueItems.length} action item{overdueItems.length > 1 ? 's' : ''} are overdue.
            Immediate attention required.
          </p>
        </div>
      )}

      {/* Status Transitions */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 flex items-center mr-1">Advance status:</span>
          {transitions.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={savingStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <ArrowRight size={12} />
              {s}
            </button>
          ))}
          {erCase.status === 'Under Investigation' && (
            <button
              onClick={() => setShowResolutionForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
            >
              <Edit3 size={12} />
              Write Resolution
            </button>
          )}
        </div>
      )}

      {/* Resolution Form */}
      {showResolutionForm && (
        <ResolutionForm
          caseId={caseId}
          onSubmit={(_resolution) => {
            setShowResolutionForm(false);
            loadData();
          }}
        />
      )}

      {/* Resolution Summary (if resolved) */}
      {erCase.resolution && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Resolution — {erCase.resolution.outcomeType}
          </h4>
          <p className="text-sm text-slate-700 mb-3">{erCase.resolution.findings}</p>
          {erCase.resolution.actionsTaken.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Actions Taken
              </p>
              <ul className="space-y-1">
                {erCase.resolution.actionsTaken.map((a, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {erCase.resolution.followUpRequired && (
            <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
              <Clock size={11} />
              Follow-up required by {erCase.resolution.followUpDate} —{' '}
              {erCase.resolution.followUpNotes}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Resolved by {erCase.resolution.resolvedBy} on {erCase.resolution.resolvedDate}
          </p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {(
          [
            ['timeline', 'Timeline'],
            ['actions', `Actions (${erCase.actionItems.length})`],
            ['documents', `Docs (${erCase.documents.length})`],
            ['notes', `Notes (${notes.length})`],
          ] as const
        ).map(([sec, label]) => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSection === sec
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      {activeSection === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          {erCase.timeline.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No events recorded yet.</p>
          ) : (
            <div>
              {erCase.timeline.map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'actions' && (
        <div className="space-y-2">
          {erCase.actionItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
              No action items.
            </div>
          ) : (
            erCase.actionItems.map((ai) => <ActionItemRow key={ai.id} item={ai} />)
          )}
        </div>
      )}

      {activeSection === 'documents' && (
        <div className="space-y-2">
          {erCase.documents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
              No documents attached.
            </div>
          ) : (
            erCase.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"
              >
                <FileText size={18} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">
                    {doc.type} &bull; {doc.sizeKb}KB &bull; {doc.uploadedDate} by {doc.uploadedBy}
                  </p>
                </div>
                {doc.isConfidential && <Lock size={12} className="text-slate-400 flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === 'notes' && (
        <div className="space-y-3">
          {!showNoteForm && (
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Plus size={14} />
              Add Confidential Note
            </button>
          )}
          {showNoteForm && (
            <form
              onSubmit={handleAddNote}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock size={12} />
                <span>This note is confidential — visible only to HR and investigators</span>
              </div>
              <textarea
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 h-24 resize-none"
                placeholder="Enter confidential note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteForm(false);
                    setNewNote('');
                  }}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote || !newNote.trim()}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          )}
          {notes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Lock size={11} className="text-slate-400" />
                  <span className="font-medium">{note.addedBy}</span>
                  <span>&bull;</span>
                  <span>{note.addedDate}</span>
                  {note.isConfidential && (
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 text-xs">
                      Confidential
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700">{note.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

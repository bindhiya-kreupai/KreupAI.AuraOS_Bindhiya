/**
 * @module OneOnOneNotes
 * @description Shared 1:1 meeting notes between manager and employee —
 *              collaborative note-taking, action items, talking points,
 *              and meeting history timeline
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Plus,
  Clock,
  User,
  UserCheck,
  MessageSquare,
  CheckSquare,
  Square,
  Calendar,
  AlertCircle,
  Pin,
  Send,
  Smile,
  Meh,
  Frown,
  Star,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type NoteAuthor = 'employee' | 'manager';
type ActionPriority = 'low' | 'medium' | 'high';
type ActionStatus = 'pending' | 'in_progress' | 'completed';
type MeetingSentiment = 1 | 2 | 3 | 4 | 5;

interface TalkingPoint {
  id: string;
  text: string;
  addedBy: NoteAuthor;
  isDiscussed: boolean;
  isPinned: boolean;
  notes?: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: NoteAuthor;
  assigneeName: string;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate?: string;
  meetingId: string;
}

interface SharedNote {
  id: string;
  author: NoteAuthor;
  authorName: string;
  content: string;
  timestamp: string;
  isPinned: boolean;
}

interface MeetingSession {
  id: string;
  date: string;
  duration: number;
  talkingPoints: TalkingPoint[];
  notes: SharedNote[];
  actionItems: ActionItem[];
  sentiment?: MeetingSentiment;
  summary?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

export interface OneOnOneNotesProps {
  sessions: MeetingSession[];
  currentUserId?: string;
  currentUserRole?: NoteAuthor;
  managerName?: string;
  employeeName?: string;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<ActionPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  medium: { label: 'Medium', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  high: { label: 'High', color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
};

const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-silver-mist' },
  in_progress: { label: 'In Progress', color: 'text-celestial-indigo' },
  completed: { label: 'Done', color: 'text-neural-mint' },
};

const SENTIMENT_OPTIONS: {
  value: MeetingSentiment;
  icon: LucideIcon;
  label: string;
  color: string;
}[] = [
  { value: 1, icon: Frown, label: 'Difficult', color: 'text-coral-alert' },
  { value: 2, icon: Frown, label: 'Below Avg', color: 'text-sunset-amber' },
  { value: 3, icon: Meh, label: 'Neutral', color: 'text-silver-mist' },
  { value: 4, icon: Smile, label: 'Positive', color: 'text-celestial-indigo' },
  { value: 5, icon: Star, label: 'Excellent', color: 'text-neural-mint' },
];

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_SESSIONS: MeetingSession[] = [
  {
    id: 'ms-1',
    date: '2026-02-24T10:00:00',
    duration: 30,
    status: 'upcoming',
    talkingPoints: [
      {
        id: 'tp-1',
        text: 'Sprint retrospective follow-ups',
        addedBy: 'employee',
        isDiscussed: false,
        isPinned: true,
      },
      {
        id: 'tp-2',
        text: 'Q1 goal alignment check',
        addedBy: 'manager',
        isDiscussed: false,
        isPinned: false,
      },
      {
        id: 'tp-3',
        text: 'Conference talk preparation timeline',
        addedBy: 'employee',
        isDiscussed: false,
        isPinned: false,
      },
    ],
    notes: [],
    actionItems: [
      {
        id: 'ai-1',
        description: 'Draft Q1 self-assessment document',
        assignedTo: 'employee',
        assigneeName: 'You',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2026-02-28',
        meetingId: 'ms-1',
      },
      {
        id: 'ai-2',
        description: 'Schedule skip-level meeting with VP',
        assignedTo: 'manager',
        assigneeName: 'Sarah Chen',
        priority: 'medium',
        status: 'pending',
        dueDate: '2026-03-05',
        meetingId: 'ms-1',
      },
    ],
    sentiment: undefined,
  },
  {
    id: 'ms-2',
    date: '2026-02-17T10:00:00',
    duration: 30,
    status: 'completed',
    talkingPoints: [
      {
        id: 'tp-4',
        text: 'Performance review preparation',
        addedBy: 'manager',
        isDiscussed: true,
        isPinned: false,
        notes: 'Discussed structure and timeline. Review due by Feb 28.',
      },
      {
        id: 'tp-5',
        text: 'Tech debt reduction plan',
        addedBy: 'employee',
        isDiscussed: true,
        isPinned: false,
        notes: 'Agreed on 20% sprint capacity for tech debt.',
      },
      {
        id: 'tp-6',
        text: 'Team morale after reorg',
        addedBy: 'manager',
        isDiscussed: true,
        isPinned: false,
        notes: 'Overall positive. Need to monitor onboarding of new members.',
      },
    ],
    notes: [
      {
        id: 'n-1',
        author: 'manager',
        authorName: 'Sarah Chen',
        content:
          "Great discussion on tech debt prioritization. Let's create a shared backlog by next week.",
        timestamp: '2026-02-17T10:15:00',
        isPinned: false,
      },
      {
        id: 'n-2',
        author: 'employee',
        authorName: 'You',
        content:
          "I'll draft the tech debt backlog and share it before next 1:1. Also want to discuss conference talk abstract.",
        timestamp: '2026-02-17T10:20:00',
        isPinned: true,
      },
    ],
    actionItems: [
      {
        id: 'ai-3',
        description: 'Create tech debt backlog in Jira',
        assignedTo: 'employee',
        assigneeName: 'You',
        priority: 'high',
        status: 'completed',
        dueDate: '2026-02-21',
        meetingId: 'ms-2',
      },
      {
        id: 'ai-4',
        description: 'Share performance review template',
        assignedTo: 'manager',
        assigneeName: 'Sarah Chen',
        priority: 'medium',
        status: 'completed',
        dueDate: '2026-02-19',
        meetingId: 'ms-2',
      },
    ],
    sentiment: 4,
    summary:
      'Productive session covering performance prep, tech debt strategy, and team dynamics post-reorg.',
  },
  {
    id: 'ms-3',
    date: '2026-02-10T10:00:00',
    duration: 25,
    status: 'completed',
    talkingPoints: [
      {
        id: 'tp-7',
        text: 'Sprint velocity trends',
        addedBy: 'manager',
        isDiscussed: true,
        isPinned: false,
      },
      {
        id: 'tp-8',
        text: 'API redesign proposal feedback',
        addedBy: 'employee',
        isDiscussed: true,
        isPinned: false,
        notes: 'Manager approved the proposal with minor revisions.',
      },
      {
        id: 'tp-9',
        text: 'PTO request for March',
        addedBy: 'employee',
        isDiscussed: true,
        isPinned: false,
      },
    ],
    notes: [
      {
        id: 'n-3',
        author: 'employee',
        authorName: 'You',
        content: 'API proposal approved! Need to revise auth section and present to backend team.',
        timestamp: '2026-02-10T10:12:00',
        isPinned: false,
      },
    ],
    actionItems: [
      {
        id: 'ai-5',
        description: 'Revise API auth section per feedback',
        assignedTo: 'employee',
        assigneeName: 'You',
        priority: 'high',
        status: 'completed',
        dueDate: '2026-02-14',
        meetingId: 'ms-3',
      },
    ],
    sentiment: 5,
    summary: 'Quick check-in. API proposal got the green light. PTO approved.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ── Component ────────────────────────────────────────────────────────────────────

export const OneOnOneNotes: React.FC<OneOnOneNotesProps> = ({
  sessions,
  currentUserRole = 'employee',
  managerName = 'Sarah Chen',
  employeeName = 'You',
}) => {
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '');
  const [newTalkingPoint, setNewTalkingPoint] = useState('');
  const [newNote, setNewNote] = useState('');
  const [localSessions, setLocalSessions] = useState(sessions);

  const activeSession = localSessions.find((s) => s.id === activeSessionId);
  const pendingActions = localSessions
    .flatMap((s) => s.actionItems)
    .filter((a) => a.status !== 'completed');
  const completedActions = localSessions
    .flatMap((s) => s.actionItems)
    .filter((a) => a.status === 'completed');

  const addTalkingPoint = useCallback(() => {
    if (!newTalkingPoint.trim() || !activeSession) return;
    const tp: TalkingPoint = {
      id: `tp-${Date.now()}`,
      text: newTalkingPoint.trim(),
      addedBy: currentUserRole,
      isDiscussed: false,
      isPinned: false,
    };
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, talkingPoints: [...s.talkingPoints, tp] } : s
      )
    );
    setNewTalkingPoint('');
  }, [newTalkingPoint, activeSession, activeSessionId, currentUserRole]);

  const toggleDiscussed = useCallback(
    (tpId: string) => {
      setLocalSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                talkingPoints: s.talkingPoints.map((tp) =>
                  tp.id === tpId ? { ...tp, isDiscussed: !tp.isDiscussed } : tp
                ),
              }
            : s
        )
      );
    },
    [activeSessionId]
  );

  const togglePin = useCallback(
    (tpId: string) => {
      setLocalSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                talkingPoints: s.talkingPoints.map((tp) =>
                  tp.id === tpId ? { ...tp, isPinned: !tp.isPinned } : tp
                ),
              }
            : s
        )
      );
    },
    [activeSessionId]
  );

  const addNote = useCallback(() => {
    if (!newNote.trim() || !activeSession) return;
    const note: SharedNote = {
      id: `n-${Date.now()}`,
      author: currentUserRole,
      authorName: currentUserRole === 'manager' ? managerName : employeeName,
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
      isPinned: false,
    };
    setLocalSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, notes: [...s.notes, note] } : s))
    );
    setNewNote('');
  }, [newNote, activeSession, activeSessionId, currentUserRole, managerName, employeeName]);

  const toggleActionStatus = useCallback((actionId: string) => {
    setLocalSessions((prev) =>
      prev.map((s) => ({
        ...s,
        actionItems: s.actionItems.map((a) => {
          if (a.id !== actionId) return a;
          const nextStatus: ActionStatus =
            a.status === 'pending'
              ? 'in_progress'
              : a.status === 'in_progress'
                ? 'completed'
                : 'pending';
          return { ...a, status: nextStatus };
        }),
      }))
    );
  }, []);

  return (
    <div className="space-y-3">
      {/* Session Timeline */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {localSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const sentimentOpt = session.sentiment
            ? SENTIMENT_OPTIONS.find((s) => s.value === session.sentiment)
            : null;
          return (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 transition-colors ${
                isActive
                  ? 'border-celestial-indigo bg-celestial-indigo/5'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/40'
              }`}
            >
              <Calendar
                className={`w-3 h-3 ${isActive ? 'text-celestial-indigo' : 'text-silver-mist'}`}
              />
              <div className="text-left">
                <p
                  className={`text-[9px] font-bold ${isActive ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                >
                  {formatDate(session.date)}
                </p>
                <p className="text-[7px] text-silver-mist">
                  {formatTime(session.date)} • {session.duration}min
                </p>
              </div>
              {session.status === 'upcoming' && (
                <span className="px-1 py-0.5 rounded text-[6px] font-bold bg-celestial-indigo/10 text-celestial-indigo">
                  NEXT
                </span>
              )}
              {sentimentOpt &&
                (() => {
                  const SIcon = sentimentOpt.icon;
                  return <SIcon className={`w-3 h-3 ${sentimentOpt.color}`} />;
                })()}
            </button>
          );
        })}
      </div>

      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left: Talking Points */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
            <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
              <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-celestial-indigo" />
                Talking Points ({activeSession.talkingPoints.filter((t) => t.isDiscussed).length}/
                {activeSession.talkingPoints.length})
              </p>
            </div>

            <div className="p-2 space-y-1.5 max-h-[360px] overflow-y-auto">
              {/* Pinned first, then unpinned */}
              {[...activeSession.talkingPoints]
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                .map((tp) => (
                  <div
                    key={tp.id}
                    className={`rounded-lg p-2 transition-colors ${
                      tp.isDiscussed
                        ? 'bg-neural-mint/5 border border-neural-mint/20'
                        : tp.isPinned
                          ? 'bg-sunset-amber/5 border border-sunset-amber/20'
                          : 'border border-cloud/50 dark:border-nebula-purple/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button onClick={() => toggleDiscussed(tp.id)} className="mt-0.5 shrink-0">
                        {tp.isDiscussed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-neural-mint" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-silver-mist" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[9px] ${tp.isDiscussed ? 'text-silver-mist line-through' : 'text-ink-black dark:text-pearl'}`}
                        >
                          {tp.text}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-[7px] ${tp.addedBy === 'manager' ? 'text-nebula-purple' : 'text-celestial-indigo'}`}
                          >
                            {tp.addedBy === 'manager' ? managerName : employeeName}
                          </span>
                          {tp.isPinned && <Pin className="w-2 h-2 text-sunset-amber" />}
                        </div>
                        {tp.notes && (
                          <p className="text-[8px] text-silver-mist italic mt-1 pl-1 border-l-2 border-cloud dark:border-nebula-purple/20">
                            {tp.notes}
                          </p>
                        )}
                      </div>
                      <button onClick={() => togglePin(tp.id)} className="shrink-0">
                        <Pin
                          className={`w-2.5 h-2.5 ${tp.isPinned ? 'text-sunset-amber' : 'text-silver-mist/40 hover:text-sunset-amber'} transition-colors`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Add talking point */}
            {activeSession.status !== 'completed' && (
              <div className="px-2 pb-2 pt-1 border-t border-cloud/50 dark:border-nebula-purple/10">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTalkingPoint}
                    onChange={(e) => setNewTalkingPoint(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTalkingPoint()}
                    placeholder="Add talking point..."
                    className="flex-1 px-2 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                  />
                  <button
                    onClick={addTalkingPoint}
                    className="p-1.5 rounded-lg bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Middle: Shared Notes */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
            <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
              <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-nebula-purple" />
                Shared Notes ({activeSession.notes.length})
              </p>
            </div>

            <div className="p-2 space-y-2 max-h-[320px] overflow-y-auto">
              {activeSession.notes.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="w-6 h-6 mx-auto text-silver-mist/20 mb-1" />
                  <p className="text-[8px] text-silver-mist">
                    No notes yet. Start the conversation!
                  </p>
                </div>
              )}
              {activeSession.notes.map((note) => {
                const isManager = note.author === 'manager';
                return (
                  <div
                    key={note.id}
                    className={`rounded-lg p-2.5 ${
                      isManager
                        ? 'bg-nebula-purple/5 border border-nebula-purple/10 ml-2'
                        : 'bg-celestial-indigo/5 border border-celestial-indigo/10 mr-2'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {isManager ? (
                        <UserCheck className="w-3 h-3 text-nebula-purple" />
                      ) : (
                        <User className="w-3 h-3 text-celestial-indigo" />
                      )}
                      <span
                        className={`text-[8px] font-bold ${isManager ? 'text-nebula-purple' : 'text-celestial-indigo'}`}
                      >
                        {note.authorName}
                      </span>
                      <span className="text-[7px] text-silver-mist">
                        {formatTime(note.timestamp)}
                      </span>
                      {note.isPinned && <Pin className="w-2 h-2 text-sunset-amber" />}
                    </div>
                    <p className="text-[9px] text-ink-black dark:text-pearl leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Add note */}
            <div className="px-2 pb-2 pt-1 border-t border-cloud/50 dark:border-nebula-purple/10">
              <div className="flex items-end gap-1.5">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                  placeholder="Add a shared note..."
                  rows={2}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="p-1.5 rounded-lg bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Action Items */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
            <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
              <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-sunset-amber" />
                Action Items
              </p>
              <div className="flex items-center gap-2 mt-1 text-[7px]">
                <span className="text-coral-alert font-bold">{pendingActions.length} pending</span>
                <span className="text-neural-mint font-bold">{completedActions.length} done</span>
              </div>
            </div>

            <div className="p-2 space-y-1.5 max-h-[360px] overflow-y-auto">
              {/* Active session actions first */}
              {activeSession.actionItems.map((action) => {
                const priCfg = PRIORITY_CONFIG[action.priority];
                const staCfg = STATUS_CONFIG[action.status];
                const isOverdue =
                  action.dueDate &&
                  new Date(action.dueDate) < new Date() &&
                  action.status !== 'completed';

                return (
                  <div
                    key={action.id}
                    className={`rounded-lg p-2 border transition-colors ${
                      action.status === 'completed'
                        ? 'border-neural-mint/20 bg-neural-mint/5'
                        : isOverdue
                          ? 'border-coral-alert/20 bg-coral-alert/5'
                          : 'border-cloud/50 dark:border-nebula-purple/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleActionStatus(action.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {action.status === 'completed' ? (
                          <CheckSquare className="w-3.5 h-3.5 text-neural-mint" />
                        ) : action.status === 'in_progress' ? (
                          <Clock className="w-3.5 h-3.5 text-celestial-indigo" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-silver-mist" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[9px] ${action.status === 'completed' ? 'text-silver-mist line-through' : 'text-ink-black dark:text-pearl'}`}
                        >
                          {action.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`text-[7px] font-bold ${action.assignedTo === 'manager' ? 'text-nebula-purple' : 'text-celestial-indigo'}`}
                          >
                            {action.assigneeName}
                          </span>
                          <span
                            className={`px-1 py-0.5 rounded text-[6px] font-bold ${priCfg.bg} ${priCfg.color}`}
                          >
                            {priCfg.label}
                          </span>
                          <span className={`text-[7px] font-bold ${staCfg.color}`}>
                            {staCfg.label}
                          </span>
                          {action.dueDate && (
                            <span
                              className={`text-[7px] flex items-center gap-0.5 ${isOverdue ? 'text-coral-alert font-bold' : 'text-silver-mist'}`}
                            >
                              {isOverdue && <AlertCircle className="w-2 h-2" />}
                              {formatDate(action.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeSession.actionItems.length === 0 && (
                <div className="text-center py-6">
                  <CheckSquare className="w-6 h-6 mx-auto text-silver-mist/20 mb-1" />
                  <p className="text-[8px] text-silver-mist">No action items for this session</p>
                </div>
              )}
            </div>

            {/* Session summary (if completed) */}
            {activeSession.status === 'completed' && activeSession.summary && (
              <div className="px-3 py-2 border-t border-cloud/50 dark:border-nebula-purple/10 bg-pearl/20 dark:bg-deep-cosmos/10">
                <p className="text-[8px] font-bold text-silver-mist mb-0.5">Session Summary</p>
                <p className="text-[8px] text-ink-black dark:text-pearl leading-relaxed">
                  {activeSession.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OneOnOneNotes;

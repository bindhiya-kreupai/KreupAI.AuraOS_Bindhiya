'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  User,
  MessageSquare,
  Paperclip,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { CasesApi, type CaseDTO, type CaseNoteDTO } from '../services';

type Feedback = { kind: 'success' | 'error'; text: string };

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
type Priority = (typeof PRIORITIES)[number];

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function priorityBadgeClass(priority: string): string {
  const normalized = priority.toUpperCase();
  if (normalized === 'CRITICAL') return 'bg-rose-100 text-rose-700';
  if (normalized === 'HIGH') return 'bg-orange-100 text-orange-700';
  if (normalized === 'MEDIUM') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SYS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CaseManagementPage() {
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [noteContent, setNoteContent] = useState('');
  const [noteSending, setNoteSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newCategory, setNewCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const loadList = useCallback(async (): Promise<CaseDTO[]> => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await CasesApi.list();
      setCases(data);
      return data;
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load cases.');
      setCases([]);
      return [];
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await CasesApi.get(id);
      if (!data) {
        setDetail(null);
        setDetailError('Case not found.');
        return;
      }
      setDetail(data);
    } catch (err) {
      setDetail(null);
      setDetailError(err instanceof Error ? err.message : 'Failed to load case detail.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  // Keep a valid selection whenever the list changes.
  useEffect(() => {
    if (cases.length === 0) {
      setSelectedId(null);
      return;
    }
    const stillExists = selectedId !== null && cases.some((c) => c.id === selectedId);
    if (!stillExists) {
      setSelectedId(cases[0].id);
    }
  }, [cases, selectedId]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const notes: CaseNoteDTO[] = useMemo(() => detail?.notes ?? [], [detail]);

  const handleCloseCase = useCallback(async () => {
    if (!detail || detail.status.toUpperCase() === 'CLOSED') return;
    setClosing(true);
    try {
      const updated = await CasesApi.update(detail.id, { status: 'CLOSED' });
      if (!updated) {
        setFeedback({ kind: 'error', text: 'Could not close the case.' });
        return;
      }
      await loadList();
      await loadDetail(detail.id);
      setFeedback({ kind: 'success', text: 'Case closed.' });
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Could not close the case.',
      });
    } finally {
      setClosing(false);
    }
  }, [detail, loadList, loadDetail]);

  const handleAddNote = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const content = noteContent.trim();
      if (!detail || content.length === 0 || noteSending) return;
      setNoteSending(true);
      try {
        const created = await CasesApi.addNote(detail.id, content);
        if (!created) {
          setFeedback({ kind: 'error', text: 'Could not add the note.' });
          return;
        }
        setNoteContent('');
        await loadDetail(detail.id);
      } catch (err) {
        setFeedback({
          kind: 'error',
          text: err instanceof Error ? err.message : 'Could not add the note.',
        });
      } finally {
        setNoteSending(false);
      }
    },
    [detail, noteContent, noteSending, loadDetail]
  );

  const resetModal = useCallback(() => {
    setModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewPriority('MEDIUM');
    setNewCategory('');
    setModalError(null);
    setCreating(false);
  }, []);

  const handleCreate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const title = newTitle.trim();
      if (title.length === 0) {
        setModalError('Title is required.');
        return;
      }
      setCreating(true);
      setModalError(null);
      try {
        const payload: Partial<CaseDTO> = {
          title,
          priority: newPriority,
        };
        const description = newDescription.trim();
        if (description.length > 0) payload.description = description;
        const category = newCategory.trim();
        if (category.length > 0) payload.category = category;

        const created = await CasesApi.create(payload);
        if (!created) {
          setModalError('Could not create the case.');
          return;
        }
        resetModal();
        const refreshed = await loadList();
        const match = refreshed.find((c) => c.id === created.id);
        if (match) setSelectedId(match.id);
        setFeedback({ kind: 'success', text: `Case ${created.caseNumber} created.` });
      } catch (err) {
        setModalError(err instanceof Error ? err.message : 'Could not create the case.');
      } finally {
        setCreating(false);
      }
    },
    [newTitle, newDescription, newPriority, newCategory, loadList, resetModal]
  );

  const isClosed = detail?.status.toUpperCase() === 'CLOSED';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Case Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage complex employee cases requiring multi-step resolution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {feedback && (
        <div
          className={`shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            feedback.kind === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.kind === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        {/* Case List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:col-span-1 min-h-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold">
            Active Cases ({cases.length})
          </div>
          <div className="overflow-y-auto flex-1">
            {listLoading && (
              <div className="flex items-center justify-center gap-2 p-8 text-slate-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading cases…
              </div>
            )}

            {!listLoading && listError && (
              <div className="m-4 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{listError}</span>
              </div>
            )}

            {!listLoading && !listError && cases.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                No cases yet. Use “New Case” to create one.
              </div>
            )}

            {!listLoading &&
              !listError &&
              cases.map((c) => {
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-500'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-400">{c.caseNumber}</span>
                      <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <h4 className="font-bold text-sm mb-2">{c.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-bold">
                        {c.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${priorityBadgeClass(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Case Detail View */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-2 flex flex-col min-h-0">
          {selectedId === null && (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-slate-500">
              Select a case to view its details.
            </div>
          )}

          {selectedId !== null && detailLoading && (
            <div className="flex-1 flex items-center justify-center gap-2 p-8 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading case…
            </div>
          )}

          {selectedId !== null && !detailLoading && detailError && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{detailError}</span>
              </div>
            </div>
          )}

          {selectedId !== null && !detailLoading && !detailError && detail && (
            <>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h2 className="text-xl font-bold">
                    {detail.caseNumber}: {detail.title}
                  </h2>
                  {!isClosed && (
                    <button
                      type="button"
                      onClick={handleCloseCase}
                      disabled={closing}
                      className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {closing && <Loader2 className="w-4 h-4 animate-spin" />}
                      Close Case
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {detail.status}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" /> Reporter: {detail.reporterId ?? 'Unknown'}
                  </span>
                  <span>|</span>
                  <span>Assignee: {detail.assigneeId ?? 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
                {notes.length === 0 && (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No notes yet. Add the first update below.
                  </div>
                )}

                {notes.map((note) => {
                  const author = note.authorName ?? 'System';
                  return (
                    <div key={note.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initialsFrom(author)}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl rounded-tl-none max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {author}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-slate-400">
                            {note.noteType}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        <span className="text-xs text-slate-400 mt-1 block">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleAddNote}
                className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
              >
                <button
                  type="button"
                  disabled
                  title="Attachments coming soon"
                  className="p-2 rounded-lg text-slate-300 cursor-not-allowed"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add internal note or update…"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={noteSending || noteContent.trim().length === 0}
                  className="inline-flex items-center justify-center p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  title="Send note"
                >
                  {noteSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-5 h-5" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                New Case
              </h3>
              <button
                type="button"
                onClick={resetModal}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-4">
              {modalError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="case-title">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="case-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Short summary of the case"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="case-description">
                  Description
                </label>
                <textarea
                  id="case-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional context (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="case-priority">
                    Priority
                  </label>
                  <select
                    id="case-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="case-category">
                    Category
                  </label>
                  <input
                    id="case-category"
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. GRIEVANCE"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LifeBuoy, Plus, Clock, MoreHorizontal, User, Loader2, X, AlertCircle } from 'lucide-react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HelpdeskTicketsApi, type HelpdeskTicketDTO } from '../services';

type StatusKey = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

const COLUMNS: { key: StatusKey; label: string; dot: string }[] = [
  { key: 'OPEN', label: 'Open', dot: 'bg-rose-500' },
  { key: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-amber-500' },
  { key: 'RESOLVED', label: 'Resolved', dot: 'bg-emerald-500' },
];

const CATEGORIES = ['Payroll', 'Benefits', 'IT Support', 'Leave', 'Admin', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function priorityColor(p: string) {
  switch (p.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
  }
}

function SortableTicket({
  ticket,
  onAssign,
  assigning,
}: {
  ticket: HelpdeskTicketDTO;
  onAssign: (t: HelpdeskTicketDTO) => void;
  assigning: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const due = ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleDateString() : '—';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow mb-3 group"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityColor(ticket.priority)}`}
        >
          {ticket.priority}
        </span>
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag ticket"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
        {ticket.subject}
      </h4>
      <div className="text-xs text-slate-500 mb-3">
        {ticket.ticketNumber} • {ticket.category}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{due}</span>
        </div>
        {ticket.assigneeId ? (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <User className="w-3 h-3" /> Assigned
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAssign(ticket)}
            disabled={assigning}
            className="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-50"
          >
            {assigning ? 'Assigning…' : 'Assign to me'}
          </button>
        )}
      </div>
    </div>
  );
}

function Column({
  colKey,
  label,
  dot,
  tickets,
  onAssign,
  assigningId,
}: {
  colKey: StatusKey;
  label: string;
  dot: string;
  tickets: HelpdeskTicketDTO[];
  onAssign: (t: HelpdeskTicketDTO) => void;
  assigningId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colKey });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl border h-full max-h-full transition-colors ${
        isOver ? 'border-indigo-400' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dot}`} />
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{label}</h3>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded-md font-medium">
            {tickets.length}
          </span>
        </div>
      </div>
      <div className="p-3 flex-1 overflow-y-auto">
        <SortableContext items={tickets.map((t) => t.id)}>
          {tickets.map((t) => (
            <SortableTicket
              key={t.id}
              ticket={t}
              onAssign={onAssign}
              assigning={assigningId === t.id}
            />
          ))}
        </SortableContext>
        {tickets.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">No tickets</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HelpdeskTicketsPage() {
  const [tickets, setTickets] = useState<HelpdeskTicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'Payroll',
    priority: 'MEDIUM',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const notify = useCallback((type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await HelpdeskTicketsApi.list());
    } catch {
      notify('error', 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const g: Record<StatusKey, HelpdeskTicketDTO[]> = { OPEN: [], IN_PROGRESS: [], RESOLVED: [] };
    for (const t of tickets) {
      const s = (t.status || 'OPEN').toUpperCase();
      if (s === 'RESOLVED' || s === 'CLOSED') g.RESOLVED.push(t);
      else if (s === 'IN_PROGRESS' || s === 'PENDING') g.IN_PROGRESS.push(t);
      else g.OPEN.push(t);
    }
    return g;
  }, [tickets]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const ticket = tickets.find((t) => t.id === active.id);
      if (!ticket) return;
      const target = String(over.id) as StatusKey;
      const validTargets: StatusKey[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
      if (!validTargets.includes(target)) return;
      const current = (ticket.status || 'OPEN').toUpperCase();
      const normalizedCurrent =
        current === 'CLOSED' ? 'RESOLVED' : current === 'PENDING' ? 'IN_PROGRESS' : current;
      if (normalizedCurrent === target) return;
      // Optimistic update.
      const prev = tickets;
      setTickets((ts) => ts.map((t) => (t.id === ticket.id ? { ...t, status: target } : t)));
      try {
        await HelpdeskTicketsApi.update(ticket.id, { status: target });
        notify('success', `Ticket moved to ${target.replace('_', ' ').toLowerCase()}`);
        await load();
      } catch {
        setTickets(prev);
        notify('error', 'Failed to update ticket status');
      }
    },
    [tickets, notify, load]
  );

  const handleAssign = useCallback(
    async (ticket: HelpdeskTicketDTO) => {
      setAssigningId(ticket.id);
      try {
        // Self-assignment — the server derives the current user from the auth
        // context; we send no id so the assignee is set to the caller.
        await HelpdeskTicketsApi.assign(ticket.id);
        notify('success', 'Ticket assigned');
        await load();
      } catch {
        notify('error', 'Failed to assign ticket');
      } finally {
        setAssigningId(null);
      }
    },
    [notify, load]
  );

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.subject.trim()) {
        notify('error', 'Subject is required');
        return;
      }
      setSaving(true);
      try {
        await HelpdeskTicketsApi.create({
          subject: form.subject.trim(),
          description: form.description.trim() || undefined,
          category: form.category,
          priority: form.priority,
          status: 'OPEN',
        });
        notify('success', 'Ticket created');
        setShowCreate(false);
        setForm({ subject: '', description: '', category: 'Payroll', priority: 'MEDIUM' });
        await load();
      } catch {
        notify('error', 'Failed to create ticket');
      } finally {
        setSaving(false);
      }
    },
    [form, notify, load]
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-500" />
            HR Helpdesk
          </h1>
          <p className="text-slate-500 text-sm">Manage support requests and SLAs.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Create Ticket
        </button>
      </div>

      {feedback && (
        <div
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" /> {feedback.msg}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 h-full min-w-[900px] pb-4">
              {COLUMNS.map((col) => (
                <Column
                  key={col.key}
                  colKey={col.key}
                  label={col.label}
                  dot={col.dot}
                  tickets={grouped[col.key]}
                  onAssign={handleAssign}
                  assigningId={assigningId}
                />
              ))}
            </div>
          </DndContext>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Create Ticket
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Short summary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add details"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

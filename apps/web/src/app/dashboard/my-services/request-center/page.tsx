'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import { RequestCenterService } from '../services';

const CATEGORIES = ['IT Support', 'HR Queries', 'Facility', 'Finance', 'General'];
const PRIORITIES = ['Low', 'Medium', 'High'];

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  status: string;
  date: string;
  priority: string;
}

export default function RequestCenterPage() {
  const [fetching, setFetching] = useState(true);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    subject: '',
    description: '',
    priority: 'Medium',
  });

  const mapTickets = (rows: any[]): TicketItem[] =>
    rows.map((t: any) => ({
      id: t.id || t.ticketId,
      subject: t.subject || t.title || 'Request',
      category: t.category || t.type || 'General',
      status: t.status || 'Pending',
      date: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString('en', { month: 'short', day: '2-digit' })
        : '',
      priority: t.priority || 'Medium',
    }));

  const loadRequests = async () => {
    try {
      const res = await RequestCenterService.getRequests();
      if (res?.success && Array.isArray(res.data)) {
        setTickets(mapTickets(res.data));
      }
    } catch (err: any) {
      console.error('Failed to fetch requests:', err);
      setError('Unable to load requests. Please refresh.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleCreate = async () => {
    if (!form.subject.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await RequestCenterService.createRequest({
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      if (res?.success && res.data) {
        setShowCreate(false);
        setForm({ category: CATEGORIES[0], subject: '', description: '', priority: 'Medium' });
        await loadRequests();
      } else {
        setError(res?.message || 'Failed to create ticket. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to create request:', err);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = searchQuery
    ? tickets.filter(
        (t) =>
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets;

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-500" />
            Request Center
          </h1>
          <p className="text-slate-500 text-sm">
            Raise tickets for IT, HR, or Facility related issues.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowCreate(true);
          }}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Ticket
        </button>
      </div>

      {error && !showCreate && (
        <div className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-500/30 px-4 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="space-y-2">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter By
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p className="text-xs text-slate-400">
                Search tickets by ID or subject on the right.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by ID or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                      {ticket.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        ticket.priority === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                      ticket.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ticket.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ticket.status === 'Resolved' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {ticket.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1">{ticket.subject}</h3>
                <div className="text-sm text-slate-500 mb-4">
                  {ticket.category} {ticket.date ? `• Raised on ${ticket.date}` : ''}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <MessageSquare className="w-3 h-3" /> {ticket.status}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No requests found</p>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-500" /> New Ticket
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                placeholder="Brief summary of your request"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                placeholder="Provide details about your request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, priority: lvl }))}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      form.priority === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-500/30 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting || !form.subject.trim()}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

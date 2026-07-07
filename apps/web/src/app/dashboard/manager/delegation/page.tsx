'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Calendar,
  Shield,
  Search,
  AlertCircle,
  UserX,
  History,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';

interface DelegationRule {
  delegationId: string;
  delegationName: string;
  status: string;
  startDate: string;
  endDate: string;
  delegatorId: string;
  delegateId: string;
  delegateName: string;
  scope: string;
  createdAt: string;
}

interface DelegationSummary {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

interface FormState {
  delegateId: string;
  delegateName: string;
  scope: string;
  startDate: string;
  endDate: string;
}

const emptyForm: FormState = {
  delegateId: '',
  delegateName: '',
  scope: 'All Approvals',
  startDate: '',
  endDate: '',
};

export default function DelegationPage() {
  const [delegations, setDelegations] = useState<DelegationRule[]>([]);
  const [summary, setSummary] = useState<DelegationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const fetchDelegations = useCallback(async () => {
    try {
      const res = await fetch('/api/manager/delegation');
      if (res.ok) {
        const data = await res.json();
        setDelegations(data.delegations || []);
        setSummary(data.summary || null);
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback({ type: 'error', message: data.message || 'Failed to load delegations.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load delegations.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDelegations();
  }, [fetchDelegations]);

  // Debounced delegate search (only while the modal is open).
  useEffect(() => {
    if (!modalOpen) return;
    let active = true;
    setCandidatesLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/manager/delegation?candidates=true&q=${encodeURIComponent(candidateQuery)}`
        );
        if (res.ok && active) {
          const data = await res.json();
          setCandidates(data.candidates || []);
        }
      } catch {
        if (active) setCandidates([]);
      } finally {
        if (active) setCandidatesLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [candidateQuery, modalOpen]);

  const activeDelegations = delegations.filter(
    (d) => d.status === 'active' || d.status === 'scheduled'
  );
  const historyDelegations = delegations.filter(
    (d) => d.status === 'expired' || d.status === 'revoked'
  );

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toInputDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setCandidateQuery('');
    setFeedback(null);
    setModalOpen(true);
  }

  function openEdit(item: DelegationRule) {
    setEditingId(item.delegationId);
    setForm({
      delegateId: item.delegateId,
      delegateName: item.delegateName,
      scope: item.scope,
      startDate: toInputDate(item.startDate),
      endDate: toInputDate(item.endDate),
    });
    setCandidateQuery('');
    setFeedback(null);
    setModalOpen(true);
  }

  function selectCandidate(candidate: Candidate) {
    setForm((prev) => ({ ...prev, delegateId: candidate.id, delegateName: candidate.name }));
    setCandidateQuery('');
    setCandidates([]);
  }

  async function handleSave() {
    if (!editingId && !form.delegateId) {
      setFeedback({ type: 'error', message: 'Please select a delegate.' });
      return;
    }
    if (!form.startDate || !form.endDate) {
      setFeedback({ type: 'error', message: 'Please provide a start and end date.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = editingId
        ? await fetch('/api/manager/delegation', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingId,
              scope: form.scope,
              startDate: form.startDate,
              endDate: form.endDate,
            }),
          })
        : await fetch('/api/manager/delegation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              delegateId: form.delegateId,
              scope: form.scope,
              startDate: form.startDate,
              endDate: form.endDate,
            }),
          });

      if (res.ok) {
        setModalOpen(false);
        setFeedback({
          type: 'success',
          message: editingId
            ? 'Delegation updated successfully.'
            : 'Delegation created successfully.',
        });
        await fetchDelegations();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback({ type: 'error', message: data.message || 'Failed to save delegation.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save delegation.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/manager/delegation?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Delegation revoked successfully.' });
        await fetchDelegations();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback({ type: 'error', message: data.message || 'Failed to revoke delegation.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to revoke delegation.' });
    } finally {
      setRevoking(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-2 text-sm text-silver-mist">Loading delegations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-500" />
            Delegation of Authority
          </h1>
          <p className="text-slate-500 text-sm">
            Temporarily assign your approval rights to another team member.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <UserPlus className="w-4 h-4" /> Add New Delegate
        </button>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Active Delegations
            </h3>

            {activeDelegations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-500">No active delegations</p>
                <p className="text-xs text-slate-400 mt-1">
                  Create a delegation to assign approval rights
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeDelegations.map((item) => (
                  <div
                    key={item.delegationId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {getInitials(item.delegateName)}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{item.delegateName}</div>
                          <div className="text-xs text-slate-500">{item.delegationName}</div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}
                      >
                        {item.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <div>
                        <div className="text-slate-500 text-xs mb-1 uppercase font-bold tracking-wider">
                          Scope
                        </div>
                        <div className="font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-400" /> {item.scope}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs mb-1 uppercase font-bold tracking-wider">
                          Duration
                        </div>
                        <div className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />{' '}
                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-slate-500 hover:text-indigo-600 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        disabled={revoking === item.delegationId}
                        onClick={() => handleRevoke(item.delegationId)}
                        className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        {revoking === item.delegationId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}{' '}
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-500">
              <History className="w-5 h-5" /> Delegation History
            </h3>
            {historyDelegations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                <p className="text-sm text-slate-400">No delegation history</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Delegate</th>
                      <th className="px-6 py-4">Scope</th>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyDelegations.map((item) => (
                      <tr
                        key={item.delegationId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 font-medium">{item.delegateName}</td>
                        <td className="px-6 py-4">{item.scope}</td>
                        <td className="px-6 py-4">
                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400 capitalize">{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">
                  Important Policy
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2 list-disc pl-4">
                  <li>Delegates assume full responsibility for actions taken on your behalf.</li>
                  <li>
                    Financial approvals above $5,000 cannot be delegated without CFO approval.
                  </li>
                  <li>Automation rules will notify you of all delegated actions daily.</li>
                </ul>
              </div>
            </div>
          </div>

          {summary && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h4 className="font-bold mb-4">Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Delegations</span>
                  <span className="font-bold">{summary.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Active</span>
                  <span className="font-bold text-emerald-500">{summary.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Scheduled</span>
                  <span className="font-bold text-amber-500">{summary.scheduled}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Expired</span>
                  <span className="font-bold text-slate-400">{summary.expired}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                {editingId ? 'Edit Delegation' : 'New Delegation'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {editingId ? (
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Delegate
                  </span>
                  <div className="mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium">
                    {form.delegateName}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Delegate
                  </span>
                  {form.delegateId ? (
                    <div className="mt-1 flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-sm">
                      <span className="font-medium">{form.delegateName}</span>
                      <button
                        onClick={() =>
                          setForm((prev) => ({ ...prev, delegateId: '', delegateName: '' }))
                        }
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Clear delegate"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={candidateQuery}
                          onChange={(e) => setCandidateQuery(e.target.value)}
                          className="w-full pl-9 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          placeholder="Search team member by name or email"
                        />
                      </div>
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {candidatesLoading ? (
                          <div className="px-3 py-3 text-sm text-slate-400 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                          </div>
                        ) : candidates.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-slate-400">No users found</div>
                        ) : (
                          candidates.map((candidate) => (
                            <button
                              key={candidate.id}
                              onClick={() => selectCandidate(candidate)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                            >
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-xs text-slate-400">{candidate.email}</div>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Scope
                </span>
                <select
                  value={form.scope}
                  onChange={(e) => setForm((prev) => ({ ...prev, scope: e.target.value }))}
                  className="w-full mt-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                >
                  <option>All Approvals</option>
                  <option>Leave</option>
                  <option>Expenses</option>
                  <option>Overtime</option>
                  <option>Attendance</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full mt-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    End Date
                  </span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full mt-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Delegation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

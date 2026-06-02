'use client';

import React, { useState, useEffect } from 'react';
import { JobOfferService } from '../services';
import type { JobOffer } from '../types';
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  FileSignature,
  Loader2,
  Save,
  Send,
  User,
  X,
} from 'lucide-react';

function getOfferStageLabel(status: JobOffer['status'] | string) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending_approval':
      return 'Pending Approval';
    case 'approved':
      return 'Approved';
    case 'sent':
      return 'Sent to Candidate';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    case 'withdrawn':
      return 'Withdrawn';
    case 'expired':
      return 'Expired';
    default:
      return String(status || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

function getOfferStatusStyle(status: JobOffer['status'] | string) {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-600';
    case 'pending_approval':
    case 'draft':
    case 'approved':
      return 'bg-amber-100 text-amber-600';
    case 'declined':
    case 'withdrawn':
    case 'expired':
      return 'bg-rose-100 text-rose-600';
    default:
      return 'bg-indigo-100 text-indigo-600';
  }
}

function getOfferValue(offer: JobOffer): string {
  return `${offer.currency || 'USD'} ${Number(offer.salary || 0).toLocaleString()}`;
}

type NewOfferForm = {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  departmentName: string;
  salary: string;
  currency: string;
  startDate: string;
  applicationId: string;
};

const emptyForm: NewOfferForm = {
  candidateName: '',
  candidateEmail: '',
  jobTitle: '',
  departmentName: '',
  salary: '',
  currency: 'USD',
  startDate: '',
  applicationId: '',
};

export default function OfferManagementPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<NewOfferForm | null>(null);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, awaitingSignature: 0 });
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await JobOfferService.getOffers();
      setOffers(data);

      const awaitingSignature = data.filter((offer) => offer.status === 'sent').length;
      const accepted = data.filter((offer) => offer.status === 'accepted').length;
      const pending = data.filter(
        (offer) => offer.status === 'pending_approval' || offer.status === 'draft'
      ).length;
      setStats({ pending, accepted, awaitingSignature });
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load offers.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (offerId: string) => {
    try {
      await JobOfferService.sendOffer(offerId);
      await fetchOffers();
      setStatus({ kind: 'success', text: 'Offer sent to candidate.' });
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to send offer.' });
    }
  };

  const handleCreateOffer = async () => {
    if (!editing) return;
    if (
      !editing.candidateName.trim() ||
      !editing.jobTitle.trim() ||
      !editing.applicationId.trim()
    ) {
      setStatus({
        kind: 'error',
        text: 'Candidate name, job title, and application ID are required.',
      });
      return;
    }
    setCreating(true);
    setStatus(null);
    try {
      await JobOfferService.createOffer({
        applicationId: editing.applicationId,
        candidateName: editing.candidateName,
        candidateEmail: editing.candidateEmail || undefined,
        jobTitle: editing.jobTitle,
        departmentName: editing.departmentName || undefined,
        salary: Number(editing.salary) || 0,
        currency: editing.currency,
        startDate: editing.startDate || undefined,
        status: 'draft',
      } as any);
      await fetchOffers();
      setEditing(null);
      setStatus({ kind: 'success', text: 'Offer created as draft.' });
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to create offer.' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-silver-mist font-medium">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-indigo-500" />
            Offer Management
          </h1>
          <p className="text-slate-500 text-sm">Create, approve, and track candidate offers.</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Create New Offer
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-3xl font-black text-indigo-600">{stats.awaitingSignature}</div>
          <div className="text-sm font-bold text-slate-500">Offers Out for Signature</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-3xl font-black text-emerald-600">{stats.accepted}</div>
          <div className="text-sm font-bold text-slate-500">Accepted</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-3xl font-black text-amber-600">{stats.pending}</div>
          <div className="text-sm font-bold text-slate-500">Pending Approval</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold text-slate-500 text-sm flex">
          <div className="w-1/3">Candidate & Role</div>
          <div className="w-1/3">Stage</div>
          <div className="w-1/3 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {offers.length === 0 && (
            <div className="p-12 text-center">
              <FileSignature className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                No offers yet
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Create your first offer to get started.
              </p>
            </div>
          )}
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-1/3">
                <div className="font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {offer.candidateName || 'Candidate'}
                </div>
                <div className="text-xs text-slate-500 ml-6">
                  {offer.jobTitle || 'Untitled Position'} •{' '}
                  {offer.departmentName || 'No department'}
                </div>
              </div>
              <div className="w-1/3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getOfferStatusStyle(offer.status)}`}
                >
                  {offer.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                  {(offer.status === 'pending_approval' || offer.status === 'draft') && (
                    <Clock className="w-3 h-3" />
                  )}
                  {getOfferStageLabel(offer.status)}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {getOfferValue(offer)} • Starts{' '}
                  {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'TBD'}
                </div>
              </div>
              <div className="w-1/3 flex justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                {offer.status === 'approved' && (
                  <button
                    onClick={() => handleSendOffer(offer.id)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                  >
                    Send Offer
                  </button>
                )}
                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">New offer</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field label="Application ID" required>
                <input
                  value={editing.applicationId}
                  onChange={(e) => setEditing({ ...editing, applicationId: e.target.value })}
                  placeholder="e.g. APP-1234"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
              <Field label="Candidate name" required>
                <input
                  value={editing.candidateName}
                  onChange={(e) => setEditing({ ...editing, candidateName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
              <Field label="Candidate email">
                <input
                  type="email"
                  value={editing.candidateEmail}
                  onChange={(e) => setEditing({ ...editing, candidateEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
              <Field label="Job title" required>
                <input
                  value={editing.jobTitle}
                  onChange={(e) => setEditing({ ...editing, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
              <Field label="Department">
                <input
                  value={editing.departmentName}
                  onChange={(e) => setEditing({ ...editing, departmentName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
              <Field label="Salary">
                <input
                  type="number"
                  value={editing.salary}
                  onChange={(e) => setEditing({ ...editing, salary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
              <Field label="Currency">
                <select
                  value={editing.currency}
                  onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>AED</option>
                  <option>SAR</option>
                  <option>INR</option>
                </select>
              </Field>
              <Field label="Start date">
                <input
                  type="date"
                  value={editing.startDate}
                  onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOffer}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {creating ? 'Creating…' : 'Create offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

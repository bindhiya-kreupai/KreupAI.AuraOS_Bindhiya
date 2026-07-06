'use client';

import React, { useState, useEffect } from 'react';
import { Users, Phone, Building2, X } from 'lucide-react';
import { UnionService } from '../services';
import type { Union, Toast } from '../types';
import { ToastContainer } from '../components/Toast';

interface UnionFormState {
  unionName: string;
  registrationNumber: string;
  unionType: 'local' | 'national' | 'international';
  memberCount: string;
  representativeName: string;
  representativeContact: string;
}

const EMPTY_FORM: UnionFormState = {
  unionName: '',
  registrationNumber: '',
  unionType: 'local',
  memberCount: '',
  representativeName: '',
  representativeContact: '',
};

export default function UnionDatabasePage() {
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<UnionFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [membersOf, setMembersOf] = useState<Union | null>(null);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    fetchUnions();
  }, []);

  const fetchUnions = async () => {
    setLoading(true);
    try {
      const data = await UnionService.getUnions();
      setUnions(data);
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to load unions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await UnionService.createUnion({
        unionName: form.unionName,
        registrationNumber: form.registrationNumber,
        unionType: form.unionType,
        memberCount: Number(form.memberCount) || 0,
        representativeName: form.representativeName,
        representativeContact: form.representativeContact,
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      notify('success', 'Union added successfully.');
      await fetchUnions();
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to add union.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status?: string) =>
    status === 'active'
      ? 'bg-emerald-100 text-emerald-600'
      : status === 'inactive'
        ? 'bg-amber-100 text-amber-600'
        : 'bg-rose-100 text-rose-600';

  const penetration = (u: Union) =>
    u.eligibleEmployees > 0 ? Math.round((u.memberCount / u.eligibleEmployees) * 100) : 0;

  const contactHref = (contact?: string) => {
    if (!contact) return null;
    return contact.includes('@') ? `mailto:${contact}` : `tel:${contact}`;
  };

  const activeCount = unions.filter((u) => u.status === 'active').length;
  const totalMembers = unions.reduce((sum, u) => sum + (u.memberCount || 0), 0);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Union Database
          </h1>
          <p className="text-slate-500 text-sm">
            Directory of union locals and representative contacts.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          Add Union
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Total Unions</div>
          <div className="text-2xl font-bold">{unions.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Total Members</div>
          <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading unions&hellip;
        </div>
      ) : unions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          No unions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-auto">
          {unions.map((union) => {
            const href = contactHref(union.representativeContact);
            return (
              <div
                key={union.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{union.unionName}</h3>
                      <div className="text-sm text-slate-500">
                        {union.unionCode} &middot; Rep: {union.representativeName || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold capitalize ${statusStyle(union.status)}`}
                  >
                    {union.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="text-slate-500 mb-1">Membership</div>
                    <div className="font-bold">{union.memberCount} Members</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="text-slate-500 mb-1">Penetration</div>
                    <div className="font-bold">{penetration(union)}%</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMembersOf(union)}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" /> View Members
                  </button>
                  {href ? (
                    <a
                      href={href}
                      className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Contact Rep
                    </a>
                  ) : (
                    <button
                      disabled
                      title="No representative contact on file"
                      className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Contact Rep
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {membersOf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{membersOf.unionName} &mdash; Membership</h3>
              <button
                onClick={() => setMembersOf(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-2xl font-bold">{membersOf.memberCount}</div>
                <div className="text-xs text-slate-500 mt-1">Members</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-2xl font-bold">{membersOf.eligibleEmployees}</div>
                <div className="text-xs text-slate-500 mt-1">Eligible</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600">{penetration(membersOf)}%</div>
                <div className="text-xs text-slate-500 mt-1">Penetration</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Aggregate membership figures. Individual member rosters are not maintained in this
              directory.
            </p>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Union</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Union Name</label>
              <input
                required
                value={form.unionName}
                onChange={(e) => setForm({ ...form, unionName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Registration Number</label>
                <input
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Union Type</label>
                <select
                  value={form.unionType}
                  onChange={(e) =>
                    setForm({ ...form, unionType: e.target.value as UnionFormState['unionType'] })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="local">Local</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Member Count</label>
              <input
                type="number"
                min="0"
                value={form.memberCount}
                onChange={(e) => setForm({ ...form, memberCount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Representative Name</label>
                <input
                  value={form.representativeName}
                  onChange={(e) => setForm({ ...form, representativeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Representative Contact</label>
                <input
                  value={form.representativeContact}
                  onChange={(e) => setForm({ ...form, representativeContact: e.target.value })}
                  placeholder="email or phone"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Add Union'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

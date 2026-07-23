'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, AlertTriangle, Upload, Loader2, PlusCircle, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No providers found. Add one to get started.</p>
  </div>
);

export default function CredentialingPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('General Practice');
  const [email, setEmail] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['healthcareProviders'],
    queryFn: async () => {
      const res = await fetch('/api/healthcare/credentialing');
      if (!res.ok) throw new Error('Failed to fetch healthcare providers');
      return res.json();
    },
  });

  const providers = data?.providers || [];

  const createMutation = useMutation({
    mutationFn: async (newProvider: any) => {
      const res = await fetch('/api/healthcare/credentialing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider),
      });
      if (!res.ok) throw new Error('Failed to create provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthcareProviders'] });
      toast.success('Provider added successfully!');
      setIsModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
    },
    onError: () => {
      toast.error('Failed to create provider');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/healthcare/credentialing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthcareProviders'] });
      toast.success('Provider deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete provider');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      personalInfo: { firstName, lastName, email },
      specialty,
      status: 'active',
      licenses: [
        {
          issuingState: 'CA',
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        },
      ],
    });
  };

  const expiringAlerts = providers.filter((p: any) => {
    const primaryLicense = p.licenses?.[0];
    if (!primaryLicense) return false;
    const expiryDate = new Date(primaryLicense.expiryDate);
    const now = new Date();
    const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 90;
  });

  return (
    <div className="space-y-4 pb-6 relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-indigo-500" />
            Credentialing
          </h1>
          <p className="text-slate-500 text-sm">Track medical licenses and certifications.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-200 transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Provider
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold">
          Error loading providers
        </div>
      ) : providers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {expiringAlerts.length > 0 && (
            <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-rose-700 dark:text-rose-400">Expiring Licenses</h3>
                <p className="text-sm text-rose-600 dark:text-rose-300">
                  {expiringAlerts.length} provider(s) have licenses expiring within the next 90
                  days.
                </p>
              </div>
            </div>
          )}

          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Practitioner</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {providers.map((p: any) => {
                  const primaryLicense = p.licenses?.[0];
                  const fullName = `${p.personalInfo?.firstName || ''} ${p.personalInfo?.lastName || ''}`;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {p.personalInfo?.lastName?.[0] || '?'}
                        </div>
                        <span className="font-bold">{fullName.trim() || 'Unnamed'}</span>
                      </td>
                      <td className="px-6 py-4">{p.specialty}</td>
                      <td className="px-6 py-4">{primaryLicense?.issuingState || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono">
                        {primaryLicense
                          ? new Date(primaryLicense.expiryDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-600'
                              : p.status === 'pending'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="text-rose-500 hover:text-rose-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Healthcare Provider</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                >
                  <option value="General Practice">General Practice</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, FileCheck, AlertOctagon, CheckCircle, PlusCircle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
    <p className="font-bold">Error loading programs</p>
    <p className="text-sm">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No compliance programs found.</p>
  </div>
);

export default function RegulatoryCompliancePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [programName, setProgramName] = useState('');
  const [complianceArea, setComplianceArea] = useState('AML/KYC');
  const [status, setStatus] = useState('Active');

  const {
    data: programs,
    isLoading: isProgramsLoading,
    error,
  } = useQuery({
    queryKey: ['compliancePrograms'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/compliance/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json();
    },
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ['financialTransactions'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/banking/transactions');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newProgram: any) => {
      const res = await fetch('/api/financial-services/compliance/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgram),
      });
      if (!res.ok) throw new Error('Failed to create program');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliancePrograms'] });
      toast.success('Compliance program created!');
      setIsModalOpen(false);
      setProgramName('');
    },
    onError: () => {
      toast.error('Failed to create program');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/financial-services/compliance/programs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete program');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliancePrograms'] });
      toast.success('Program deleted');
    },
    onError: () => {
      toast.error('Failed to delete program');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate({
      programName: programName || 'New Program',
      complianceArea,
      status,
    });
  };

  // Calculate Metrics
  const totalPrograms = programs?.length || 0;
  const compliantPrograms =
    programs?.filter(
      (p: any) => p.status.toLowerCase() === 'active' || p.status.toLowerCase() === 'compliant'
    ).length || 0;
  const complianceScore =
    totalPrograms > 0 ? Math.round((compliantPrograms / totalPrograms) * 100) : 100;

  const sarReportsCount =
    transactions?.filter((t: any) => t.status.toLowerCase() === 'flagged').length || 0;

  const isLoading = isProgramsLoading || isTxLoading;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            Regulatory Compliance
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor adherence to financial regulations and KYC/AML policies.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2"
        >
          <FileCheck className="w-4 h-4" /> New Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliance Score</div>
          <div
            className={`text-4xl font-bold ${complianceScore >= 90 ? 'text-emerald-600' : complianceScore >= 75 ? 'text-amber-500' : 'text-rose-600'}`}
          >
            {isProgramsLoading ? '...' : `${complianceScore}%`}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Based on {totalPrograms} Active Programs
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Programs</div>
          <div className="text-4xl font-bold text-slate-700 dark:text-slate-300">
            {isProgramsLoading ? '...' : totalPrograms}
          </div>
          <div className="text-xs text-emerald-500 font-bold mt-1">All Systems Nominal</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">SAR Reports</div>
          <div
            className={`text-4xl font-bold ${sarReportsCount > 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}
          >
            {isTxLoading ? '...' : sarReportsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Suspicious Activity Reports</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1">
        <h3 className="font-bold text-lg mb-4">Regulatory Programs</h3>

        {isLoading && <Skeleton />}
        {error && <ErrorState message={(error as Error).message} />}
        {!isLoading && !error && programs?.length === 0 && <EmptyState />}

        {!isLoading && !error && programs?.length > 0 && (
          <div className="space-y-2">
            {programs.map((program: any) => (
              <div
                key={program.programId}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors group relative"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      program.status.toLowerCase() === 'active' ||
                      program.status.toLowerCase() === 'compliant'
                        ? 'bg-emerald-100 text-emerald-600'
                        : program.status.toLowerCase() === 'warning'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {program.status.toLowerCase() === 'active' ||
                    program.status.toLowerCase() === 'compliant' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertOctagon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{program.programName}</div>
                    <div className="text-xs text-slate-500">
                      Area: {program.complianceArea} • Next Review:{' '}
                      {new Date(program.nextReviewDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      program.status.toLowerCase() === 'active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {program.status}
                  </span>

                  <button
                    onClick={() => deleteMutation.mutate(program.programId)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Compliance Program</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Program Name
                </label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. Q3 AML Audit"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Compliance Area
                </label>
                <select
                  value={complianceArea}
                  onChange={(e) => setComplianceArea(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AML/KYC">AML/KYC</option>
                  <option value="Data Privacy">Data Privacy (GDPR)</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Fraud Detection">Fraud Detection</option>
                  <option value="BASEL III">BASEL III</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Warning">Warning</option>
                  <option value="Reviewing">Reviewing</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, FileText, AlertCircle, PlusCircle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
    <p className="font-bold">Error loading claims</p>
    <p className="text-sm">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No claims found.</p>
  </div>
);

export default function InsuranceClaimsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [policyId, setPolicyId] = useState('POL-AUTO-01');
  const [claimantName, setClaimantName] = useState('');
  const [reserveAmount, setReserveAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [riskLevel, setRiskLevel] = useState('Low');

  const {
    data: claims,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['insuranceClaims'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/insurance/claims');
      if (!res.ok) throw new Error('Failed to fetch claims');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newClaim: any) => {
      const res = await fetch('/api/financial-services/insurance/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim),
      });
      if (!res.ok) throw new Error('Failed to create claim');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceClaims'] });
      toast.success('Claim created successfully!');
      setIsModalOpen(false);
      setReserveAmount('');
      setClaimantName('');
      setRiskLevel('Low');
    },
    onError: () => {
      toast.error('Failed to create claim');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/financial-services/insurance/claims/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete claim');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceClaims'] });
      toast.success('Claim deleted');
    },
    onError: () => {
      toast.error('Failed to delete claim');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reserveAmount || isNaN(Number(reserveAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    createMutation.mutate({
      policyId,
      status,
      reserveAmount: Number(reserveAmount),
      claimant: {
        name: claimantName || 'Unknown Claimant',
        contact: 'Not provided',
      },
      incident: {
        description: 'User created claim',
        severity: riskLevel,
        location: 'Unspecified',
        policeReport: false,
      },
    });
  };

  // Calculate Metrics
  const totalClaims = claims?.length || 0;

  // Avg Processing Time (in days)
  const processingTimes =
    claims
      ?.filter((c: any) => c.status.toLowerCase() !== 'pending' && c.createdAt && c.updatedAt)
      .map((c: any) => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.updatedAt).getTime();
        return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
      }) || [];

  const avgProcessingTime =
    processingTimes.length > 0
      ? (
          processingTimes.reduce((a: number, b: number) => a + b, 0) / processingTimes.length
        ).toFixed(1)
      : '0.0';

  // Approval Rate
  const approvedClaims =
    claims?.filter((c: any) => c.status.toLowerCase() === 'approved').length || 0;
  const approvalRate = totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;

  // Fraud Detection (using High risk as flagged)
  const flaggedClaims =
    claims?.filter(
      (c: any) =>
        c.incident?.severity === 'High' || (c.reserveAmount > 15000 && !c.incident?.severity)
    ).length || 0;
  const fraudRate = totalClaims > 0 ? ((flaggedClaims / totalClaims) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            Insurance Claims
          </h1>
          <p className="text-slate-500 text-sm">Process and track insurance claims efficiently.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> New Claim
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-4">Active Claims</h3>

          {isLoading && <Skeleton />}
          {error && <ErrorState message={(error as Error).message} />}
          {!isLoading && !error && claims?.length === 0 && <EmptyState />}

          {!isLoading && !error && claims?.length > 0 && (
            <div className="space-y-4">
              {claims.map((claim: any) => {
                const cName = claim.claimant?.name || 'Unknown';
                const reserveStr = `$${Number(claim.reserveAmount).toFixed(2)}`;
                const risk =
                  claim.incident?.severity || (claim.reserveAmount > 15000 ? 'High' : 'Low');

                return (
                  <div
                    key={claim.claimId}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 gap-3 relative group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <FileText className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{cName}</div>
                        <div className="text-sm text-slate-500">
                          Policy: {claim.policyId} • ID: {claim.claimId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-lg">{reserveStr}</div>
                        <div
                          className={`text-xs font-bold ${risk === 'High' ? 'text-rose-500' : risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}
                        >
                          {risk} Risk
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          claim.status.toLowerCase() === 'approved'
                            ? 'bg-emerald-100 text-emerald-600'
                            : claim.status.toLowerCase() === 'investigation'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {claim.status}
                      </span>

                      <button
                        onClick={() => deleteMutation.mutate(claim.claimId)}
                        disabled={deleteMutation.isPending}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete claim"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-6">Processing Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Avg Processing Time</span>
                <span className="font-bold">{isLoading ? '...' : `${avgProcessingTime} Days`}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${Math.min(100, Number(avgProcessingTime) * 10)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Approval Rate</span>
                <span className="font-bold">{isLoading ? '...' : `${approvalRate}%`}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${approvalRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Fraud Detection</span>
                <span className="font-bold">{isLoading ? '...' : `${fraudRate}% Flagged`}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${fraudRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div className="text-sm text-indigo-800 dark:text-indigo-200">
              <strong>AI Insight:</strong>{' '}
              {Number(fraudRate) > 10
                ? 'Unusually high fraud detection rate this week. Enhanced review protocol recommended.'
                : 'Claims processing and approval rates are within normal operational parameters.'}
            </div>
          </div>
        </div>
      </div>

      {/* Create Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Insurance Claim</h3>
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
                  Policy ID
                </label>
                <input
                  type="text"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  placeholder="POL-AUTO-01"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Claimant Name
                </label>
                <input
                  type="text"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reserve Amount ($)
                </label>
                <input
                  type="number"
                  value={reserveAmount}
                  onChange={(e) => setReserveAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
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
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Investigation">Investigation</option>
                  <option value="Approved">Approved</option>
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
                  {createMutation.isPending ? 'Saving...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle2, Briefcase, ArrowRight, Loader2, X } from 'lucide-react';
import { EligibilityService, BenefitPlanService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export default function PlanEligibilityPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const toast = useToast();

  const [eligibilityRules, setEligibilityRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [checking, setChecking] = useState(false);

  const fetchEligibility = useCallback(async () => {
    if (!user?.employeeId) return;
    try {
      setLoading(true);
      const response = await EligibilityService.getEmployeeEligibility(user.employeeId);
      setEligibilityRules(response.data || []);
    } catch (error: any) {
      console.error('Error fetching eligibility:', error);
      setEligibilityRules([]);
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchEligibility();
  }, [authLoading, user, fetchEligibility]);

  const openCheckModal = async () => {
    setCheckModalOpen(true);
    setSelectedPlanId('');
    try {
      setPlansLoading(true);
      const response = await BenefitPlanService.getPlans({ status: 'ACTIVE' });
      setPlans(response.data || []);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      setPlans([]);
      toast.error('Failed to load benefit plans.');
    } finally {
      setPlansLoading(false);
    }
  };

  const closeCheckModal = () => {
    if (checking) return;
    setCheckModalOpen(false);
    setSelectedPlanId('');
  };

  const runEligibilityCheck = async () => {
    if (!user?.employeeId || !selectedPlanId) return;
    try {
      setChecking(true);
      const response = await EligibilityService.checkEligibility(user.employeeId, selectedPlanId);
      if (response.success) {
        const result = response.data;
        const status = result?.status;
        const reason = result?.reason || 'No additional details.';
        const normalizedStatus = String(status || '').toLowerCase();
        const eligible =
          normalizedStatus === 'eligible' ||
          normalizedStatus === 'enrolled' ||
          normalizedStatus === 'conditional';
        if (eligible) {
          toast.success(`Eligible: ${reason}`);
        } else {
          toast.warning(`Not eligible (${status || 'PENDING'}): ${reason}`);
        }
        await fetchEligibility();
        setCheckModalOpen(false);
        setSelectedPlanId('');
      } else {
        toast.error('Eligibility check failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      toast.error('Eligibility check failed. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Plan Eligibility Rules
          </h1>
          <p className="text-slate-500 text-sm">
            Define criteria for employee benefit qualification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : eligibilityRules.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">
              No Eligibility Rules Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Create eligibility rules to define which employees qualify for benefit plans.
            </p>
          </div>
        ) : (
          eligibilityRules.map((rule, i) => (
            <div
              key={rule.id || i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{rule.benefitPlanName || rule.name}</h3>
                    <p className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                      {rule.reason || rule.criteria || 'No criteria specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-500 md:px-8 md:border-l md:border-r border-slate-100 dark:border-slate-800 flex-1 justify-center">
                <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
                <div className="text-center md:text-left">
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                    Status
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {rule.status || 'pending'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border ${
                    rule.status === 'eligible' || rule.status === 'ELIGIBLE'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />{' '}
                  {rule.status === 'eligible' || rule.status === 'ELIGIBLE'
                    ? 'Eligible'
                    : 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={openCheckModal}
          disabled={authLoading || !user}
          className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-600 dark:text-slate-300">Check Plan Eligibility</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Select an active benefit plan to evaluate your eligibility against its criteria.
          </p>
        </button>
      </div>

      {/* Eligibility Check Modal */}
      {checkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                Check Plan Eligibility
              </h2>
              <button
                type="button"
                onClick={closeCheckModal}
                disabled={checking}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Select an active benefit plan to run an eligibility check for the current employee.
            </p>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Benefit Plan
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={plansLoading || checking}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">{plansLoading ? 'Loading plans…' : 'Select a benefit plan'}</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.planName || plan.name || plan.id}
                </option>
              ))}
            </select>
            {!plansLoading && plans.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">No active benefit plans available.</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeCheckModal}
                disabled={checking}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runEligibilityCheck}
                disabled={!selectedPlanId || checking}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {checking && <Loader2 className="w-4 h-4 animate-spin" />}
                {checking ? 'Checking…' : 'Check Eligibility'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}

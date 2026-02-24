"use client";

import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { BenefitPlanService, EnrollmentService } from '../services';

interface RetirementPlan {
  name: string;
  employeePremium: number;
  employerPremium: number;
  totalPremium: number;
}

export default function RetirementPage() {
  const [plans, setPlans] = useState<RetirementPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await BenefitPlanService.getPlans({ category: 'RETIREMENT' });
      const data = response?.data || response || [];
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data.map((p: any) => ({
          name: p.planName || p.name || 'Retirement Plan',
          employeePremium: p.employeePremium || 0,
          employerPremium: p.employerPremium || 0,
          totalPremium: (p.employeePremium || 0) + (p.employerPremium || 0),
        })));
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching retirement data:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  const totalContributions = plans.reduce((sum, p) => sum + p.totalPremium, 0);
  const totalEmployeeContributions = plans.reduce((sum, p) => sum + p.employeePremium, 0);
  const totalEmployerContributions = plans.reduce((sum, p) => sum + p.employerPremium, 0);

  if (plans.length === 0) {
    return (
      <div className="space-y-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Retirement</h1>
          <p className="text-sm text-silver-mist mt-1">Track your 401(k) balance, contributions, and investment performance</p>
        </div>
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <Landmark className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">No Retirement Plans</h2>
          <p className="text-silver-mist max-w-md">You are not currently enrolled in any retirement benefit plans. Contact HR for enrollment options.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Retirement</h1>
        <p className="text-sm text-silver-mist mt-1">Track your 401(k) balance, contributions, and investment performance</p>
      </div>

      {/* Balance Overview */}
      <div className="bg-gradient-to-r from-celestial-indigo to-purple-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-80">Total Monthly Contributions</p>
        <p className="text-4xl font-bold mt-1">${totalContributions.toLocaleString()}</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>Employee: ${totalEmployeeContributions.toLocaleString()}/mo</span>
          </div>
          <span className="text-sm opacity-70">|</span>
          <span className="text-sm opacity-80">Employer: ${totalEmployerContributions.toLocaleString()}/mo</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Your Contribution</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">${totalEmployeeContributions.toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">per month</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Employer Match</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${totalEmployerContributions.toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">per month</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Annual Total</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">${(totalContributions * 12).toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">projected yearly</p>
        </div>
      </div>

      {/* Plan Details */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Retirement Plans</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {plans.map((plan, idx) => (
            <div key={idx} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{plan.name}</p>
                <p className="text-xs text-silver-mist mt-0.5">Employee: ${plan.employeePremium}/mo | Employer: ${plan.employerPremium}/mo</p>
              </div>
              <div className="w-20 text-right">
                <p className="text-sm font-bold text-ink-black dark:text-pearl">${plan.totalPremium}/mo</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


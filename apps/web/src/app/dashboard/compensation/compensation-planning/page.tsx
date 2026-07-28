'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, TrendingUp, X } from 'lucide-react';
import { EmployeeCompensationService, CompensationAnalyticsService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface CompForm {
  employeeId: string;
  annualCTC: string;
  annualGross: string;
  annualBasic: string;
  effectiveFrom: string;
  reason: string;
}

const EMPTY_FORM: CompForm = {
  employeeId: '',
  annualCTC: '',
  annualGross: '',
  annualBasic: '',
  effectiveFrom: '',
  reason: '',
};

export default function CompensationPlanningPage() {
  const [compensations, setCompensations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'revise' | null>(null);
  const [form, setForm] = useState<CompForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState<any>(null);

  // Create Form States
  const [empId, setEmpId] = useState('');
  const [annualCTC, setAnnualCTC] = useState<number>(0);
  const [annualBasic, setAnnualBasic] = useState<number>(0);
  const [annualGross, setAnnualGross] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Revise Form States
  const [newSalary, setNewSalary] = useState<number>(0);
  const [reviseReason, setReviseReason] = useState('');
  const [reviseEffectiveFrom, setReviseEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Edit fields states
  const [reviseEmployeeId, setReviseEmployeeId] = useState('');
  const [reviseBasicSalary, setReviseBasicSalary] = useState<number>(0);
  const [reviseIsActive, setReviseIsActive] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compData, metricsData] = await Promise.all([
        EmployeeCompensationService.getCompensations(),
        CompensationAnalyticsService.getMetrics(),
      ]);
      setCompensations(compData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error:', err);
      error('Failed to load compensation data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalMode('create');
  };

  const openRevise = (comp: any) => {
    setForm({
      employeeId: comp.employeeId || '',
      annualCTC: String(comp.annualCTC ?? ''),
      annualGross: String(comp.annualGross ?? ''),
      annualBasic: String(comp.annualBasic ?? ''),
      effectiveFrom: new Date().toISOString().slice(0, 10),
      reason: '',
    });
    setModalMode('revise');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.effectiveFrom) {
      error('Employee and effective date are required');
      return;
    }
    setSubmitting(true);
    try {
      if (modalMode === 'revise') {
        await EmployeeCompensationService.reviseCompensation(
          form.employeeId,
          Number(form.annualCTC) || 0,
          form.effectiveFrom,
          form.reason
        );
        success('Compensation revised');
      } else {
        await EmployeeCompensationService.createCompensation({
          employeeId: form.employeeId,
          annualCTC: Number(form.annualCTC) || 0,
          annualGross: Number(form.annualGross) || 0,
          annualBasic: Number(form.annualBasic) || 0,
          effectiveFrom: form.effectiveFrom,
          remarks: form.reason,
          isActive: true,
        } as any);
        success('Compensation record created');
      }
      setModalMode(null);
      setForm(EMPTY_FORM);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to save compensation');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBudget = metrics?.totalCompensationCost || 0;
  const avgIncrease = metrics?.incrementMetrics?.averageIncrementPercentage || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Compensation Planning
          </h1>
          <p className="text-sm text-silver-mist mt-1">
            Plan and allocate merit increases for your team
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Compensation
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Compensation</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">
            ${totalBudget > 0 ? (totalBudget / 1000).toFixed(0) + 'K' : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">
            Active employees: {metrics?.totalEmployees || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Compensation</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">
            $
            {metrics?.averageCompensation
              ? (metrics.averageCompensation / 1000).toFixed(0) + 'K'
              : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">Per employee</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Median Compensation</p>
          <p className="text-2xl font-bold text-neural-mint mt-1">
            $
            {metrics?.medianCompensation
              ? (metrics.medianCompensation / 1000).toFixed(0) + 'K'
              : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">50th percentile</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Increase</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">
            {avgIncrease > 0 ? avgIncrease.toFixed(1) + '%' : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">Last cycle</p>
        </div>
      </div>

      {/* Team Compensation Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">
            Employee Compensation Details
          </h3>
        </div>
        {compensations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No compensation data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-4 py-3 font-medium">Employee</th>
                  <th className="text-right px-4 py-3 font-medium">Annual CTC</th>
                  <th className="text-right px-4 py-3 font-medium">Monthly CTC</th>
                  <th className="text-right px-4 py-3 font-medium">Basic Salary</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {compensations.map((comp: any) => (
                  <tr
                    key={comp.id}
                    className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-celestial-indigo">
                            {(comp.employeeName || comp.employeeId || '?')
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">
                          {comp.employeeName || comp.employeeId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      ${comp.annualCTC ? Number(comp.annualCTC).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      ${comp.monthlyCTC ? Number(comp.monthlyCTC).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      ${comp.annualBasic ? Number(comp.annualBasic).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${comp.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {comp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openRevise(comp)}
                        className="text-xs font-bold text-celestial-indigo hover:underline inline-flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" /> Revise
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market Benchmarking */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3">
          Compensation Distribution
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <p className="text-xs text-silver-mist">Total Employees</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">
              {metrics?.totalEmployees || 0}
            </p>
          </div>
          <div className="text-center p-3 bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-lg border border-celestial-indigo/20">
            <p className="text-xs text-celestial-indigo font-medium">Average CTC</p>
            <p className="text-lg font-bold text-celestial-indigo mt-1">
              $
              {metrics?.averageCompensation
                ? Math.round(metrics.averageCompensation).toLocaleString()
                : '--'}
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <p className="text-xs text-silver-mist">Median CTC</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">
              $
              {metrics?.medianCompensation
                ? Math.round(metrics.medianCompensation).toLocaleString()
                : '--'}
            </p>
          </div>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
                {modalMode === 'revise' ? 'Revise Compensation' : 'New Compensation'}
              </h2>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">
                <span className="text-silver-mist font-medium">Employee ID</span>
                <input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  disabled={modalMode === 'revise'}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-transparent disabled:opacity-60"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-silver-mist font-medium">Annual CTC</span>
                <input
                  type="number"
                  value={form.annualCTC}
                  onChange={(e) => setForm({ ...form, annualCTC: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-transparent"
                />
              </label>
              {modalMode === 'create' && (
                <>
                  <label className="text-sm">
                    <span className="text-silver-mist font-medium">Annual Gross</span>
                    <input
                      type="number"
                      value={form.annualGross}
                      onChange={(e) => setForm({ ...form, annualGross: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-transparent"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-silver-mist font-medium">Annual Basic</span>
                    <input
                      type="number"
                      value={form.annualBasic}
                      onChange={(e) => setForm({ ...form, annualBasic: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-transparent"
                    />
                  </label>
                </>
              )}
              <label className="text-sm">
                <span className="text-silver-mist font-medium">Effective From</span>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-silver-mist font-medium">Reason / Remarks</span>
                <input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-transparent"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-cloud dark:border-nebula-purple/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-celestial-indigo text-white hover:bg-celestial-indigo/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'revise' ? 'Revise' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

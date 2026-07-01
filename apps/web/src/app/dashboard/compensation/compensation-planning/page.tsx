'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { EmployeeCompensationService, CompensationAnalyticsService } from '../services';

export default function CompensationPlanningPage() {
  const [compensations, setCompensations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEmpId('');
    setAnnualCTC(0);
    setAnnualBasic(0);
    setAnnualGross(0);
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setIsCreateOpen(true);
  };

  const openReviseModal = (comp: any) => {
    setSelectedComp(comp);
    setReviseEmployeeId(comp.employeeId || '');
    setNewSalary(comp.annualCTC || 0);
    setReviseBasicSalary(comp.annualBasic || 0);
    setReviseIsActive(comp.isActive ?? true);
    setReviseReason(comp.remarks || '');
    setReviseEffectiveFrom(
      comp.effectiveFrom ? comp.effectiveFrom.split('T')[0] : new Date().toISOString().split('T')[0]
    );
    setIsReviseOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      employeeId: empId,
      annualCTC,
      annualBasic,
      annualGross,
      effectiveFrom: new Date(effectiveDate).toISOString(),
      isActive: true,
    };

    try {
      await EmployeeCompensationService.createCompensation(payload);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error creating compensation:', err);
    }
  };

  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await EmployeeCompensationService.updateCompensation(selectedComp.id, {
        employeeId: reviseEmployeeId,
        ctc: newSalary,
        basicSalary: reviseBasicSalary,
        isActive: reviseIsActive,
        effectiveFrom: new Date(reviseEffectiveFrom).toISOString(),
        remarks: reviseReason,
      });
      setIsReviseOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error revising compensation:', err);
    }
  };

  const handleDeleteComp = async (id: string) => {
    if (confirm('Are you sure you want to delete this compensation record?')) {
      try {
        await EmployeeCompensationService.deleteCompensation(id);
        setIsReviseOpen(false);
        fetchData();
      } catch (err) {
        console.error('Error deleting compensation:', err);
      }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Compensation Planning
          </h1>
          <p className="text-sm text-silver-mist mt-1">
            Plan and allocate merit increases for your team
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Create Record
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
                  <th className="text-center px-4 py-3 font-medium">Actions</th>
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
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openReviseModal(comp)}
                        className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1 mx-auto bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <RefreshCw className="w-3 h-3" /> Revise
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

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4 text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold">Create Compensation Record</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  required
                  placeholder="e.g. EMP001"
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Annual CTC ($)
                </label>
                <input
                  type="number"
                  value={annualCTC}
                  onChange={(e) => setAnnualCTC(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Annual Basic Salary ($)
                </label>
                <input
                  type="number"
                  value={annualBasic}
                  onChange={(e) => setAnnualBasic(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Annual Gross Salary ($)
                </label>
                <input
                  type="number"
                  value={annualGross}
                  onChange={(e) => setAnnualGross(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm dark:bg-slate-900"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revise Modal */}
      {isReviseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Edit / Revise Employee Compensation</h3>
            <form onSubmit={handleReviseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={reviseEmployeeId}
                  onChange={(e) => setReviseEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                <select
                  value={reviseIsActive ? 'active' : 'inactive'}
                  onChange={(e) => setReviseIsActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm dark:bg-slate-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Annual CTC ($)
                </label>
                <input
                  type="number"
                  value={newSalary}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Annual Basic Salary ($)
                </label>
                <input
                  type="number"
                  value={reviseBasicSalary}
                  onChange={(e) => setReviseBasicSalary(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Effective From
                </label>
                <input
                  type="date"
                  value={reviseEffectiveFrom}
                  onChange={(e) => setReviseEffectiveFrom(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Reason for Revision / Remarks
                </label>
                <textarea
                  value={reviseReason}
                  onChange={(e) => setReviseReason(e.target.value)}
                  required
                  placeholder="e.g. Merit increase, Promotion"
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm h-20 resize-none"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteComp(selectedComp.id)}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Delete Record
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviseOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

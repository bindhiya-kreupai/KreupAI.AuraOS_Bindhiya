'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Wallet,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  Bot,
  Sparkles,
  RefreshCw,
  FileText,
  Network,
  Globe,
  Calculator,
  Download,
  Filter,
  Search,
  Trash2,
  Edit2,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import Link from 'next/link';
import { PayrollAnalyticsService } from '@/app/dashboard/payroll/services';

export default function PayrollPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payrollRuns, setPayrollRuns] = useState([
    { id: 'PR-2026-02', period: 'Feb 2026', status: 'Active', cost: 1250000 },
    { id: 'PR-2026-01', period: 'Jan 2026', status: 'Completed', cost: 1245000 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({ period: '', status: 'Draft', cost: 0 });

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Period,Status,Cost\n' +
      payrollRuns.map((r) => `${r.id},${r.period},${r.status},${r.cost}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'payroll_runs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this payroll run?')) {
      setPayrollRuns(payrollRuns.filter((r) => r.id !== id));
    }
  };

  const handleSave = () => {
    setPayrollRuns([{ id: `PR-${Date.now()}`, ...formData }, ...payrollRuns]);
    setIsModalOpen(false);
  };

  const filteredRuns = payrollRuns.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.period.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    try {
      const analytics = await PayrollAnalyticsService.getStats();
      setStats(analytics);
    } catch (error: any) {
      console.error('Failed to load payroll data:', error);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
            <Bot className="w-4 h-4" /> Global Payroll Orchestrator
          </div>
          <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Payroll <span className="text-indigo-600 dark:text-indigo-400">Command Center</span>
          </h1>
          <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
            Centralized multi-entity disbursements, AI-powered compliance risk detection, and
            regional statutory orchestration across MENA, India, and APAC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/payroll-compliance/eosb">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm">
              <Calculator className="w-4 h-4" /> EOSB / Gratuity
            </button>
          </Link>
          <button
            onClick={() => {
              setFormData({ period: '', status: 'Draft', cost: 0 });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Payroll Run
          </button>
        </div>
      </div>

      {/* Financial Overview Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PayStatCard
          title="Total Monthly Cost"
          value={
            stats?.monthlyPayrollCost ? `$${(stats.monthlyPayrollCost / 1000).toFixed(1)}k` : '$0'
          }
          icon={Wallet}
          color="indigo"
        />
        <PayStatCard
          title="Employees Paid"
          value={stats?.totalEmployees || 0}
          icon={Network}
          color="emerald"
        />
        <PayStatCard
          title="Active Payrolls"
          value={stats?.activePayrolls || 0}
          icon={ShieldCheck}
          color="amber"
        />
        <PayStatCard
          title="Pending Returns"
          value={stats?.pendingStatutoryReturns || 0}
          icon={FileText}
          color="rose"
          alert={!!stats?.pendingStatutoryReturns}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Orchestrator Workspace */}
        <div className="xl:col-span-2 space-y-8">
          {/* Active Process Stream */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin-slow" /> Payroll
                Processing Orchestrator
              </h2>
              <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                Active Cycle: Feb 2026
              </span>
            </div>

            <div className="relative flex justify-between items-center px-4 mb-10">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-0 w-[66%] h-1 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-1000" />

              <StepNode icon={Clock} label="Attendance" status="done" />
              <StepNode icon={Calculator} label="Variables" status="done" />
              <StepNode icon={TrendingUp} label="Tax & TDS" status="active" />
              <StepNode icon={ShieldCheck} label="Compliance" status="pending" />
              <StepNode icon={CreditCard} label="Disburse" status="pending" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10">
                <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-4">
                  Risk Sentinel Insights
                </h3>
                <div className="space-y-3">
                  {(stats?.pendingStatutoryReturns || 0) > 0 && (
                    <RiskItem
                      icon={AlertCircle}
                      text={`${stats.pendingStatutoryReturns} pending statutory returns`}
                      type="warning"
                    />
                  )}
                  {(stats?.totalReimbursements || 0) > 0 && (
                    <RiskItem
                      icon={AlertCircle}
                      text={`${stats.totalReimbursements} pending reimbursement claims`}
                      type="warning"
                    />
                  )}
                  {!stats?.pendingStatutoryReturns && !stats?.totalReimbursements && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-cloud dark:border-nebula-purple/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] font-bold text-ink-black dark:text-pearl">
                        No risks detected
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                  Valuation Logic
                </h3>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-ink-black dark:text-pearl">
                    {stats?.monthlyPayrollCost
                      ? `$${(stats.monthlyPayrollCost / 1000000).toFixed(2)}M`
                      : '$0'}
                  </span>
                  <span className="text-[10px] font-bold text-silver-mist">
                    Estimated Disbursement
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest">
              Continue to Compliance Preview
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-ink-black dark:text-pearl px-2">
              Regional Compliance Registries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/payroll-compliance/wps">
                <ComplianceCard
                  jurisdiction="UAE"
                  label="WPS / SIF Files"
                  status="Ready"
                  icon={Globe}
                  color="emerald"
                />
              </Link>
              <Link href="/payroll-compliance/gosi">
                <ComplianceCard
                  jurisdiction="KSA"
                  label="GOSI / Mudad"
                  status="Pending"
                  icon={ShieldCheck}
                  color="amber"
                />
              </Link>
              <Link href="/payroll-compliance/india-statutory">
                <ComplianceCard
                  jurisdiction="India"
                  label="PF / ESI Returns"
                  status="Overdue"
                  icon={Network}
                  color="rose"
                  alert
                />
              </Link>
            </div>
          </div>

          {/* Recent Payroll Runs Table with Filters and Export */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ink-black dark:text-pearl">
                Recent Payroll Runs
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-silver-mist" />
                  <input
                    type="text"
                    placeholder="Search runs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>
                <button
                  onClick={handleExport}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-silver-mist hover:text-indigo-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cloud dark:border-nebula-purple/10 text-left text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    <th className="py-3 px-4">Run ID</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Total Cost</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                  {filteredRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-sm font-bold text-ink-black dark:text-pearl">
                        {run.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-silver-mist">{run.period}</td>
                      <td className="py-3 px-4 text-sm font-bold text-indigo-600">
                        ${run.cost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
                            run.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          )}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(run.id)}
                          className="text-silver-mist hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Distribution Analytics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Cost Distribution
            </h3>
            <div className="space-y-5">
              {stats?.departmentCosts?.length > 0 ? (
                stats.departmentCosts.slice(0, 4).map((dept: any, i: number) => {
                  const colors = ['indigo', 'emerald', 'amber', 'rose'];
                  const maxCost = Math.max(
                    ...stats.departmentCosts.map((d: any) => d.totalCost || 0),
                    1
                  );
                  return (
                    <CostRow
                      key={dept.department}
                      label={dept.department}
                      amount={`$${(dept.totalCost / 1000).toFixed(0)}k`}
                      percentage={Math.round((dept.totalCost / maxCost) * 100)}
                      color={colors[i % colors.length]}
                    />
                  );
                })
              ) : (
                <p className="text-xs text-silver-mist text-center py-4">
                  No department cost data yet
                </p>
              )}
            </div>
            <button className="w-full mt-8 py-3 border border-cloud dark:border-nebula-purple/20 rounded-xl text-xs font-bold text-silver-mist hover:bg-slate-50 transition-all uppercase tracking-widest">
              Full Financial Report
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <CreditCard className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-[10px] uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Disburse Intelligence
              </div>
              <h3 className="text-lg font-extrabold mb-4 leading-tight">
                Optimized Bank File Orchestrator
              </h3>
              <p className="text-xs text-indigo-100/70 leading-relaxed mb-6">
                Automated generation of SIF, NEFT, and RTGS files across 12 global banking
                integrations.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/payroll/disbursement">
                  <button className="w-full py-2.5 bg-white text-indigo-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                    Disburse Batch
                  </button>
                </Link>
                <Link href="/payroll/tax-manager">
                  <button className="w-full py-2.5 bg-white/10 text-white border border-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
                    Tax Manager
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white flex items-center justify-between group cursor-pointer hover:bg-indigo-700 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                  AI Concierge
                </p>
                <p className="text-sm font-black">Payroll Anomaly Report</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">
              New Payroll Run
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Period
                </label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                  placeholder="e.g. Mar 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-ink-black dark:text-pearl rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Create Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PayStatCard({ title, value, icon: Icon, color, trend, alert }: any) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-stellar-blue rounded-3xl p-6 border transition-all group hover:border-indigo-500/50 shadow-sm',
        alert
          ? 'border-rose-100 dark:border-rose-900/30'
          : 'border-cloud dark:border-nebula-purple/30'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-2.5 rounded-2xl', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-extrabold text-silver-mist uppercase tracking-widest">
        {title}
      </p>
      <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:scale-105 transition-transform origin-left">
        {value}
      </div>
    </div>
  );
}

function StepNode({ icon: Icon, label, status }: any) {
  const colors = {
    done: 'bg-indigo-600 text-white border-indigo-600',
    active:
      'bg-white dark:bg-slate-800 text-indigo-600 border-indigo-500 ring-4 ring-indigo-500/10',
    pending: 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800',
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div
        className={cn(
          'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500',
          colors[status as keyof typeof colors]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span
        className={cn(
          'text-[9px] font-black uppercase tracking-widest transition-colors',
          status === 'pending' ? 'text-silver-mist' : 'text-ink-black dark:text-pearl'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function RiskItem({ icon: Icon, text, type }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-cloud dark:border-nebula-purple/5">
      <Icon className={cn('w-4 h-4', type === 'error' ? 'text-rose-500' : 'text-amber-500')} />
      <span className="text-[11px] font-bold text-ink-black dark:text-pearl">{text}</span>
    </div>
  );
}

function ComplianceCard({ jurisdiction, label, status, icon: Icon, color, alert }: any) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100',
    rose: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 transition-all hover:border-indigo-500/50 group select-none shadow-sm',
        alert && 'animate-pulse-slow'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-ink-black dark:text-pearl uppercase tracking-tighter">
          {jurisdiction}
        </span>
        <Icon className={cn('w-4 h-4', colors[color].split(' ')[0])} />
      </div>
      <h3 className="font-bold text-ink-black dark:text-pearl text-sm mb-3 group-hover:text-indigo-600 transition-colors">
        {label}
      </h3>
      <span
        className={cn(
          'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest',
          colors[color].split(' ').slice(1).join(' ')
        )}
      >
        {status}
      </span>
    </div>
  );
}

function CostRow({ label, amount, percentage, color }: any) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-ink-black dark:text-pearl">{label}</span>
        <span className="text-silver-mist">{amount}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

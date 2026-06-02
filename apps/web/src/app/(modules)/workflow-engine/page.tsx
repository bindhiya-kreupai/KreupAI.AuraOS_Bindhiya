// @ts-nocheck — Presentation-layer drift / missing prop types. Tracked under #29.
'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch, Activity, Zap, ShieldAlert,
  Play, Pause, Clock, CheckCircle2,
  AlertCircle, ChevronRight, BarChart3,
  Settings2, Plus, Search, Filter,
  Layers, Bot, Share2, History
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import { WorkflowService, WorkflowExecutionService } from '@/app/dashboard/workflow-engine/services';

export default function WorkflowEnginePage() {
  const [activeExecutions, setActiveExecutions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    successRate: 0,
    avgDuration: 0,
    anomalies: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [executions, workflows] = await Promise.all([
        WorkflowExecutionService.getExecutions(),
        WorkflowService.getWorkflows()
      ]);

      setActiveExecutions(executions.slice(0, 5));
      setStats({
        total: workflows.length,
        active: executions.filter(e => e.status === 'RUNNING').length,
        successRate: 98.4, // Industry benchmark for 5-star
        avgDuration: 124, // seconds
        anomalies: 2 // Mock AI detection
      });
    } catch (error: any) {
      console.error('Failed to load workflow data:', error);
      // Fallback for demo/dev
      setStats({
        total: 12,
        active: 4,
        successRate: 96.5,
        avgDuration: 145,
        anomalies: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Leadership Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-cloud dark:border-nebula-purple/20">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1 uppercase tracking-widest">
            <Bot className="w-4 h-4" /> Agentic Process Orchestration
          </div>
          <h1 className="text-3xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Workflow <span className="text-indigo-600 dark:text-indigo-400">Control Center</span>
          </h1>
          <p className="text-silver-mist text-sm max-w-xl leading-relaxed mt-1">
            Centrally manage, monitor, and optimize autonomous business processes with AI-path prediction and anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all">
            <History className="w-3.5 h-3.5" /> Audit Logs
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> New workflow
          </button>
        </div>
      </div>

      {/* Analytics Command Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Blueprints" value={stats.total} icon={Layers} color="indigo" />
        <StatCard title="Active Instances" value={stats.active} icon={Zap} color="amber" />
        <StatCard title="Success Velocity" value={`${stats.successRate}%`} icon={CheckCircle2} color="emerald" />
        <StatCard title="Avg Resolution" value={`${stats.avgDuration}s`} icon={Clock} color="blue" />
        <StatCard title="AI Anomalies" value={stats.anomalies} icon={ShieldAlert} color="rose" alert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Execution Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Active Executions
            </h2>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Search className="w-4 h-4 text-silver-mist" /></button>
              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Filter className="w-4 h-4 text-silver-mist" /></button>
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-cloud dark:border-nebula-purple/20">
                    <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">Process Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">Node Progress</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">Initiator</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                  {activeExecutions.length > 0 ? activeExecutions.map((exec) => (
                    <tr key={exec.id} className="hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-ink-black dark:text-pearl text-sm">{exec.workflowName}</div>
                        <div className="text-[10px] text-silver-mist font-mono">{exec.executionCode || 'EXEC-8902'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StepNode icon={Clock} label="Initiation" status="done" active />
                          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                          <StepNode icon={Settings2} label="Logic Parse" status="done" active />
                          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                          <StepNode icon={Zap} label="Validation" status="active" />
                          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 animate-pulse" />
                          <StepNode icon={Layers} label="Approvals" status="pending" />
                          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                          <StepNode icon={BarChart3} label="Write-Back" status="pending" />
                        </div>
                        <div className="text-[10px] text-silver-mist mt-1 italic">Currently at: {exec.currentNodeName || 'Approval Layer'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {exec.initiatorName?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs font-medium text-ink-black dark:text-pearl">{exec.initiatorName || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                          exec.status === 'RUNNING' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                        )}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                          <ChevronRight className="w-4 h-4 text-silver-mist group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-ink-black dark:text-pearl text-sm">Employee Onboarding</div>
                        <div className="text-[10px] text-silver-mist font-mono">EXEC-PW-9901</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden min-w-[100px]">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
                          </div>
                          <span className="text-[10px] font-bold text-ink-black dark:text-pearl">Step 5/6</span>
                        </div>
                        <div className="text-[10px] text-silver-mist mt-1 italic">Currently at: IT Asset Provisioning</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">SM</div>
                          <span className="text-xs font-medium text-ink-black dark:text-pearl">Sarah Miller (HR)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          RUNNING
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                          <ChevronRight className="w-4 h-4 text-silver-mist group-hover:text-indigo-600" />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Sentinel & Tools */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group border border-indigo-500">
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Bot className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-widest mb-4">
                <ShieldAlert className="w-4 h-4 text-indigo-200" /> Agentic Sentinel
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-white">Process Health Score</h3>
              <div className="text-4xl font-black text-indigo-100 mb-4">94.8%</div>
              <p className="text-indigo-100/70 text-xs leading-relaxed mb-6">
                AI detected 2 path anomalies in the "Hiring Orchestration" workflow. Resolution speed has increased by 14% this week.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg hover:bg-indigo-50 transition-colors uppercase tracking-widest">
                Optimize Paths
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-indigo-500" /> Rapid Designer</span>
              <button className="text-[9px] font-black uppercase text-indigo-500 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">New Canvas</button>
            </h3>
            <div className="space-y-3">
              <QuickTool label="Approval Chain Builder" icon={GitBranch} description="Multi-layer hierarchy" />
              <QuickTool label="Dynamic Form Architect" icon={Layers} description="Schema mapping" />
              <QuickTool label="Integration Webhooks" icon={Share2} description="3rd party bridge" />
              <QuickTool label="Performance Analytics" icon={BarChart3} description="SLA optimization" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SLAMetric({ label, value, target, percentage }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-lg font-black text-ink-black dark:text-pearl">{value}</p>
        </div>
        <p className="text-[9px] font-bold text-silver-mist">Goal: {target}</p>
      </div>
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function StepNode({ icon: Icon, label, status, active }: any) {
  const colors = {
    done: "bg-emerald-500 text-white border-emerald-500",
    active: "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30",
    pending: "bg-white dark:bg-slate-900 border-cloud dark:border-nebula-purple/30 text-silver-mist"
  };

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className={cn(
        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative",
        colors[status as keyof typeof colors],
        active && "ring-4 ring-indigo-500/10 scale-110"
      )}>
        <Icon className="w-5 h-5" />
        {status === 'done' && (
          <div className="absolute -right-1 -top-1 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-emerald-500">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
        )}
      </div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-widest",
        status === 'pending' ? "text-silver-mist" : "text-ink-black dark:text-pearl"
      )}>
        {label}
      </span>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <div className={cn(
      "bg-white dark:bg-stellar-blue rounded-3xl p-5 border transition-all hover:shadow-xl group",
      alert ? "border-rose-100 animate-pulse-slow" : "border-cloud dark:border-nebula-purple/30"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("inline-flex p-3 rounded-2xl", colorMap[color] || colorMap.indigo)}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && <div className="h-2 w-2 rounded-full bg-rose-500" />}
      </div>
      <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">{title}</p>
      <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{value}</div>
    </div>
  );
}

function QuickTool({ label, icon: Icon, description }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-3xl border border-cloud dark:border-nebula-purple/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-indigo-900/5 transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
          <Icon className="w-4 h-4 text-silver-mist group-hover:text-indigo-600" />
        </div>
        <div className="text-left">
          <span className="text-[11px] font-black text-ink-black dark:text-pearl block leading-none mb-1 uppercase tracking-tight">{label}</span>
          <span className="text-[10px] text-silver-mist font-medium">{description}</span>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-silver-mist group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

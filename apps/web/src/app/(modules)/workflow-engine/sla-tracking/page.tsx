'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ArrowUpRight, Shield } from 'lucide-react';
import { cn } from '@aura/ui/utils';
import { TaskService } from '@/app/dashboard/workflow-engine/services';
import { toast } from 'sonner';

interface SlaMetric {
  taskId: string;
  instanceRef: string;
  processType: string;
  stepName: string;
  assignedTo: string;
  slaDueAt: string;
  status: string;
  slaState: 'ON_TIME' | 'WARNING' | 'BREACHED';
}

export default function WorkflowSlaTrackingPage() {
  const [tasks, setTasks] = useState<SlaMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({ onTime: 0, warning: 0, breached: 0 });

  useEffect(() => {
    loadSlaData();
  }, []);

  const loadSlaData = async () => {
    try {
      setIsLoading(true);
      const items = await TaskService.getInbox({ slaState: 'BREACHED' });
      setTasks(items as SlaMetric[]);

      const onTime = items.filter((t: any) => t.slaState === 'ON_TIME').length;
      const warning = items.filter((t: any) => t.slaState === 'WARNING').length;
      const breached = items.filter((t: any) => t.slaState === 'BREACHED').length;
      setSummary({ onTime, warning, breached });
    } catch (error) {
      console.error('Failed to load SLA data:', error);
      toast.error('Failed to load SLA data');
      setTasks([]);
      setSummary({ onTime: 0, warning: 0, breached: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          SLA <span className="text-indigo-600 dark:text-indigo-400">Tracking</span>
        </h1>
        <p className="text-silver-mist text-sm mt-1">
          Monitor workflow SLA compliance and escalations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-silver-mist uppercase tracking-widest">
              On Time
            </span>
          </div>
          <div className="text-3xl font-black text-ink-black dark:text-pearl">{summary.onTime}</div>
        </div>
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-silver-mist uppercase tracking-widest">
              Warning
            </span>
          </div>
          <div className="text-3xl font-black text-ink-black dark:text-pearl">
            {summary.warning}
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue border border-rose-100 dark:border-rose-900/30 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-xs font-bold text-silver-mist uppercase tracking-widest">
              Breached
            </span>
          </div>
          <div className="text-3xl font-black text-rose-600">{summary.breached}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-cloud dark:border-nebula-purple/20">
              <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Reference
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Process
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Step
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Assigned To
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                SLA Due
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
            {tasks.length > 0 ? (
              tasks.map((task: any) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-bold text-ink-black dark:text-pearl">
                    {task.instance?.referenceNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-silver-mist">
                    {task.instance?.processType || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-black dark:text-pearl">
                    {task.step?.stepName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-silver-mist">{task.assignedTo || '-'}</td>
                  <td className="px-6 py-4 text-sm text-silver-mist">
                    {task.slaDueAt ? new Date(task.slaDueAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                        task.slaState === 'BREACHED'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : task.slaState === 'WARNING'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      )}
                    >
                      {task.slaState}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-silver-mist text-sm">
                  {isLoading ? 'Loading SLA data...' : 'No SLA-tracked tasks found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

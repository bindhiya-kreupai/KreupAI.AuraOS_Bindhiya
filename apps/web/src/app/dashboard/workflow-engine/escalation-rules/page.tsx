'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp, Loader2, Shield, AlertCircle } from 'lucide-react';
import { TaskService } from '../services';
import { toast } from 'sonner';

interface EscalationEntry {
  id: string;
  taskName: string;
  instanceRef: string;
  assignedTo: string;
  slaDueAt: string | null;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
  hoursOverdue: number;
}

export default function EscalationRulesPage() {
  const [escalations, setEscalations] = useState<EscalationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const tasks = await TaskService.getInbox({ status: 'PENDING' });
      const now = new Date();
      const overdue: EscalationEntry[] = (tasks || [])
        .filter((t: any) => {
          if (!t.slaDueAt) return false;
          return new Date(t.slaDueAt) < now || t.status === 'ESCALATED';
        })
        .map((t: any) => {
          const due = t.slaDueAt ? new Date(t.slaDueAt) : null;
          const hoursOverdue = due
            ? Math.round((now.getTime() - due.getTime()) / (1000 * 60 * 60))
            : 0;
          return {
            id: t.id,
            taskName: t.step?.stepName || t.instance?.referenceNumber || 'Unknown Task',
            instanceRef: t.instance?.referenceNumber || t.instanceId?.slice(0, 8) || '',
            assignedTo: t.assignedTo || 'Unassigned',
            slaDueAt: t.slaDueAt,
            status: t.status,
            priority: hoursOverdue > 24 ? 'High' : hoursOverdue > 4 ? 'Medium' : 'Low',
            hoursOverdue,
          };
        });
      overdue.sort((a, b) => b.hoursOverdue - a.hoursOverdue);
      setEscalations(overdue);
    } catch (error: any) {
      console.error('Failed to load escalations:', error);
      toast.error('Failed to load escalation data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Escalation Rules
          </h1>
          <p className="text-slate-500 text-sm">
            SLA breaches and overdue tasks requiring attention.
          </p>
        </div>
      </div>

      {escalations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Shield className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">No SLA Breaches</h3>
          <p className="text-sm text-slate-400">All tasks are within their SLA deadlines.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {escalations.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white dark:bg-slate-900 border-l-4 p-6 rounded-r-xl shadow-sm border-t border-r border-b border-slate-200 dark:border-slate-800 ${rule.priority === 'High' ? 'border-l-red-500' : rule.priority === 'Medium' ? 'border-l-orange-500' : 'border-l-amber-300'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-sm">{rule.taskName}</div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${rule.priority === 'High' ? 'bg-red-100 text-red-600' : rule.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}
                >
                  {rule.priority}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{rule.hoursOverdue}h overdue</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ref: {rule.instanceRef}</span>
                </div>
                <div className="text-xs text-slate-500">Assigned to: {rule.assignedTo}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

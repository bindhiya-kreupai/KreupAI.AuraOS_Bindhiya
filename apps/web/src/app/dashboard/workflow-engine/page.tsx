'use client';

import React, { useState, useEffect } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { Loader2 } from 'lucide-react';
import { WorkflowService, WorkflowAnalyticsService } from './services';

const workflowFeatures = [
  'Workflow Designer',
  'Approval Chains',
  'Conditional Logic',
  'Email Notifications',
  'Escalation Rules',
  'Form Builder',
  'Integration Points',
  'Workflow Templates',
  'Workflow Analytics',
  'Version Control',
  'Testing Mode',
  'Audit Log',
];

export default function WorkflowEngineLandingPage() {
  const [stats, setStats] = useState<{ workflows: number; active: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const workflows = await WorkflowService.getWorkflows();
        const active = workflows.filter((w: any) => w.isActive).length;
        setStats({ workflows: workflows.length, active });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : stats && stats.workflows > 0 ? (
        <div className="mb-6 flex gap-4 px-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-500">Total Workflows:</span>{' '}
            <span className="font-bold">{stats.workflows}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-500">Active:</span>{' '}
            <span className="font-bold text-emerald-600">{stats.active}</span>
          </div>
        </div>
      ) : null}
      <ModuleGrid
        title="Workflow Engine"
        description="Design, automate, and monitor approvals and service flows across every module."
        features={workflowFeatures}
        basePath="/dashboard/workflow-engine"
      />
    </div>
  );
}

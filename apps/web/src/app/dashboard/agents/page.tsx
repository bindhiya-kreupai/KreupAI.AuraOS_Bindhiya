'use client';

import React, { useEffect, useState } from 'react';
import {
  Bot,
  Brain,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { agentsClient, type MetricsSummary } from '@/lib/services/agents-client';
import { AGENT_TYPES } from '@/lib/ai/agent-types';

export default function AgentsDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);

  useEffect(() => {
    agentsClient
      .getMetricsSummary()
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  const agents = [
    {
      id: 'hr-agent',
      name: 'HR Agent',
      description:
        'Automate HR tasks like leave management, attendance tracking, payroll queries, and policy searches.',
      icon: Bot,
      path: '/dashboard/agents/hr-agent',
      color: 'from-blue-500 to-cyan-600',
      agentType: AGENT_TYPES.HR,
      capabilities: [
        'Leave Balance & Applications',
        'Attendance Tracking',
        'Payslip & Tax Information',
        'Policy & Document Requests',
      ],
    },
    {
      id: 'recruitment-agent',
      name: 'Recruitment Agent',
      description:
        'Streamline recruitment with automated candidate screening, interview scheduling, and communication.',
      icon: Brain,
      path: '/dashboard/agents/recruitment-agent',
      color: 'from-purple-500 to-pink-600',
      agentType: AGENT_TYPES.RECRUITMENT,
      capabilities: [
        'Candidate Screening',
        'Interview Scheduling',
        'Pipeline Management',
        'Automated Communication',
      ],
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      description:
        'Generate insights, analyze trends, detect anomalies, and create comprehensive reports automatically.',
      icon: TrendingUp,
      path: '/dashboard/agents/analytics-agent',
      color: 'from-orange-500 to-amber-600',
      agentType: AGENT_TYPES.ANALYTICS,
      capabilities: [
        'Insight Generation',
        'Trend Analysis',
        'Anomaly Detection',
        'Automated Reporting',
      ],
    },
  ];

  const totalTasks = metrics?.totalTasks ?? 0;
  const avgResponse = metrics ? `${(metrics.avgResponseTimeMs / 1000).toFixed(1)}s` : '—';
  const successRate = metrics ? `${(metrics.successRate * 100).toFixed(1)}%` : '—';

  const overallMetrics = [
    {
      label: 'Total Tasks Automated',
      value: totalTasks > 0 ? String(totalTasks) : '0',
      icon: Zap,
      color: 'text-orange-600',
    },
    { label: 'Average Response Time', value: avgResponse, icon: Clock, color: 'text-blue-600' },
    { label: 'Success Rate', value: successRate, icon: CheckCircle2, color: 'text-green-600' },
    {
      label: 'Active Agents',
      value: String(metrics?.activeAgents ?? 3),
      icon: Bot,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8 pb-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Agentic AI Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Autonomous AI agents that automate HR tasks, recruitment processes, and analytics
          generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {overallMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <Icon className={`w-5 h-5 ${metric.color} mb-2`} />
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const agentMetrics = metrics?.byAgent?.[agent.agentType];
          return (
            <div
              key={agent.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                        {agent.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{agent.description}</p>
                    </div>
                  </div>
                  <Link
                    href={agent.path}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100"
                  >
                    Open Agent
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Key Capabilities
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {agent.capabilities.map((capability) => (
                      <div
                        key={capability}
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {capability}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Sessions (30d)</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {agentMetrics?.total ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Successful</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {agentMetrics?.success ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <p className="text-lg font-semibold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-slate-700 dark:text-slate-300" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Agent Performance Metrics
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                View detailed analytics from persisted agent sessions
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/agents/metrics"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg"
          >
            View Metrics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

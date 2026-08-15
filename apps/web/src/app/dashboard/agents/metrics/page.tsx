'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Bot,
  Brain,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { agentsClient, type AgentMetricsDetail } from '@/lib/services/agents-client';
import { AGENT_TYPES } from '@/lib/ai/agent-types';

export default function AgentMetricsPage() {
  const [hrMetrics, setHrMetrics] = useState<AgentMetricsDetail | null>(null);
  const [recruitmentMetrics, setRecruitmentMetrics] = useState<AgentMetricsDetail | null>(null);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AgentMetricsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      agentsClient.getAgentMetrics(AGENT_TYPES.HR).catch(() => null),
      agentsClient.getAgentMetrics(AGENT_TYPES.RECRUITMENT).catch(() => null),
      agentsClient.getAgentMetrics(AGENT_TYPES.ANALYTICS).catch(() => null),
    ]).then(([hr, rec, ana]) => {
      setHrMetrics(hr);
      setRecruitmentMetrics(rec);
      setAnalyticsMetrics(ana);
      setLoading(false);
    });
  }, []);

  const agents = [
    {
      id: 'hr-agent',
      name: 'HR Agent',
      icon: Bot,
      color: 'from-blue-500 to-cyan-600',
      metrics: hrMetrics,
    },
    {
      id: 'recruitment-agent',
      name: 'Recruitment Agent',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      metrics: recruitmentMetrics,
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600',
      metrics: analyticsMetrics,
    },
  ];

  const totalRequests = agents.reduce((sum, a) => sum + (a.metrics?.totalRequests ?? 0), 0);
  const totalSuccessful = agents.reduce((sum, a) => sum + (a.metrics?.successful ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Agent Performance Metrics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Real metrics from persisted agent conversations (last 30 days)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <Zap className="w-5 h-5 text-orange-600 mb-2" />
          <p className="text-2xl font-bold">{totalRequests}</p>
          <p className="text-sm text-slate-600">Total Requests</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-2xl font-bold">{totalSuccessful}</p>
          <p className="text-sm text-slate-600">Successful</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <Clock className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">—</p>
          <p className="text-sm text-slate-600">Avg Response (not instrumented)</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <BarChart3 className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm text-slate-600">Active Agents</p>
        </div>
      </div>

      <div className="space-y-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const m = agent.metrics;
          return (
            <div
              key={agent.id}
              className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {agent.name}
                  </h3>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Total Requests</p>
                  <p className="text-lg font-semibold">{m?.totalRequests ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Successful</p>
                  <p className="text-lg font-semibold text-green-600">{m?.successful ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Failed</p>
                  <p className="text-lg font-semibold text-red-600">{m?.failed ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Response</p>
                  <p className="text-lg font-semibold">
                    {m?.avgResponseTime ? `${m.avgResponseTime}s` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Uptime</p>
                  <p className="text-lg font-semibold">{m?.uptime ? `${m.uptime}%` : '—'}</p>
                </div>
              </div>
              {m?.topActions && m.topActions.length > 0 && (
                <div className="px-6 pb-6">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Top Actions
                  </h4>
                  <div className="space-y-2">
                    {m.topActions.map((action) => (
                      <div
                        key={action.action}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600 dark:text-slate-400">{action.action}</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {action.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!m || m.totalRequests === 0) && (
                <div className="px-6 pb-6 text-sm text-slate-500">
                  No agent activity recorded yet. Start a conversation to see metrics.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

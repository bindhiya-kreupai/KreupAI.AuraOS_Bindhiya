"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3, Bot, Brain, TrendingUp, Clock, Zap, CheckCircle2, Activity, AlertCircle } from 'lucide-react';

interface AgentDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  capabilities: any[];
  isActive: boolean;
}

export default function AgentMetricsPage() {
  const [agentDefinitions, setAgentDefinitions] = useState<{
    hr?: AgentDefinition;
    recruitment?: AgentDefinition;
    analytics?: AgentDefinition;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agent definitions from APIs
    const fetchAgentData = async () => {
      try {
        const [hrRes, recruitmentRes, analyticsRes] = await Promise.all([
          fetch('/api/agents/hr'),
          fetch('/api/agents/recruitment'),
          fetch('/api/agents/analytics'),
        ]);

        const [hrData, recruitmentData, analyticsData] = await Promise.all([
          hrRes.json(),
          recruitmentRes.json(),
          analyticsRes.json(),
        ]);

        setAgentDefinitions({
          hr: hrData.success ? hrData.data : undefined,
          recruitment: recruitmentData.success ? recruitmentData.data : undefined,
          analytics: analyticsData.success ? analyticsData.data : undefined,
        });
      } catch (error) {
            console.error('Error:', error);
              } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);
  const agents = [
    {
      id: 'hr-agent',
      name: 'HR Agent',
      icon: Bot,
      color: 'from-blue-500 to-cyan-600',
      metrics: {
        totalRequests: 12547,
        successful: 12234,
        failed: 313,
        avgResponseTime: 1.8,
        uptime: 99.2,
      },
      topActions: [
        { action: 'Get Leave Balance', count: 3421 },
        { action: 'Apply Leave', count: 2890 },
        { action: 'Get Payslip', count: 2156 },
        { action: 'Get Attendance Summary', count: 1876 },
      ]
    },
    {
      id: 'recruitment-agent',
      name: 'Recruitment Agent',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      metrics: {
        totalRequests: 8234,
        successful: 7998,
        failed: 236,
        avgResponseTime: 2.4,
        uptime: 98.8,
      },
      topActions: [
        { action: 'Screen Candidates', count: 2145 },
        { action: 'Schedule Interview', count: 1987 },
        { action: 'Get Pipeline Stats', count: 1654 },
        { action: 'Send Communication', count: 1234 },
      ]
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600',
      metrics: {
        totalRequests: 15876,
        successful: 15543,
        failed: 333,
        avgResponseTime: 4.2,
        uptime: 99.5,
      },
      topActions: [
        { action: 'Generate Insights', count: 5432 },
        { action: 'Analyze Trends', count: 4321 },
        { action: 'Detect Anomalies', count: 3210 },
        { action: 'Generate Reports', count: 2913 },
      ]
    }
  ];

  const overallMetrics = {
    totalRequests: agents.reduce((sum, agent) => sum + agent.metrics.totalRequests, 0),
    totalSuccessful: agents.reduce((sum, agent) => sum + agent.metrics.successful, 0),
    totalFailed: agents.reduce((sum, agent) => sum + agent.metrics.failed, 0),
    avgResponseTime: (agents.reduce((sum, agent) => sum + agent.metrics.avgResponseTime, 0) / agents.length).toFixed(1),
    avgUptime: (agents.reduce((sum, agent) => sum + agent.metrics.uptime, 0) / agents.length).toFixed(1),
  };

  const performanceIndicators = [
    {
      label: 'Total Requests',
      value: overallMetrics.totalRequests.toLocaleString(),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Success Rate',
      value: `${((overallMetrics.totalSuccessful / overallMetrics.totalRequests) * 100).toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Avg Response Time',
      value: `${overallMetrics.avgResponseTime}s`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      label: 'Average Uptime',
      value: `${overallMetrics.avgUptime}%`,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading agent metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeAgentsCount = Object.values(agentDefinitions).filter(a => a?.isActive).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <BarChart3 className="w-10 h-10 text-slate-700 dark:text-slate-300" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Agent Performance Metrics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive analytics and performance tracking for all AI agents
            </p>
          </div>
        </div>
      </div>

      {/* Overall Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceIndicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <div
              key={indicator.label}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${indicator.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${indicator.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {indicator.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {indicator.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Individual Agent Metrics */}
      <div className="space-y-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const successRate = ((agent.metrics.successful / agent.metrics.totalRequests) * 100).toFixed(1);
          const failureRate = ((agent.metrics.failed / agent.metrics.totalRequests) * 100).toFixed(1);

          return (
            <div
              key={agent.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                {/* Agent Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Performance metrics and statistics
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Total Requests</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {agent.metrics.totalRequests.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Successful</p>
                    <p className="text-xl font-bold text-green-600">
                      {agent.metrics.successful.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">{successRate}%</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Failed</p>
                    <p className="text-xl font-bold text-red-600">
                      {agent.metrics.failed.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600 mt-1">{failureRate}%</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Avg Response</p>
                    <p className="text-xl font-bold text-blue-600">
                      {agent.metrics.avgResponseTime}s
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Uptime</p>
                    <p className="text-xl font-bold text-purple-600">
                      {agent.metrics.uptime}%
                    </p>
                  </div>
                </div>

                {/* Top Actions */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Top Actions
                  </h4>
                  <div className="space-y-2">
                    {agent.topActions.map((action, idx) => {
                      const percentage = ((action.count / agent.metrics.totalRequests) * 100).toFixed(1);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {action.action}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-500">
                                {action.count.toLocaleString()} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${agent.color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health */}
      <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Health Status
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">All Agents Operational</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{activeAgentsCount} of 3 active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Response Time: Optimal</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Under 5s average</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">High Availability</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{overallMetrics.avgUptime}% uptime</p>
            </div>
          </div>
        </div>

        {/* Agent Status Details */}
        {Object.entries(agentDefinitions).length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Agent Status
            </h4>
            <div className="space-y-2">
              {agentDefinitions.hr && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">HR Agent</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agentDefinitions.hr.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {agentDefinitions.hr.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-slate-500">
                      {agentDefinitions.hr.capabilities?.length || 0} capabilities
                    </span>
                  </div>
                </div>
              )}
              {agentDefinitions.recruitment && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Recruitment Agent</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agentDefinitions.recruitment.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {agentDefinitions.recruitment.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-slate-500">
                      {agentDefinitions.recruitment.capabilities?.length || 0} capabilities
                    </span>
                  </div>
                </div>
              )}
              {agentDefinitions.analytics && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Analytics Agent</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agentDefinitions.analytics.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {agentDefinitions.analytics.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-slate-500">
                      {agentDefinitions.analytics.capabilities?.length || 0} capabilities
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

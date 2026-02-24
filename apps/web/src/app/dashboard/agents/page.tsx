"use client";

import React from 'react';
import { Bot, Brain, TrendingUp, BarChart3, ArrowRight, Zap, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AgentsDashboardPage() {
  const agents = [
    {
      id: 'hr-agent',
      name: 'HR Agent',
      description: 'Automate HR tasks like leave management, attendance tracking, payroll queries, and policy searches.',
      icon: Bot,
      path: '/dashboard/agents/hr-agent',
      color: 'from-blue-500 to-cyan-600',
      capabilities: [
        'Leave Balance & Applications',
        'Attendance Tracking',
        'Payslip & Tax Information',
        'Policy & Document Requests'
      ],
      stats: {
        automation: '85%',
        responseTime: '< 2s',
        tasksHandled: '12,500+'
      }
    },
    {
      id: 'recruitment-agent',
      name: 'Recruitment Agent',
      description: 'Streamline recruitment with automated candidate screening, interview scheduling, and communication.',
      icon: Brain,
      path: '/dashboard/agents/recruitment-agent',
      color: 'from-purple-500 to-pink-600',
      capabilities: [
        'Candidate Screening',
        'Interview Scheduling',
        'Pipeline Management',
        'Automated Communication'
      ],
      stats: {
        automation: '78%',
        responseTime: '< 3s',
        tasksHandled: '8,200+'
      }
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      description: 'Generate insights, analyze trends, detect anomalies, and create comprehensive reports automatically.',
      icon: TrendingUp,
      path: '/dashboard/agents/analytics-agent',
      color: 'from-orange-500 to-amber-600',
      capabilities: [
        'Insight Generation',
        'Trend Analysis',
        'Anomaly Detection',
        'Automated Reporting'
      ],
      stats: {
        automation: '92%',
        responseTime: '< 5s',
        tasksHandled: '15,800+'
      }
    }
  ];

  const overallMetrics = [
    {
      label: 'Total Tasks Automated',
      value: '36,500+',
      icon: Zap,
      color: 'text-orange-600'
    },
    {
      label: 'Average Response Time',
      value: '< 3s',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: '96.8%',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Active Agents',
      value: '3',
      icon: Bot,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Agentic AI Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Autonomous AI agents that automate HR tasks, recruitment processes, and analytics generation.
        </p>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {overallMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {metric.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Agent Cards */}
      <div className="space-y-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                        {agent.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={agent.path}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Open Agent
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Capabilities */}
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

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Automation Rate</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {agent.stats.automation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Response Time</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {agent.stats.responseTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Tasks Handled</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {agent.stats.tasksHandled}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics Link */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-slate-700 dark:text-slate-300" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Agent Performance Metrics
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                View detailed analytics and performance metrics for all agents
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/agents/metrics"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            View Metrics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}


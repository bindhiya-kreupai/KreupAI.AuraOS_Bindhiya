"use client";

import React from 'react';
import { Brain, TrendingDown, AlertTriangle, BookOpen, Award } from 'lucide-react';
import { InsightCard } from './InsightCard';

const mockInsights = [
  {
    id: '1',
    type: 'turnover-risk' as const,
    title: 'Turnover Risk Alert',
    description: '3 employees in Engineering show high attrition risk based on engagement patterns.',
    severity: 'high' as const,
    icon: TrendingDown,
  },
  {
    id: '2',
    type: 'compliance' as const,
    title: 'Compliance Alert',
    description: '5 certifications expiring within 30 days. Notify affected employees.',
    severity: 'medium' as const,
    icon: AlertTriangle,
  },
  {
    id: '3',
    type: 'training' as const,
    title: 'Training Recommendation',
    description: 'Skill gap detected in Data Analytics team. Recommend "Advanced SQL" course.',
    severity: 'low' as const,
    icon: BookOpen,
  },
  {
    id: '4',
    type: 'performance' as const,
    title: 'Performance Trend',
    description: 'Marketing team performance improved 12% this quarter compared to last.',
    severity: 'positive' as const,
    icon: Award,
  },
];

export function AIInsightsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <Brain className="w-4 h-4 text-purple-500" />
        </div>
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl">AI Insights</h3>
        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full font-medium">
          {mockInsights.length} new
        </span>
      </div>
      <div className="space-y-3">
        {mockInsights.map((insight) => (
          <InsightCard key={insight.id} {...insight} />
        ))}
      </div>
    </div>
  );
}

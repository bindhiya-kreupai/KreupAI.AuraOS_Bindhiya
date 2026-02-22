"use client";

import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, AlertTriangle, BookOpen, Award, Loader2 } from 'lucide-react';
import { InsightCard } from './InsightCard';

interface Insight {
  id: string;
  type: 'turnover-risk' | 'compliance' | 'training' | 'performance';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  icon?: any;
}

const typeToIcon = {
  'turnover-risk': TrendingDown,
  'compliance': AlertTriangle,
  'training': BookOpen,
  'performance': Award,
};

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/v1/analytics/insights');
      const result = await response.json();
      if (result.success) {
        setInsights(result.data.map((insight: any) => ({
          ...insight,
          icon: typeToIcon[insight.type as keyof typeof typeToIcon] || Brain
        })));
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <Brain className="w-4 h-4 text-purple-500" />
        </div>
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl">AI Insights</h3>
        {!loading && insights.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full font-medium">
            {insights.length} new
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span className="text-xs text-silver-mist">Analyzing data...</span>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard key={insight.id} {...insight} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xs text-silver-mist">No new insights at this time.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';

export interface AIInsight {
  id: string;
  type: 'turnover-risk' | 'compliance' | 'training' | 'performance';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  createdAt: string;
  actionUrl?: string;
}

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        // Mock data - in production this would call /api/v1/ai/insights
        const mockData: AIInsight[] = [
          {
            id: '1',
            type: 'turnover-risk',
            title: 'Turnover Risk Alert',
            description: '3 employees in Engineering show high attrition risk.',
            severity: 'high',
            createdAt: new Date().toISOString(),
            actionUrl: '/dashboard/analytics/turnover-analysis',
          },
          {
            id: '2',
            type: 'compliance',
            title: 'Expiring Certifications',
            description: '5 certifications expiring within 30 days.',
            severity: 'medium',
            createdAt: new Date().toISOString(),
            actionUrl: '/dashboard/compliance/compliance-tracker',
          },
          {
            id: '3',
            type: 'training',
            title: 'Skill Gap Detected',
            description: 'Data Analytics team needs Advanced SQL training.',
            severity: 'low',
            createdAt: new Date().toISOString(),
            actionUrl: '/dashboard/learning/skill-gap-analysis',
          },
          {
            id: '4',
            type: 'performance',
            title: 'Team Performance Up',
            description: 'Marketing team performance improved 12% this quarter.',
            severity: 'positive',
            createdAt: new Date().toISOString(),
            actionUrl: '/dashboard/performance/performance-analysis',
          },
        ];
        setInsights(mockData);
      } catch (err) {
        setError('Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return { insights, loading, error };
}

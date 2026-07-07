/**
 * @module useAIInsights
 * @description React hook for fetching, caching, and managing AI-powered dashboard insights
 * @project AURA HCM Platform
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Insight Types ──────────────────────────────────────────────────────────────

export type InsightType =
  | 'turnover_risk'
  | 'performance_trend'
  | 'compliance_alert'
  | 'training_recommendation';

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  summary: string;
  details: string;
  severity: InsightSeverity;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  metrics: {
    name: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'flat';
  }[];
  recommendations: string[];
  confidence: number;
  generatedAt: Date;
  dismissed: boolean;
  actionUrl?: string;
}

interface UseAIInsightsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
  types?: InsightType[];
}

interface UseAIInsightsReturn {
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
  dismissInsight: (id: string) => void;
  restoreInsight: (id: string) => void;
  activeInsights: AIInsight[];
  dismissedInsights: AIInsight[];
}

// ── Cache ──────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'aura_ai_insights_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const DISMISSED_KEY = 'aura_ai_insights_dismissed';

function getCachedInsights(): { insights: AIInsight[]; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCachedInsights(insights: AIInsight[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ insights, timestamp: Date.now() }));
  } catch {
    // Silently fail if localStorage is full
  }
}

function getDismissedIds(): Set<string> {
  try {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    return dismissed ? new Set(JSON.parse(dismissed)) : new Set();
  } catch {
    return new Set();
  }
}

function setDismissedIds(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Silently fail
  }
}

// ── Mock Insight Generation ────────────────────────────────────────────────────
// In production, this would call the AnalyticsAgentService via API

function generateMockInsights(types?: InsightType[]): AIInsight[] {
  const allInsights: AIInsight[] = [
    // Turnover Risk
    {
      id: 'insight_turnover_001',
      type: 'turnover_risk',
      title: 'High Turnover Risk in Engineering',
      summary:
        '8 employees in Engineering show high flight risk based on engagement scores, tenure patterns, and market compensation gaps.',
      details: `AI analysis of employee sentiment, compensation benchmarks, and engagement survey responses identifies the following risk factors:

1. **Compensation Gap**: Engineering salaries are 12% below market median for equivalent roles
2. **Engagement Decline**: Team engagement score dropped from 78 to 64 over the past 2 quarters
3. **Manager Feedback**: 3 of 8 flagged employees have unresolved concerns in 1:1 notes
4. **Tenure Pattern**: 5 employees are in the 2-3 year band, historically the highest attrition window`,
      severity: 'critical',
      impact: 'HIGH',
      metrics: [
        { name: 'At-Risk Employees', value: 8, trend: 'up' },
        { name: 'Avg Flight Risk Score', value: '78%', trend: 'up' },
        { name: 'Comp Gap vs Market', value: '-12%', trend: 'down' },
        { name: 'Engagement Score', value: 64, change: -14, trend: 'down' },
      ],
      recommendations: [
        'Initiate retention conversations with the 8 identified employees',
        'Review and adjust engineering salary bands to match market rates',
        'Schedule skip-level meetings for the affected teams',
        'Fast-track pending promotions for top performers in the group',
      ],
      confidence: 0.89,
      generatedAt: new Date(),
      dismissed: false,
      actionUrl: '/dashboard/core-hr/employee-database',
    },

    // Performance Trend
    {
      id: 'insight_performance_001',
      type: 'performance_trend',
      title: 'Team Performance Trending Upward',
      summary:
        'Overall team performance improved by 15% this quarter driven by product and design teams, though operations lags behind.',
      details: `Performance trend analysis across departments shows:

1. **Product Team**: Goal completion rate improved from 72% to 88% (+22%)
2. **Design Team**: Sprint velocity up 18%, customer satisfaction scores at all-time high
3. **Operations**: Performance flat at 68% goal completion - staffing gaps identified
4. **Overall**: 15% improvement in organizational performance index`,
      severity: 'success',
      impact: 'MEDIUM',
      metrics: [
        { name: 'Performance Index', value: '82%', change: 15, trend: 'up' },
        { name: 'Goal Completion', value: '78%', change: 8, trend: 'up' },
        { name: 'Avg Rating', value: 3.8, change: 0.3, trend: 'up' },
        { name: 'Top Performers', value: 42, change: 7, trend: 'up' },
      ],
      recommendations: [
        'Recognize top-performing Product and Design teams publicly',
        'Investigate Operations bottlenecks and staffing gaps',
        'Share best practices from high-performing teams across the org',
        'Consider linking improved performance to upcoming promotion cycle',
      ],
      confidence: 0.93,
      generatedAt: new Date(),
      dismissed: false,
      actionUrl: '/dashboard/performance/performance-reviews',
    },

    // Compliance Alert
    {
      id: 'insight_compliance_001',
      type: 'compliance_alert',
      title: 'Expiring Certifications & Missing Documents',
      summary:
        '14 employees have certifications expiring within 30 days and 6 have missing mandatory documents requiring immediate action.',
      details: `Compliance scan results:

1. **Expiring Certifications**: 14 employees across 3 departments
   - Safety certifications (7) - expire within 15 days
   - Professional licenses (4) - expire within 30 days
   - Compliance training (3) - overdue for renewal
2. **Missing Documents**: 6 employees missing mandatory records
   - Background verification pending (3)
   - Updated emergency contacts (2)
   - Tax declarations (1)
3. **Audit Risk**: Next external audit scheduled in 45 days`,
      severity: 'warning',
      impact: 'HIGH',
      metrics: [
        { name: 'Expiring Certs', value: 14, trend: 'up' },
        { name: 'Missing Docs', value: 6, trend: 'flat' },
        { name: 'Days to Audit', value: 45, trend: 'down' },
        { name: 'Compliance Score', value: '91%', change: -4, trend: 'down' },
      ],
      recommendations: [
        'Send automated renewal reminders to the 14 employees with expiring certifications',
        'Escalate 7 safety certification renewals as they are within the critical 15-day window',
        'Schedule document collection sessions for the 6 employees with missing records',
        'Prepare pre-audit checklist and assign ownership to HR compliance team',
      ],
      confidence: 0.97,
      generatedAt: new Date(),
      dismissed: false,
      actionUrl: '/dashboard/admin/compliance',
    },

    // Training Recommendation
    {
      id: 'insight_training_001',
      type: 'training_recommendation',
      title: 'Skill Gaps Detected in Cloud & AI',
      summary:
        "Skills gap analysis reveals 23 employees need upskilling in cloud technologies and 15 in AI/ML, aligning with company's digital transformation goals.",
      details: `Based on skills assessment data, job requirements analysis, and industry benchmarks:

1. **Cloud Skills Gap**: 23 employees in Engineering and DevOps lack required AWS/Azure certifications
   - Critical for 3 upcoming projects starting Q2
   - Avg proficiency: 2.1/5 vs required 3.5/5
2. **AI/ML Gap**: 15 data analysts and developers below competency threshold
   - Company AI strategy requires 80% readiness by Q3
   - Current readiness: 52%
3. **Leadership Development**: 8 high-potential employees identified for management track
   - No formal development plans in place`,
      severity: 'info',
      impact: 'MEDIUM',
      metrics: [
        { name: 'Cloud Skill Gap', value: 23, trend: 'flat' },
        { name: 'AI/ML Gap', value: 15, trend: 'flat' },
        { name: 'AI Readiness', value: '52%', trend: 'up' },
        { name: 'Training Budget Used', value: '34%', trend: 'up' },
      ],
      recommendations: [
        'Enroll 23 engineers in accelerated cloud certification program (AWS/Azure)',
        'Launch AI/ML bootcamp series for the 15 identified employees',
        'Create individual development plans for 8 high-potential leaders',
        'Allocate remaining training budget (66%) before fiscal year end',
      ],
      confidence: 0.85,
      generatedAt: new Date(),
      dismissed: false,
      actionUrl: '/dashboard/learning/calendar',
    },
  ];

  if (types && types.length > 0) {
    return allInsights.filter((i) => types.includes(i.type));
  }
  return allInsights;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAIInsights(options: UseAIInsightsOptions = {}): UseAIInsightsReturn {
  const { autoRefresh = true, refreshInterval = 15, types } = options;

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [_dismissedIds, setDismissedIdsState] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load dismissed IDs on mount
  useEffect(() => {
    setDismissedIdsState(getDismissedIds());
  }, []);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedInsights();
      if (cached) {
        const dismissed = getDismissedIds();
        setInsights(cached.insights.map((i) => ({ ...i, dismissed: dismissed.has(i.id) })));
        setLastRefreshed(new Date(cached.timestamp));
        setLoading(false);
        return;
      }

      // In production, this would be an API call:
      // const res = await fetch('/api/v1/ai/insights', { params: { types } });
      // const data = await res.json();

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const generated = generateMockInsights(types);
      const dismissed = getDismissedIds();
      const withDismissed = generated.map((i) => ({ ...i, dismissed: dismissed.has(i.id) }));

      setCachedInsights(withDismissed);
      setInsights(withDismissed);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [types]);

  // Initial fetch
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchInsights, refreshInterval * 60 * 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [autoRefresh, refreshInterval, fetchInsights]);

  const dismissInsight = useCallback((id: string) => {
    setDismissedIdsState((prev) => {
      const next = new Set(prev);
      next.add(id);
      setDismissedIds(next);
      return next;
    });
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i)));
  }, []);

  const restoreInsight = useCallback((id: string) => {
    setDismissedIdsState((prev) => {
      const next = new Set(prev);
      next.delete(id);
      setDismissedIds(next);
      return next;
    });
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: false } : i)));
  }, []);

  const activeInsights = insights.filter((i) => !i.dismissed);
  const dismissedInsights = insights.filter((i) => i.dismissed);

  return {
    insights,
    loading,
    error,
    lastRefreshed,
    refresh: fetchInsights,
    dismissInsight,
    restoreInsight,
    activeInsights,
    dismissedInsights,
  };
}

export default useAIInsights;

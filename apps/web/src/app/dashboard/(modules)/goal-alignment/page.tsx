'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Target, Loader2 } from 'lucide-react';
import { GoalAlignmentTree } from '@/components/performance/GoalAlignmentTree';
import type {
  AlignmentGoal,
  GoalLevel,
  GoalNodeStatus,
} from '@/components/performance/GoalAlignmentTree';
import { APIClient } from '@/lib/api-client';

const TYPE_TO_LEVEL: Record<string, GoalLevel> = {
  company: 'company',
  organizational: 'company',
  department: 'department',
  team: 'team',
  individual: 'individual',
};

function mapStatus(status: string, progress: number): GoalNodeStatus {
  switch (status) {
    case 'completed':
    case 'achieved':
      return 'achieved';
    case 'not_started':
      return 'not_started';
    case 'at_risk':
      return 'at_risk';
    case 'behind':
      return 'behind';
    default:
      if (progress >= 100) return 'achieved';
      if (progress <= 0) return 'not_started';
      return 'on_track';
  }
}

function mapGoal(g: any, childCount: number): AlignmentGoal {
  const progress = Number(g.progress ?? 0);
  return {
    id: g.id,
    title: g.title,
    description: g.description ?? '',
    level: TYPE_TO_LEVEL[g.type] ?? (g.parentGoalId ? 'individual' : 'company'),
    status: mapStatus(g.status ?? '', progress),
    progress,
    owner:
      g.ownerName ?? (g.employeeId ? `Employee ${String(g.employeeId).slice(-4)}` : 'Unassigned'),
    ownerRole: g.category ?? '',
    department: g.department ?? undefined,
    targetDate: g.dueDate ?? g.completedDate ?? '',
    parentGoalId: g.parentGoalId ?? undefined,
    childCount,
    weight: Number(g.weight ?? 0),
  };
}

export default function GoalAlignmentPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await APIClient.get<any>('/performance/goals');
        const rows: any[] = Array.isArray(res) ? res : res?.goals || res?.data || res?.items || [];
        if (active) setGoals(rows);
      } catch (e: any) {
        if (active) setError(e?.message ?? 'Failed to load goals');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const alignmentGoals = useMemo<AlignmentGoal[]>(() => {
    const childCounts = new Map<string, number>();
    for (const g of goals) {
      if (g.parentGoalId) {
        childCounts.set(g.parentGoalId, (childCounts.get(g.parentGoalId) ?? 0) + 1);
      }
    }
    return goals.map((g) => mapGoal(g, childCounts.get(g.id) ?? 0));
  }, [goals]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Goal Alignment Visualization
          </p>
          <p className="text-[9px] text-silver-mist">
            Company → Department → Team → Individual cascading goals
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-coral-alert/30 bg-coral-alert/10 px-3 py-2 text-[10px] font-semibold text-coral-alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
        </div>
      ) : alignmentGoals.length === 0 ? (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-12 text-center text-sm text-silver-mist">
          No goals found yet. Create goals with parent/child links to see the alignment cascade.
        </div>
      ) : (
        <GoalAlignmentTree goals={alignmentGoals} />
      )}
    </div>
  );
}

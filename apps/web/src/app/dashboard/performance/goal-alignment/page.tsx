"use client";

import React, { useState, useEffect } from 'react';
import { GoalService } from '../core/services';
import { Target, ChevronDown, ChevronRight, Link2, TrendingUp, Users, Building2, Loader2 } from 'lucide-react';

interface GoalNode {
  id: string;
  title: string;
  owner: string;
  progress: number;
  level: 'company' | 'department' | 'team' | 'individual';
  children?: GoalNode[];
}

const GoalNodeComponent = ({ goal, depth = 0 }: { goal: GoalNode; depth?: number }) => {
  const [expanded, setExpanded] = useState(depth < 2);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'company': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'department': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'team': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'individual': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'company': return <Building2 className="w-3.5 h-3.5" />;
      case 'department': return <Users className="w-3.5 h-3.5" />;
      case 'team': return <Users className="w-3.5 h-3.5" />;
      case 'individual': return <Target className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-celestial-indigo';
    if (progress >= 25) return 'bg-sunset-amber';
    return 'bg-coral-alert';
  };

  return (
    <div style={{ marginLeft: `${depth * 24}px` }}>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos rounded-lg transition-colors">
        {goal.children && goal.children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        {depth > 0 && <Link2 className="w-3.5 h-3.5 text-silver-mist flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${goal.level === 'individual' ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}>
              {goal.title}
            </p>
          </div>
          <p className="text-xs text-silver-mist">{goal.owner}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getLevelColor(goal.level)}`}>
          {getLevelIcon(goal.level)} {goal.level}
        </span>
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressColor(goal.progress)}`} style={{ width: `${goal.progress}%` }} />
          </div>
          <span className="text-xs font-medium text-ink-black dark:text-pearl w-8 text-right">{goal.progress}%</span>
        </div>
      </div>
      {expanded && goal.children?.map((child) => (
        <GoalNodeComponent key={child.id} goal={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default function GoalAlignmentPage() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await GoalService.getGoals();
        setGoals(data);
      } catch (error) {
        console.error('Failed to load goals:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGoals();
  }, []);

  // Build a goal tree from flat goals
  const buildGoalTree = (flatGoals: any[]): GoalNode[] => {
    const goalMap = new Map<string, GoalNode>();
    const roots: GoalNode[] = [];

    flatGoals.forEach(g => {
      const level = g.type === 'company' ? 'company' :
        g.type === 'department' ? 'department' :
        g.type === 'team' ? 'team' : 'individual';

      goalMap.set(g.id, {
        id: g.id,
        title: g.title,
        owner: g.alignedTo || g.type || 'Individual',
        progress: g.progress || 0,
        level,
        children: [],
      });
    });

    flatGoals.forEach(g => {
      const node = goalMap.get(g.id);
      if (node && g.parentGoalId && goalMap.has(g.parentGoalId)) {
        goalMap.get(g.parentGoalId)!.children!.push(node);
      } else if (node) {
        roots.push(node);
      }
    });

    return roots;
  };

  const goalTree = buildGoalTree(goals);
  const myGoals = goals.filter(g => g.type === 'individual');
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0;
  const alignedGoals = goals.filter(g => g.parentGoalId || g.alignedTo).length;
  const alignmentScore = goals.length > 0 ? Math.round((alignedGoals / goals.length) * 100) : 0;
  const atRisk = goals.filter(g => g.progress < 30 && g.status !== 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Goal Alignment</h1>
        <p className="text-sm text-silver-mist mt-1">Visualize how individual goals cascade from company objectives</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">My Goals</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{myGoals.length}</p>
          <p className="text-[10px] text-silver-mist">{alignedGoals} aligned to objectives</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Progress</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{avgProgress}%</p>
          <p className="text-[10px] text-silver-mist">Across all goals</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Alignment Score</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{alignmentScore}%</p>
          <p className="text-[10px] text-silver-mist">Goals linked to strategy</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">At Risk</p>
          <p className="text-2xl font-bold text-coral-alert mt-1">{atRisk}</p>
          <p className="text-[10px] text-silver-mist">Below 30% progress</p>
        </div>
      </div>

      {/* Goal Tree */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Goal Cascade</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Company</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Department</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Team</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Individual</span>
          </div>
        </div>
        <div className="p-2">
          {goalTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Target className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">No goals to display</p>
              <p className="text-xs mt-1">Create goals and set parent relationships to see alignment</p>
            </div>
          ) : (
            goalTree.map((goal) => (
              <GoalNodeComponent key={goal.id} goal={goal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}


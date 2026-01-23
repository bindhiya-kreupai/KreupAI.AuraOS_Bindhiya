"use client";

import React, { useState } from 'react';
import { Target, ChevronDown, ChevronRight, Link2, TrendingUp, Users, Building2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  owner: string;
  progress: number;
  level: 'company' | 'department' | 'team' | 'individual';
  children?: Goal[];
}

const goalTree: Goal[] = [
  {
    id: '1',
    title: 'Increase Annual Revenue by 25%',
    owner: 'Company',
    progress: 62,
    level: 'company',
    children: [
      {
        id: '1a',
        title: 'Expand Enterprise Customer Base',
        owner: 'Sales Department',
        progress: 55,
        level: 'department',
        children: [
          { id: '1a1', title: 'Close 15 new enterprise deals in Q1', owner: 'Enterprise Sales Team', progress: 73, level: 'team' },
          { id: '1a2', title: 'Improve sales pipeline conversion by 20%', owner: 'You', progress: 40, level: 'individual' },
        ]
      },
      {
        id: '1b',
        title: 'Launch 3 New Product Features',
        owner: 'Engineering',
        progress: 70,
        level: 'department',
        children: [
          { id: '1b1', title: 'Deliver reporting module by Q2', owner: 'Platform Team', progress: 85, level: 'team' },
          { id: '1b2', title: 'Implement API v3 endpoints', owner: 'You', progress: 60, level: 'individual' },
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Improve Employee Satisfaction Score to 4.5',
    owner: 'Company',
    progress: 78,
    level: 'company',
    children: [
      {
        id: '2a',
        title: 'Reduce Voluntary Turnover by 10%',
        owner: 'HR Department',
        progress: 80,
        level: 'department',
      }
    ]
  }
];

const GoalNode = ({ goal, depth = 0 }: { goal: Goal; depth?: number }) => {
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
        <GoalNode key={child.id} goal={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default function GoalAlignmentPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Goal Alignment</h1>
        <p className="text-sm text-silver-mist mt-1">Visualize how individual goals cascade from company objectives</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">My Goals</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">4</p>
          <p className="text-[10px] text-silver-mist">2 aligned to company OKRs</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Progress</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">52%</p>
          <p className="text-[10px] text-silver-mist">Across all goals</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Alignment Score</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">85%</p>
          <p className="text-[10px] text-silver-mist">Goals linked to strategy</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">At Risk</p>
          <p className="text-2xl font-bold text-coral-alert mt-1">1</p>
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
          {goalTree.map((goal) => (
            <GoalNode key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}

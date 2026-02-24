'use client';

import React from 'react';
import { Target } from 'lucide-react';
import {
  GoalAlignmentTree,
  MOCK_ALIGNMENT_GOALS,
} from '@/components/performance/GoalAlignmentTree';

export default function GoalAlignmentPage() {
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

      {/* Goal Tree */}
      <GoalAlignmentTree goals={MOCK_ALIGNMENT_GOALS} />
    </div>
  );
}

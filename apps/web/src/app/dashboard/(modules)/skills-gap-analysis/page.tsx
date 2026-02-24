'use client';

import React, { useCallback } from 'react';
import { Target } from 'lucide-react';
import { SkillsGapAnalysis } from '@/components/skills/SkillsGapAnalysis';
import { MOCK_SKILL_DATA } from '@/components/skills/SkillRadarChart';
import { MOCK_RECOMMENDATIONS } from '@/components/skills/SkillGapRecommendations';

export default function SkillsGapAnalysisPage() {
  const handleEnroll = useCallback((id: string) => {
    void id;
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">Skills Gap Analysis</p>
          <p className="text-[9px] text-silver-mist">
            Identify skill gaps, compare current vs required levels, and find learning paths
          </p>
        </div>
      </div>

      {/* Skills Gap Analysis */}
      <SkillsGapAnalysis
        skills={MOCK_SKILL_DATA}
        recommendations={MOCK_RECOMMENDATIONS}
        onEnroll={handleEnroll}
      />
    </div>
  );
}

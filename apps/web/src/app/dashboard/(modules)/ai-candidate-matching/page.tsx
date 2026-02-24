'use client';

import React from 'react';
import { Brain } from 'lucide-react';
import {
  AICandidateMatching,
  MOCK_CANDIDATES,
  MOCK_JOB,
} from '@/components/recruitment/AICandidateMatching';

export default function AICandidateMatchingPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">AI Candidate Matching</p>
          <p className="text-[9px] text-silver-mist">
            Ranked candidates with AI-powered match scores and recommendations
          </p>
        </div>
      </div>

      {/* Matching Dashboard */}
      <AICandidateMatching candidates={MOCK_CANDIDATES} job={MOCK_JOB} />
    </div>
  );
}

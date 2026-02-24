'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ContinuousFeedback } from '@/components/performance/ContinuousFeedback';

export default function ContinuousFeedbackPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">Continuous Feedback</p>
          <p className="text-[9px] text-silver-mist">
            Give and receive praise, constructive feedback, and suggestions
          </p>
        </div>
      </div>

      {/* Feedback Hub */}
      <ContinuousFeedback />
    </div>
  );
}

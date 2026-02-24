'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import {
  CandidateCommunicationHub,
  MOCK_THREADS,
  MOCK_TEMPLATES,
} from '@/components/recruitment/CandidateCommunicationHub';

export default function CandidateCommunicationPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Candidate Communication Hub
          </p>
          <p className="text-[9px] text-silver-mist">
            Email threads, SMS messaging, and template-based outreach
          </p>
        </div>
      </div>

      {/* Communication Hub */}
      <CandidateCommunicationHub threads={MOCK_THREADS} templates={MOCK_TEMPLATES} />
    </div>
  );
}

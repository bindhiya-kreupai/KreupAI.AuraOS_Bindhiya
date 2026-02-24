/**
 * @module AIResumeParserPage
 * @description AI Resume Parser page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Brain, Shield } from 'lucide-react';
import { AIResumeParser } from '@/components/recruitment/AIResumeParser';

export default function AIResumeParserPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Brain className="w-5 h-5 text-celestial-indigo" />
          AI Resume Parser
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Upload resumes in PDF or DOCX format for AI-powered parsing and job match scoring.
        </p>
      </div>

      {/* Parser */}
      <AIResumeParser />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Resume data is processed securely and handled in compliance with data protection policies.
          Files are not retained after parsing.
        </p>
      </div>
    </div>
  );
}

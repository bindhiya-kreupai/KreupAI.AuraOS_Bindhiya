'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LayoutTemplate, FileText, Megaphone } from 'lucide-react';
import {
  CheckInTemplates,
  MOCK_CHECKIN_TEMPLATES,
} from '@/components/performance/CheckInTemplates';
import type { CheckInTemplate } from '@/components/performance/CheckInTemplates';
import { OneOnOneNotes, MOCK_SESSIONS } from '@/components/performance/OneOnOneNotes';
import { PraiseWall, MOCK_PRAISE_POSTS } from '@/components/performance/PraiseWall';

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'templates', label: 'Check-In Templates', icon: LayoutTemplate },
  { key: 'notes', label: '1:1 Notes', icon: FileText },
  { key: 'praise', label: 'Praise Wall', icon: Megaphone },
];

export default function CheckInTemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');

  const handleUseTemplate = useCallback((_template: CheckInTemplate) => {
    // template selected
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutTemplate className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Check-In Templates & 1:1 Notes
          </p>
          <p className="text-[9px] text-silver-mist">
            Templates for recurring check-ins, shared meeting notes, and public praise
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
                activeTab === tab.key
                  ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <CheckInTemplates templates={MOCK_CHECKIN_TEMPLATES} onUseTemplate={handleUseTemplate} />
      )}

      {activeTab === 'notes' && <OneOnOneNotes sessions={MOCK_SESSIONS} />}

      {activeTab === 'praise' && <PraiseWall posts={MOCK_PRAISE_POSTS} />}
    </div>
  );
}

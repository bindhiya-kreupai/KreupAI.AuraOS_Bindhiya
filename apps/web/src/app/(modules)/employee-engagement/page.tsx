/**
 * @module EmployeeEngagementPage
 * @description Employee Engagement module — redirects to full engagement suite
 * @project AURA HCM Platform
 */

'use client';

import { useState } from 'react';
import SurveyDashboard from '@/components/engagement/SurveyDashboard';
import GiveRecognitionForm from '@/components/engagement/GiveRecognitionForm';
import RewardsMarketplace from '@/components/engagement/RewardsMarketplace';

type Tab = 'surveys' | 'recognition' | 'rewards';

const TABS: { id: Tab; label: string }[] = [
  { id: 'surveys', label: 'Pulse Surveys' },
  { id: 'recognition', label: 'Give Recognition' },
  { id: 'rewards', label: 'Rewards Marketplace' },
];

export default function EmployeeEngagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('surveys');

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Employee Engagement</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pulse surveys, peer recognition, and rewards
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'surveys' && <SurveyDashboard />}
        {activeTab === 'recognition' && <GiveRecognitionForm />}
        {activeTab === 'rewards' && <RewardsMarketplace />}
      </div>
    </div>
  );
}

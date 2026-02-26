/**
 * @module EngagementPage
 * @description Engagement module — Pulse Surveys, Recognition & Rewards, Company Feed
 * @project AURA HCM Platform
 */

'use client';

import { useState } from 'react';
import SurveyDashboard from '@/components/engagement/SurveyDashboard';
import SurveyBuilder from '@/components/engagement/SurveyBuilder';
import SurveyResults from '@/components/engagement/SurveyResults';
import GiveRecognitionForm from '@/components/engagement/GiveRecognitionForm';
import RewardsMarketplace from '@/components/engagement/RewardsMarketplace';
import AnnouncementsBoard from '@/components/communications/AnnouncementsBoard';
import CompanyFeed from '@/components/communications/CompanyFeed';

type Tab = 'surveys' | 'builder' | 'results' | 'recognition' | 'rewards' | 'announcements' | 'feed';

const TABS: { id: Tab; label: string }[] = [
  { id: 'surveys', label: 'Pulse Surveys' },
  { id: 'builder', label: 'Survey Builder' },
  { id: 'results', label: 'Survey Results' },
  { id: 'recognition', label: 'Give Recognition' },
  { id: 'rewards', label: 'Rewards Marketplace' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'feed', label: 'Company Feed' },
];

export default function EngagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('surveys');

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Employee Engagement</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pulse surveys, recognition, rewards, and company communications
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
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
        {activeTab === 'builder' && <SurveyBuilder />}
        {activeTab === 'results' && <SurveyResults surveyId="survey-1" />}
        {activeTab === 'recognition' && <GiveRecognitionForm />}
        {activeTab === 'rewards' && <RewardsMarketplace />}
        {activeTab === 'announcements' && <AnnouncementsBoard />}
        {activeTab === 'feed' && <CompanyFeed />}
      </div>
    </div>
  );
}

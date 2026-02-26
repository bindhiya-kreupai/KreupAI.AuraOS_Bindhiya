/**
 * @module BenefitsPage
 * @description Benefits module — dashboard, enrollment, HSA/FSA, wellness, retirement, claims, COBRA, perks
 * @project AURA HCM Platform
 */

'use client';

import { useState } from 'react';
import BenefitsDashboard from '@/components/benefits/BenefitsDashboard';
import HSAFSAManagement from '@/components/benefits/HSAFSAManagement';
import WellnessTracker from '@/components/benefits/WellnessTracker';
import RetirementDashboard from '@/components/benefits/RetirementDashboard';
import ClaimsManager from '@/components/benefits/ClaimsManager';
import COBRAManager from '@/components/benefits/COBRAManager';
import PerksMarketplace from '@/components/benefits/PerksMarketplace';

type Tab = 'dashboard' | 'hsa-fsa' | 'wellness' | 'retirement' | 'claims' | 'cobra' | 'perks';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Benefits Dashboard' },
  { id: 'hsa-fsa', label: 'HSA / FSA' },
  { id: 'wellness', label: 'Wellness Tracker' },
  { id: 'retirement', label: 'Retirement' },
  { id: 'claims', label: 'Claims Manager' },
  { id: 'cobra', label: 'COBRA' },
  { id: 'perks', label: 'Perks Marketplace' },
];

export default function BenefitsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="space-y-4">
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
        {activeTab === 'dashboard' && <BenefitsDashboard />}
        {activeTab === 'hsa-fsa' && <HSAFSAManagement />}
        {activeTab === 'wellness' && <WellnessTracker />}
        {activeTab === 'retirement' && <RetirementDashboard />}
        {activeTab === 'claims' && <ClaimsManager />}
        {activeTab === 'cobra' && <COBRAManager />}
        {activeTab === 'perks' && <PerksMarketplace />}
      </div>
    </div>
  );
}

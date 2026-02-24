'use client';

import React, { useState, useCallback } from 'react';
import { Users, Search, Gift, Send } from 'lucide-react';
import { ReferralPortal, MOCK_REFERRAL_JOBS } from '@/components/recruitment/ReferralPortal';
import type { ReferralFormData } from '@/components/recruitment/ReferralPortal';
import {
  ReferralTracking,
  MOCK_TRACKED_REFERRALS,
} from '@/components/recruitment/ReferralTracking';
import { ReferralRewards, MOCK_REWARDS_DATA } from '@/components/recruitment/ReferralRewards';

const TABS = [
  { key: 'refer' as const, label: 'Refer Someone', icon: Send },
  { key: 'tracking' as const, label: 'My Referrals', icon: Search },
  { key: 'rewards' as const, label: 'Rewards', icon: Gift },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function EmployeeReferralPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('refer');

  const handleSubmitReferral = useCallback((_data: ReferralFormData) => {
    // referral submitted
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Employee Referral Portal
          </p>
          <p className="text-[9px] text-silver-mist">
            Refer great talent, track progress, and earn rewards
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
              activeTab === tab.key
                ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'refer' && (
        <ReferralPortal
          jobs={MOCK_REFERRAL_JOBS}
          onSubmitReferral={handleSubmitReferral}
          referralLink="https://careers.aura.tech/ref/EMP-1042"
        />
      )}

      {activeTab === 'tracking' && <ReferralTracking referrals={MOCK_TRACKED_REFERRALS} />}

      {activeTab === 'rewards' && <ReferralRewards data={MOCK_REWARDS_DATA} />}
    </div>
  );
}

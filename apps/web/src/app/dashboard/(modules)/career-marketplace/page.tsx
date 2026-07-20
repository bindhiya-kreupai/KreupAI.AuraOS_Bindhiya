/**
 * @module CareerPage
 * @description ESS Career & Internal Marketplace — career interests, internal jobs, applications
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Target, Briefcase, Shield } from 'lucide-react';
import { CareerInterestsProfile } from '@/components/career/CareerInterestsProfile';
import {
  InternalJobMarketplace,
  type InternalJob,
} from '@/components/career/InternalJobMarketplace';
import { InternalApplicationForm } from '@/components/career/InternalApplicationForm';

type ActiveTab = 'interests' | 'marketplace';

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('marketplace');
  const [applyingTo, setApplyingTo] = useState<InternalJob | null>(null);

  const handleApply = useCallback((job: InternalJob) => {
    setApplyingTo(job);
  }, []);

  const handleBackFromApply = useCallback(() => {
    setApplyingTo(null);
  }, []);

  // If applying, show application form
  if (applyingTo) {
    return (
      <div className="space-y-6 pb-6">
        <div>
          <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-celestial-indigo" />
            Internal Application
          </h1>
          <p className="text-sm text-silver-mist mt-0.5">Apply for an internal position</p>
        </div>
        <InternalApplicationForm
          job={applyingTo}
          onBack={handleBackFromApply}
          onSubmitted={handleBackFromApply}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Target className="w-5 h-5 text-quantum-rose" />
          Career & Internal Marketplace
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Define your career interests and explore internal opportunities.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30 w-fit">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'marketplace'
              ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
              : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Job Marketplace
        </button>
        <button
          onClick={() => setActiveTab('interests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'interests'
              ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
              : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          My Career Interests
        </button>
      </div>

      {/* Content */}
      {activeTab === 'marketplace' ? (
        <InternalJobMarketplace onApply={handleApply} />
      ) : (
        <CareerInterestsProfile />
      )}

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Internal applications are confidential. Your current manager will only be contacted with
          your consent or during the transfer process.
        </p>
      </div>
    </div>
  );
}

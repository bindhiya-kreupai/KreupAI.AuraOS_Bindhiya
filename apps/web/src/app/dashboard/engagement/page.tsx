'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { EngagementAnalyticsService } from './services';

export default function EmployeeEngagementPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await EngagementAnalyticsService.getMetrics();
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Each label kebab-cases to an existing sub-route under /dashboard/engagement.
  const features = [
    'Engagement Analytics',
    'Surveys',
    'Pulse Checks',
    'Recognition Wall',
    'Innovation',
    'Social Feed',
    'Events',
    'Newsletter',
    'Referral Program',
    'Rewards Catalog',
    'CSR Activities',
    'Classifieds',
    'Polls Quizzes',
    'Settings',
  ];

  return (
    <ModuleGrid
      title="Employee Engagement"
      description="Recognition, gamification, wellness, and employee engagement programs."
      features={features}
      basePath="/dashboard/engagement"
    />
  );
}

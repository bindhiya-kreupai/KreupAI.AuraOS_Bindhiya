"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function EmployeeEngagementPage() {
  const features = [
    'Engagement Analytics',
    'Pulse Surveys',
    'Recognition Wall',
    'Suggestion Box',
    'Social Feed',
    'Event Calendar',
    'Referral Program',
    'Polls Quizzes',
    'CSR Activities',
    'Classifieds'
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

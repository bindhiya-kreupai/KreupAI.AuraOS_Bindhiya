"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function OnboardingPage() {
  const features = [
    'Pre-boarding',
    'First Day Experience',
    'Induction Program',
    'Buddy Assignment',
    '30-60-90 Day Plan'
  ];

  return (
    <ModuleGrid
      title="Onboarding"
      description="Manage your onboarding operations and settings."
      features={features}
      basePath="/dashboard/onboarding"
    />
  );
}

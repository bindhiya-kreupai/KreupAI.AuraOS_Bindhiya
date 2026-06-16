'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function OnboardingPage() {
  const features = [
    'Cases',
    'Guidance',
    'Pre-boarding',
    'First Day Experience',
    'Induction Program',
    'Buddy Assignment',
    '30-60-90 Day Plan',
    'Employee Master',
    'Social Insurance',
    'Benefits',
    'Payroll',
    'Country Rules',
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

"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function DeiPage() {
  const features = [
    'Diversity Metrics',
    'Inclusion Survey',
    'Pay Equity Analysis',
    'Bias Training',
    'ERG Management',
    'Mentorship Program',
    'Accessibility',
    'DEI Goals'
  ];

  return (
    <ModuleGrid
      title="DEI"
      description="Manage your dei operations and settings."
      features={features}
      basePath="/dashboard/dei"
    />
  );
}

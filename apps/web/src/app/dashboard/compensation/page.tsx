"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function CompensationPage() {
  const features = [
    'Salary Structure',
    'Grade & Bands',
    'Increment Planning',
    'Bonus Management',
    'Stock Options',
    'Loan & Advances',
    'Arrears Processing',
    'Total Rewards',
    'Market Benchmarking',
    'Budget Simulation',
    'Loans'
  ];

  return (
    <ModuleGrid
      title="Compensation"
      description="Manage your compensation operations and settings."
      features={features}
      basePath="/dashboard/compensation"
    />
  );
}

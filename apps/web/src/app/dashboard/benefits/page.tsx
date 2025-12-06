"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function BenefitsPage() {
  const features = [
    'Benefit Types',
    'Plan Eligibility',
    'Enrollment Window',
    'Dependent Management',
    'Insurance Coverage',
    'Premium Sharing',
    'Claims',
    'Claim Status',
    'Provider Directory',
    'Notification',
    'Exception Handling',
    'Reporting'
  ];

  return (
    <ModuleGrid
      title="Benefits"
      description="Manage your benefits operations and settings."
      features={features}
      basePath="/dashboard/benefits"
    />
  );
}

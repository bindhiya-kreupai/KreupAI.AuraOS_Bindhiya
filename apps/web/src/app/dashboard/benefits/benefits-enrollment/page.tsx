"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function BenefitsEnrollmentPage() {
  const features = [
    'Plan Selection',
    'Coverage Level',
    'Dependent Selection',
    'Cost Summary',
    'Plan Comparison',
    'Enrollment History',
  ];

  return (
    <ModuleGrid
      title="Benefits Enrollment"
      description="Enroll in benefit plans, compare options, and manage your coverage."
      features={features}
      basePath="/dashboard/benefits/benefits-enrollment"
    />
  );
}


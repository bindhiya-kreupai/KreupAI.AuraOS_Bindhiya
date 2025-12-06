"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function NonprofitPage() {
  const features = [
    'Volunteer Management',
    'Field Deployment',
    'Donor Relations'
  ];

  return (
    <ModuleGrid
      title="Nonprofit / NGO"
      description="Coordinate volunteers, manage field missions, and engage donors."
      features={features}
      basePath="/dashboard/nonprofit"
    />
  );
}

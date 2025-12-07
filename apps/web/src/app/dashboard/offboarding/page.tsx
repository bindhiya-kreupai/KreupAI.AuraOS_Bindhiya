"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function OffboardingPage() {
  const features = [
    'Exit Process',
    'Exit Interview',
    'Clearance Checklist',
    'F&F Settlement'
  ];

  return (
    <ModuleGrid
      title="Offboarding"
      description="Manage resignations, exit interviews, and full & final settlements."
      features={features}
      basePath="/dashboard/offboarding"
    />
  );
}

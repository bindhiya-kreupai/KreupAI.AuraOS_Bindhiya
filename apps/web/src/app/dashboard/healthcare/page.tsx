"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function HealthcarePage() {
  const features = [
    'Credentialing',
    'Nurse Rostering',
    'Locum Management'
  ];

  return (
    <ModuleGrid
      title="Healthcare"
      description="Manage clinical staff, rostering complexity, and credential compliance."
      features={features}
      basePath="/dashboard/healthcare"
    />
  );
}


"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function HospitalityPage() {
  const features = [
    'Tip Management',
    'Event Staffing',
    'Housekeeping'
  ];

  return (
    <ModuleGrid
      title="Hospitality"
      description="Optimize guest experience, distribute tips, and manage events."
      features={features}
      basePath="/dashboard/hospitality"
    />
  );
}


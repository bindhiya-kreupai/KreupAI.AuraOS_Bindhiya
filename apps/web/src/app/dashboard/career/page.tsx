"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function CareerPlanningPage() {
  const features = [
    'Career Ladders',
    'Internal Mobility',
    'Career Goals',
    'Aspirations'
  ];

  return (
    <ModuleGrid
      title="Career Planning"
      description="Manage your career planning operations and settings."
      features={features}
      basePath="/dashboard/career"
    />
  );
}

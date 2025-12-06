"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function SuccessionPlanningPage() {
  const features = [
    'Critical Positions',
    'Talent Matrix',
    'Successor Identification',
    'Development Planning',
    'Emergency Succession',
    'Talent Review',
    'Career Pathing',
    'Succession Analytics'
  ];

  return (
    <ModuleGrid
      title="Succession Planning"
      description="Manage your succession planning operations and settings."
      features={features}
      basePath="/dashboard/succession-planning"
    />
  );
}

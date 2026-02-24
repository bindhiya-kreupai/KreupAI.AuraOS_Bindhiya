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
    'Succession Analytics',
  ];

  return (
    <ModuleGrid
      title="Succession Planning"
      description="Identify, develop, and retain top talent for key leadership roles."
      features={features}
      basePath="/dashboard/succession-planning"
    />
  );
}


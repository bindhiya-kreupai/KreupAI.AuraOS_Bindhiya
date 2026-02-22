"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function PerformancePage() {
  const features = [
    'Goal Setting',
    'Goal Alignment',
    'Review Cycles',
    'Self-Assessment',
    'Manager Assessment',
    '360 Feedback',
    'Continuous Feedback',
    'Recognition Wall',
    'Rating Scales',
    'Bell Curve',
    'Calibration',
    '1-on-1 Meetings',
    'Check-in Templates',
    'PIP Management',
    'Competency Assessment',
    'Development Plans',
    'Performance Analytics',
    'Reward Linkage',
    'My Reviews'
  ];

  return (
    <ModuleGrid
      title="Performance"
      description="Manage your performance operations and settings."
      features={features}
      basePath="/dashboard/performance"
    />
  );
}


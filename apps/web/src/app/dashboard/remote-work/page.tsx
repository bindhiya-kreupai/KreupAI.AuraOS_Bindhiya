'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function RemoteWorkDashboard() {
  const features = [
    'Remote Policy',
    'Equipment Tracking',
    'Virtual Onboarding',
    'Productivity Tracking',
    'Communication Tools',
    'Virtual Team Building',
    'Expense Management',
    'Well-being Support',
  ];

  return (
    <ModuleGrid
      title="Remote Work"
      description="Manage remote workforce policies, assets, and engagement."
      features={features}
      basePath="/dashboard/remote-work"
    />
  );
}

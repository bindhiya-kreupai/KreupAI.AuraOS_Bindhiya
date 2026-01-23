"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function MssPage() {
  const features = [
    'Team Dashboard',
    'Approval Center',
    'One-on-Ones',
    'Team Capacity',
    'Team Reports',
    'Delegation',
    'Team Analytics'
  ];

  return (
    <ModuleGrid
      title="MSS"
      description="Manage your mss operations and settings."
      features={features}
      basePath="/dashboard/manager"
    />
  );
}

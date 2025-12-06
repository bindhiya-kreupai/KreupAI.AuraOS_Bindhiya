"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function MssPage() {
  const features = [
    'Team Dashboard',
    'Approval Center',
    'Team Reports',
    'Delegation'
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

"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AlumniNetworkPage() {
  const features = [
    'Alumni Directory',
    'Events & Reunions',
    'Alumni Jobs'
  ];

  return (
    <ModuleGrid
      title="Alumni Network"
      description="Manage your alumni network operations and settings."
      features={features}
      basePath="/dashboard/offboarding"
    />
  );
}

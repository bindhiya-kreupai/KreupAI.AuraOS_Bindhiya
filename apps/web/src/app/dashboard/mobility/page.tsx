"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function GlobalMobilityPage() {
  const features = [
    'Visa & Immigration',
    'Relocation Packages',
    'Expat Tax Manager'
  ];

  return (
    <ModuleGrid
      title="Global Mobility"
      description="Manage international assignments, visas, and relocation logistics."
      features={features}
      basePath="/dashboard/mobility"
    />
  );
}

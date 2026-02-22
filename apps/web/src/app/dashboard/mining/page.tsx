"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function MiningPage() {
  const features = [
    'FIFO Logistics',
    'Camp Management',
    'Hazard Pay'
  ];

  return (
    <ModuleGrid
      title="Mining & Resources"
      description="Coordinate remote workforce logistics, camp operations, and hazard compensation."
      features={features}
      basePath="/dashboard/mining"
    />
  );
}


"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function MaritimePage() {
  const features = [
    'Vessel Crewing',
    'Port Operations',
    'Offshore Compliance'
  ];

  return (
    <ModuleGrid
      title="Maritime"
      description="Manage vessel crewing, port logistics, and offshore compliance."
      features={features}
      basePath="/dashboard/maritime"
    />
  );
}


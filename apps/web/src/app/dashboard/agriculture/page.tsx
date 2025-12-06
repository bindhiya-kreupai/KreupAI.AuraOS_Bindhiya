"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AgriculturePage() {
  const features = [
    'Seasonal Labor',
    'Housing Management',
    'Crop Cycles'
  ];

  return (
    <ModuleGrid
      title="Agriculture"
      description="Manage seasonal workforce, on-campus housing, and crop harvest cycles."
      features={features}
      basePath="/dashboard/agriculture"
    />
  );
}

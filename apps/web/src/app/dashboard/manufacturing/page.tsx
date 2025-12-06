"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function ManufacturingPage() {
  const features = [
    'Plant Maintenance',
    'Production Efficiency',
    'Safety Compliance'
  ];

  return (
    <ModuleGrid
      title="Manufacturing"
      description="Optimize plant operations, track maintenance, and ensure safety compliance."
      features={features}
      basePath="/dashboard/manufacturing"
    />
  );
}

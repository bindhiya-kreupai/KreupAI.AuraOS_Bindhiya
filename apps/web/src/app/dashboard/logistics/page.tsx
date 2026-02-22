"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function LogisticsPage() {
  const features = [
    'Driver Management',
    'Fleet Safety',
    'Warehouse Staffing'
  ];

  return (
    <ModuleGrid
      title="Logistics"
      description="Manage your logistics operations and settings."
      features={features}
      basePath="/dashboard/logistics"
    />
  );
}


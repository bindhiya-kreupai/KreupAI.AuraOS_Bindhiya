"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AutomotivePage() {
  const features = [
    'Technician Rostering',
    'Sales Commissions',
    'Parts Inventory'
  ];

  return (
    <ModuleGrid
      title="Automotive"
      description="Manage dealership operations, service technicians, and inventory."
      features={features}
      basePath="/dashboard/automotive"
    />
  );
}


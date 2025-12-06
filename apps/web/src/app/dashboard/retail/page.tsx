"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function RetailPage() {
  const features = [
    'Store Operations',
    'Commission & Incentives',
    'Seasonal Hiring'
  ];

  return (
    <ModuleGrid
      title="Retail"
      description="Optimize store performance, manage sales commissions, and handle peak season staffing."
      features={features}
      basePath="/dashboard/retail"
    />
  );
}

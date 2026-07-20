'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function ConstructionPage() {
  const features = [
    'Project Management',
    'Site Safety',
    { label: 'Site Safety (HSE)', slug: 'safety' },
    'Equipment Leasing',
    'Subcontractor Portal',
    'Staffing',
    'Unions',
  ];

  return (
    <ModuleGrid
      title="Construction & Real Estate"
      description="Manage projects, site safety, equipment, and subcontractors."
      features={features}
      basePath="/dashboard/construction"
    />
  );
}

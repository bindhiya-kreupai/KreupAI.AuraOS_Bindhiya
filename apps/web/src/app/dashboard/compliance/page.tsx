"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function LaborRelationsPage() {
  const features = [
    'Union Database',
    'Grievance Management',
    'Collective Bargaining',
    'Disciplinary Actions',
    'Labor Law Compliance',
    'Strike Management',
    'Arbitration',
    'Communication Log'
  ];

  return (
    <ModuleGrid
      title="Labor Relations"
      description="Manage your labor relations operations and settings."
      features={features}
      basePath="/dashboard/compliance"
    />
  );
}


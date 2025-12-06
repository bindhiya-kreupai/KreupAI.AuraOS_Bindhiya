"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function CoreHrPage() {
  const features = [
    'Employee Database',
    'Organization Structure',
    'Employment History',
    'Document Management',
    'Position Management',
    'Cost Center',
    'Employee Life Events',
    'Mass Updates',
    'Employee ID Cards',
    'Letter Generation',
    'Exit Management',
    'Anniversary Alerts',
    'Auto-Numbering',
    'Probation Tracking',
    'Confirmation Letters',
    'Asset Management'
  ];

  return (
    <ModuleGrid
      title="Core HR"
      description="Manage your core hr operations and settings."
      features={features}
      basePath="/dashboard/core-hr"
    />
  );
}

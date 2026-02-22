"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function GovernmentPage() {
  const features = [
    'Civil Service Grades',
    'Security Clearance',
    'Pension Scheme'
  ];

  return (
    <ModuleGrid
      title="Government"
      description="Manage public sector grades, security clearances, and pension schemes."
      features={features}
      basePath="/dashboard/government"
    />
  );
}


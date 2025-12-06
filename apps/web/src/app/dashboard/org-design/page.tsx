"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function OrgDesignPage() {
  const features = [
    'Org Chart Builder',
    'Scenario Planning',
    'Span of Control',
    'Position Hierarchy',
    'Matrix Structure',
    'Succession Pool',
    'Org Analytics',
    'Change Management'
  ];

  return (
    <ModuleGrid
      title="Org Design"
      description="Manage your org design operations and settings."
      features={features}
      basePath="/dashboard/org-design"
    />
  );
}

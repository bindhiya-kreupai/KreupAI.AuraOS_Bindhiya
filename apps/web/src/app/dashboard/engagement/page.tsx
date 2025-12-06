"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function EmployeeEngagementPage() {
  const features = [
    'Pulse Surveys',
    'Recognition Wall',
    'Suggestion Box'
  ];

  return (
    <ModuleGrid
      title="Employee Engagement"
      description="Manage your employee engagement operations and settings."
      features={features}
      basePath="/dashboard/engagement"
    />
  );
}

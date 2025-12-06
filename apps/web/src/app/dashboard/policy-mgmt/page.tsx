"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function PolicyMgmtPage() {
  const features = [
    'Policy Repository',
    'Policy Creation',
    'Approval Workflow',
    'Policy Distribution',
    'Acknowledgement',
    'Policy Updates',
    'Compliance Tracking',
    'Policy FAQs'
  ];

  return (
    <ModuleGrid
      title="Policy Mgmt"
      description="Manage your policy mgmt operations and settings."
      features={features}
      basePath="/dashboard/policy-mgmt"
    />
  );
}

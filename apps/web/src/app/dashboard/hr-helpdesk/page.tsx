'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function HrsdPage() {
  const features = [
    'Tickets',
    'Knowledge Base',
    'Service Catalog',
    'Request Portal',
    'Case Management',
    'Service Automation',
    'Chat Support',
    'Omnichannel',
    'Performance Metrics',
    'Continuous Improvement',
  ];

  return (
    <ModuleGrid
      title="HRSD"
      description="Manage your hrsd operations and settings."
      features={features}
      basePath="/dashboard/hr-helpdesk"
    />
  );
}

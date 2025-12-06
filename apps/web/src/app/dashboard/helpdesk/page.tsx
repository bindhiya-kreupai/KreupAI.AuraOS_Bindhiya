"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function HrHelpdeskPage() {
  const features = [
    'Ticket Management',
    'SLA Tracking',
    'Knowledge Base',
    'Agent Assignment',
    'Escalation Matrix',
    'Customer Satisfaction',
    'Canned Responses',
    'Analytics',
    'Tickets'
  ];

  return (
    <ModuleGrid
      title="HR Helpdesk"
      description="Manage your hr helpdesk operations and settings."
      features={features}
      basePath="/dashboard/helpdesk"
    />
  );
}

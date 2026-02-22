"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function HealthSafetyPage() {
  const features = [
    'Incident Reporting',
    'Safety Training',
    'Health Checkups',
    'Emergency Contacts',
    'COVID Tracker'
  ];

  return (
    <ModuleGrid
      title="Health & Safety"
      description="Manage your health & safety operations and settings."
      features={features}
      basePath="/dashboard/health-safety"
    />
  );
}


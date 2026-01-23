"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function EssPage() {
  const features = [
    'Personal Info Update',
    'Leave Application',
    'Payslip Access',
    'Tax Declaration',
    'Tax Documents',
    'Benefits Enrollment',
    'Attendance View',
    'Team Directory',
    'Request Center',
    'My Documents',
    'Life Events',
    'Dependents',
    'Career Interests'
  ];

  return (
    <ModuleGrid
      title="ESS"
      description="Manage your ess operations and settings."
      features={features}
      basePath="/dashboard/my-services"
    />
  );
}

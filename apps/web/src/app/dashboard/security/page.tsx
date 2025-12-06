"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AuditSecurityPage() {
  const features = [
    'Audit Logs',
    'Login Logs',
    'Role-based Access',
    'Field-level Security',
    'Dual Authentication',
    'Document Access Logs',
    'Compliance Tracker',
    'Policy Acknowledgement',
    'Approval Logs',
    'GDPR Tools',
    'Alert Rules',
    'Data Retention'
  ];

  return (
    <ModuleGrid
      title="Audit & Security"
      description="Manage your audit & security operations and settings."
      features={features}
      basePath="/dashboard/security"
    />
  );
}

"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function UserManagementPage() {
  const features = [
    'Users',
    'Role Management',
    'Access Control',
    'Password Policy',
    'Single Sign-On',
    'Session Management',
    'Audit Trail',
    'User Delegation',
    'License Management',
    'User Deactivation',
    'Profile Management',
    'Multi-Factor Auth'
  ];

  return (
    <ModuleGrid
      title="User Management"
      description="Manage your user management operations and settings."
      features={features}
      basePath="/dashboard/user-management"
    />
  );
}


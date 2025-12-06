"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function LeavePage() {
  const features = [
    'Leave Types',
    'Leave Policy',
    'Leave Balance',
    'Leave Application',
    'Leave Calendar',
    'Holiday Management',
    'Leave Encashment',
    'Carry Forward',
    'Comp-off Tracking',
    'Leave Reports',
    'My Leaves'
  ];

  return (
    <ModuleGrid
      title="Leave"
      description="Manage your leave operations and settings."
      features={features}
      basePath="/dashboard/leave"
    />
  );
}

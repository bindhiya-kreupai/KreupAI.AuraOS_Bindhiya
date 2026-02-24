"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AttendancePage() {
  const features = [
    'Shift Management',
    'Roster Assignment',
    'Time Capture',
    'Punch Rules',
    'Geo-Fencing',
    'IP Restriction',
    'Attendance Exceptions',
    'Regularization Request',
    'Work From Home',
    'Comp-off Management',
    'Overtime Management',
    'Time Rounding',
    'Approval Workflow',
    'Timesheets'
  ];

  return (
    <ModuleGrid
      title="Attendance"
      description="Manage your attendance operations and settings."
      features={features}
      basePath="/dashboard/attendance"
    />
  );
}


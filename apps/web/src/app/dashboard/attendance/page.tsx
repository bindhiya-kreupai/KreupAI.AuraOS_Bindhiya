'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import Link from 'next/link';
import { LayoutGrid, ArrowRight } from 'lucide-react';

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
    'Timesheets',
  ];

  return (
    <div className="space-y-6">
      {/* Banner linking to the main Command Center */}
      <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6" />
            Attendance Command Center
          </h2>
          <p className="text-indigo-100 mt-1">
            Access the live dashboard, view AI insights, record manual entries, and perform quick
            actions.
          </p>
        </div>
        <Link
          href="/attendance"
          className="bg-white text-indigo-600 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors self-start md:self-auto shrink-0 shadow-sm"
        >
          Open Command Center <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ModuleGrid
        title="Attendance Settings & Sub-modules"
        description="Manage your specific attendance configurations and rules."
        features={features}
        basePath="/dashboard/attendance"
      />
    </div>
  );
}

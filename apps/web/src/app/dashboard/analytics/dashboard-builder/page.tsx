'use client';

import React from 'react';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';

/**
 * Consolidated report builder. This route previously rendered a duplicate inline builder
 * (titled "Report Builder") with unwired Export/Save buttons and a headcount-only static
 * preview. It now mounts the shared, fully-wired CustomReportBuilder.
 */
export default function DashboardBuilderPage() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <CustomReportBuilder />
      </div>
    </div>
  );
}

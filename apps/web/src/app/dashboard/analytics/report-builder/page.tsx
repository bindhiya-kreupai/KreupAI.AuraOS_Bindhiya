'use client';

import React from 'react';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';

/**
 * Canonical report builder page. Previously this rendered a duplicate inline builder with
 * unwired Save/Run buttons and headcount-only mock preview. It now mounts the shared
 * CustomReportBuilder, which is fully wired to real metadata, preview, save, run, and
 * delete endpoints.
 */
export default function AnalyticsReportBuilderPage() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <CustomReportBuilder />
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { VendorSubdomainView, type VendorSubRecord } from '../_components/vendor-subdomain-view';

export default function VendorPerformancePage() {
  return (
    <VendorSubdomainView
      title="Vendor Performance"
      description="Capture staffing partner scorecards across quality, timeliness, and communication."
      Icon={Award}
      endpoint="/v1/recruitment/vendors/performance-rating"
      requiresVendor
      createLabel="Add Scorecard"
      emptyMessage="No performance reviews recorded. Add a scorecard to track vendor quality, timeliness, and communication over time."
      createFields={[
        {
          name: 'periodLabel',
          label: 'Period',
          type: 'text',
          required: true,
          placeholder: 'e.g. Q1 2026',
        },
        { name: 'qualityScore', label: 'Quality (0-5)', type: 'number' },
        { name: 'timelinessScore', label: 'Timeliness (0-5)', type: 'number' },
        { name: 'communicationScore', label: 'Communication (0-5)', type: 'number' },
        { name: 'reviewNotes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        {
          header: 'Vendor',
          render: (r: VendorSubRecord) => String(r.vendorName ?? r.vendorId ?? '—'),
        },
        { header: 'Period', render: (r: VendorSubRecord) => String(r.periodLabel ?? '—') },
        {
          header: 'Quality',
          render: (r: VendorSubRecord) => Number(r.qualityScore ?? 0).toFixed(1),
        },
        {
          header: 'Timeliness',
          render: (r: VendorSubRecord) => Number(r.timelinessScore ?? 0).toFixed(1),
        },
        {
          header: 'Communication',
          render: (r: VendorSubRecord) => Number(r.communicationScore ?? 0).toFixed(1),
        },
        {
          header: 'Overall',
          render: (r: VendorSubRecord) => (
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {Number(r.overallScore ?? 0).toFixed(1)}
            </span>
          ),
        },
      ]}
    />
  );
}

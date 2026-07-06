'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import {
  VendorSubdomainView,
  formatDate,
  statusBadge,
  type VendorSubRecord,
} from '../_components/vendor-subdomain-view';

export default function AgencyTimesheetPage() {
  return (
    <VendorSubdomainView
      title="Contractor Timesheets"
      description="Submit and approve weekly contractor hours per vendor."
      Icon={Clock}
      endpoint="/v1/recruitment/vendors/timesheets"
      requiresVendor
      createLabel="Submit Timesheet"
      emptyMessage="No timesheets submitted. Add contractor hours to run the submission and approval workflow."
      createFields={[
        { name: 'workerName', label: 'Worker Name', type: 'text', required: true },
        { name: 'periodStart', label: 'Period Start', type: 'date' },
        { name: 'periodEnd', label: 'Period End', type: 'date' },
        { name: 'hours', label: 'Hours', type: 'number', required: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        {
          header: 'Vendor',
          render: (r: VendorSubRecord) => String(r.vendorName ?? r.vendorId ?? '—'),
        },
        { header: 'Worker', render: (r: VendorSubRecord) => String(r.workerName ?? '—') },
        {
          header: 'Period',
          render: (r: VendorSubRecord) =>
            `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`,
        },
        { header: 'Hours', render: (r: VendorSubRecord) => Number(r.hours ?? 0).toFixed(1) },
        { header: 'Status', render: (r: VendorSubRecord) => statusBadge(r.status) },
      ]}
      rowActions={[
        {
          label: 'Approve',
          patch: { status: 'approved' },
          variant: 'primary',
          show: (r) => r.status === 'submitted',
        },
        {
          label: 'Reject',
          patch: { status: 'rejected' },
          variant: 'danger',
          show: (r) => r.status === 'submitted',
        },
      ]}
    />
  );
}

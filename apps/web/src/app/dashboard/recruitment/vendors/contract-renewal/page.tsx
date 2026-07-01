'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import {
  VendorSubdomainView,
  formatDate,
  statusBadge,
  type VendorSubRecord,
} from '../_components/vendor-subdomain-view';

export default function ContractRenewalPage() {
  return (
    <VendorSubdomainView
      title="Contract Renewals"
      description="Manage expiring vendor agreements, renewal decisions, and extension history."
      Icon={RefreshCw}
      endpoint="/v1/recruitment/vendors/contract-renewal"
      requiresVendor
      createLabel="Raise Renewal"
      emptyMessage="No renewals in progress. Raise a renewal to capture proposed end dates and track the decision workflow."
      createFields={[
        { name: 'currentEndDate', label: 'Current End Date', type: 'date' },
        { name: 'proposedEndDate', label: 'Proposed End Date', type: 'date' },
        {
          name: 'decision',
          label: 'Decision',
          type: 'select',
          options: [
            { value: '', label: 'Not decided' },
            { value: 'renew', label: 'Renew' },
            { value: 'extend', label: 'Extend' },
            { value: 'terminate', label: 'Terminate' },
          ],
        },
        { name: 'decisionNotes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        {
          header: 'Vendor',
          render: (r: VendorSubRecord) => String(r.vendorName ?? r.vendorId ?? '—'),
        },
        { header: 'Current End', render: (r: VendorSubRecord) => formatDate(r.currentEndDate) },
        { header: 'Proposed End', render: (r: VendorSubRecord) => formatDate(r.proposedEndDate) },
        { header: 'Decision', render: (r: VendorSubRecord) => String(r.decision ?? '—') },
        { header: 'Status', render: (r: VendorSubRecord) => statusBadge(r.status) },
      ]}
      rowActions={[
        {
          label: 'Approve',
          patch: { status: 'approved' },
          variant: 'primary',
          show: (r) => r.status === 'pending',
        },
        {
          label: 'Mark Renewed',
          patch: { status: 'renewed', decision: 'renew' },
          variant: 'primary',
          show: (r) => r.status === 'approved',
        },
        {
          label: 'Reject',
          patch: { status: 'rejected' },
          variant: 'danger',
          show: (r) => r.status === 'pending',
        },
      ]}
    />
  );
}

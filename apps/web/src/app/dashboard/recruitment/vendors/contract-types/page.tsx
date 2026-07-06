'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import {
  VendorSubdomainView,
  statusBadge,
  type VendorSubRecord,
} from '../_components/vendor-subdomain-view';

export default function ContractTypesPage() {
  return (
    <VendorSubdomainView
      title="Contract Configurations"
      description="Define reusable vendor engagement models, notice periods, and payment terms."
      Icon={FileText}
      endpoint="/v1/recruitment/vendors/contract-types"
      requiresVendor={false}
      createLabel="Add Contract Type"
      emptyMessage="No contract types configured yet. Define engagement models and standard terms to standardize vendor agreements."
      createFields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        {
          name: 'engagementModel',
          label: 'Engagement Model',
          type: 'select',
          options: [
            { value: 'staff_augmentation', label: 'Staff Augmentation' },
            { value: 'fixed_price', label: 'Fixed Price' },
            { value: 'managed_service', label: 'Managed Service' },
            { value: 'rpo', label: 'RPO' },
          ],
        },
        { name: 'noticePeriodDays', label: 'Notice Period (days)', type: 'number' },
        { name: 'paymentTermsDays', label: 'Payment Terms (days)', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        { header: 'Code', render: (r: VendorSubRecord) => String(r.code ?? '—') },
        { header: 'Name', render: (r: VendorSubRecord) => String(r.name ?? '—') },
        {
          header: 'Engagement',
          render: (r: VendorSubRecord) =>
            String(r.engagementModel ?? '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()),
        },
        { header: 'Notice', render: (r: VendorSubRecord) => `${r.noticePeriodDays ?? 0} days` },
        { header: 'Payment', render: (r: VendorSubRecord) => `${r.paymentTermsDays ?? 0} days` },
        {
          header: 'Status',
          render: (r: VendorSubRecord) => statusBadge(r.isActive ? 'approved' : 'expired'),
        },
      ]}
      rowActions={[
        {
          label: 'Deactivate',
          patch: { isActive: false },
          variant: 'danger',
          show: (r) => Boolean(r.isActive),
        },
        {
          label: 'Activate',
          patch: { isActive: true },
          variant: 'primary',
          show: (r) => !r.isActive,
        },
      ]}
    />
  );
}

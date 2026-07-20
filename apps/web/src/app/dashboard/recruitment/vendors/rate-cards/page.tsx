'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import {
  VendorSubdomainView,
  statusBadge,
  type VendorSubRecord,
} from '../_components/vendor-subdomain-view';

export default function RateCardsPage() {
  return (
    <VendorSubdomainView
      title="Vendor Rate Cards"
      description="Standardize pricing by role, experience level, and location for each vendor."
      Icon={DollarSign}
      endpoint="/v1/recruitment/vendors/rate-cards"
      requiresVendor
      createLabel="Add Rate Card"
      emptyMessage="No rate cards yet. Add role-based pricing to standardize commercial terms across vendors."
      createFields={[
        { name: 'roleTitle', label: 'Role Title', type: 'text', required: true },
        {
          name: 'experienceLevel',
          label: 'Experience Level',
          type: 'select',
          options: [
            { value: 'junior', label: 'Junior' },
            { value: 'mid', label: 'Mid' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead' },
          ],
        },
        { name: 'location', label: 'Location', type: 'text' },
        {
          name: 'ratePeriod',
          label: 'Rate Period',
          type: 'select',
          options: [
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'monthly', label: 'Monthly' },
          ],
        },
        { name: 'rate', label: 'Rate', type: 'number', required: true },
        { name: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
        { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
        { name: 'effectiveTo', label: 'Effective To', type: 'date' },
      ]}
      columns={[
        {
          header: 'Vendor',
          render: (r: VendorSubRecord) => String(r.vendorName ?? r.vendorId ?? '—'),
        },
        { header: 'Role', render: (r: VendorSubRecord) => String(r.roleTitle ?? '—') },
        {
          header: 'Level',
          render: (r: VendorSubRecord) =>
            String(r.experienceLevel ?? '').replace(/\b\w/g, (c) => c.toUpperCase()),
        },
        {
          header: 'Rate',
          render: (r: VendorSubRecord) =>
            `${r.currency ?? 'USD'} ${Number(r.rate ?? 0).toLocaleString()} / ${String(r.ratePeriod ?? 'hourly')}`,
        },
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

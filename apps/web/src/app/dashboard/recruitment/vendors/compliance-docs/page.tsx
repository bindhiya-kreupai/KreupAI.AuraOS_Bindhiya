'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  VendorSubdomainView,
  formatDate,
  statusBadge,
  type VendorSubRecord,
} from '../_components/vendor-subdomain-view';

export default function ComplianceDocsPage() {
  return (
    <VendorSubdomainView
      title="Vendor Compliance"
      description="Track mandatory legal and security documents with expiry and review status per vendor."
      Icon={ShieldCheck}
      endpoint="/v1/recruitment/vendors/compliance-docs"
      requiresVendor
      createLabel="Add Document"
      emptyMessage="No compliance documents recorded yet. Add trade licenses, insurance, and certifications to track expiry and review status."
      createFields={[
        {
          name: 'documentType',
          label: 'Document Type',
          type: 'select',
          required: true,
          options: [
            { value: 'trade_license', label: 'Trade License' },
            { value: 'insurance', label: 'Insurance' },
            { value: 'iso_cert', label: 'ISO Certification' },
            { value: 'vat_cert', label: 'VAT Certificate' },
            { value: 'wps', label: 'WPS' },
            { value: 'other', label: 'Other' },
          ],
        },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'documentNumber', label: 'Document Number', type: 'text' },
        { name: 'issueDate', label: 'Issue Date', type: 'date' },
        { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
        { name: 'documentUrl', label: 'Document URL', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { header: 'Title', render: (r: VendorSubRecord) => String(r.title ?? '—') },
        {
          header: 'Type',
          render: (r: VendorSubRecord) =>
            String(r.documentType ?? '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()),
        },
        { header: 'Number', render: (r: VendorSubRecord) => String(r.documentNumber ?? '—') },
        { header: 'Expiry', render: (r: VendorSubRecord) => formatDate(r.expiryDate) },
        { header: 'Status', render: (r: VendorSubRecord) => statusBadge(r.status) },
      ]}
      rowActions={[
        {
          label: 'Mark Valid',
          patch: { status: 'valid' },
          variant: 'primary',
          show: (r) => r.status !== 'valid',
        },
        {
          label: 'Reject',
          patch: { status: 'rejected' },
          variant: 'danger',
          show: (r) => r.status !== 'rejected',
        },
      ]}
    />
  );
}

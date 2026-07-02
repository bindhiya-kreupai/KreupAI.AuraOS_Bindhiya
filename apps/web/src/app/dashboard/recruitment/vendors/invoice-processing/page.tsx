'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import {
  VendorSubdomainView,
  formatDate,
  statusBadge,
  type VendorSubRecord,
} from '../_components/vendor-subdomain-view';

export default function InvoiceProcessingPage() {
  return (
    <VendorSubdomainView
      title="Vendor Invoices"
      description="Register, approve, and reconcile vendor invoices through the payment lifecycle."
      Icon={FileText}
      endpoint="/v1/recruitment/vendors/invoices"
      requiresVendor
      createLabel="Register Invoice"
      emptyMessage="No invoices registered. Add vendor invoices to track approval status and payment reconciliation."
      createFields={[
        { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
        { name: 'invoiceDate', label: 'Invoice Date', type: 'date' },
        { name: 'dueDate', label: 'Due Date', type: 'date' },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        {
          header: 'Vendor',
          render: (r: VendorSubRecord) => String(r.vendorName ?? r.vendorId ?? '—'),
        },
        { header: 'Invoice #', render: (r: VendorSubRecord) => String(r.invoiceNumber ?? '—') },
        {
          header: 'Amount',
          render: (r: VendorSubRecord) =>
            `${r.currency ?? 'USD'} ${Number(r.amount ?? 0).toLocaleString()}`,
        },
        { header: 'Due', render: (r: VendorSubRecord) => formatDate(r.dueDate) },
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
          label: 'Reject',
          patch: { status: 'rejected' },
          variant: 'danger',
          show: (r) => r.status === 'pending',
        },
        {
          label: 'Mark Paid',
          patch: { status: 'paid' },
          variant: 'primary',
          show: (r) => r.status === 'approved',
        },
      ]}
    />
  );
}

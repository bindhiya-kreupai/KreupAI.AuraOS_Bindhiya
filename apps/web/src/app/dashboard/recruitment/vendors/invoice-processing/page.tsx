"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function InvoiceProcessingPage() {
    return (
        <VendorUnsupportedState
            title="Vendor Invoices"
            description="Process payments and reconcile vendor charges once invoices and timesheets are exposed through a real vendor finance contract."
            unavailableTitle="Vendor invoices not yet connected"
            buttonLabel="Approve Invoices"
            requirement="Add invoice intake, approval status, and vendor payment reconciliation to the recruitment vendor domain before enabling finance workflows here."
            scope="Invoice queues, payable totals, and payment history have been removed because they were synthetic and are not backed by a validated recruitment vendor integration."
            statusLabel="Awaiting vendor finance contract"
            Icon={FileText}
        />
    );
}


"use client";

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function ComplianceDocsPage() {
    return (
        <VendorUnsupportedState
            title="Vendor Compliance"
            description="Track mandatory legal and security documents once vendor compliance data is backed by recruitment services."
            unavailableTitle="Vendor compliance not yet connected"
            buttonLabel="Request Document"
            requirement="Add vendor document storage, expiry tracking, and audit metadata to a dedicated recruitment vendor contract before enabling compliance review."
            scope="Compliance status, document lists, and request actions remain unavailable because there is no validated vendor compliance integration in the current dashboard layer."
            statusLabel="Awaiting vendor compliance contract"
            Icon={ShieldCheck}
        />
    );
}


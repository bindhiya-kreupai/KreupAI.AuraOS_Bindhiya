"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function ContractRenewalPage() {
    return (
        <VendorUnsupportedState
            title="Contract Renewals"
            description="Manage expiring contractor agreements and extensions once vendor contract lifecycle data is integrated."
            unavailableTitle="Vendor renewals not yet connected"
            buttonLabel="Review Renewals"
            requirement="Add contract terms, renewal decisions, and renewal history to the recruitment vendor domain before surfacing lifecycle actions here."
            scope="This route no longer shows synthetic contractor renewals or negotiation events because there is no validated vendor renewal contract in recruitment."
            statusLabel="Awaiting vendor renewal contract"
            Icon={RefreshCw}
        />
    );
}


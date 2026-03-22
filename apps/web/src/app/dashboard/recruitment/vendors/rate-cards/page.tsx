"use client";

import React from 'react';
import { DollarSign } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function RateCardsPage() {
    return (
        <VendorUnsupportedState
            title="Vendor Rate Cards"
            description="Standardize pricing by role, location, and experience once commercial rate data is backed by a real vendor contract."
            unavailableTitle="Vendor rate cards not yet connected"
            buttonLabel="Update Rates"
            requirement="Add vendor-specific rate cards, pricing dimensions, and commercial history to the recruitment vendor domain before enabling rate management here."
            scope="Rate tables and pricing trends were removed because they were hardcoded and are not backed by a validated recruitment vendor integration."
            statusLabel="Awaiting vendor pricing contract"
            Icon={DollarSign}
        />
    );
}


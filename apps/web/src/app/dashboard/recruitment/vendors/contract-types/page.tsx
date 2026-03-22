"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function ContractTypesPage() {
    return (
        <VendorUnsupportedState
            title="Contract Configurations"
            description="Define engagement models and standard terms after vendor contract types are sourced from a real recruitment configuration service."
            unavailableTitle="Vendor contract types not yet connected"
            buttonLabel="Configure Types"
            requirement="Expose vendor engagement models, notice periods, and payment terms through a normalized vendor configuration contract before enabling rate or term setup."
            scope="This page intentionally avoids fabricated contract templates and commercial defaults because vendor contracting is not part of the validated recruitment dashboard surface yet."
            statusLabel="Awaiting vendor contract configuration"
            Icon={FileText}
        />
    );
}


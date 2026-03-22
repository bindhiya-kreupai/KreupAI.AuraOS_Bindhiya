"use client";

import React from 'react';
import { Award } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function VendorPerformancePage() {
    return (
        <VendorUnsupportedState
            title="Vendor Performance"
            description="Review staffing partner scorecards once vendor performance metrics are sourced from a dedicated recruitment service."
            unavailableTitle="Vendor performance not yet connected"
            buttonLabel="Review Ratings"
            requirement="Expose vendor scorecards, trend metrics, and review notes through a normalized vendor analytics contract before enabling partner reviews."
            scope="This page no longer displays fabricated ratings or trend bars because vendor performance data is not part of the validated recruitment dashboard contract today."
            statusLabel="Awaiting vendor analytics contract"
            Icon={Award}
        />
    );
}


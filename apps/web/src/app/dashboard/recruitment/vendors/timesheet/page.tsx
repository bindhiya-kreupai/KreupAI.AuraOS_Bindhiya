"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { VendorUnsupportedState } from '../_components/vendor-unsupported-state';

export default function AgencyTimesheetPage() {
    return (
        <VendorUnsupportedState
            title="Contractor Timesheets"
            description="Review and approve weekly hours from vendors after timesheet submission data is integrated into recruitment."
            unavailableTitle="Vendor timesheets not yet connected"
            buttonLabel="Approve Timesheets"
            requirement="Add vendor worker assignments, timesheet submissions, and approval state to a dedicated vendor operations contract before enabling timesheet review."
            scope="Timesheet rows, weekly totals, and approval actions have been removed because they were synthetic and are not backed by a validated recruitment vendor workflow."
            statusLabel="Awaiting vendor timesheet contract"
            Icon={Clock}
        />
    );
}


"use client";

import React from 'react';
import { RecruitmentVendorRegistry } from './_components/recruitment-vendor-registry';

export default function VendorManagementPage() {
    return (
        <RecruitmentVendorRegistry
            title="Vendor Management"
            description="Manage recruitment vendors, agencies, and service providers from the live tenant-scoped vendor registry."
        />
    );
}


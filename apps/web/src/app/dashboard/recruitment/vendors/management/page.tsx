"use client";

import React from 'react';
import { RecruitmentVendorRegistry } from '../_components/recruitment-vendor-registry';

export default function VendorsManagementPage() {
    return (
        <RecruitmentVendorRegistry
            title="Vendor Management"
            description="Review vendor onboarding and relationship status from the live recruitment vendor registry."
        />
    );
}


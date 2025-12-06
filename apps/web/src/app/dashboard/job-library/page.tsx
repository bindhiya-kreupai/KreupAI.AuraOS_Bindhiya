"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function JobLibraryPage() {
    const features = [
        'Job Catalog',
        'Job Families',
        'Job Evaluation',
        'Market Pricing',
        'Job Posting Templates'
    ];

    return (
        <ModuleGrid
            title="Job Library"
            description="Manage your organization's job architecture, descriptions, and compensation standards."
            features={features}
            basePath="/dashboard/job-library"
        />
    );
}

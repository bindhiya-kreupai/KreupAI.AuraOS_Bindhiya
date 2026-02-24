"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function MediaTelecomPage() {
    const features = [
        'Content Rights',
        'Bandwidth Analytics',
        'Audience Metrics',
        'Network Operations'
    ];

    return (
        <ModuleGrid
            title="Media & Telecommunications"
            description="Manage digital assets, network performance, and audience engagement."
            features={features}
            basePath="/dashboard/media"
        />
    );
}


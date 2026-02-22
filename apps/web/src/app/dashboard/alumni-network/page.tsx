"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AlumniNetworkPage() {
    const features = [
        'Alumni Directory',
        'Events & Reunions',
        'Alumni Jobs'
    ];

    return (
        <ModuleGrid
            title="Alumni Network"
            description="Stay connected with former employees, manage reunions, and share opportunities."
            features={features}
            basePath="/dashboard/alumni-network"
        />
    );
}


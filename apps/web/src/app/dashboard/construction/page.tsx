"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function ConstructionPage() {
    const features = [
        'Project Management',
        'Site Safety',
        'Equipment Leasing',
        'Subcontractor Portal'
    ];

    return (
        <ModuleGrid
            title="Construction & Real Estate"
            description="Manage projects, site safety, equipment, and subcontractors."
            features={features}
            basePath="/dashboard/construction"
        />
    );
}


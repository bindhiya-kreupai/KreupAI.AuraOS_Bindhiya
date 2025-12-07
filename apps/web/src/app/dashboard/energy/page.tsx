"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function EnergyUtilitiesPage() {
    const features = [
        'Smart Grid',
        'Water Conservation',
        'Renewable Assets',
        'Utility Billing'
    ];

    return (
        <ModuleGrid
            title="Energy & Utilities"
            description="Manage energy consumption, renewable assets, and utility billing."
            features={features}
            basePath="/dashboard/energy"
        />
    );
}

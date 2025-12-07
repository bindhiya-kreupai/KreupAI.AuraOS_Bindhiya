"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function ReportsDashboard() {
    const features = [
        'Standard Reports',
        'Custom Reports',
        'Dashboard Builder',
        'Scheduled Reports',
        'Export Options',
        'Real-time Analytics',
        'Drill-down Reports',
        'Cross-module Reports',
        'Compliance Reports',
        'Executive Dashboards',
        'Predictive Analytics',
        'Report Security',
    ];

    return (
        <ModuleGrid
            title="Reports & Analytics"
            description="Comprehensive reporting, data visualization, and predictive insights."
            features={features}
            basePath="/dashboard/analytics"
        />
    );
}

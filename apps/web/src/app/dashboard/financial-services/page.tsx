"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function FinancialServicesPage() {
    const features = [
        'Banking Operations',
        'Insurance Claims',
        'Wealth Management',
        'Regulatory Compliance'
    ];

    return (
        <ModuleGrid
            title="Financial Services"
            description="Manage banking operations, insurance claims, wealth portfolios, and compliance."
            features={features}
            basePath="/dashboard/financial-services"
        />
    );
}


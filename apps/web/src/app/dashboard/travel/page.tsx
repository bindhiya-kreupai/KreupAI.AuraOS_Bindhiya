"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function TravelPage() {
    const features = [
        'Travel Request',
        'Travel Policy',
        'Booking Integration',
        'Advance Request',
        'Expense Claims',
        'Per Diem',
        'Travel Insurance',
        'Visa Support',
        'Travel Dashboard',
        'Travel History',
        'Mileage Tracking',
        'Travel Analytics',
        'Dashboard',
    ];

    return (
        <ModuleGrid
            title="Travel Management"
            description="Streamline corporate travel, bookings, and expense reporting."
            features={features}
            basePath="/dashboard/travel"
        />
    );
}

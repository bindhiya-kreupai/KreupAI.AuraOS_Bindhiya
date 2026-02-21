"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { TravelAnalyticsService } from './services';

export default function TravelPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            try {
                await TravelAnalyticsService.getMetrics();
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-500">Loading travel module...</span>
            </div>
        );
    }

    return (
        <ModuleGrid
            title="Travel Management"
            description="Streamline corporate travel, bookings, and expense reporting."
            features={features}
            basePath="/dashboard/travel"
        />
    );
}

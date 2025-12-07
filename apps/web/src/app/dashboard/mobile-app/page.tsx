"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function MobileAppPage() {
    const features = [
        'Native Apps',
        'Push Notifications',
        'Offline Mode',
        'Biometric Login',
        'GPS Attendance',
        'Mobile Approvals',
        'Document Upload',
        'Team View',
        'Expense Claims',
        'Mobile Timesheets',
        'Quick Actions',
        'Voice Commands',
        'Mobile Analytics',
        'Chat Messaging',
        'Profile Management',
    ];

    return (
        <ModuleGrid
            title="Mobile App"
            description="Manage mobile application settings, features, and user experience."
            features={features}
            basePath="/dashboard/mobile-app"
        />
    );
}

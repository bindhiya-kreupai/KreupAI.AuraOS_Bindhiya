"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function IntegrationHubPage() {
    const features = [
        'API Marketplace',
        'Webhook Manager',
        'App Directory'
    ];

    return (
        <ModuleGrid
            title="Integration Hub"
            description="Manage API integrations, webhooks, and connect third-party applications."
            features={features}
            basePath="/dashboard/integration-hub"
        />
    );
}

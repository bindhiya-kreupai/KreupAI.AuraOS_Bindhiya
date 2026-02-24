"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { Briefcase } from 'lucide-react';

export default function PositionBudgetingPage() {
    const features = [
        'Position Creation',
        'Budget Allocation',
        'Vacancy Tracking',
        'Position History',
        'Position Freeze',
        'Position Transfer',
        'Budget vs Actual',
        'Position Analytics'
    ];

    return (
        <ModuleGrid
            title="Position Budgeting"
            description="Design, track, and manage job positions, vacancies, and headcount budgets."
            icon={Briefcase}
            features={features}
            basePath="/dashboard/position-budgeting"
        />
    );
}


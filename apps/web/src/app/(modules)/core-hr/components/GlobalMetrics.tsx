'use client';

import React from 'react';
import { Users, UserPlus, UserCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const METRICS = [
    {
        label: 'Total Headcount',
        value: '1,284',
        subValue: '+12 this month',
        icon: Users,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        trend: 'up'
    },
    {
        label: 'New Joiners',
        value: '42',
        subValue: 'Across 4 entities',
        icon: UserPlus,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        trend: 'up'
    },
    {
        label: 'Active Leases',
        value: '86',
        subValue: 'Visa renewals due',
        icon: UserCheck,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        trend: 'down'
    },
    {
        label: 'Group Growth',
        value: '8.4%',
        subValue: 'Global avg',
        icon: TrendingUp,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        trend: 'up'
    },
];

export function GlobalMetrics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((metric) => (
                <div
                    key={metric.label}
                    className="p-5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${metric.bg} dark:bg-opacity-10 flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <metric.icon className={`w-6 h-6 ${metric.color}`} />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold ${metric.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded-full`}>
                            {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {metric.trend === 'up' ? '12%' : '3%'}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-silver-mist mb-1">{metric.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-2xl font-bold text-ink-black dark:text-pearl tracking-tight">{metric.value}</h4>
                            <span className="text-xs text-silver-mist font-medium">{metric.subValue}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

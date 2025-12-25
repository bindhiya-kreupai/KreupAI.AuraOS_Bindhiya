"use client";

import React, { useState } from 'react';
import {
    Building2,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Package,
    Briefcase,
    Code,
    ShoppingCart,
    Megaphone,
    HeadphonesIcon,
    Settings,
    AlertCircle,
    CheckCircle,
    Plus,
    Search,
    Filter,
    BarChart3,
    Download,
    PieChart
} from 'lucide-react';

type CostCenterType = 'all' | 'department' | 'project' | 'location';
type VarianceStatus = 'under-budget' | 'on-budget' | 'over-budget';

interface CostCenter {
    id: string;
    name: string;
    code: string;
    type: 'department' | 'project' | 'location';
    manager: string;
    budget: number;
    actualSpend: number;
    variance: number;
    variancePercent: number;
    assetCount: number;
    assetValue: number;
    headcount: number;
    status: VarianceStatus;
    icon: any;
}

export default function CostCentersPage() {
    const [filter, setFilter] = useState<CostCenterType>('all');

    const costCenters: CostCenter[] = [
        {
            id: 'CC-001',
            name: 'Engineering',
            code: 'ENG-001',
            type: 'department',
            manager: 'Sarah Connor',
            budget: 850000,
            actualSpend: 782000,
            variance: 68000,
            variancePercent: 8.0,
            assetCount: 45,
            assetValue: 425000,
            headcount: 32,
            status: 'under-budget',
            icon: Code
        },
        {
            id: 'CC-002',
            name: 'Sales & Marketing',
            code: 'SAL-001',
            type: 'department',
            manager: 'Kyle Reese',
            budget: 450000,
            actualSpend: 468000,
            variance: -18000,
            variancePercent: -4.0,
            assetCount: 28,
            assetValue: 185000,
            headcount: 24,
            status: 'over-budget',
            icon: Megaphone
        },
        {
            id: 'CC-003',
            name: 'Operations',
            code: 'OPS-001',
            type: 'department',
            manager: 'John Connor',
            budget: 320000,
            actualSpend: 315000,
            variance: 5000,
            variancePercent: 1.6,
            assetCount: 35,
            assetValue: 280000,
            headcount: 18,
            status: 'on-budget',
            icon: Settings
        },
        {
            id: 'CC-004',
            name: 'Customer Support',
            code: 'SUP-001',
            type: 'department',
            manager: 'Lisa Garcia',
            budget: 180000,
            actualSpend: 172000,
            variance: 8000,
            variancePercent: 4.4,
            assetCount: 22,
            assetValue: 95000,
            headcount: 15,
            status: 'under-budget',
            icon: HeadphonesIcon
        },
        {
            id: 'CC-005',
            name: 'Product Development',
            code: 'PRD-001',
            type: 'department',
            manager: 'Mike Chen',
            budget: 620000,
            actualSpend: 615000,
            variance: 5000,
            variancePercent: 0.8,
            assetCount: 38,
            assetValue: 340000,
            headcount: 28,
            status: 'on-budget',
            icon: Briefcase
        },
        {
            id: 'CC-006',
            name: 'Project Alpha - Mobile App',
            code: 'PRJ-ALPHA',
            type: 'project',
            manager: 'Emma Wilson',
            budget: 250000,
            actualSpend: 225000,
            variance: 25000,
            variancePercent: 10.0,
            assetCount: 15,
            assetValue: 120000,
            headcount: 12,
            status: 'under-budget',
            icon: Code
        },
        {
            id: 'CC-007',
            name: 'Project Beta - Enterprise Suite',
            code: 'PRJ-BETA',
            type: 'project',
            manager: 'David Park',
            budget: 480000,
            actualSpend: 495000,
            variance: -15000,
            variancePercent: -3.1,
            assetCount: 20,
            assetValue: 185000,
            headcount: 18,
            status: 'over-budget',
            icon: Building2
        },
        {
            id: 'CC-008',
            name: 'San Francisco Office',
            code: 'LOC-SF',
            type: 'location',
            manager: 'Regional Admin',
            budget: 580000,
            actualSpend: 572000,
            variance: 8000,
            variancePercent: 1.4,
            assetCount: 85,
            assetValue: 520000,
            headcount: 75,
            status: 'on-budget',
            icon: Building2
        },
        {
            id: 'CC-009',
            name: 'New York Office',
            code: 'LOC-NY',
            type: 'location',
            manager: 'Regional Admin',
            budget: 720000,
            actualSpend: 695000,
            variance: 25000,
            variancePercent: 3.5,
            assetCount: 95,
            assetValue: 680000,
            headcount: 88,
            status: 'under-budget',
            icon: Building2
        },
        {
            id: 'CC-010',
            name: 'R&D Lab',
            code: 'RND-001',
            type: 'department',
            manager: 'Dr. Alan Grant',
            budget: 450000,
            actualSpend: 445000,
            variance: 5000,
            variancePercent: 1.1,
            assetCount: 42,
            assetValue: 380000,
            headcount: 22,
            status: 'on-budget',
            icon: Code
        }
    ];

    const filteredCostCenters = filter === 'all'
        ? costCenters
        : costCenters.filter(cc => cc.type === filter);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'department':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'project':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'location':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getStatusColor = (status: VarianceStatus) => {
        switch (status) {
            case 'under-budget':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'on-budget':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'over-budget':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getStatusIcon = (status: VarianceStatus) => {
        switch (status) {
            case 'under-budget':
                return <CheckCircle className="w-4 h-4" />;
            case 'on-budget':
                return <CheckCircle className="w-4 h-4" />;
            case 'over-budget':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <CheckCircle className="w-4 h-4" />;
        }
    };

    const totalBudget = costCenters.reduce((sum, cc) => sum + cc.budget, 0);
    const totalActual = costCenters.reduce((sum, cc) => sum + cc.actualSpend, 0);
    const totalVariance = totalBudget - totalActual;
    const totalAssets = costCenters.reduce((sum, cc) => sum + cc.assetCount, 0);
    const totalAssetValue = costCenters.reduce((sum, cc) => sum + cc.assetValue, 0);
    const overBudgetCount = costCenters.filter(cc => cc.status === 'over-budget').length;

    const stats = [
        {
            label: 'Total Budget',
            value: `$${(totalBudget / 1000000).toFixed(2)}M`,
            icon: DollarSign,
            color: 'text-blue-600',
            subtext: `${costCenters.length} cost centers`
        },
        {
            label: 'Total Spend',
            value: `$${(totalActual / 1000000).toFixed(2)}M`,
            icon: TrendingUp,
            color: totalVariance > 0 ? 'text-emerald-600' : 'text-red-600',
            subtext: `${((totalActual / totalBudget) * 100).toFixed(1)}% of budget`
        },
        {
            label: 'Variance',
            value: `${totalVariance > 0 ? '+' : ''}$${(totalVariance / 1000).toFixed(0)}k`,
            icon: totalVariance > 0 ? TrendingDown : TrendingUp,
            color: totalVariance > 0 ? 'text-emerald-600' : 'text-red-600',
            subtext: `${((totalVariance / totalBudget) * 100).toFixed(1)}% ${totalVariance > 0 ? 'under' : 'over'}`
        },
        {
            label: 'Asset Allocation',
            value: `$${(totalAssetValue / 1000000).toFixed(2)}M`,
            icon: Package,
            color: 'text-indigo-600',
            subtext: `${totalAssets} assets tracked`
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        Cost Centers
                    </h1>
                    <p className="text-slate-500 text-sm">Track asset allocation and spending by organizational units</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Plus className="w-4 h-4" /> Add Cost Center
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search cost centers..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'all'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('all')}
                    >
                        All Centers
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'department'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('department')}
                    >
                        Departments
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'project'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('project')}
                    >
                        Projects
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'location'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('location')}
                    >
                        Locations
                    </button>
                </div>
            </div>

            {/* Cost Centers Table */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredCostCenters.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No cost centers found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Cost Center</th>
                                        <th className="p-4">Code</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Manager</th>
                                        <th className="p-4">Headcount</th>
                                        <th className="p-4">Budget</th>
                                        <th className="p-4">Actual Spend</th>
                                        <th className="p-4">Variance</th>
                                        <th className="p-4">Utilization</th>
                                        <th className="p-4">Assets</th>
                                        <th className="p-4">Asset Value</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredCostCenters.map((cc) => {
                                        const utilization = (cc.actualSpend / cc.budget) * 100;
                                        const Icon = cc.icon;

                                        return (
                                            <tr key={cc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${getTypeColor(cc.type)}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{cc.name}</div>
                                                            <div className="text-xs text-slate-500">{cc.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-slate-500">{cc.code}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getTypeColor(cc.type)}`}>
                                                        {cc.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{cc.manager}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-4 h-4 text-slate-400" />
                                                        <span className="font-bold">{cc.headcount}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono">${cc.budget.toLocaleString()}</td>
                                                <td className="p-4 font-mono font-bold">${cc.actualSpend.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className={`font-mono font-bold ${cc.variance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {cc.variance > 0 ? '+' : ''}${cc.variance.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {cc.variancePercent > 0 ? '+' : ''}{cc.variancePercent.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    utilization > 100
                                                                        ? 'bg-red-500'
                                                                        : utilization > 90
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-emerald-500'
                                                                }`}
                                                                style={{ width: `${Math.min(utilization, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{utilization.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="w-4 h-4 text-slate-400" />
                                                        <span className="font-bold">{cc.assetCount}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">
                                                    ${cc.assetValue.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(cc.status)} w-fit`}>
                                                        {getStatusIcon(cc.status)}
                                                        <span>{cc.status.replace(&apos;-', ' ')}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

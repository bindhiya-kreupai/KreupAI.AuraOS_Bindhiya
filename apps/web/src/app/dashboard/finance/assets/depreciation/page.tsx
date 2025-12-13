"use client";

import React, { useState } from 'react';
import {
    Calculator,
    TrendingDown,
    Calendar,
    DollarSign,
    BarChart3,
    Download,
    RefreshCw,
    Clock,
    Building2,
    Laptop,
    Car,
    Filter
} from 'lucide-react';

type DepreciationMethod = 'all' | 'straight-line' | 'declining-balance' | 'sum-of-years' | 'units-of-production';

interface DepreciableAsset {
    id: string;
    name: string;
    assetType: 'equipment' | 'vehicles' | 'property' | 'furniture';
    purchaseDate: string;
    purchaseCost: number;
    salvageValue: number;
    usefulLife: number;
    currentAge: number;
    method: 'straight-line' | 'declining-balance' | 'sum-of-years' | 'units-of-production';
    annualDepreciation: number;
    accumulatedDepreciation: number;
    bookValue: number;
    remainingLife: number;
}

export default function DepreciationPage() {
    const [filter, setFilter] = useState<DepreciationMethod>('all');

    const assets: DepreciableAsset[] = [
        {
            id: 'DA-001',
            name: 'MacBook Pro M3 Fleet (25 units)',
            assetType: 'equipment',
            purchaseDate: '2024-01-15',
            purchaseCost: 87500,
            salvageValue: 17500,
            usefulLife: 4,
            currentAge: 0.9,
            method: 'straight-line',
            annualDepreciation: 17500,
            accumulatedDepreciation: 15750,
            bookValue: 71750,
            remainingLife: 3.1
        },
        {
            id: 'DA-002',
            name: 'Office Building - Floor 5',
            assetType: 'property',
            purchaseDate: '2018-03-10',
            purchaseCost: 1200000,
            salvageValue: 800000,
            usefulLife: 25,
            currentAge: 6.75,
            method: 'straight-line',
            annualDepreciation: 16000,
            accumulatedDepreciation: 108000,
            bookValue: 1092000,
            remainingLife: 18.25
        },
        {
            id: 'DA-003',
            name: 'Toyota Camry Fleet (5 units)',
            assetType: 'vehicles',
            purchaseDate: '2023-06-01',
            purchaseCost: 140000,
            salvageValue: 35000,
            usefulLife: 5,
            currentAge: 1.5,
            method: 'declining-balance',
            annualDepreciation: 28000,
            accumulatedDepreciation: 42000,
            bookValue: 98000,
            remainingLife: 3.5
        },
        {
            id: 'DA-004',
            name: 'Industrial Printer HP Z9+',
            assetType: 'equipment',
            purchaseDate: '2023-09-15',
            purchaseCost: 15000,
            salvageValue: 2000,
            usefulLife: 5,
            currentAge: 1.25,
            method: 'straight-line',
            annualDepreciation: 2600,
            accumulatedDepreciation: 3250,
            bookValue: 11750,
            remainingLife: 3.75
        },
        {
            id: 'DA-005',
            name: 'Conference Room Furniture Set',
            assetType: 'furniture',
            purchaseDate: '2022-11-20',
            purchaseCost: 35000,
            salvageValue: 7000,
            usefulLife: 10,
            currentAge: 2.1,
            method: 'straight-line',
            annualDepreciation: 2800,
            accumulatedDepreciation: 5880,
            bookValue: 29120,
            remainingLife: 7.9
        },
        {
            id: 'DA-006',
            name: 'Dell Server Rack - Datacenter',
            assetType: 'equipment',
            purchaseDate: '2021-08-10',
            purchaseCost: 85000,
            salvageValue: 15000,
            usefulLife: 7,
            currentAge: 3.3,
            method: 'declining-balance',
            annualDepreciation: 12857,
            accumulatedDepreciation: 42429,
            bookValue: 42571,
            remainingLife: 3.7
        },
        {
            id: 'DA-007',
            name: 'Manufacturing Equipment - CNC',
            assetType: 'equipment',
            purchaseDate: '2020-04-05',
            purchaseCost: 250000,
            salvageValue: 50000,
            usefulLife: 10,
            currentAge: 4.7,
            method: 'units-of-production',
            annualDepreciation: 20000,
            accumulatedDepreciation: 94000,
            bookValue: 156000,
            remainingLife: 5.3
        },
        {
            id: 'DA-008',
            name: 'Ford Transit Vans (3 units)',
            assetType: 'vehicles',
            purchaseDate: '2022-07-01',
            purchaseCost: 105000,
            salvageValue: 21000,
            usefulLife: 6,
            currentAge: 2.4,
            method: 'declining-balance',
            annualDepreciation: 17500,
            accumulatedDepreciation: 42000,
            bookValue: 63000,
            remainingLife: 3.6
        },
        {
            id: 'DA-009',
            name: 'Warehouse Shelving System',
            assetType: 'furniture',
            purchaseDate: '2023-02-15',
            purchaseCost: 45000,
            salvageValue: 9000,
            usefulLife: 12,
            currentAge: 1.8,
            method: 'straight-line',
            annualDepreciation: 3000,
            accumulatedDepreciation: 5400,
            bookValue: 39600,
            remainingLife: 10.2
        },
        {
            id: 'DA-010',
            name: 'HVAC System - Main Building',
            assetType: 'property',
            purchaseDate: '2019-11-01',
            purchaseCost: 125000,
            salvageValue: 25000,
            usefulLife: 15,
            currentAge: 5.1,
            method: 'straight-line',
            annualDepreciation: 6667,
            accumulatedDepreciation: 34001,
            bookValue: 90999,
            remainingLife: 9.9
        }
    ];

    const filteredAssets = filter === 'all'
        ? assets
        : assets.filter(a => a.method === filter);

    const getAssetTypeIcon = (type: string) => {
        switch (type) {
            case 'equipment':
                return <Laptop className="w-4 h-4" />;
            case 'vehicles':
                return <Car className="w-4 h-4" />;
            case 'property':
                return <Building2 className="w-4 h-4" />;
            default:
                return <BarChart3 className="w-4 h-4" />;
        }
    };

    const getAssetTypeColor = (type: string) => {
        switch (type) {
            case 'equipment':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'vehicles':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'property':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'furniture':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'straight-line':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'declining-balance':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'sum-of-years':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'units-of-production':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const totalPurchaseCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
    const totalBookValue = assets.reduce((sum, a) => sum + a.bookValue, 0);
    const totalDepreciation = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
    const totalAnnualExpense = assets.reduce((sum, a) => sum + a.annualDepreciation, 0);

    const stats = [
        {
            label: 'Total Book Value',
            value: `$${(totalBookValue / 1000).toFixed(0)}k`,
            icon: DollarSign,
            color: 'text-emerald-600',
            subtext: `Of $${(totalPurchaseCost / 1000).toFixed(0)}k original`
        },
        {
            label: 'Accumulated Depreciation',
            value: `$${(totalDepreciation / 1000).toFixed(0)}k`,
            icon: TrendingDown,
            color: 'text-red-600',
            subtext: `${((totalDepreciation / totalPurchaseCost) * 100).toFixed(1)}% of cost`
        },
        {
            label: 'Annual Expense',
            value: `$${(totalAnnualExpense / 1000).toFixed(0)}k`,
            icon: Calendar,
            color: 'text-indigo-600',
            subtext: 'Current year projection'
        },
        {
            label: 'Assets Tracked',
            value: assets.length,
            icon: BarChart3,
            color: 'text-blue-600',
            subtext: `${new Set(assets.map(a => a.method)).size} methods used`
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Asset Depreciation
                    </h1>
                    <p className="text-slate-500 text-sm">Track asset depreciation schedules and book values</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Calculator className="w-4 h-4" /> Calculate
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

            {/* Filters */}
            <div className="flex gap-2 shrink-0 overflow-x-auto">
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'all'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('all')}
                >
                    All Methods
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'straight-line'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('straight-line')}
                >
                    Straight-Line
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'declining-balance'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('declining-balance')}
                >
                    Declining Balance
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'sum-of-years'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('sum-of-years')}
                >
                    Sum of Years
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'units-of-production'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('units-of-production')}
                >
                    Units of Production
                </button>
            </div>

            {/* Depreciation Table */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4">Asset</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Purchase Cost</th>
                                    <th className="p-4">Salvage Value</th>
                                    <th className="p-4">Age/Life</th>
                                    <th className="p-4">Annual Depr.</th>
                                    <th className="p-4">Accumulated</th>
                                    <th className="p-4">Book Value</th>
                                    <th className="p-4">Remaining Life</th>
                                    <th className="p-4">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAssets.map((asset) => {
                                    const depreciationPercent = (asset.accumulatedDepreciation / (asset.purchaseCost - asset.salvageValue)) * 100;
                                    const lifeProgress = (asset.currentAge / asset.usefulLife) * 100;

                                    return (
                                        <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getAssetTypeColor(asset.assetType)}`}>
                                                        {getAssetTypeIcon(asset.assetType)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{asset.name}</div>
                                                        <div className="text-xs text-slate-500">
                                                            Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getAssetTypeColor(asset.assetType)}`}>
                                                    {asset.assetType}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getMethodColor(asset.method)}`}>
                                                    {asset.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono">${asset.purchaseCost.toLocaleString()}</td>
                                            <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                                                ${asset.salvageValue.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{asset.currentAge.toFixed(1)}y</span>
                                                    <span className="text-xs text-slate-500">of {asset.usefulLife}y</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-red-600 dark:text-red-400">
                                                -${asset.annualDepreciation.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                                        -${asset.accumulatedDepreciation.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {depreciationPercent.toFixed(1)}% of depreciable
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                ${asset.bookValue.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold">{asset.remainingLife.toFixed(1)}y</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                lifeProgress > 75
                                                                    ? 'bg-red-500'
                                                                    : lifeProgress > 50
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${lifeProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{lifeProgress.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

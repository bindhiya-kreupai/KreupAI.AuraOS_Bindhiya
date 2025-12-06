"use client";

import React, { useState } from 'react';
import {
    Monitor,
    Smartphone,
    Laptop,
    HardDrive,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    User,
    CheckCircle2,
    AlertCircle,
    Package
} from 'lucide-react';

// --- MOCK DATA ---

type AssetStatus = 'Assigned' | 'In Stock' | 'In Repair' | 'Retired';

interface Asset {
    id: string;
    name: string;
    model: string;
    category: 'Laptop' | 'Monitor' | 'Phone' | 'Peripherals';
    serial: string;
    purchaseDate: string;
    value: number;
    status: AssetStatus;
    assignedTo?: string;
    location?: string;
}

const ASSETS: Asset[] = [
    {
        id: 'AST-001',
        name: 'MacBook Pro 16"',
        model: 'M2 Max, 32GB RAM',
        category: 'Laptop',
        serial: 'FVFXG...',
        purchaseDate: 'Jan 15, 2024',
        value: 2499,
        status: 'Assigned',
        assignedTo: 'Sarah Jenkins',
        location: 'Remote (NY)'
    },
    {
        id: 'AST-002',
        name: 'Dell UltraSharp 27"',
        model: 'U2723QE',
        category: 'Monitor',
        serial: 'CN-0...',
        purchaseDate: 'Feb 10, 2024',
        value: 549,
        status: 'In Stock',
        location: 'HQ - IT Room'
    },
    {
        id: 'AST-003',
        name: 'iPhone 15 Pro',
        model: '256GB, Titanium',
        category: 'Phone',
        serial: 'G6T7...',
        purchaseDate: 'Mar 01, 2024',
        value: 1099,
        status: 'Assigned',
        assignedTo: 'Mike Ross',
        location: 'HQ - Sales Floor'
    },
    {
        id: 'AST-004',
        name: 'MacBook Air 13"',
        model: 'M1, 16GB RAM',
        category: 'Laptop',
        serial: 'C02...',
        purchaseDate: 'Jun 20, 2022',
        value: 1299,
        status: 'In Repair',
        location: 'Service Center'
    },
];

export default function AssetManagementPage() {
    const [filterCategory, setFilterCategory] = useState('All');

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'Laptop': return <Laptop className="w-5 h-5" />;
            case 'Monitor': return <Monitor className="w-5 h-5" />;
            case 'Phone': return <Smartphone className="w-5 h-5" />;
            default: return <HardDrive className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: AssetStatus) => {
        switch (status) {
            case 'Assigned': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'In Stock': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'In Repair': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Package className="w-6 h-6 text-celestial-indigo" />
                        Asset Management
                    </h1>
                    <p className="text-silver-mist text-sm">Track inventory, manage assignments, and monitor allocations.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Add Asset
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Total Assets</div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">142</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Assigned</div>
                    <div className="text-2xl font-bold text-emerald-500 mt-1">118</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">In Stock</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">20</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Total Value</div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">$245k</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-stellar-blue p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    <input
                        type="text"
                        placeholder="Search by tag, serial, or user..."
                        className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                    {['All', 'Laptop', 'Monitor', 'Phone', 'Peripherals'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === cat
                                    ? 'bg-celestial-indigo text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <button className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-celestial-indigo">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ASSETS.map(asset => (
                    <div key={asset.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-xl ${asset.category === 'Laptop' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                        asset.category === 'Phone' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {getIcon(asset.category)}
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(asset.status)}`}>
                                    {asset.status}
                                </div>
                            </div>

                            <h3 className="font-bold text-ink-black dark:text-pearl truncate">{asset.name}</h3>
                            <div className="text-sm text-silver-mist mb-4 truncate">{asset.model}</div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-silver-mist">Tag ID</span>
                                    <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{asset.id}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-silver-mist">Value</span>
                                    <span className="font-medium text-slate-600 dark:text-slate-300">${asset.value}</span>
                                </div>
                                {asset.assignedTo && (
                                    <div className="flex justify-between text-xs items-center pt-2 border-t border-cloud dark:border-nebula-purple/20">
                                        <span className="text-silver-mist">Holder</span>
                                        <div className="flex items-center gap-1.5 font-bold text-ink-black dark:text-pearl">
                                            <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[8px] text-indigo-700">
                                                {asset.assignedTo.charAt(0)}
                                            </div>
                                            {asset.assignedTo}
                                        </div>
                                    </div>
                                )}
                                {!asset.assignedTo && (
                                    <div className="flex justify-between text-xs items-center pt-2 border-t border-cloud dark:border-nebula-purple/20">
                                        <span className="text-silver-mist">Location</span>
                                        <span className="text-slate-600 dark:text-slate-300">{asset.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-3 border-t border-cloud dark:border-nebula-purple/20 bg-slate-50/50 dark:bg-deep-cosmos/30 rounded-b-2xl">
                            <button className="w-full py-1.5 text-xs font-bold text-celestial-indigo hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                {asset.status === 'In Stock' ? 'Allocate Asset' : 'View Details'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

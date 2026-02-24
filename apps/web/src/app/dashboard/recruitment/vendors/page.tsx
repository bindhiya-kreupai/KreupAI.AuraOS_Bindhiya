"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../services';
import {
    Briefcase,
    Plus,
    Building2,
    Star,
    Clock,
    DollarSign,
    MoreHorizontal,
    Phone,
    Mail,
    CheckCircle2,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// --- MOCK DATA ---

interface Vendor {
    id: string;
    name: string;
    type: 'Agency' | 'Contractor' | 'Platform';
    specialization: string;
    status: 'Active' | 'Review' | 'Expired';
    contact: {
        name: string;
        email: string;
        phone: string;
    };
    metrics: {
        candidatesSubmitted: number;
        hires: number;
        avgTimeToFill: string;
        rating: number; // 1-5
    };
}

const VENDORS: Vendor[] = [
    {
        id: 'VEN-001',
        name: 'Apex Recruiters',
        type: 'Agency',
        specialization: 'Tech & Engineering',
        status: 'Active',
        contact: { name: 'Sarah Connor', email: 'sarah@apex.com', phone: '+1 555-0123' },
        metrics: { candidatesSubmitted: 45, hires: 12, avgTimeToFill: '18 Days', rating: 4.8 }
    },
    {
        id: 'VEN-002',
        name: 'Global Talent Sol.',
        type: 'Agency',
        specialization: 'Executive Search',
        status: 'Active',
        contact: { name: 'Mike Ross', email: 'mike@gts.com', phone: '+1 555-0987' },
        metrics: { candidatesSubmitted: 15, hires: 3, avgTimeToFill: '45 Days', rating: 4.2 }
    },
    {
        id: 'VEN-003',
        name: 'FastStaffing Inc.',
        type: 'Contractor',
        specialization: 'Admin & Support',
        status: 'Review',
        contact: { name: 'Jenny Doe', email: 'jenny@faststaff.com', phone: '+1 555-4567' },
        metrics: { candidatesSubmitted: 60, hires: 8, avgTimeToFill: '12 Days', rating: 3.5 }
    },
];

const SPEND_DATA = [
    { name: 'Apex', amount: 125000 },
    { name: 'GTS', amount: 85000 },
    { name: 'FastStaff', amount: 45000 },
    { name: 'Others', amount: 20000 },
];

export default function VendorManagementPage() {
    const [vendors, setVendors] = useState<Vendor[]>(VENDORS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await RecruitmentSettingsService.getSettings();
            if (data) {
                // Vendor data would be part of recruitment settings
                // For now keeping mock data
                setVendors(VENDORS);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-celestial-indigo" />
                        Vendor Management
                    </h1>
                    <p className="text-silver-mist text-sm">Manage recruitment partners, contracts, and performance.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Add Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Top Level Stats */}
                <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">23</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Total Hires (YTD)</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">$275k</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Agency Spend</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">22 Days</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Avg Time to Fill</div>
                        </div>
                    </div>
                </div>

                {/* Vendor List */}
                <div className="md:col-span-3 space-y-4">
                    {vendors.map(vendor => (
                        <div key={vendor.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">
                                        {vendor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">{vendor.name}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {vendor.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-silver-mist flex items-center gap-2">
                                            <span>{vendor.type}</span>
                                            <span>•</span>
                                            <span>{vendor.specialization}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Call">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Email">
                                        <Mail className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-deep-cosmos/30 rounded-xl">
                                <div>
                                    <div className="text-[10px] text-silver-mist uppercase font-bold mb-1">Submitted</div>
                                    <div className="font-bold text-ink-black dark:text-pearl">{vendor.metrics.candidatesSubmitted}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-silver-mist uppercase font-bold mb-1">Hired</div>
                                    <div className="font-bold text-emerald-600">{vendor.metrics.hires}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-silver-mist uppercase font-bold mb-1">Speed</div>
                                    <div className="font-bold text-ink-black dark:text-pearl">{vendor.metrics.avgTimeToFill}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-silver-mist uppercase font-bold mb-1">Quality</div>
                                    <div className="flex items-center gap-1 font-bold text-amber-500">
                                        {vendor.metrics.rating} <Star className="w-3 h-3 fill-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Spend Analysis Widget */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-full">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Spend Breakdown</h3>
                        <div className="h-48 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={SPEND_DATA} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Insight
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                <span className="font-bold">Apex Recruiters</span> provides the best ROI with high volume and quality scores.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState } from 'react';
import {
    Scale,
    Building2,
    Landmark,
    Calendar,
    CheckCircle2,
    Save,
    AlertCircle,
    ChevronDown,
    Plus,
    Trash2,
    Edit2,
    Info,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const STATUTORY_UPDATES = [
    { id: 1, title: 'PF Challan Due', date: 'Dec 15', status: 'Pending', type: 'Urgent' },
    { id: 2, title: 'ESI Return Filing', date: 'Dec 20', status: 'Pending', type: 'Normal' },
    { id: 3, title: 'PT Payment (Karnataka)', date: 'Dec 25', status: 'Done', type: 'Normal' },
];

const PT_SLABS = [
    { min: 0, max: 14999, amount: 0 },
    { min: 15000, max: 24999, amount: 200 },
    { min: 25000, max: 9999999, amount: 200 }, // 200 flat for > 15k usually, just mock
];

export default function StatutoryPage() {
    const [activeTab, setActiveTab] = useState<'PF' | 'ESI' | 'Professional Tax' | 'Gratuity'>('PF');
    const [ptState, setPtState] = useState('Karnataka');

    // PF State
    const [pfConfig, setPfConfig] = useState({
        enabled: true,
        number: 'PY/KRP/0012345/000',
        signatory: 'John Doe',
        restrictEmployerShare: true,
        includeAdminCharges: false
    });

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Statutory Configuration
                    </h1>
                    <p className="text-silver-mist text-sm">Manage legal compliance for PF, ESI, PT, and Gratuity.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Main Configuration */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit overflow-x-auto">
                        {['PF', 'ESI', 'Professional Tax', 'Gratuity'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab
                                        ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                            {/* Decorative Background Icon */}
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                {activeTab === 'PF' && <Landmark className="w-64 h-64" />}
                                {activeTab === 'ESI' && <ShieldCheck className="w-64 h-64" />}
                                {activeTab === 'Professional Tax' && <Building2 className="w-64 h-64" />}
                                {activeTab === 'Gratuity' && <Scale className="w-64 h-64" />}
                            </div>

                            {activeTab === 'PF' && (
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Employees' Provident Fund (EPF)</h2>
                                            <p className="text-sm text-silver-mist">Configure EPF account details and calculation logic.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-500">Enable PF</span>
                                            <button
                                                onClick={() => setPfConfig({ ...pfConfig, enabled: !pfConfig.enabled })}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors ${pfConfig.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pfConfig.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">EPF Number</label>
                                            <input
                                                type="text"
                                                value={pfConfig.number}
                                                onChange={(e) => setPfConfig({ ...pfConfig, number: e.target.value })}
                                                className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Authorized Signatory</label>
                                            <input
                                                type="text"
                                                value={pfConfig.signatory}
                                                onChange={(e) => setPfConfig({ ...pfConfig, signatory: e.target.value })}
                                                className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide border-b border-cloud dark:border-slate-800 pb-2">Calculation Rules</h3>

                                        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                            <input
                                                type="checkbox"
                                                checked={pfConfig.restrictEmployerShare}
                                                onChange={(e) => setPfConfig({ ...pfConfig, restrictEmployerShare: e.target.checked })}
                                                className="w-5 h-5 mt-0.5 accent-indigo-500"
                                            />
                                            <div>
                                                <div className="text-sm font-bold text-ink-black dark:text-pearl">Restrict Employer's Contribution</div>
                                                <div className="text-xs text-silver-mist mt-1">
                                                    Limit employer's contribution to ₹1,800 (12% of ₹15,000) even if Basic Salary is higher.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                            <input
                                                type="checkbox"
                                                checked={pfConfig.includeAdminCharges}
                                                onChange={(e) => setPfConfig({ ...pfConfig, includeAdminCharges: e.target.checked })}
                                                className="w-5 h-5 mt-0.5 accent-indigo-500"
                                            />
                                            <div>
                                                <div className="text-sm font-bold text-ink-black dark:text-pearl">Include Admin Charges in CTC</div>
                                                <div className="text-xs text-silver-mist mt-1">
                                                    Recover PF Admin Charges (0.5%) and EDLI Charges (0.5%) from employee's CTC pool.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Professional Tax' && (
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Professional Tax (PT)</h2>
                                            <p className="text-sm text-silver-mist">Manage state-wise PT slabs and deductibility.</p>
                                        </div>
                                        <div className="relative">
                                            <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <select
                                                value={ptState}
                                                onChange={(e) => setPtState(e.target.value)}
                                                className="pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer"
                                            >
                                                <option>Karnataka</option>
                                                <option>Maharashtra</option>
                                                <option>Tamil Nadu</option>
                                                <option>Telangana</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="overflow-hidden border border-cloud dark:border-slate-800 rounded-xl">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold">
                                                <tr>
                                                    <th className="p-4">Monthly Gross Salary (min)</th>
                                                    <th className="p-4">Monthly Gross Salary (max)</th>
                                                    <th className="p-4">PT Amount</th>
                                                    <th className="p-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-cloud dark:divide-slate-800">
                                                {PT_SLABS.map((slab, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                                        <td className="p-4 font-mono">₹{slab.min.toLocaleString()}</td>
                                                        <td className="p-4 font-mono">{slab.max > 900000 ? 'No Limit' : `₹${slab.max.toLocaleString()}`}</td>
                                                        <td className="p-4 font-bold text-indigo-500">₹{slab.amount}</td>
                                                        <td className="p-4 text-right">
                                                            <button className="text-slate-400 hover:text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-cloud dark:border-slate-800 text-center">
                                            <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-2">
                                                <Plus className="w-4 h-4" /> Add New Slab
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 flex gap-3">
                                        <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-800 dark:text-amber-300">
                                            <strong>Note:</strong> Professional Tax configuration typically generally requires location based mapping. Ensure work locations are correctly mapped to states in Employee Directory.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'ESI' || activeTab === 'Gratuity') && (
                                <div className="flex flex-col items-center justify-center h-64 text-center opacity-60">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                        <Scale className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="font-bold text-ink-black dark:text-pearl mb-1">Standard Configuration</h3>
                                    <p className="text-sm text-silver-mist">Default government rules will be applied.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Compliance Calendar */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Calendar Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" /> Compliance Calendar
                            </h3>
                            <span className="text-xs font-bold text-slate-400">December 2024</span>
                        </div>

                        <div className="space-y-3">
                            {STATUTORY_UPDATES.map(update => (
                                <div key={update.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 flex gap-3 items-center group">
                                    <div className={`w-12 h-12 rounded-lg ${update.type === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'} flex flex-col items-center justify-center shrink-0`}>
                                        <span className="text-[10px] font-bold uppercase tracking-wider block">Dec</span>
                                        <span className="text-lg font-black leading-none">{update.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl truncate">{update.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${update.status === 'Done' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            <span className="text-xs text-silver-mist">{update.status}</span>
                                        </div>
                                    </div>
                                    {update.status !== 'Done' && (
                                        <button className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-500 transition-colors">
                            View Annual Calendar
                        </button>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex-1">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> Audits
                        </h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                            Last statutory audit was completed on <strong>Sep 30, 2024</strong>. No non-compliance issues were flagged.
                        </p>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-indigo-500 h-full w-3/4"></div>
                        </div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-right">Q3 Review in progress</div>
                    </div>
                </div>
            </div>
        </div>
    );
}


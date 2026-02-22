"use client";

import React, { useState } from 'react';
import {
    PlusCircle,
    Save,
    DollarSign,
    Users
} from 'lucide-react';

export default function PositionCreationPage() {
    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PlusCircle className="w-6 h-6 text-indigo-500" />
                        Position Creation
                    </h1>
                    <p className="text-slate-500 text-sm">Request and configure new headcount positions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        <Save className="w-4 h-4" /> Submit Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-6">Position Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Position Title</label>
                                <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Senior Product Manager" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>Engineering</option>
                                    <option>Marketing</option>
                                    <option>Sales</option>
                                    <option>HR</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Reports To</label>
                                <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Manager Name" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Job Grade</label>
                                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>L1 - Entry</option>
                                    <option>L2 - Associate</option>
                                    <option>L3 - Senior</option>
                                    <option>L4 - Principal</option>
                                    <option>L5 - Director</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">FTE Count</label>
                                <input type="number" defaultValue={1} min={0.5} step={0.5} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-6">Budget Impact</h3>
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Estimated Annual Cost</div>
                                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-500">$120,000 - $145,000</div>
                                <div className="text-xs text-emerald-600/80 mt-1">Includes base salary + standard benefits load (25%).</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-4">Approval Chain</h3>
                        <div className="relative pl-4 space-y-4 border-l-2 border-slate-100 dark:border-slate-800">
                            {[
                                { role: 'Hiring Manager', status: 'Pending', time: '-' },
                                { role: 'Department Head', status: 'Pending', time: '-' },
                                { role: 'Finance Controller', status: 'Pending', time: '-' },
                            ].map((step, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="text-sm font-bold">{step.role}</div>
                                    <div className="text-xs text-slate-400">{step.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                        <h3 className="font-bold mb-2 flex items-center gap-2"><Users className="w-5 h-5" /> Recruiting Slot</h3>
                        <p className="text-xs text-indigo-100 mb-4">Once approved, this position will automatically sync to the ATS and Job Board.</p>
                        <div className="flex items-center gap-2 text-xs font-bold bg-indigo-700/50 p-2 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> ATS Connected
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


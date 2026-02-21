"use client";

import React, { useState, useEffect } from 'react';
import {
    FilePlus,
    Save,
    Eye,
    Upload,
    Type,
    Loader2
} from 'lucide-react';
import { PolicySettingsService } from '../services';
import type { PolicySettings } from '../types';

export default function PolicyCreationPage() {
    const [settings, setSettings] = useState<PolicySettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await PolicySettingsService.get();
                setSettings(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FilePlus className="w-6 h-6 text-indigo-500" />
                        Create New Policy
                    </h1>
                    <p className="text-slate-500 text-sm">Draft, format, and configure new organizational policies.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Policy Title</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg" placeholder="e.g. Remote Work Policy 2025" />

                        <div className="mt-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Content</label>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                {/* Mock Toolbar */}
                                <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-2 flex gap-2">
                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"><Type className="w-4 h-4" /></button>
                                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-2"></div>
                                    <button className="text-xs font-bold px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">Bold</button>
                                    <button className="text-xs font-bold px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">Italic</button>
                                </div>
                                <textarea className="w-full h-96 p-4 bg-white dark:bg-slate-950 resize-none outline-none" placeholder="Start typing your policy content here..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-4">Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Effective Date</label>
                                <input type="date" className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                                <select className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm">
                                    <option>HR & Compliance</option>
                                    <option>IT Security</option>
                                    <option>Procurement</option>
                                    <option>Code of Conduct</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Applicability</label>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className="rounded text-indigo-600" defaultChecked /> Full Time Employees
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className="rounded text-indigo-600" /> Contractors
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className="rounded text-indigo-600" defaultChecked /> Interns
                                    </label>
                                </div>
                            </div>

                            {settings && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-xs text-slate-400 mb-2">Approval Levels Required: <span className="font-bold text-slate-600 dark:text-slate-300">{settings.approvalSettings?.levelsRequired || 2}</span></div>
                                    <div className="text-xs text-slate-400">Auto Distribute: <span className="font-bold text-slate-600 dark:text-slate-300">{settings.distributionSettings?.autoDistribute ? 'Yes' : 'No'}</span></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-4">Attachments</h3>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 mx-auto mb-2 transition-colors" />
                            <p className="text-xs text-slate-500">Click to upload PDF or DOCX</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

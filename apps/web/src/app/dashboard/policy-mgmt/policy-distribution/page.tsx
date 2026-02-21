"use client";

import React, { useState, useEffect } from 'react';
import {
    Send,
    Users,
    Mail,
    Globe,
    Filter,
    Loader2
} from 'lucide-react';
import { PolicyService, PolicySettingsService } from '../services';
import type { Policy, PolicySettings } from '../types';

export default function PolicyDistributionPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [settings, setSettings] = useState<PolicySettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [policiesData, settingsData] = await Promise.all([
                    PolicyService.getAll(),
                    PolicySettingsService.get(),
                ]);
                setPolicies(policiesData);
                setSettings(settingsData);
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

    const publishedCount = policies.filter(p => p.status === 'published').length;

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Send className="w-6 h-6 text-indigo-500" />
                        Policy Distribution
                    </h1>
                    <p className="text-slate-500 text-sm">Target and publish policies to specific employee groups. ({publishedCount} published policies)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Select Audience</h3>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                <div className="font-bold text-indigo-900 dark:text-indigo-100">All Employees</div>
                            </div>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 ml-8">Distribute to the entire organization.</p>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 dark:border-slate-800 bg-white dark:bg-slate-950 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-slate-500" />
                                <div className="font-bold">Specific Departments</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 dark:border-slate-800 bg-white dark:bg-slate-950 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-slate-500" />
                                <div className="font-bold">Location Based</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Notification Settings</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 cursor-pointer transition-colors">
                                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600" defaultChecked={settings?.notifications?.policyPublished ?? true} />
                                <div className="flex-1">
                                    <div className="font-bold text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Email Notification</div>
                                    <div className="text-xs text-slate-500">Send an email alert to all recipients.</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 cursor-pointer transition-colors">
                                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600" defaultChecked={settings?.complianceSettings?.trackAcknowledgement ?? true} />
                                <div className="flex-1">
                                    <div className="font-bold text-sm">Require Acknowledgement</div>
                                    <div className="text-xs text-slate-500">Mandatory read receipt and signature.</div>
                                </div>
                            </label>
                        </div>
                        {settings && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                                Reminder frequency: every {settings.distributionSettings?.reminderFrequencyDays || 7} days
                            </div>
                        )}
                    </div>

                    <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95">
                        Distribute Policy
                    </button>
                </div>
            </div>
        </div>
    );
}

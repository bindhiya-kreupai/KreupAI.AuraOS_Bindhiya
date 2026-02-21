"use client";

import React, { useState, useEffect } from 'react';
import {
    History,
    ArrowRight,
    FileText,
    Loader2
} from 'lucide-react';
import { PolicyService } from '../services';
import type { Policy } from '../types';

export default function PolicyUpdatesPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await PolicyService.getAll();
                setPolicies(data);
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

    // Build update timeline from policies
    const updates = policies.map(p => ({
        version: `v${p.version}`,
        date: p.updatedAt || p.createdAt,
        title: `${p.policyName} Updated`,
        desc: `Version ${p.version} of ${p.policyName} (${p.policyNumber}).`,
        author: p.createdBy || 'System',
    }));

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Policy Updates
                    </h1>
                    <p className="text-slate-500 text-sm">Track version history and changelogs.</p>
                </div>
            </div>

            {updates.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No policy updates found.</div>
            ) : (
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-6 space-y-12">
                    {updates.map((update, i) => (
                        <div key={i} className="relative pl-8">
                            {/* Dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-full"></div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-xs font-bold">{update.version}</span>
                                        <span className="text-xs text-slate-400 font-bold">{update.date ? new Date(update.date).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">by {update.author}</span>
                                </div>

                                <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-indigo-100">{update.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">{update.desc}</p>

                                <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
                                    View Changes <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

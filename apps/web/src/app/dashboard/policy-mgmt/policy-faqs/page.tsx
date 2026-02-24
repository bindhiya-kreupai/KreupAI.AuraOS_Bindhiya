"use client";

import React, { useState, useEffect } from 'react';
import {
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    Loader2
} from 'lucide-react';
import { PolicyService } from '../services';
import type { Policy } from '../types';

export default function PolicyFAQsPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

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

    const toggle = (id: number) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Build FAQs from policies data
    const FAQs = policies.length > 0
        ? policies.map((p, i) => ({
            id: i + 1,
            q: `What does the ${p.policyName} cover?`,
            a: p.content || `This policy (${p.policyNumber}) covers organizational guidelines related to ${p.category}. It was effective from ${p.effectiveDate}.`,
        }))
        : [];

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-indigo-500" />
                        Policy FAQs
                    </h1>
                    <p className="text-slate-500 text-sm">Common questions and answers regarding company policies.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search for answers..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
                {FAQs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No policy FAQs available yet.</div>
                ) : (
                    FAQs.map(faq => (
                        <div key={faq.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer" onClick={() => toggle(faq.id)}>
                            <div className="p-6 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-colors">
                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">{faq.q}</h3>
                                {expandedIds.includes(faq.id) ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>
                            {expandedIds.includes(faq.id) && (
                                <div className="p-6 text-slate-500 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top-1">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


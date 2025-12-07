"use client";

import React, { useState } from 'react';
import {
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function PolicyFAQsPage() {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggle = (id: number) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const FAQs = [
        { id: 1, q: 'How do I request an exception to the Remote Work Policy?', a: 'You can submit an exception request via the "Request Center" under the "Exceptions" category. This will trigger an approval workflow involving your manager and HR.' },
        { id: 2, q: 'Are travel expenses reimbursed for daily commute?', a: 'No, daily commute expenses are not reimbursable under the current Travel Policy. Only travel for business meetings away from your primary office location is covered.' },
        { id: 3, q: 'Where can I find the holiday calendar for my region?', a: 'The holiday calendar is available in the "Leave & Attendance" module. It is automatically filtered based on your tagged location.' },
        { id: 4, q: 'What is the dress code policy?', a: 'We follow a "Business Casual" dress code from Monday to Thursday, and "Casual Fridays". Please refer to the Code of Conduct document for specific examples.' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                {FAQs.map(faq => (
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
                ))}
            </div>
        </div>
    );
}

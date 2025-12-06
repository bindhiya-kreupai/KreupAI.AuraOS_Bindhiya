"use client";

import React, { useState } from 'react';
import {
    Book,
    Search,
    ChevronRight,
    FileText
} from 'lucide-react';

export default function KnowledgeBasePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header with Search */}
            <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold mb-2">How can we help you today?</h1>
                <p className="text-indigo-100 mb-6">Search our knowledge base for answers to common questions.</p>
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for articles, policies, or guides..."
                        className="w-full pl-12 pr-6 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { cat: 'Payroll & Taxes', articles: ['How to download Form 16', 'Understanding your salary slip', 'Tax saving investment proof guide'] },
                    { cat: 'Leave & Attendance', articles: ['Leave policy 2024', 'How to apply for maternity leave', 'Work from home guidelines'] },
                    { cat: 'Employee Benefits', articles: ['Medical insurance coverage details', 'Claiming gym reimbursement', 'Corporate discount program'] },
                    { cat: 'IT Support', articles: ['Resetting your domain password', 'VPN configuration guide', 'Requesting new software'] },
                    { cat: 'Travel & Expense', articles: ['Travel policy overview', 'Submitting expense reports', 'Hotel booking limits'] },
                ].map((section, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Book className="w-5 h-5 text-indigo-500" />
                            {section.cat}
                        </h3>
                        <ul className="space-y-3">
                            {section.articles.map((art, j) => (
                                <li key={j} className="flex items-start gap-2 group cursor-pointer">
                                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-indigo-500" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline">
                                        {art}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

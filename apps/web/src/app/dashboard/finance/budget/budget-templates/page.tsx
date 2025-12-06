"use client";

import React, { useState } from 'react';
import {
    LayoutTemplate,
    Download,
    Eye
} from 'lucide-react';

export default function BudgetTemplatesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-indigo-500" />
                        Budget Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Standardized templates for departmental forecasting.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Standard Dept Budget', desc: 'Basic OPEX and CAPEX planning sheet.', format: 'Excel' },
                    { title: 'Headcount Plan 2024', desc: 'Role-based hiring projection template.', format: 'Google Sheets' },
                    { title: 'Event Cost Calculator', desc: 'Detailed breakdown for offsites and conferences.', format: 'Excel' },
                ].map((tmpl, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                            <LayoutTemplate className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{tmpl.title}</h3>
                        <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{tmpl.desc}</p>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200">
                                <Eye className="w-4 h-4" /> Preview
                            </button>
                            <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700">
                                <Download className="w-4 h-4" /> Use
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

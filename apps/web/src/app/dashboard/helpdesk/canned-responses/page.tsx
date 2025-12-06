"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Copy,
    Edit3,
    Trash2,
    Plus
} from 'lucide-react';

export default function CannedResponsesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Canned Responses
                    </h1>
                    <p className="text-slate-500 text-sm">Manage standard reply templates for faster resolution.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Password Reset', category: 'IT Support', content: 'Hello [Name], You can reset your password by visiting the following link...', uses: 1240 },
                    { title: 'Leave Policy Gaps', category: 'HR Policy', content: 'Hi [Name], according to our policy, leave encashment is only applicable...', uses: 856 },
                    { title: 'Insurance Enrollment', category: 'Benefits', content: 'The enrollment window is open until [Date]. Please login to the portal...', uses: 432 },
                    { title: 'Payslip Query', category: 'Payroll', content: 'Payslips are generated on the 25th of each month. You can view them at...', uses: 2105 },
                ].map((tmpl, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                {tmpl.category}
                            </span>
                            <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-500"><Edit3 className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{tmpl.title}</h3>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-500 italic mb-4 flex-1">
                            "{tmpl.content}"
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <span className="text-xs font-bold text-slate-400">{tmpl.uses} Uses</span>
                            <button className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

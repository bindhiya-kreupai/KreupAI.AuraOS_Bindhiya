"use client";

import React, { useState, useEffect } from 'react';
import { JobOfferService } from '../../services';
import {
    FileText,
    Plus,
    Copy,
    Edit3,
    Eye,
    Save,
    MoreVertical,
    Variable,
    CheckCircle2
} from 'lucide-react';

const TEMPLATES = [
    { id: 'TPL-001', name: 'Software Engineer Offer', type: 'Full-Time', lastUpdated: '2 days ago', status: 'Active' },
    { id: 'TPL-002', name: 'Sales Associate Offer', type: 'Full-Time', lastUpdated: '1 month ago', status: 'Active' },
    { id: 'TPL-003', name: 'Internship Agreement', type: 'Internship', lastUpdated: '5 days ago', status: 'Draft' },
];

export default function OfferTemplatesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Offer Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Standardize offer letters with dynamic fields.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {TEMPLATES.map(tpl => (
                    <div key={tpl.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${tpl.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                                `}>
                                    {tpl.status}
                                </span>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{tpl.name}</h3>
                        <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{tpl.type}</span>
                            <span>• Updated {tpl.lastUpdated}</span>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" /> Preview
                            </button>
                        </div>
                    </div>
                ))}

                {/* Tips Card */}
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl flex flex-col justify-center">
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <Variable className="w-5 h-5" /> Dynamic Variables
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                        Use placeholders like <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 mx-1">{'{salary}'}</code>
                        and <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 mx-1">{'{joining_date}'}</code> to auto-fill candidate details.
                    </p>
                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-left">View Variable Guide &rarr;</button>
                </div>
            </div>
        </div>
    );
}

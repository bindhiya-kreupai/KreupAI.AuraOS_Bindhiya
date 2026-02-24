"use client";

import React, { useState } from 'react';
import {
    FileText,
    Copy,
    Edit3,
    Eye
} from 'lucide-react';

export default function JobPostingTemplatesPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Job Posting Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Standardized templates for job advertisements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { name: 'Standard Engineering Role', type: 'Engineering', sections: ['About Us', 'Responsibilities', 'Requirements', 'Benefits'], lastUsed: '2h ago' },
                    { name: 'Sales Representative', type: 'Sales', sections: ['The Opportunity', 'What You\'ll Do', 'Ideal Candidate', 'Perks'], lastUsed: '5d ago' },
                    { name: 'Executive Leadership', type: 'Executive', sections: ['Company Vision', 'Role Overview', 'Strategic Impact'], lastUsed: '2w ago' },
                    { name: 'Internship Program', type: 'Early Talent', sections: ['Program Details', 'Learning Outcomes', 'Requirements'], lastUsed: '1d ago' },
                ].map((tmpl, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500" title="Preview"><Eye className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500" title="Edit"><Edit3 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-1">{tmpl.name}</h3>
                        <p className="text-xs font-bold text-indigo-600 uppercase mb-4">{tmpl.type}</p>

                        <div className="space-y-1 mb-6">
                            {tmpl.sections.map((sec, j) => (
                                <div key={j} className="text-sm text-slate-500 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {sec}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <span className="text-xs text-slate-400">Used {tmpl.lastUsed}</span>
                            <button className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                                <Copy className="w-3 h-3" /> Use Template
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


"use client";

import React, { useState } from 'react';
import {
    Briefcase,
    User,
    MessageSquare,
    Paperclip
} from 'lucide-react';

export default function CaseManagementPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Case Management
                    </h1>
                    <p className="text-slate-500 text-sm">Manage complex employee cases requiring multi-step resolution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
                {/* Case List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:col-span-1">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold">Active Cases (3)</div>
                    <div className="overflow-y-auto flex-1 h-[600px]">
                        {[
                            { id: 'CASE-902', title: 'Workplace Harassment Investigation', status: 'Investigation', priority: 'High', date: '2d ago' },
                            { id: 'CASE-895', title: 'Long-term Disability Claim', status: 'Pending Docs', priority: 'Medium', date: '5d ago' },
                            { id: 'CASE-905', title: 'Relocation Assistance - London', status: 'Approval', priority: 'Medium', date: 'Today' },
                        ].map((c, i) => (
                            <div key={i} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-400">{c.id}</span>
                                    <span className="text-xs text-slate-400">{c.date}</span>
                                </div>
                                <h4 className="font-bold text-sm mb-2">{c.title}</h4>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-bold">{c.status}</span>
                                    {c.priority === 'High' && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-bold">High Priority</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Case Detail View */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-2 flex flex-col h-[653px]">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-bold">CASE-902: Workplace Harassment Investigation</h2>
                            <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Close Case</button>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> Reported by: Anonymous</span>
                            <span>|</span>
                            <span>Assignee: Sarah Connor (HRBP)</span>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">SYS</div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl rounded-tl-none max-w-[80%]">
                                <p className="text-sm">Case created via Ethics Hotline submission.</p>
                                <span className="text-xs text-slate-400 mt-1 block">Oct 22, 10:00 AM</span>
                            </div>
                        </div>

                        <div className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">SC</div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl rounded-tr-none max-w-[80%]">
                                <p className="text-sm">Initial interview scheduled with the reporter for Oct 25th.</p>
                                <span className="text-xs text-indigo-400 mt-1 block">Oct 22, 11:30 AM</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Paperclip className="w-5 h-5" /></button>
                        <input
                            type="text"
                            placeholder="Add internal note or update..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"><MessageSquare className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}


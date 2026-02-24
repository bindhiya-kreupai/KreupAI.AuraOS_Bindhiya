"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    FileText,
    Settings,
    Clock,
    DollarSign,
    Briefcase
} from 'lucide-react';

export default function ContractTypesPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Contract Configurations
                    </h1>
                    <p className="text-slate-500 text-sm">Define engagement models and standard terms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[
                    { title: 'Time & Materials (T&M)', desc: 'Pay based on hourly rates and actual hours worked. Best for flexible scope projects.', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { title: 'Fixed Bid / Project Based', desc: 'Set price for specific deliverables. Best for well-defined scopes.', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { title: 'Retainer', desc: 'Fixed monthly fee for ongoing services or reserved capacity.', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { title: 'Staff Augmentation', desc: 'External staff working under internal management.', icon: UsersIcon, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map((type, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${type.bg} ${type.color}`}>
                                <type.icon className="w-6 h-6" />
                            </div>
                            <Settings className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">{type.title}</h3>
                        <p className="text-slate-500 text-sm mb-6 flex-1">
                            {type.desc}
                        </p>
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Notice Period</span>
                                <span className="font-bold">Standard (30 Days)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Payment Terms</span>
                                <span className="font-bold">Net 45</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> }


"use client";

import React from 'react';
import {
    BellRing,
    Plus,
    Volume2,
    Mail,
    Smartphone,
    Trash2,
    Edit2
} from 'lucide-react';

export default function AlertRulesPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BellRing className="w-6 h-6 text-amber-500" />
                        Security Alert Rules
                    </h1>
                    <p className="text-slate-500 text-sm">Configure automated triggers and notifications for suspicious activities.</p>
                </div>
                <button className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-200 dark:shadow-amber-900/20 hover:bg-amber-600 transition-all">
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20">
                {[
                    { name: 'Multiple Failed Logins', condition: 'Failed attempts > 5 in 10 mins', severity: 'High', channels: ['Email', 'SMS'], status: true },
                    { name: 'Access from New Country', condition: 'User logs in from unknown geo-ip', severity: 'Medium', channels: ['Email'], status: true },
                    { name: 'Bulk Data Export', condition: 'Download > 500 records', severity: 'Critical', channels: ['Email', 'Slack', 'SMS'], status: true },
                    { name: 'After Hours Access', condition: 'Login between 12 AM - 5 AM', severity: 'Low', channels: ['Log Only'], status: false },
                    { name: 'Privilege Escalation', condition: 'Role changed to Admin', severity: 'Critical', channels: ['Email', 'SMS'], status: true },
                ].map((rule, i) => (
                    <div key={i} className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border ${rule.status ? 'border-slate-200 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800/50 opacity-70'} flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all hover:shadow-md`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{rule.name}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                                    ${rule.severity === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                        rule.severity === 'High' ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-100 text-slate-600'}
                                `}>{rule.severity}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 inline-block px-2 py-1 rounded">{rule.condition}</p>
                        </div>

                        <div className="flex items-center gap-3 text-slate-400">
                            {rule.channels.includes('Email') && <Mail className="w-4 h-4" />}
                            {rule.channels.includes('SMS') && <Smartphone className="w-4 h-4" />}
                            {rule.channels.includes('Slack') && <Volume2 className="w-4 h-4" />}
                            <span className="text-xs font-bold">{rule.channels.length} Channels</span>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
                            <div className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${rule.status ? 'bg-emerald-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}


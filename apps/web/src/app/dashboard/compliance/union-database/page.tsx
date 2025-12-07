"use client";

import React, { useState } from 'react';
import {
    Users,
    FileText,
    Phone,
    Building2
} from 'lucide-react';

export default function UnionDatabasePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Union Database
                    </h1>
                    <p className="text-slate-500 text-sm">Directory of union locals and representative contacts.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                    Add Local
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { name: 'Local 42 - Logistics', rep: 'Frank Sobotka', members: 450, contract: 'Exp. 2026', status: 'Active' },
                    { name: 'Local 101 - Manufacturing', rep: 'Norma Rae', members: 1200, contract: 'Negotiating', status: 'Warning' },
                    { name: 'Local 7 - Services', rep: 'Cesar Chavez', members: 300, contract: 'Exp. 2027', status: 'Active' },
                    { name: 'Local 88 - Transport', rep: 'Jimmy Hoffa', members: 600, contract: 'Expired', status: 'Critical' },
                ].map((union, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{union.name}</h3>
                                    <div className="text-sm text-slate-500">Rep: {union.rep}</div>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${union.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                    union.status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                                        'bg-rose-100 text-rose-600'
                                }`}>{union.status}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-slate-500 mb-1">Membership</div>
                                <div className="font-bold">{union.members} Members</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-slate-500 mb-1">Contract Status</div>
                                <div className="font-bold">{union.contract}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> View Agreement
                            </button>
                            <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" /> Contact Rep
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

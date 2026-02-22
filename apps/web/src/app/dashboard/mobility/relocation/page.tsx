"use client";

import React from 'react';
import {
    Map,
    Home,
    Truck,
    DollarSign,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

export default function RelocationPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6 text-indigo-500" />
                        Relocation Packages
                    </h1>
                    <p className="text-slate-500 text-sm">Manage employee moves, housing, and relocation budgets.</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl text-indigo-700 dark:text-indigo-400 text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                    Active Moves: 12
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto pb-20">
                {[
                    { emp: 'John Doe', from: 'London', to: 'New York', tier: 'Tier 1 (Exec)', budget: '$25,000', used: 65, status: 'In Progress' },
                    { emp: 'Alice Wong', from: 'Singapore', to: 'Berlin', tier: 'Tier 2 (Manager)', budget: '$15,000', used: 20, status: 'Planning' },
                    { emp: 'Carlos Ruiz', from: 'Madrid', to: 'London', tier: 'Tier 3 (Individual)', budget: '$8,000', used: 90, status: 'Closing' },
                ].map((move, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all group">

                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{move.emp}</h3>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${move.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                    move.status === 'Planning' ? 'bg-slate-100 text-slate-500' :
                                        'bg-emerald-100 text-emerald-600'}
                            `}>
                                {move.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500">{move.from}</div>
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                            <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200">{move.to}</div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <Truck className="w-4 h-4 text-slate-400" />
                                <span>Movers & Packers</span>
                                {move.used > 10 && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <Home className="w-4 h-4 text-slate-400" />
                                <span>Temporary Housing</span>
                                {move.used > 40 && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                                <span>Budget Used ({move.budget})</span>
                                <span>{move.used}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${move.used > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${move.used}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


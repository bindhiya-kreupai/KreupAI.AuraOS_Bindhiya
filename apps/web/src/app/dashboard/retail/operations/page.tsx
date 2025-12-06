"use client";

import React from 'react';
import {
    ShoppingBag,
    CheckSquare,
    Users,
    Clock,
    Store,
    MapPin
} from 'lucide-react';

export default function StoreOpsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Store className="w-6 h-6 text-fuchsia-500" />
                        Store Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Opening checklists, shift handovers, and store performance.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <select className="bg-transparent text-sm font-bold outline-none">
                        <option>New York Flagship</option>
                        <option>London Oxford St</option>
                        <option>Dubai Mall</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Checklists */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Opening Checklist */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-500" /> Opening (08:00 AM)
                                </h3>
                                <span className="text-xs font-bold text-slate-400">4/5 Done</span>
                            </div>
                            <div className="space-y-3 flex-1">
                                {[
                                    { task: 'Disable Alarm System', done: true },
                                    { task: 'Count Cash Drawers', done: true },
                                    { task: 'Turn on Lights & HVAC', done: true },
                                    { task: 'Check Visual Merchandising', done: true },
                                    { task: 'Staff Briefing', done: false },
                                ].map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center
                                            ${t.done ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}
                                        `}>
                                            {t.done && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={`text-sm ${t.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{t.task}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Closing Checklist */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col opacity-60">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Store className="w-5 h-5 text-slate-400" /> Closing (09:00 PM)
                                </h3>
                                <span className="text-xs font-bold text-slate-400">Locked</span>
                            </div>
                            <div className="space-y-3 flex-1 pointer-events-none">
                                {[
                                    { task: 'Lock Fitting Rooms', done: false },
                                    { task: 'Empty Trash Bins', done: false },
                                    { task: 'Reconcile Registers', done: false },
                                    { task: 'Enable Night Alarm', done: false },
                                ].map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2">
                                        <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600"></div>
                                        <span className="text-sm text-slate-500">{t.task}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Staff On Floor */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-500" /> Staff On Floor
                            </h3>
                            <button className="text-xs text-indigo-500 font-bold">View Schedule</button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {[
                                { name: 'Alex M.', role: 'Manager', status: 'Office' },
                                { name: 'Sarah J.', role: 'Associate', status: 'Floor' },
                                { name: 'Mike T.', role: 'Associate', status: 'Break' },
                                { name: 'Emma W.', role: 'Cashier', status: 'Register 1' },
                                { name: 'Chris P.', role: 'Stock', status: 'Backroom' },
                            ].map((s, i) => (
                                <div key={i} className="min-w-[120px] p-3 text-center border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 mb-2">
                                        {s.name.substring(0, 2)}
                                    </div>
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.name}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">{s.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Sidebar */}
                <div className="bg-fuchsia-600 text-white rounded-2xl p-6 shadow-lg shadow-fuchsia-500/20">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" /> Today's Sales
                    </h3>

                    <div className="mb-6">
                        <div className="text-sm opacity-80 mb-1">Total Revenue</div>
                        <div className="text-4xl font-bold">$12,450</div>
                        <div className="text-xs font-bold bg-white/20 inline-block px-2 py-1 rounded mt-2">
                            +15% vs Last Tuesday
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1 opacity-90">
                                <span>Footfall</span>
                                <span>850 Visitors</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/20 rounded-full">
                                <div className="h-full bg-white w-3/4 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1 opacity-90">
                                <span>Conversion</span>
                                <span>22% (Target 20%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/20 rounded-full">
                                <div className="h-full bg-emerald-300 w-[22%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

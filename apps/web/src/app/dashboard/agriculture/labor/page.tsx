"use client";

import React from 'react';
import {
    Wheat,
    Users,
    Scale,
    Tractor,
    Calendar,
    Sun
} from 'lucide-react';

export default function AgricultureLaborPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wheat className="w-6 h-6 text-amber-500" />
                        Seasonal Labor & Harvest
                    </h1>
                    <p className="text-slate-500 text-sm">Managing temporary harvesters, piece-rate pay, and field allocation.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100 dark:border-amber-800/30">
                    <Sun className="w-4 h-4" /> Harvest Season: Active (Day 12/45)
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600"><Scale className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">42,500 <span className="text-sm font-normal text-slate-400">lbs</span></div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Harvested Today</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500"><Users className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">185</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Active Pickers</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500"><Tractor className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Machinery deployed</div>
                        </div>
                    </div>
                    <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex flex-col justify-between">
                        <div className="text-3xl font-bold">$0.45 <span className="text-sm text-emerald-200 font-normal">/ lb</span></div>
                        <div className="text-xs opacity-80 uppercase font-bold">Current Piece Rate</div>
                    </div>
                </div>

                {/* Worker List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Harvester Performance (Daily)</h3>
                    {[
                        { name: 'Juan Mendez', field: 'Block A (Berries)', collected: '450 lbs', pay: '$202.50', status: 'Active' },
                        { name: 'Elena Rodriguez', field: 'Block A (Berries)', collected: '410 lbs', pay: '$184.50', status: 'Active' },
                        { name: 'Team Gamma', field: 'Block C (Orchard)', collected: '2,100 lbs', pay: '$945.00', status: 'Group' },
                        { name: 'Carlos S.', field: 'Block B', collected: '380 lbs', pay: '$171.00', status: 'Break' },
                    ].map((w, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {w.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{w.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{w.field}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Scale className="w-3 h-3" /> {w.collected} Today
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-emerald-600 font-mono">{w.pay}</div>
                                    <div className="text-xs text-slate-400">Est. Daily Pay</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${w.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            w.status === 'Break' ? 'bg-amber-100 text-amber-600' :
                                                'bg-indigo-100 text-indigo-600'}
                                    `}>
                                        {w.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">Log Weight</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Field Map Placeholder & Controls */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Field Allocation</h3>
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden mb-4">
                        <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-2">
                            <div className="bg-emerald-500/20 border-2 border-emerald-500 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-xs p-2 text-center">
                                Block A<br />(Harvesting)
                            </div>
                            <div className="bg-amber-500/10 border-2 border-slate-300 border-dashed rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs p-2 text-center">
                                Block B<br />(Ripening)
                            </div>
                            <div className="bg-indigo-500/20 border-2 border-indigo-500 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-xs p-2 text-center">
                                Block C<br />(Harvesting)
                            </div>
                            <div className="bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs p-2 text-center">
                                Fallow
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                        Reassign Crews
                    </button>
                </div>
            </div>
        </div>
    );
}

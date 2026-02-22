"use client";

import React from 'react';
import {
    Anchor,
    Ship,
    Calendar,
    Users,
    MapPin,
    FileText
} from 'lucide-react';

export default function CrewPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Anchor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Vessel Crewing & Manning
                    </h1>
                    <p className="text-slate-500 text-sm">Seafarer contracts, watchkeeping schedules, and crew changes.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800/30">
                    <Ship className="w-4 h-4" /> Fleet Status: 12 Active, 2 Drydock
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Vessel List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Fleet Manning Status</h3>
                    {[
                        { name: 'MV Pacific Star', type: 'Container', route: 'CN-US West', crew: '22/24', captain: 'Capt. Phillips', status: 'At Sea' },
                        { name: 'SS Northern Light', type: 'LNG Carrier', route: 'QA-UK', crew: '18/18', captain: 'Capt. Sparrow', status: 'Port Call (In)' },
                        { name: 'MV Black Pearl', type: 'Tanker', route: 'Drydock (SG)', crew: 'Min Safe (6)', captain: 'Capt. Barbossa', status: 'Maintenance' },
                    ].map((v, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all relative overflow-hidden">
                            <div className={`absolute top-0 left-0 bottom-0 w-1 ${v.status === 'At Sea' ? 'bg-blue-500' : v.status.includes('Maintenance') ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                            <div className="pl-4 flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    <Ship className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{v.name}</h3>
                                    <div className="text-xs text-blue-500 font-bold mb-1">{v.type} Vessel</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> {v.route}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{v.crew}</div>
                                    <div className="text-xs text-slate-400">Complement</div>
                                </div>
                                <div className="text-right border-l border-slate-100 dark:border-slate-800 pl-4">
                                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{v.captain}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Master</div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${v.status === 'At Sea' ? 'bg-blue-100 text-blue-600' :
                                            v.status.includes('Maintenance') ? 'bg-amber-100 text-amber-600' :
                                                'bg-emerald-100 text-emerald-600'}
                                    `}>
                                        {v.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        + Add Vessel to Fleet
                    </button>
                </div>

                {/* Contract Expiry */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" /> Contract Relief Due
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Will Turner', role: 'Bosun', vessel: 'MV Pacific Star', due: '5 Days', status: 'Urgent' },
                                { name: 'Elizabeth Swann', role: '3rd Officer', vessel: 'SS Northern Light', due: '12 Days', status: 'Plan' },
                                { name: 'Joshamee Gibbs', role: 'Chief Eng', vessel: 'MV Black Pearl', due: 'Overdue', status: 'Critical' },
                            ].map((c, i) => (
                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">{c.name}</h4>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${c.status === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                                c.status === 'Urgent' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'}
                                        `}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{c.role} • {c.vessel}</p>
                                    <button className="w-full py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">Arrange Relief</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


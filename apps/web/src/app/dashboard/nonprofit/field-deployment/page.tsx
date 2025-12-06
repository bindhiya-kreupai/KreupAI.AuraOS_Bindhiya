"use client";

import React, { useState } from 'react';
import {
    Tent,
    Map,
    Truck,
    AlertCircle
} from 'lucide-react';

export default function FieldDeploymentPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Tent className="w-6 h-6 text-indigo-500" />
                        Field Deployment
                    </h1>
                    <p className="text-slate-500 text-sm">Coordinate relief missions and field resources.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Missions</h3>
                    <div className="space-y-4">
                        {[
                            { mission: 'Clean Water Initiative', loc: 'Kenya', status: 'Ongoing', team: 12, progress: '65%' },
                            { mission: 'Disaster Relief', loc: 'Southeast Asia', status: 'Urgent', team: 45, progress: '20%' },
                            { mission: 'Medical Outreach', loc: 'Amazon Basin', status: 'Planning', team: 0, progress: '0%' },
                        ].map((m, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-lg">{m.mission}</div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.status === 'Urgent' ? 'bg-rose-100 text-rose-600' :
                                            m.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-slate-200 text-slate-600'
                                        }`}>{m.status}</span>
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-4 mb-3">
                                    <span className="flex items-center gap-1"><Map className="w-3 h-3" /> {m.loc}</span>
                                    <span className="flex items-center gap-1 font-bold"><Tent className="w-3 h-3" /> {m.team} Staff</span>
                                </div>

                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                                Completion
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold inline-block text-indigo-600">
                                                {m.progress}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                        <div style={{ width: m.progress }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-amber-800 dark:text-amber-200">Resource Shortages</h3>
                        </div>
                        <ul className="list-disc list-inside text-sm text-amber-800 dark:text-amber-200 space-y-1">
                            <li><strong>Kenya Mission:</strong> Water purification tablets running low.</li>
                            <li><strong>Disaster Relief:</strong> Need 5 more medical personnel.</li>
                        </ul>
                        <button className="mt-4 w-full py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">Mobilize Resources</button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Logistics Updates</h3>
                        <div className="space-y-3">
                            {[
                                { update: 'Supply convoy arrived at Base Camp Alpha.', time: '2h ago', icon: Truck },
                                { update: 'Weather warning issued for coastal zone.', time: '4h ago', icon: AlertCircle },
                                { update: 'New satellite comms established.', time: '1d ago', icon: Map },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-1">
                                        <log.icon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{log.update}</div>
                                        <div className="text-xs text-slate-500">{log.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

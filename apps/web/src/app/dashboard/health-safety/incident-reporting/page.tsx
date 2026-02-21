"use client";

import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    FileText,
    Camera,
    MapPin,
    Send,
    Clock,
    Loader2
} from 'lucide-react';
import { IncidentService } from '../services';
import type { Incident } from '../services';

export default function IncidentReportingPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await IncidentService.getAll();
                setIncidents(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        Incident Reporting
                    </h1>
                    <p className="text-slate-500 text-sm">Report workplace hazards, accidents, or near misses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Form */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4">New Report</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Type of Incident</label>
                            <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 border border-transparent transition-all">
                                <option>Workplace Hazard</option>
                                <option>Minor Injury</option>
                                <option>Near Miss</option>
                                <option>Equipment Failure</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-transparent focus-within:ring-2 focus-within:ring-rose-500">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="e.g. 2nd Floor Pantry" className="bg-transparent outline-none flex-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                            <textarea rows={4} placeholder="Describe what happened..." className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 border border-transparent transition-all resize-none"></textarea>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer">
                            <Camera className="w-6 h-6 mb-2" />
                            <span className="text-xs font-bold">Add Photo Evidence</span>
                        </div>

                        <button className="w-full py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" /> Submit Report
                        </button>
                    </div>
                </div>

                {/* Recent Reports Log */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg">Recent Logs</h3>
                    {incidents.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                            No incidents reported yet.
                        </div>
                    ) : (
                        incidents.map((inc, i) => (
                            <div key={inc.id || i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${inc.severity === 'High' || inc.severity === 'Critical' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                                                inc.severity === 'Medium' || inc.severity === 'Major' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                                                    'border-slate-200 text-slate-500 bg-slate-50'
                                            }`}>
                                            {inc.type}
                                        </span>
                                        <h4 className="font-bold text-sm">{inc.description?.substring(0, 60) || inc.type}</h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {inc.id}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inc.location}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {inc.date}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${inc.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' :
                                            inc.status === 'Investigating' || inc.status === 'Action Taken' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {inc.status}
                                    </div>
                                    <button className="text-xs font-bold text-slate-500 hover:text-rose-600">View Details</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

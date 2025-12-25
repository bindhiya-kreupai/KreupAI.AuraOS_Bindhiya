"use client";

import React, { useState, useEffect } from 'react';
import {
    DoorOpen,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ArrowRight,
    X
} from 'lucide-react';
import { ExitService } from '../services';

export default function ExitManagementPage() {
    const [showModal, setShowModal] = useState(false);
    const [exitProcesses, setExitProcesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExitProcesses();
    }, []);

    const fetchExitProcesses = async () => {
        try {
            const data = await ExitService.getAllExitProcesses();
            setExitProcesses(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DoorOpen className="w-6 h-6 text-rose-500" />
                        Exit Management
                    </h1>
                    <p className="text-slate-500 text-sm">Manage resignations, clearances, and offboarding.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                    Initiate Separation
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Resignations */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg mb-2">Active Separations</h3>
                    {[
                        { name: 'Emily White', role: 'UX Researcher', dept: 'Design', reason: 'Better Opportunity', lwd: 'Dec 15, 2023', stage: 'Clearance Pending' },
                        { name: 'James Wilson', role: 'Sales Executive', dept: 'Sales', reason: 'Relocation', lwd: 'Dec 22, 2023', stage: 'Interview Pending' },
                    ].map((emp, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                                    <img src={`https://i.pravatar.cc/150?u=${emp.name}`} alt={emp.name} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{emp.name}</h4>
                                    <div className="text-sm text-slate-500">{emp.role} • {emp.dept}</div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Last Working Day</div>
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {emp.lwd}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Current Stage</div>
                                    <div className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-sm cursor-pointer hover:bg-amber-100 transition-colors">
                                        {emp.stage}
                                    </div>
                                </div>
                                <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Attrition Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Attrition Reasons</h3>
                        <div className="space-y-3">
                            {[
                                { reason: 'Better Compensation', pct: '45%' },
                                { reason: 'Career Growth', pct: '30%' },
                                { reason: 'Work-Life Balance', pct: '15%' },
                                { reason: 'Relocation', pct: '10%' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>{item.reason}</span>
                                        <span className="text-slate-500">{item.pct}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: item.pct }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Initiate Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Initiate Employee Separation</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Employee</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500">
                                    <option>Select Employee...</option>
                                    <option>John Doe</option>
                                    <option>Jane Smith</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Separation Type</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500">
                                    <option>Resignation</option>
                                    <option>Termination</option>
                                    <option>Retirement</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Last Working Day (Proposed)</label>
                                <input type="date" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Separation Initiated!');
                                    setShowModal(false);
                                }}
                                className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                            >
                                Initiate Process
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

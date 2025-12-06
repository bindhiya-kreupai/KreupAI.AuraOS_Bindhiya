"use client";

import React from 'react';
import {
    Bed,
    Sparkles,
    ClipboardCheck,
    SprayCan,
    Clock,
    CheckCircle2
} from 'lucide-react';

export default function HousekeepingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bed className="w-6 h-6 text-pink-500" />
                        Housekeeping
                    </h1>
                    <p className="text-slate-500 text-sm">Room assignment, inspection scores, and turn-down service tracking.</p>
                </div>
                <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-xl text-sm font-bold border border-pink-100 dark:border-pink-800/30">
                    <Sparkles className="w-4 h-4" /> 84% Clean (12:30 PM)
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Floors Sidebar */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4">Floors</h3>
                    <div className="space-y-2">
                        {[
                            { name: 'Floor 1 (Lobby/Suites)', status: 'In Progress', progress: '60%' },
                            { name: 'Floor 2 (Standard)', status: 'Completed', progress: '100%' },
                            { name: 'Floor 3 (Standard)', status: 'In Progress', progress: '45%' },
                            { name: 'Floor 4 (Executive)', status: 'Not Started', progress: '0%' },
                        ].map((f, i) => (
                            <button key={i} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm flex flex-col gap-2 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    {f.name}
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${f.status === 'Completed' ? 'bg-emerald-500' : 'bg-pink-500'}`} style={{ width: f.progress }}></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Room Grid */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-4">Floor 3 - Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { room: '301', type: 'Checkout', assigned: 'Maria G.', status: 'Clean', time: '10:45 AM' },
                            { room: '302', type: 'Stayover', assigned: 'Maria G.', status: 'Cleaning', time: 'In Progress' },
                            { room: '303', type: 'Checkout', assigned: 'Sophia L.', status: 'Dirty', time: '-' },
                            { room: '304', type: 'DND', assigned: 'Sophia L.', status: 'Skipped', time: '-' },
                            { room: '305', type: 'Stayover', assigned: 'Anna K.', status: 'Clean', time: '09:30 AM' },
                            { room: '306', type: 'Deep Clean', assigned: '-', status: 'Blocked', time: '-' },
                        ].map((r, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg transition-all relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 
                                    ${r.status === 'Clean' ? 'bg-emerald-500' :
                                        r.status === 'Dirty' ? 'bg-rose-500' :
                                            r.status === 'Cleaning' ? 'bg-amber-500 animate-pulse' :
                                                'bg-slate-300'}
                                `}></div>

                                <div className="pl-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">{r.room}</h3>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${r.type === 'Checkout' ? 'bg-rose-100 text-rose-600' :
                                                r.type === 'Deep Clean' ? 'bg-slate-800 text-white' :
                                                    'bg-indigo-100 text-indigo-600'}
                                        `}>
                                            {r.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {r.assigned === '-' ? '?' : r.assigned.split(' ')[0][0]}
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{r.assigned}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                        <div className="text-xs text-slate-400 font-bold uppercase">{r.status}</div>
                                        {r.status === 'Clean' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <button className="text-xs font-bold text-indigo-500 hover:underline">Update</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

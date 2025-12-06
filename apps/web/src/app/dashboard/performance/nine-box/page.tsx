"use client";

import React, { useState } from 'react';
import {
    Grid,
    Users,
    Info,
    Move,
    Save,
    RotateCcw
} from 'lucide-react';

const BOXES = [
    { id: '1-1', title: 'Rough Diamond', desc: 'High Potential, Low Performance', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200' },
    { id: '1-2', title: 'Future Star', desc: 'High Potential, Moderate Performance', color: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200' },
    { id: '1-3', title: 'Star', desc: 'High Potential, High Performance', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200' },

    { id: '2-1', title: 'Inconsistent', desc: 'Mod Potential, Low Performance', color: 'bg-slate-100 dark:bg-slate-800 border-slate-200' },
    { id: '2-2', title: 'Key Player', desc: 'Mod Potential, Moderate Performance', color: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100' },
    { id: '2-3', title: 'High Performer', desc: 'Mod Potential, High Performance', color: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' },

    { id: '3-1', title: 'Talent Risk', desc: 'Low Potential, Low Performance', color: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200' },
    { id: '3-2', title: 'Effective', desc: 'Low Potential, Moderate Performance', color: 'bg-slate-100 dark:bg-slate-800 border-slate-200' },
    { id: '3-3', title: 'Trusted Pro', desc: 'Low Potential, High Performance', color: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100' },
];

const EMPLOYEES = [
    { id: 1, name: 'Alice M.', role: 'Senior Dev', box: '1-3', avatar: 'AM' },
    { id: 2, name: 'Bob D.', role: 'Product Lead', box: '1-2', avatar: 'BD' },
    { id: 3, name: 'Charlie', role: 'Designer', box: '2-2', avatar: 'C' },
    { id: 4, name: 'Dave', role: 'Support', box: '3-1', avatar: 'D' },
];

export default function NineBoxGridPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Grid className="w-6 h-6 text-indigo-500" />
                        9-Box Grid
                    </h1>
                    <p className="text-slate-500 text-sm">Talent calibration matrix for succession planning.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-500">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <Save className="w-4 h-4" /> Save Calibration
                    </button>
                </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-auto">
                <div className="flex relative h-full min-w-[800px]">
                    {/* Y-Axis Label */}
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-bold text-slate-400 tracking-widest uppercase">
                        Potential &rarr;
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        {/* Rows */}
                        {[0, 1, 2].map(row => (
                            <div key={row} className="flex-1 flex gap-4">
                                {[0, 1, 2].map(col => {
                                    const boxIndex = row * 3 + col;
                                    const box = BOXES[boxIndex];
                                    const occupants = EMPLOYEES.filter(e => e.box === box.id);

                                    return (
                                        <div
                                            key={box.id}
                                            className={`flex-1 rounded-xl border p-4 flex flex-col ${box.color} hover:bg-opacity-80 transition-all cursor-pointer group relative`}
                                        >
                                            <div className="flex justify-between items-start mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <span className="font-bold text-sm">{box.title}</span>
                                                <Info className="w-4 h-4" />
                                            </div>

                                            {/* Draggable Employees */}
                                            <div className="flex-1 flex flex-wrap content-start gap-2">
                                                {occupants.map(emp => (
                                                    <div key={emp.id} className="bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                                            {emp.avatar}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{emp.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-[10px] text-slate-500 mt-auto pt-2 border-t border-black/5 dark:border-white/5">
                                                {box.desc}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* X-Axis Label */}
                    <div className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 text-sm font-bold text-slate-400 tracking-widest uppercase">
                        Performance &rarr;
                    </div>
                </div>
            </div>
        </div>
    );
}

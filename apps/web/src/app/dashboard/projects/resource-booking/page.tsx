"use client";

import React, { useState } from 'react';
import {
    CalendarDays,
    Users,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    MoreHorizontal
} from 'lucide-react';

// --- MOCK DATA ---

const PROJECTS = [
    { id: 1, name: 'Alpha Redesign', color: 'bg-indigo-500' },
    { id: 2, name: 'Mobile App V2', color: 'bg-emerald-500' },
    { id: 3, name: 'Cloud Migration', color: 'bg-amber-500' },
    { id: 4, name: 'Internal Tools', color: 'bg-rose-500' },
];

const EMPLOYEES = [
    { id: 1, name: 'Sarah Jenkins', role: 'Senior Dev', avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', role: 'UX Designer', avatar: 'MC' },
    { id: 3, name: 'Jessica Wu', role: 'Product Mgr', avatar: 'JW' },
    { id: 4, name: 'David Kim', role: 'Backend Dev', avatar: 'DK' },
    { id: 5, name: 'Alex Thompson', role: 'QA Lead', avatar: 'AT' },
];

// Mocking allocation data for 14 days
const DATES = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
        day: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        fullDate: d.toISOString().split('T')[0]
    };
});

// Assignments: employeeId -> date -> projectId
const ASSIGNMENTS: Record<string, number> = {
    '1-2025-12-05': 1, '1-2025-12-06': 1, '1-2025-12-07': 1,
    '1-2025-12-10': 2, '1-2025-12-11': 2,
    '2-2025-12-05': 2, '2-2025-12-06': 2,
    '3-2025-12-08': 3, '3-2025-12-09': 3, '3-2025-12-10': 3,
    '4-2025-12-05': 1, '4-2025-12-06': 1, '4-2025-12-07': 1, '4-2025-12-08': 4,
    '4-2025-12-09': 4 // David is overbooked on these days conceptually
};

// Conflict mock
const CONFLICTS = ['4-2025-12-08', '4-2025-12-09'];

export default function ResourceBookingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Resource Booking
                    </h1>
                    <p className="text-silver-mist text-sm">Visualize team capacity and allocate resources to projects.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 px-3 py-1.5 rounded-xl text-sm">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold min-w-[100px] text-center">Dec 05 - Dec 18</span>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Briefcase className="w-4 h-4" /> Auto-Allocate
                    </button>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="flex gap-6 h-full min-h-0">
                {/* Left: Project List / Legend */}
                <div className="w-64 shrink-0 flex flex-col gap-6">
                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="text-xs font-bold text-silver-mist uppercase mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Projects
                        </h3>
                        <div className="space-y-3">
                            {PROJECTS.map(proj => (
                                <div key={proj.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-colors group">
                                    <div className={`w-3 h-3 rounded-full ${proj.color}`}></div>
                                    <span className="text-sm font-bold text-ink-black dark:text-pearl flex-1">{proj.name}</span>
                                    <MoreHorizontal className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-bold text-indigo-500 border border-indigo-200 dark:border-indigo-500/30 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                            + Add Project
                        </button>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1">
                        <h3 className="text-xs font-bold text-silver-mist uppercase mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-xl">
                                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs mb-1">
                                    <AlertCircle className="w-3 h-3" /> Overbooked
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-bold">David Kim</span> is allocated to 2 projects on Dec 08-09.
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                                    <CheckCircle2 className="w-3 h-3" /> Availability
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-bold">Alex Thompson</span> is free for 3 days next week.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Gantt Chart */}
                <div className="flex-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col overflow-hidden">
                    {/* Gantt Header (Dates) */}
                    <div className="flex border-b border-cloud dark:border-nebula-purple/20">
                        <div className="w-48 shrink-0 p-4 border-r border-cloud dark:border-nebula-purple/20 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search resources..." className="bg-transparent text-sm w-full outline-none" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex h-full">
                                {DATES.map((date, idx) => (
                                    <div key={idx} className={`flex-1 min-w-[60px] border-r border-cloud dark:border-slate-800 flex flex-col items-center justify-center p-2
                                        ${['Sa', 'Su'].includes(date.weekday) ? 'bg-slate-50 dark:bg-slate-900' : ''}
                                    `}>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">{date.weekday}</span>
                                        <span className={`text-sm font-bold ${['Sa', 'Su'].includes(date.weekday) ? 'text-slate-400' : 'text-ink-black dark:text-pearl'}`}>
                                            {date.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Gantt Body (Rows) */}
                    <div className="flex-1 overflow-y-auto">
                        {EMPLOYEES.map(emp => (
                            <div key={emp.id} className="flex border-b border-cloud dark:border-slate-800 h-16 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                {/* Employee Info */}
                                <div className="w-48 shrink-0 p-3 border-r border-cloud dark:border-nebula-purple/20 flex items-center gap-3 bg-white dark:bg-stellar-blue z-10 sticky left-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {emp.avatar}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl truncate">{emp.name}</div>
                                        <div className="text-[10px] text-silver-mist truncate">{emp.role}</div>
                                    </div>
                                </div>

                                {/* Timeline Cells */}
                                <div className="flex-1 flex relative">
                                    {DATES.map((date, idx) => {
                                        // Using a simple deterministic generation date string for mock matching
                                        // Real app would use actual Date objects comparison
                                        const dateKey = `${emp.id}-${new Date().getFullYear()}-12-${date.day.toString().padStart(2, '0')}`;
                                        // Simplified key logic for mock data matching in this prototype
                                        // In real usage, DATES array needs to match keys in ASSIGNMENTS exactly.
                                        // For this demo, let's just use index matching to simulate "some days assigned"

                                        // Actually reconstruct the date key properly based on DATES generation logic
                                        const d = new Date();
                                        d.setDate(d.getDate() + idx);
                                        const isoDate = d.toISOString().split('T')[0];
                                        const assignmentKey = `${emp.id}-${isoDate}`;
                                        const projectId = ASSIGNMENTS[assignmentKey];
                                        const project = PROJECTS.find(p => p.id === projectId);
                                        const isConflict = CONFLICTS.includes(assignmentKey);

                                        return (
                                            <div key={idx} className={`flex-1 min-w-[60px] border-r border-cloud dark:border-slate-800 relative group
                                                ${['Sa', 'Su'].includes(date.weekday) ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}
                                            `}>
                                                {project && (
                                                    <div className={`absolute top-2 bottom-2 left-1 right-1 rounded-md ${project.color} opacity-80 shadow-sm flex items-center justify-center group-hover:opacity-100 transition-opacity cursor-pointer
                                                        ${isConflict ? 'ring-2 ring-rose-500 animate-pulse' : ''}
                                                    `}>
                                                        {isConflict && <AlertCircle className="w-4 h-4 text-white" />}
                                                    </div>
                                                )}
                                                {/* Hover Add Button */}
                                                {!project && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 cursor-pointer">
                                                            +
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

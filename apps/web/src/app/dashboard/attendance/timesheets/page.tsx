"use client";

import React, { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    Save,
    Send,
    Plus,
    Trash2,
    Briefcase,
    CheckCircle2,
    Play,
    Square,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

// --- MOCK DATA ---

interface TimeEntry {
    id: string;
    project: string;
    task: string;
    hours: number[]; // Mon-Sun
}

const PROJECTS = ['Internal - General', 'Project Aura', 'Client X - Implementation', 'Client Y - Support', 'Training'];
const TASKS = ['Development', 'Meeting', 'Design', 'Testing', 'Documentation', 'Admin'];

const INITIAL_ENTRIES: TimeEntry[] = [
    { id: '1', project: 'Project Aura', task: 'Development', hours: [8, 8, 4, 0, 0, 0, 0] },
    { id: '2', project: 'Internal - General', task: 'Meeting', hours: [1, 1, 2, 0, 0, 0, 0] },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = ['Dec 02', 'Dec 03', 'Dec 04', 'Dec 05', 'Dec 06', 'Dec 07', 'Dec 08'];

export default function TimesheetsPage() {
    const [entries, setEntries] = useState<TimeEntry[]>(INITIAL_ENTRIES);
    const [isClockedIn, setIsClockedIn] = useState(true);
    const [timer, setTimer] = useState(14400 + 3600 + 1500); // Start at ~5h for demo

    // Simulate Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isClockedIn) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isClockedIn]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddRow = () => {
        const newEntry: TimeEntry = {
            id: Date.now().toString(),
            project: PROJECTS[0],
            task: TASKS[0],
            hours: [0, 0, 0, 0, 0, 0, 0]
        };
        setEntries([...entries, newEntry]);
    };

    const handleRemoveRow = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const handleHourChange = (id: string, dayIndex: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setEntries(entries.map(e => {
            if (e.id === id) {
                const newHours = [...e.hours];
                newHours[dayIndex] = numValue;
                return { ...e, hours: newHours };
            }
            return e;
        }));
    };

    const getTotalPerDay = (dayIndex: number) => {
        return entries.reduce((acc, curr) => acc + curr.hours[dayIndex], 0);
    };

    const getTotalWeek = () => {
        return entries.reduce((acc, curr) => acc + curr.hours.reduce((a, b) => a + b, 0), 0);
    };

    const totalWeek = getTotalWeek();
    const isOvertime = totalWeek > 40;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-celestial-indigo" />
                        Timesheets
                    </h1>
                    <p className="text-silver-mist text-sm">Log your hours, track projects, and submit for approval.</p>
                </div>

                {/* Clock In Widget */}
                <div className="flex items-center gap-4 bg-white dark:bg-stellar-blue p-2 pr-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <button
                        onClick={() => setIsClockedIn(!isClockedIn)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all shadow-md ${isClockedIn
                                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                    >
                        {isClockedIn ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <div>
                        <div className="text-[10px] text-silver-mist font-bold uppercase tracking-wider">
                            {isClockedIn ? 'Currently Working' : 'Clocked Out'}
                        </div>
                        <div className="text-xl font-mono font-bold text-ink-black dark:text-pearl w-24">
                            {formatTime(timer)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Week Navigation & Summary */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-stellar-blue p-1 rounded-lg border border-cloud dark:border-nebula-purple/50">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-celestial-indigo" />
                        Dec 02 - Dec 08, 2024
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="ml-2 text-xs font-medium text-celestial-indigo hover:underline">Today</button>
                </div>

                <div className="flex items-center gap-6 bg-white dark:bg-stellar-blue px-6 py-3 rounded-xl border border-cloud dark:border-nebula-purple/50">
                    <div>
                        <div className="text-xs text-silver-mist font-medium">Weekly Goal</div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">40.00 Hrs</div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                        <div className="text-xs text-silver-mist font-medium">Logged</div>
                        <div className={`text-xl font-bold ${isOvertime ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {totalWeek.toFixed(2)} Hrs
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-silver-mist uppercase font-bold border-b border-cloud dark:border-nebula-purple/20">
                            <tr>
                                <th className="px-4 py-3 min-w-[300px]">Project & Task</th>
                                {DAYS.map((day, i) => (
                                    <th key={day} className="px-2 py-3 text-center min-w-[60px]">
                                        <div>{day}</div>
                                        <div className="text-[10px] font-normal text-slate-400">{DATES[i]}</div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center min-w-[80px]">Total</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {entries.map((entry) => (
                                <tr key={entry.id} className="group hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-celestial-indigo/50"
                                                    value={entry.project}
                                                    onChange={() => { }} // Mock
                                                >
                                                    {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <select
                                                className="w-full pl-3 pr-4 py-1.5 bg-transparent text-slate-500 text-xs focus:text-ink-black focus:outline-none"
                                                value={entry.task}
                                                onChange={() => { }} // Mock
                                            >
                                                {TASKS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                    {entry.hours.map((h, i) => (
                                        <td key={i} className="px-2 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                className={`w-full text-center py-2 rounded-lg border focus:ring-2 focus:ring-celestial-indigo/50 focus:outline-none transition-all ${h > 0
                                                        ? 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 font-bold text-ink-black dark:text-pearl'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'
                                                    }`}
                                                value={h > 0 ? h : ''}
                                                placeholder="-"
                                                onChange={(e) => handleHourChange(entry.id, i, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-center font-bold text-ink-black dark:text-pearl">
                                        {entry.hours.reduce((a, b) => a + b, 0)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleRemoveRow(entry.id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t border-cloud dark:border-nebula-purple/20">
                            <tr>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={handleAddRow}
                                        className="flex items-center gap-2 text-sm font-bold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Add Line Item
                                    </button>
                                </td>
                                {DAYS.map((_, i) => (
                                    <td key={i} className="px-2 py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                        {getTotalPerDay(i) > 0 ? getTotalPerDay(i) : '-'}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center font-bold text-celestial-indigo text-lg">
                                    {totalWeek}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                    <Save className="w-4 h-4" />
                    Save Draft
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-celestial-indigo to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all">
                    <Send className="w-4 h-4" />
                    Submit Week
                </button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                    <strong>Policy Reminder:</strong> Timesheets must be submitted by <strong>Friday 5:00 PM</strong>.
                    Late submissions may delay approval and payroll processing.
                </p>
            </div>
        </div>
    );
}

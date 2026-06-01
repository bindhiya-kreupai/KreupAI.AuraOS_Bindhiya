"use client";

import React, { useState, useEffect } from 'react';
import {
    Clock,
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    Sun,
    Moon,
    Coffee,
    Briefcase
} from 'lucide-react';
import { ShiftService } from '../services';

const iconMap: Record<string, any> = {
    Sun,
    Moon,
    Coffee,
    Briefcase
};

interface Shift {
    id: string;
    name: string;
    start: string;
    end: string;
    break_duration: string;
    type: string;
    color: string;
    icon: string;
    employees: number;
}

export default function ShiftManagementPage() {
    const [shiftList, setShiftList] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const result = await ShiftService.getShifts();
            // Map API fields to UI interface
            const mapped: Shift[] = (result as any[]).map((s: any) => ({
                id: s.id,
                name: s.name || '',
                start: s.startTime || s.start || '',
                end: s.endTime || s.end || '',
                break_duration: s.breakDuration || s.break_duration || '0 min',
                type: s.isFlexible ? 'Flexible' : (s.type || 'Fixed'),
                color: s.color || 'bg-blue-500',
                icon: s.icon || 'Sun',
                employees: s.employees || s._count?.employees || 0,
            }));
            setShiftList(mapped);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await ShiftService.deleteShift(id);
            await fetchShifts();
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Shift Management
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Configure work shifts, timings, and break rules.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add New Shift
                </button>
            </div>

            {/* Shift Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {loading ? (
                    <div className="col-span-full p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : shiftList.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-400">No shifts configured</div>
                ) : (
                shiftList.map((shift) => {
                    const IconComponent = iconMap[shift.icon] || Sun;
                    return (
                    <div key={shift.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                        <div className={`h-2 ${shift.color}`} />
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${shift.color} bg-opacity-10 text-opacity-100`}>
                                    <IconComponent className={`w-5 h-5 ${shift.color.replace('bg-', 'text-')}`} />
                                </div>
                                <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-1">{shift.name}</h3>
                            <p className="text-xs text-silver-mist font-medium mb-4">{shift.type}</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Timing</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">
                                        {shift.start} - <span className="text-xs opacity-50">{shift.end}</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Break</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{shift.break_duration}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Employees</span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {shift.employees}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-t border-cloud dark:border-nebula-purple/20 divide-x divide-cloud dark:divide-nebula-purple/20">
                            <button className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(shift.id)}
                                disabled={loading}
                                className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                        </div>
                    </div>
                    );
                }))}
            </div>

            {/* Visual Timeline (Mock) */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm mt-8">
                <h3 className="font-bold text-ink-black dark:text-pearl mb-6">Daily Coverage Timeline (24 Hours)</h3>

                <div className="relative h-20 bg-slate-50 dark:bg-slate-900/40 rounded-lg overflow-hidden flex">
                    {/* Time Markers */}
                    {[0, 4, 8, 12, 16, 20, 24].map((h, i) => (
                        <div key={h} className="absolute h-full border-l border-slate-200 dark:border-slate-700 flex flex-col justify-end pb-2 pl-1" style={{ left: `${(h / 24) * 100}%` }}>
                            <span className="text-[10px] font-mono text-slate-400">{h}:00</span>
                        </div>
                    ))}

                    {/* Shift Bars */}
                    {/* Morning: 06:00 - 15:00 (9 hrs) -> Start 25%, Width 37.5% */}
                    <div className="absolute top-2 h-3 bg-amber-400 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style={{ left: '25%', width: '37.5%' }} title="Morning Shift" />

                    {/* General: 09:00 - 18:00 (9 hrs) -> Start 37.5%, Width 37.5% */}
                    <div className="absolute top-6 h-3 bg-blue-500 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style={{ left: '37.5%', width: '37.5%' }} title="General Shift" />

                    {/* Executive: 10:00 - 19:00 (9 hrs) -> Start 41.6%, Width 37.5% */}
                    <div className="absolute top-10 h-3 bg-emerald-500 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style={{ left: '41.6%', width: '37.5%' }} title="Executive Shift" />

                    {/* Night: 20:00 - 05:00 (9 hrs) -> Split Bar */}
                    <div className="absolute top-14 h-3 bg-indigo-500 rounded-l-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style={{ left: '83.3%', width: '16.7%' }} title="Night Shift (Start)" />
                    <div className="absolute top-14 h-3 bg-indigo-500 rounded-r-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style={{ left: '0%', width: '20.8%' }} title="Night Shift (End)" />
                </div>

                <div className="flex justify-center gap-3 mt-4">
                    {shiftList.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${s.color} rounded-sm`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    User,
    Search,
    Download,
    Save,
    MoreHorizontal,
    Moon,
    Sun,
    Sunset,
    Coffee
} from 'lucide-react';

// --- MOCK DATA ---

const SHIFT_TYPES = {
    MORNING: { id: 'M', label: 'Morning', time: '09:00 - 18:00', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Sun },
    EVENING: { id: 'E', label: 'Evening', time: '14:00 - 23:00', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Sunset },
    NIGHT: { id: 'N', label: 'Night', time: '22:00 - 07:00', color: 'bg-slate-800 text-slate-100 dark:bg-slate-700 dark:text-slate-100', icon: Moon },
    OFF: { id: 'O', label: 'Day Off', time: '-', color: 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500', icon: Coffee },
};

const EMPLOYEES = [
    { id: '1', name: 'Sarah Anderson', role: 'Team Lead', avatar: 'https://i.pravatar.cc/150?u=EMP001' },
    { id: '2', name: 'Michael Chen', role: 'Developer', avatar: 'https://i.pravatar.cc/150?u=EMP002' },
    { id: '3', name: 'Priya Sharma', role: 'Designer', avatar: 'https://i.pravatar.cc/150?u=EMP003' },
    { id: '4', name: 'James Wilson', role: 'Developer', avatar: 'https://i.pravatar.cc/150?u=EMP004' },
    { id: '5', name: 'David Kim', role: 'QA Engineer', avatar: 'https://i.pravatar.cc/150?u=EMP008' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = ['12', '13', '14', '15', '16', '17', '18']; // Mock dates for a week

// Initial Roster State (EmpId -> DayIndex -> ShiftId)
const INITIAL_ROSTER: Record<string, string[]> = {
    '1': ['M', 'M', 'M', 'M', 'M', 'O', 'O'],
    '2': ['M', 'M', 'E', 'E', 'E', 'O', 'O'],
    '3': ['E', 'E', 'E', 'E', 'E', 'O', 'O'],
    '4': ['N', 'N', 'N', 'N', 'N', 'O', 'O'],
    '5': ['M', 'M', 'M', 'M', 'M', 'O', 'O'],
};

export default function ShiftManagementPage() {
    const [roster, setRoster] = useState(INITIAL_ROSTER);
    const [selectedShiftTool, setSelectedShiftTool] = useState<string>('M'); // Default tool to paint with

    // Function to handle cell click
    const handleCellClick = (empId: string, dayIndex: number) => {
        setRoster(prev => ({
            ...prev,
            [empId]: prev[empId].map((shift, idx) => idx === dayIndex ? selectedShiftTool : shift)
        }));
    };

    // Calculate weekly stats
    const calculateStats = () => {
        let hours = 0;
        let shiftCounts = { M: 0, E: 0, N: 0, O: 0 };

        Object.values(roster).flat().forEach(shift => {
            // @ts-ignore
            shiftCounts[shift]++;
            if (shift !== 'O') hours += 9; // Assuming 9 hour shifts
        });

        return { hours, shiftCounts };
    };

    const stats = calculateStats();

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-celestial-indigo" />
                        Shift Roster
                    </h1>
                    <p className="text-silver-mist text-sm">Manage team schedules and assignments</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium hover:bg-cloud/50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> Publish Roster
                    </button>
                </div>
            </div>

            {/* Controls & Toolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Date Navigation */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
                    <button className="p-1 hover:bg-cloud dark:hover:bg-deep-cosmos rounded"><ChevronLeft className="w-5 h-5 text-silver-mist" /></button>
                    <div className="text-center">
                        <div className="font-bold text-ink-black dark:text-pearl">Aug 12 - Aug 18</div>
                        <div className="text-xs text-silver-mist">Week 33, 2024</div>
                    </div>
                    <button className="p-1 hover:bg-cloud dark:hover:bg-deep-cosmos rounded"><ChevronRight className="w-5 h-5 text-silver-mist" /></button>
                </div>

                {/* Shift Painter Tools */}
                <div className="lg:col-span-3 bg-white dark:bg-stellar-blue p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 overflow-x-auto">
                    <span className="text-xs font-semibold text-silver-mist px-2 uppercase tracking-wider">Paint Tool:</span>
                    {Object.values(SHIFT_TYPES).map((shift) => (
                        <button
                            key={shift.id}
                            onClick={() => setSelectedShiftTool(shift.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedShiftTool === shift.id
                                    ? 'ring-2 ring-celestial-indigo shadow-md scale-105'
                                    : 'hover:bg-cloud dark:hover:bg-deep-cosmos opacity-70 hover:opacity-100'
                                } ${shift.color}`}
                        >
                            <shift.icon className="w-4 h-4" />
                            {shift.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Roster Grid */}
            <div className="flex-1 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden flex flex-col">
                {/* Grid Header */}
                <div className="grid grid-cols-[250px_1fr] border-b border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-slate-900/50">
                    <div className="p-4 font-semibold text-sm text-silver-mist uppercase tracking-wider flex items-center">Employee</div>
                    <div className="grid grid-cols-7">
                        {DAYS.map((day, i) => (
                            <div key={day} className="p-3 text-center border-l border-cloud dark:border-nebula-purple/20">
                                <div className="text-xs font-bold text-ink-black dark:text-pearl">{day}</div>
                                <div className="text-xs text-silver-mist">{DATES[i]}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="overflow-y-auto flex-1">
                    {EMPLOYEES.map((emp) => (
                        <div key={emp.id} className="grid grid-cols-[250px_1fr] border-b border-cloud dark:border-nebula-purple/10 hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-colors group">
                            {/* Employee Column */}
                            <div className="p-4 flex items-center gap-3">
                                <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                                <div>
                                    <div className="font-medium text-sm text-ink-black dark:text-pearl">{emp.name}</div>
                                    <div className="text-xs text-silver-mist">{emp.role}</div>
                                </div>
                            </div>

                            {/* Shifts Columns */}
                            <div className="grid grid-cols-7">
                                {roster[emp.id].map((shiftId, dayIndex) => {
                                    // @ts-ignore
                                    const shiftConfig = Object.values(SHIFT_TYPES).find(s => s.id === shiftId);
                                    if (!shiftConfig) return null;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className="border-l border-cloud dark:border-nebula-purple/20 p-1 cursor-pointer"
                                            onClick={() => handleCellClick(emp.id, dayIndex)}
                                        >
                                            <div className={`h-full w-full rounded-md flex flex-col items-center justify-center gap-1 transition-all hover:opacity-80 ${shiftConfig.color}`}>
                                                <shiftConfig.icon className="w-4 h-4" />
                                                <span className="text-[10px] font-bold">{shiftConfig.label}</span>
                                                <span className="text-[9px] opacity-75 hidden xl:block">{shiftConfig.time}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Scheduled Hrs" value={`${stats.hours}h`} icon={Clock} color="text-celestial-indigo" />
                <StatCard label="Morning Shifts" value={stats.shiftCounts.M.toString()} icon={Sun} color="text-amber-500" />
                <StatCard label="Night Shifts" value={stats.shiftCounts.N.toString()} icon={Moon} color="text-slate-500" />
                <StatCard label="Coverage" value="98%" icon={User} color="text-emerald-500" />
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-stellar-blue p-3 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-deep-cosmos ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-lg font-bold text-ink-black dark:text-pearl leading-none">{value}</div>
                <div className="text-xs text-silver-mist mt-0.5">{label}</div>
            </div>
        </div>
    );
}

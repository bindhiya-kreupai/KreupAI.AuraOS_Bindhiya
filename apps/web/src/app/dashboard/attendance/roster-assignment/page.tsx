"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Users,
    Filter,
    Save,
    Upload,
    MoreHorizontal
} from 'lucide-react';
import { RosterService } from '../services';

const DATES = [
    { day: 'Mon', date: '01' },
    { day: 'Tue', date: '02' },
    { day: 'Wed', date: '03' },
    { day: 'Thu', date: '04' },
    { day: 'Fri', date: '05' },
    { day: 'Sat', date: '06' },
    { day: 'Sun', date: '07' },
];

const SHIFT_TYPES = {
    G: { label: 'General', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    M: { label: 'Morning', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    N: { label: 'Night', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    WO: { label: 'Week Off', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const getShiftCode = (rosters: any[], empId: string, dateIdx: number): string => {
    const roster = rosters.find((r: any) => (r.employeeId || r.id) === empId);
    if (roster && roster.shifts && roster.shifts[dateIdx]) {
        return roster.shifts[dateIdx];
    }
    // If no roster data, return empty
    return '';
};

interface Employee {
    id: string;
    name: string;
    role: string;
    avatar: string;
}

export default function RosterAssignmentPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [rosters, setRosters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRosters();
    }, []);

    const fetchRosters = async () => {
        try {
            setLoading(true);
            const result = await RosterService.getRosters();
            setRosters(result || []);
            // Extract employees from roster data
            const empList: Employee[] = (result || []).map((r: any) => ({
                id: r.employeeId || r.id,
                name: r.employeeName || r.name || 'Unknown',
                role: r.role || r.department || '',
                avatar: (r.employeeName || r.name || 'U').split(' ').map((n: string) => n[0]).join(''),
            }));
            // Deduplicate by id
            const unique = empList.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);
            setEmployees(unique);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Roster Assignment
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Manage weekly shift schedules and assignments.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4" /> Bulk Upload
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        <Save className="w-4 h-4" /> Publish Roster
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-ink-black dark:text-pearl">Apr 01 - Apr 07, 2025</span>
                        <span className="text-xs text-silver-mist">Week 14</span>
                    </div>
                    <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search employee..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none" />
                    </div>
                    <button className="p-2 border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Filter className="w-4 h-4 text-slate-500" />
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-2" />

                    <div className="flex gap-2">
                        {Object.entries(SHIFT_TYPES).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <span className={`w-3 h-3 rounded-full ${val.color.split(' ')[0]}`} />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{val.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Roster Grid */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="p-4 text-left min-w-[200px] border-b border-r border-cloud dark:border-nebula-purple/50 sticky left-0 bg-slate-50 dark:bg-slate-900/50 z-10">Employee</th>
                            {DATES.map((d, i) => (
                                <th key={i} className="p-2 text-center border-b border-cloud dark:border-nebula-purple/50 min-w-[80px]">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-silver-mist font-medium uppercase">{d.day}</span>
                                        <span className={`text-lg font-bold ${['Sat', 'Sun'].includes(d.day) ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>{d.date}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="p-4 text-center border-b border-cloud dark:border-nebula-purple/50 min-w-[60px]">Stats</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-slate-400">No employees found</td>
                            </tr>
                        ) : (
                        employees.map((emp, empIdx) => (
                            <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 border-r border-cloud dark:border-nebula-purple/50 sticky left-0 bg-white dark:bg-stellar-blue z-10 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-500">
                                            {emp.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl">{emp.name}</div>
                                            <div className="text-xs text-silver-mist">{emp.role}</div>
                                        </div>
                                    </div>
                                </td>
                                {DATES.map((d, dateIdx) => {
                                    const shiftCode = getShiftCode(rosters, emp.id, dateIdx);
                                    // @ts-ignore
                                    const style = SHIFT_TYPES[shiftCode] || SHIFT_TYPES['G'];
                                    return (
                                        <td key={dateIdx} className="p-2 text-center border-r border-cloud dark:border-nebula-purple/20 border-dahed bg-white dark:bg-transparent">
                                            <div className="group relative w-full h-12 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-200 transition-all">
                                                <div className={`px-2 py-1 rounded text-xs font-bold border ${style.color}`}>
                                                    {shiftCode}
                                                </div>
                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="p-2 text-center text-xs text-silver-mist">
                                    45h
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

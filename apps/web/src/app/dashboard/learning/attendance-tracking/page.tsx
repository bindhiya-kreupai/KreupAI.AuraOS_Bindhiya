"use client";

import React, { useState } from 'react';
import {
    Users,
    CheckSquare,
    Search
} from 'lucide-react';

export default function AttendanceTrackingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Attendance Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Mark and verify attendance for training sessions.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Leadership Workshop (Oct 28)</h3>
                        <p className="text-sm text-slate-500">Instructor: Sarah Connor</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 text-sm">Mark All Present</button>
                    </div>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Employee ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { id: 'EMP-001', name: 'Alice Johnson', dept: 'Engineering', status: 'Present' },
                            { id: 'EMP-002', name: 'Bob Williams', dept: 'Sales', status: 'Absent' },
                            { id: 'EMP-003', name: 'Charlie Brown', dept: 'Marketing', status: 'Present' },
                            { id: 'EMP-004', name: 'David Lee', dept: 'Finance', status: 'Present' },
                        ].map((person, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-mono text-slate-500">{person.id}</td>
                                <td className="px-6 py-4 font-bold">{person.name}</td>
                                <td className="px-6 py-4">{person.dept}</td>
                                <td className="px-6 py-4">
                                    <select className={`bg-transparent border-none font-bold focus:ring-0 ${person.status === 'Present' ? 'text-emerald-600' : 'text-rose-600'
                                        }`} defaultValue={person.status}>
                                        <option>Present</option>
                                        <option>Absent</option>
                                        <option>Excused</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Loader2
} from 'lucide-react';
import { TrainingSessionService } from '../services';

export default function AttendanceTrackingPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await TrainingSessionService.getTrainingSessions();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Users className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No training sessions found</p>
                    <p className="text-sm">Sessions and their attendance will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((session, idx) => (
                        <div key={session.id || idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-lg">{session.title} ({session.startDate ? new Date(session.startDate).toLocaleDateString() : ''})</h3>
                                    <p className="text-sm text-slate-500">Instructor: {session.instructor || session.instructorName || 'TBD'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 text-sm">Mark All Present</button>
                                </div>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Attendee</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(session.attendees || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No attendees registered</td>
                                        </tr>
                                    ) : (
                                        session.attendees.map((person: any, i: number) => (
                                            <tr key={person.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4 font-bold">{person.learnerName || person.employeeId}</td>
                                                <td className="px-6 py-4">
                                                    <select className="bg-transparent border-none font-bold focus:ring-0 text-emerald-600" defaultValue={person.attendanceStatus || person.status}>
                                                        <option>Present</option>
                                                        <option>Absent</option>
                                                        <option>Excused</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{person.registeredAt ? new Date(person.registeredAt).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


"use client";

import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { AttendanceAnalyticsService } from '../services';

interface Exception {
    id: number | string;
    emp: string;
    date: string;
    type: string;
    actual: string;
    expected: string;
    status: string;
}

interface ExceptionStats {
    total: number;
    lateIn: number;
    earlyOut: number;
    absent: number;
}

export default function AttendanceExceptionsPage() {
    const [exceptionList, setExceptionList] = useState<Exception[]>([]);
    const [stats, setStats] = useState<ExceptionStats>({
        total: 0,
        lateIn: 0,
        earlyOut: 0,
        absent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExceptions();
    }, []);

    const fetchExceptions = async () => {
        try {
            const exceptions = await AttendanceAnalyticsService.getExceptions();
            if (exceptions.length > 0) {
                setExceptionList(exceptions as any);
                // Calculate stats from exceptions
                const lateIn = exceptions.filter((e: any) => e.type?.includes('Late')).length;
                const earlyOut = exceptions.filter((e: any) => e.type?.includes('Early')).length;
                const absent = exceptions.filter((e: any) => e.type?.includes('Absent')).length;
                setStats({
                    total: exceptions.length,
                    lateIn,
                    earlyOut,
                    absent,
                });
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string | number, action: 'regularize' | 'deduct') => {
        setLoading(true);
        try {
            // TODO: Implement exception resolution via API
                        await fetchExceptions();
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
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        Attendance Exceptions
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Review and resolve attendance anomalies.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                        <CheckCircle className="w-4 h-4" /> Approve Selected
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs font-bold text-silver-mist uppercase">Total Exceptions</p>
                    <h3 className="text-2xl font-bold text-ink-black dark:text-pearl">{stats.total}</h3>
                </div>
                <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs font-bold text-silver-mist uppercase">Late In</p>
                    <h3 className="text-2xl font-bold text-amber-500">{stats.lateIn}</h3>
                </div>
                <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs font-bold text-silver-mist uppercase">Early Out</p>
                    <h3 className="text-2xl font-bold text-indigo-500">{stats.earlyOut}</h3>
                </div>
                <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs font-bold text-silver-mist uppercase">Absent</p>
                    <h3 className="text-2xl font-bold text-rose-500">{stats.absent}</h3>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-center">Timings</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                                </td>
                            </tr>
                        ) : exceptionList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">No exceptions found</td>
                            </tr>
                        ) : (
                        exceptionList.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-bold text-ink-black dark:text-pearl">{row.emp}</td>
                                <td className="px-6 py-4 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Calendar className="w-3.5 h-3.5" /> {row.date}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${row.type.includes('Late') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            row.type.includes('Early') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                        {row.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs">
                                        <span className="text-slate-400">{row.expected}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{row.actual}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-bold text-slate-500">{row.status}</span>
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleResolve(row.id, 'regularize')}
                                        disabled={loading}
                                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                        title="Regularize">
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleResolve(row.id, 'deduct')}
                                        disabled={loading}
                                        className="p-1.5 bg-rose-100 text-rose-600 rounded hover:bg-rose-200 transition-colors disabled:opacity-50"
                                        title="Deduct Leave">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        )))
                        }
                    </tbody>
                </table>
            </div>

        </div>
    );
}

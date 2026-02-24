"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Edit,
    Trash2,
    Plus,
    Loader2
} from 'lucide-react';
import { LeaveTypeService } from '../services';
import type { LeaveType } from '../types';

export default function LeaveTypesPage() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const fetchLeaveTypes = async () => {
        try {
            setLoading(true);
            const result = await LeaveTypeService.getLeaveTypes();
            setLeaveTypes(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-500" />
                        Leave Types
                    </h1>
                    <p className="text-slate-500 text-sm">Configure available leave categories.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Type
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Defined Leave Types</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Type Name</th>
                            <th className="px-6 py-4">Abbreviation</th>
                            <th className="px-6 py-4">Paid</th>
                            <th className="px-6 py-4">Carry Forward</th>
                            <th className="px-6 py-4">Encashable</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading leave types...
                                    </div>
                                </td>
                            </tr>
                        ) : leaveTypes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No leave types configured yet.
                                </td>
                            </tr>
                        ) : leaveTypes.map((type, i) => (
                            <tr key={type.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold">{type.name}</td>
                                <td className="px-6 py-4 font-mono text-slate-500">{type.code}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${type.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                                        }`}>{type.isPaid ? 'Paid' : 'Unpaid'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {type.isCarryForwardAllowed != null
                                        ? (type.isCarryForwardAllowed
                                            ? `Max ${type.maxCarryForwardDays ?? 'N/A'} Days`
                                            : 'No')
                                        : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    {type.isEncashable != null
                                        ? (type.isEncashable
                                            ? <span className="text-emerald-600 font-bold">Yes</span>
                                            : <span className="text-slate-400">No</span>)
                                        : <span className="text-slate-400">N/A</span>}
                                </td>
                                <td className="px-6 py-4 text-center flex items-center justify-center gap-3">
                                    <button className="text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                                    <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


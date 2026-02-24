"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Search,
    Filter,
    FileText,
    User,
    Clock,
    Download
} from 'lucide-react';
import { AuditLogService } from '../services';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await AuditLogService.getAll();
            if (result.length > 0) {
                setLogs(result);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    // Mock data for display
    const displayLogs = logs.length > 0 ? logs : [
        { time: '10:42:15 AM', date: 'Today', user: 'Admin User', action: 'UPDATE', resource: 'Salary Structure', details: 'Updated Basic Pay for Emp #1024' },
        { time: '10:15:30 AM', date: 'Today', user: 'HR Manager', action: 'CREATE', resource: 'New Hire', details: 'Added John Doe (Emp #1045)' },
        { time: '09:55:00 AM', date: 'Today', user: 'System', action: 'AUTO', resource: 'Attendance', details: 'Marked Absent: 12 Employees' },
        { time: '05:30:22 PM', date: 'Yesterday', user: 'Admin User', action: 'DELETE', resource: 'Leave Policy', details: 'Removed "Old Sick Leave" Policy' },
        { time: '04:12:10 PM', date: 'Yesterday', user: 'Sarah Connor', action: 'LOGIN', resource: 'SAML Auth', details: 'Login Success via Okta' },
    ];

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-indigo-500" />
                        System Audit Logs
                    </h1>
                    <p className="text-slate-500 text-sm">Track all data changes, deletions, and access events across the platform.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
                {/* Filters */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" /> Filters
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Date Range</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold">
                                    <option>Last 24 Hours</option>
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Custom Range</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Module</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold">
                                    <option>All Modules</option>
                                    <option>Employee Records</option>
                                    <option>Payroll</option>
                                    <option>Security</option>
                                    <option>User Management</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Action Type</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold">
                                    <option>All Actions</option>
                                    <option>Create</option>
                                    <option>Update</option>
                                    <option>Delete</option>
                                    <option>Login/Access</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">User</label>
                                <input type="text" placeholder="Search user..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold" />
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="py-3 pl-6">Timestamp</th>
                                    <th className="py-3">User</th>
                                    <th className="py-3">Action</th>
                                    <th className="py-3">Resource</th>
                                    <th className="py-3 text-right pr-6">Details</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {displayLogs.map((log, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 pl-6">
                                            <div className="font-bold text-slate-700 dark:text-slate-300">{log.time}</div>
                                            <div className="text-[10px] text-slate-400">{log.date}</div>
                                        </td>
                                        <td className="py-4 text-slate-600 dark:text-slate-400 font-bold">{log.user}</td>
                                        <td className="py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded 
                                                ${log.action === 'DELETE' ? 'bg-rose-100 text-rose-600' :
                                                    log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                                                        log.action === 'UPDATE' ? 'bg-indigo-100 text-indigo-600' :
                                                            'bg-slate-100 text-slate-600'}
                                            `}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-600 dark:text-slate-400 font-bold">{log.resource}</td>
                                        <td className="py-4 text-right pr-6">
                                            <button className="text-xs text-indigo-500 font-bold hover:underline max-w-[200px] truncate block ml-auto" title={log.details}>
                                                {log.details}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                            <button className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Load More Logs</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React from 'react';
import {
    FileText,
    Eye,
    Download,
    Printer,
    Search,
    Filter
} from 'lucide-react';

export default function DocumentAccessLogsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Document Access Logs
                    </h1>
                    <p className="text-slate-500 text-sm">Track who is viewing, downloading, and printing confidential company documents.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search filename or user..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
                    <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-2">
                        <Filter className="w-3 h-3" /> All Actions
                    </button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-slate-50">Viewed</button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-slate-50">Downloaded</button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-slate-50">Printed</button>
                </div>

                <div className="overflow-y-auto flex-1 p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                            <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                <th className="py-3 pl-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-tl-lg">Document Name</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Accessed By</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Action</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Timestamp</th>
                                <th className="py-3 pr-6 text-right bg-slate-50/50 dark:bg-slate-800/50 rounded-tr-lg">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { file: 'Q1_Financial_Report.pdf', user: 'John Doe', role: 'Finance', action: 'Download', time: 'Today, 10:45 AM', ip: '192.168.1.45' },
                                { file: 'Employee_Contract_JSmith.pdf', user: 'Sarah Connor', role: 'HR Manager', action: 'View', time: 'Today, 09:12 AM', ip: '192.168.1.12' },
                                { file: 'Marketing_Budget_2025.xlsx', user: 'Mike Ross', role: 'Marketing', action: 'Print', time: 'Yesterday, 04:30 PM', ip: '10.5.2.11' },
                                { file: 'Payroll_Data_Master.csv', user: 'Admin User', role: 'Super Admin', action: 'Download', time: 'Yesterday, 02:15 PM', ip: '192.168.1.1' },
                                { file: 'Project_Alpha_Specs.docx', user: 'Dev Lead', role: 'Engineering', action: 'View', time: 'Yesterday, 11:00 AM', ip: '10.0.0.55' },
                                { file: 'Board_Meeting_Minutes.pdf', user: 'CEO', role: 'Executive', action: 'View', time: '2 days ago', ip: 'VPN-Secure' },
                            ].map((log, i) => (
                                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{log.file}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{log.user}</div>
                                        <div className="text-xs text-slate-500">{log.role}</div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
                                            ${log.action === 'Download' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                log.action === 'Print' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}
                                        `}>
                                            {log.action === 'Download' && <Download className="w-3 h-3" />}
                                            {log.action === 'Print' && <Printer className="w-3 h-3" />}
                                            {log.action === 'View' && <Eye className="w-3 h-3" />}
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{log.time}</td>
                                    <td className="py-4 pr-6 text-right text-slate-400 text-xs font-mono">{log.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

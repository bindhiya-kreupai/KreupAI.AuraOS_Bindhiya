"use client";

import React from 'react';
import {
    FileCheck,
    Check,
    X,
    Clock,
    User,
    ArrowRight
} from 'lucide-react';

export default function ApprovalLogsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-indigo-500" />
                        Approval Logs
                    </h1>
                    <p className="text-slate-500 text-sm">Centralized audit trail of all approval decisions across modules.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto flex-1 p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50">
                            <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                <th className="py-3 pl-6 bg-slate-50/50 dark:bg-slate-800/50">Request Type</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Requester</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Action</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Approver</th>
                                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Timestamp</th>
                                <th className="py-3 pr-6 bg-slate-50/50 dark:bg-slate-800/50 text-right">Comments</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { type: 'Expense Claim', id: '#EXP-2024-001', requester: 'John Doe', action: 'Approved', approver: 'Sarah Connor', time: '10 mins ago', comment: 'Approved as per policy.' },
                                { type: 'Leave Application', id: '#LV-8892', requester: 'Mike Ross', action: 'Rejected', approver: 'Harvey Specter', time: '1 hour ago', comment: 'Critical project delivery phase.' },
                                { type: 'Access Request', id: '#IT-9922', requester: 'New Intern', action: 'Approved', approver: 'IT Admin', time: '2 hours ago', comment: 'Granted read-only access.' },
                                { type: 'Device Procurement', id: '#PO-1122', requester: 'Engineering Lead', action: 'Approved', approver: 'Finance Head', time: 'Yesterday', comment: 'Budget code verified.' },
                                { type: 'WFH Request', id: '#WFH-332', requester: 'Rachel Zane', action: 'Approved', approver: 'Louis Litt', time: 'Yesterday', comment: 'Ok.' },
                                { type: 'Payroll Run', id: '#PAY-MAR-24', requester: 'System', action: 'Auto-Approved', approver: 'Policy Engine', time: 'Mar 31, 2025', comment: 'No anomalies detected.' },
                            ].map((log, i) => (
                                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 pl-6">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{log.type}</div>
                                        <div className="text-xs text-slate-400 font-mono">{log.id}</div>
                                    </td>
                                    <td className="py-4 font-medium text-slate-600 dark:text-slate-400">{log.requester}</td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
                                            ${log.action.includes('Approved') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                log.action === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                    'bg-slate-100 text-slate-600'}
                                        `}>
                                            {log.action.includes('Approved') ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                {log.approver.charAt(0)}
                                            </div>
                                            {log.approver}
                                        </div>
                                    </td>
                                    <td className="py-4 text-xs text-slate-500 font-mono">{log.time}</td>
                                    <td className="py-4 pr-6 text-right max-w-[200px]">
                                        <span className="text-xs text-slate-500 italic truncate block" title={log.comment}>"{log.comment}"</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

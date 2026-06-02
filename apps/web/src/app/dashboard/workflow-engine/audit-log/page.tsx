'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Download, Loader2 } from 'lucide-react';
import { WorkflowExecutionService } from '../services';

export default function AuditLogPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const data = await WorkflowExecutionService.getExecutions();
            const auditLogs = (data || []).map((exec: any) => ({
                id: exec.id || exec.executionCode,
                event: `Workflow ${exec.status === 'COMPLETED' ? 'Completed' : exec.status === 'FAILED' ? 'Failed' : exec.status === 'RUNNING' ? 'Running' : exec.status}`,
                resource: exec.definition?.name || exec.workflowName || 'Unknown',
                user: exec.triggeredBy || exec.initiatorName || 'System',
                time: exec.startedAt ? new Date(exec.startedAt).toLocaleString() : exec.initiatedDate ? new Date(exec.initiatedDate).toLocaleString() : 'N/A',
                status: exec.status === 'COMPLETED' ? 'Success' : exec.status === 'FAILED' ? 'Error' : 'Info',
            }));
            setLogs(auditLogs);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-slate-500" />
                        Audit Log
                    </h1>
                    <p className="text-slate-500 text-sm">Detailed record of all system activities and changes.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Filter className="w-4 h-4 text-slate-500" /></button>
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Download className="w-4 h-4 text-slate-500" /></button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-sm border-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                </div>

                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-500 mb-2">No Audit Logs</h3>
                        <p className="text-sm text-slate-400">Workflow execution logs will appear here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.map((log, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold">{log.event}</td>
                                    <td className="px-6 py-4 text-slate-500">{log.resource}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{log.user[0]}</div>
                                        {log.user}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{log.time}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'Success' ? 'bg-emerald-100 text-emerald-600' :
                                                log.status === 'Error' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}


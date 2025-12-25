'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Download } from 'lucide-react';
import { WorkflowExecutionService } from '../services';

const LOGS = [
    { id: 'LOG-001', event: 'Workflow Executed', resource: 'Expense #442', user: 'System', time: '10:45 AM', status: 'Success' },
    { id: 'LOG-002', event: 'Rule Modified', resource: 'Approval limit > 5k', user: 'Admin', time: '10:30 AM', status: 'Info' },
    { id: 'LOG-003', event: 'Execution Failed', resource: 'Sync to Salesforce', user: 'System', time: '09:15 AM', status: 'Error' },
    { id: 'LOG-004', event: 'Workflow Published', resource: 'Leave Request v2', user: 'Admin', time: 'Yesterday', status: 'Success' },
    { id: 'LOG-005', event: 'Form Updated', resource: 'Travel Request Form', user: 'Sarah C.', time: 'Yesterday', status: 'Info' },
];

export default function AuditLogPage() {
    const [logs, setLogs] = useState<any[]>(LOGS);
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const data = await WorkflowExecutionService.getExecutions();
            setExecutions(data);
            // Transform executions into audit log format if needed
            if (data.length > 0) {
                const auditLogs = data.map((exec: any) => ({
                    id: exec.executionCode,
                    event: 'Workflow Executed',
                    resource: exec.workflowName,
                    user: exec.initiatorName || 'System',
                    time: new Date(exec.initiatedDate).toLocaleString(),
                    status: exec.status === 'completed' ? 'Success' : exec.status === 'failed' ? 'Error' : 'Info'
                }));
                setLogs([...auditLogs, ...LOGS]);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        {LOGS.map((log, idx) => (
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
            </div>
        </div>
    );
}

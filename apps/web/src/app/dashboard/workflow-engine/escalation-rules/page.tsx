'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { WorkflowExecutionService } from '../services';

export default function EscalationRulesPage() {
    const [escalations, setEscalations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEscalations();
    }, []);

    const fetchEscalations = async () => {
        try {
            setLoading(true);
            const data = await WorkflowExecutionService.getExecutions();
            const escalationData = (data || [])
                .filter((exec: any) => exec.status === 'RUNNING' || exec.status === 'FAILED')
                .map((exec: any) => ({
                    id: exec.id,
                    name: exec.definition?.name || exec.workflowName || 'Unknown Workflow',
                    trigger: exec.status === 'FAILED' ? 'Execution failed' : 'Still running',
                    action: exec.status === 'FAILED' ? 'Alert administrator' : 'Monitor progress',
                    severity: exec.status === 'FAILED' ? 'High' : 'Medium',
                }));
            setEscalations(escalationData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                        Escalation Rules
                    </h1>
                    <p className="text-slate-500 text-sm">Manage time-based triggers and overdue actions.</p>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                    + Add Rule
                </button>
            </div>

            {escalations.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 mb-2">No Escalation Rules</h3>
                    <p className="text-sm text-slate-400">No workflow instances require escalation at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {escalations.map(rule => (
                        <div key={rule.id} className="bg-white dark:bg-slate-900 border-l-4 border-orange-500 p-6 rounded-r-xl shadow-sm border-t border-r border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <div className="font-bold text-lg">{rule.name}</div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${rule.severity === 'High' ? 'bg-red-100 text-red-600' : rule.severity === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {rule.severity}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>{rule.trigger}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                    <span className="font-medium">{rule.action}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


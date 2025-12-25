'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { WorkflowExecutionService } from '../services';

const ESCALATIONS = [
    { id: 1, name: 'Expense Approval Delay', trigger: 'If pending > 3 days', action: 'Notify Manager + Skip Level', severity: 'Medium' },
    { id: 2, name: 'High Priority Ticket', trigger: 'If not resolved in 4 hours', action: 'Alert Dept Head', severity: 'High' },
    { id: 3, name: 'Leave Request Stagnation', trigger: 'If pending > 5 days', action: 'Auto-Approve', severity: 'Low' },
];

export default function EscalationRulesPage() {
    const [escalations, setEscalations] = useState<any[]>(ESCALATIONS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEscalations();
    }, []);

    const fetchEscalations = async () => {
        try {
            setLoading(true);
            const data = await WorkflowExecutionService.getExecutions();
            // Extract escalation data if available
            if (data.length > 0) {
                // Keep mock data as fallback
            }
        } catch (error) {
            console.error('Error fetching escalation rules:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ESCALATIONS.map(rule => (
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
        </div>
    );
}

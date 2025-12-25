'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Code, Filter, CheckSquare } from 'lucide-react';
import { WorkflowService } from '../services';

const RULES = [
    { id: 1, name: 'Expense > $5k Limit', condition: 'IF expense.amount > 5000', action: 'Route to CFO', active: true },
    { id: 2, name: 'International Travel', condition: 'IF travel.type == "International"', action: 'Require HR Clearance', active: true },
    { id: 3, name: 'Weekend Overtime', condition: 'IF day IN [Sat, Sun]', action: 'Apply 2x Rate', active: false },
];

export default function ConditionalLogicPage() {
    const [rules, setRules] = useState<any[]>(RULES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await WorkflowService.getWorkflows();
            // Extract conditional rules from workflows if available
            if (data.length > 0) {
                // Keep mock data as fallback
            }
        } catch (error) {
            console.error('Error fetching conditional rules:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code className="w-6 h-6 text-emerald-500" />
                        Conditional Logic
                    </h1>
                    <p className="text-slate-500 text-sm">Define business rules and logic triggers.</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                    + New Rule
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Rule Name</th>
                            <th className="px-6 py-4">Condition (Pseudo-code)</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {RULES.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{rule.name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded w-fit">
                                    {rule.condition}
                                </td>
                                <td className="px-6 py-4">{rule.action}</td>
                                <td className="px-6 py-4">
                                    <div className={`w-8 h-4 rounded-full p-0.5 ${rule.active ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'} flex items-center transition-colors cursor-pointer`}>
                                        <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-indigo-600">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

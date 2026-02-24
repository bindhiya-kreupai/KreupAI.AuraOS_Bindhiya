"use client";

import React, { useState, useEffect } from 'react';
import {
    GitPullRequest,
    Plus,
    User,
    ArrowDown,
    CheckCircle,
    Copy,
    Save
} from 'lucide-react';
import { ApprovalWorkflowService } from '../services';

interface WorkflowConfig {
    eventType: string;
    levels: Array<{
        level: number;
        approver: string;
        sla: string;
        condition?: string;
    }>;
}

export default function ApprovalWorkflowPage() {
    const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
    const [selectedEvent, setSelectedEvent] = useState('Regularization Request');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const result = await ApprovalWorkflowService.getWorkflows();
            setWorkflows(result || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await ApprovalWorkflowService.createWorkflow({
                name: selectedEvent,
                type: selectedEvent,
                levels: [
                    { level: 1, approver: 'Reporting Manager', sla: '24 hours' },
                    { level: 2, approver: 'Department Head', sla: '48 hours' }
                ]
            });
            await fetchWorkflows();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <GitPullRequest className="w-6 h-6 text-indigo-500" />
                        Approval Workflows
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Configure hierarchy for attendance and leave requests.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchWorkflows}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                        <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save Workflow
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">

                {/* Sidebar: Event Types */}
                <div className="lg:col-span-1 space-y-2">
                    {['Regularization Request', 'Leave Application', 'Overtime Approval', 'WFH Request', 'Shift Change'].map((item, i) => (
                        <div key={i} className={`p-4 rounded-xl border cursor-pointer font-bold text-sm flex items-center justify-between ${i === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}>
                            {item}
                            {i === 0 && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Event Type
                    </button>
                </div>

                {/* Visual Designer Canvas */}
                <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-inner p-10 min-h-[500px] flex justify-center">

                    <div className="flex flex-col items-center">

                        {/* Start Node */}
                        <div className="px-6 py-3 bg-white dark:bg-stellar-blue border border-slate-300 dark:border-slate-700 rounded-full shadow-sm text-sm font-bold text-slate-600 mb-2">
                            Request Submitted
                        </div>
                        <ArrowDown className="w-5 h-5 text-slate-400 mb-2" />

                        {/* Level 1 */}
                        <div className="w-64 p-4 bg-white dark:bg-stellar-blue border-l-4 border-indigo-500 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-indigo-500 uppercase">Level 1 Approver</span>
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <h4 className="font-bold text-md text-ink-black dark:text-pearl">Reporting Manager</h4>
                            <p className="text-xs text-silver-mist mt-1">SLA: 24 Hours</p>

                            {/* Hover Actions */}
                            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:text-indigo-600 shadow-sm"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <ArrowDown className="w-5 h-5 text-slate-400 my-2" />

                        {/* Level 2 */}
                        <div className="w-64 p-4 bg-white dark:bg-stellar-blue border-l-4 border-purple-500 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-purple-500 uppercase">Level 2 Approver</span>
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <h4 className="font-bold text-md text-ink-black dark:text-pearl">Department Head</h4>
                            <p className="text-xs text-silver-mist mt-1">Condition: If {'{Duration}'} &gt; 3 Days</p>
                        </div>

                        <ArrowDown className="w-5 h-5 text-slate-400 my-2" />

                        {/* End Node */}
                        <div className="px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full shadow-sm text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Final Approval
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}


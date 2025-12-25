"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    GitBranch,
    Play,
    Plus,
    Settings,
    Save,
    MoreVertical
} from 'lucide-react';
import { DialogueFlowService } from '../services';

export default function DialogueDesignerPage() {
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await DialogueFlowService.getAllFlows();
            if (result.length > 0) {
                setFlows(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-indigo-500" />
                        Dialogue Designer
                    </h1>
                    <p className="text-slate-500 text-sm">Design conversation flows visually.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all">
                        <Play className="w-4 h-4" /> Test Bot
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                        <Save className="w-4 h-4" /> Save Flow
                    </button>
                </div>
            </div>

            {/* Visual Editor Area */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
                {/* Tools Sidebar */}
                <div className="absolute left-4 top-4 bottom-4 w-12 bg-white dark:bg-slate-800 shadow-lg rounded-xl flex flex-col items-center py-4 gap-4 z-10 border border-slate-200 dark:border-slate-700">
                    <button className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400" title="Add Message">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400" title="Add Condition">
                        <GitBranch className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400" title="Settings">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Canvas Area (Mocked Nodes) */}
                <div className="absolute inset-0 p-10 ml-20 overflow-auto flex items-center justify-center">
                    <div className="relative min-w-[800px] min-h-[600px] grid place-items-center">

                        {/* Start Node */}
                        <div className="absolute top-10 left-[45%] transform -translate-x-1/2">
                            <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-md text-sm">
                                Start: Welcome
                            </div>
                            <div className="w-0.5 h-10 bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                        </div>

                        {/* Node 1 */}
                        <div className="absolute top-24 left-[45%] transform -translate-x-1/2 w-64 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-xl shadow-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-indigo-500 uppercase">Bot Message</span>
                                <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                            </div>
                            <p className="text-sm font-medium">"Hi there! How can I help you today?"</p>
                            <div className="mt-4 flex gap-2">
                                <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">Benefits</div>
                                <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">Payroll</div>
                            </div>

                            {/* Connecting Lines */}
                            <div className="absolute -bottom-10 left-10 w-0.5 h-10 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute -bottom-10 right-10 w-0.5 h-10 bg-slate-300 dark:bg-slate-600"></div>
                        </div>

                        {/* Branch Nodes */}
                        <div className="absolute top-64 left-[30%] w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-4">
                            <div className="text-xs font-bold text-slate-400 mb-1">User Intent: #Benefits</div>
                            <p className="text-sm">Show health plan options...</p>
                        </div>

                        <div className="absolute top-64 right-[30%] w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-4">
                            <div className="text-xs font-bold text-slate-400 mb-1">User Intent: #Payroll</div>
                            <p className="text-sm">Redirect to payslip view...</p>
                        </div>
                    </div>
                </div>

                {/* Grid Background */}
                <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
            </div>
        </div>
    );
}

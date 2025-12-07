'use client';

import React from 'react';
import { PlayCircle, Terminal, Cpu } from 'lucide-react';

export default function TestingModePage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PlayCircle className="w-6 h-6 text-emerald-500" />
                        Simulation & Testing
                    </h1>
                    <p className="text-slate-500 text-sm">Dry-run workflows with mock data before deployment.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                {/* Input Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-slate-500" /> Test Inputs
                    </h3>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Workflow Context</label>
                            <select className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm">
                                <option>Expense Approval (v1.4)</option>
                                <option>Leave Request (v2.0)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Input JSON Payload</label>
                            <textarea
                                className="w-full h-40 mt-1 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg p-3 border-none resize-none"
                                defaultValue={`{
  "request_id": "EXP-2024-001",
  "employee_id": "EMP123",
  "amount": 5500.00,
  "category": "Travel",
  "justification": "Client meeting in NY"
}`}
                            />
                        </div>
                        <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                            Run Simulation
                        </button>
                    </div>
                </div>

                {/* Output Console */}
                <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 p-6 font-mono text-sm overflow-y-auto">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                        <Terminal className="w-5 h-5" /> Execution Log
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="text-slate-500">[10:45:01] Initializing simulation...</div>
                        <div className="text-blue-400">[10:45:01] Trigger: 'Form Submitted' fired</div>
                        <div>[10:45:01] Data: {"{"} amount: 5500 {"}"}</div>
                        <div className="text-amber-400">[10:45:02] Evaluating Condition: Amount &gt; 5000</div>
                        <div className="text-emerald-400">[10:45:02] Result: TRUE</div>
                        <div className="text-blue-400">[10:45:02] Action: 'Route to CFO' initiated</div>
                        <div className="text-purple-400">[10:45:03] Notification: Email sent to cfo@company.com</div>
                        <div className="text-emerald-500 font-bold mt-4">✓ Workflow Completed Successfully</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

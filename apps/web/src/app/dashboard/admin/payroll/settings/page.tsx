"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Calendar,
    FileText,
    Clock,
    Save,
    CheckCircle2,
    ToggleLeft,
    ToggleRight,
    Layout,
    Eye,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PayrollSettingsService } from '../../payroll/services';

// --- MOCK DATA ---

const PAYSLIP_FIELDS = [
    { id: 'f1', label: 'Employee ID', enabled: true },
    { id: 'f2', label: 'Department', enabled: true },
    { id: 'f3', label: 'Designation', enabled: true },
    { id: 'f4', label: 'Date of Joining', enabled: true },
    { id: 'f5', label: 'UAN Number', enabled: true },
    { id: 'f6', label: 'PF Number', enabled: true },
    { id: 'f7', label: 'ESI Number', enabled: false },
    { id: 'f8', label: 'Bank Account Details', enabled: true },
    { id: 'f9', label: 'PAN Number', enabled: true },
    { id: 'f10', label: 'Leave Balance Summary', enabled: true },
    { id: 'f11', label: 'YTD (Year to Date) Summary', enabled: false },
];

export default function PayrollSettingsPage() {
    const [activeTab, setActiveTab] = useState<'General' | 'Payslip Design' | 'Cutoff Rules'>('General');

    // Config State
    const [generalConfig, setGeneralConfig] = useState({
        cycle: 'Monthly',
        startDay: 1,
        payDay: 'Last Working Day',
        currency: 'INR (₹)'
    });

    const [payslipConfig, setPayslipConfig] = useState(PAYSLIP_FIELDS);
    const [selectedLayout, setSelectedLayout] = useState('Modern');
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollSettingsService.getSettings();
            if (result) {
                setSettings(result);
            }
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const toggleField = (id: string) => {
        setPayslipConfig(payslipConfig.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-500" />
                        Payroll Settings
                    </h1>
                    <p className="text-silver-mist text-sm">Configure pay cycles, cutoff dates, and payslip templates.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Main Configuration */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['General', 'Payslip Design', 'Cutoff Rules'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                                    ${activeTab === tab
                                        ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        {activeTab === 'General' && (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-500" /> Pay Cycle Definition
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Pay Frequency</label>
                                            <select
                                                value={generalConfig.cycle}
                                                onChange={(e) => setGeneralConfig({ ...generalConfig, cycle: e.target.value })}
                                                className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                                            >
                                                <option>Monthly</option>
                                                <option>Bi-Weekly</option>
                                                <option>Weekly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">cycle Start Day</label>
                                            <select
                                                className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                                            >
                                                <option>1st of Month</option>
                                                <option>26th of Previous Month</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Payout Day</label>
                                            <select
                                                value={generalConfig.payDay}
                                                onChange={(e) => setGeneralConfig({ ...generalConfig, payDay: e.target.value })}
                                                className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                                            >
                                                <option>Last Working Day</option>
                                                <option>1st of Next Month</option>
                                                <option>5th of Next Month</option>
                                                <option>7th of Next Month</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Base Currency</label>
                                            <input
                                                type="text"
                                                value={generalConfig.currency}
                                                disabled
                                                className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm outline-none text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Payslip Design' && (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-500" /> Templates & Fields
                                        </h3>
                                        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            {['Modern', 'Classic', 'Compact'].map(layout => (
                                                <button
                                                    key={layout}
                                                    onClick={() => setSelectedLayout(layout)}
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors
                                                        ${selectedLayout === layout
                                                            ? 'bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-700'}
                                                    `}
                                                >
                                                    {layout}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {payslipConfig.map(field => (
                                            <div key={field.id} className="flex items-center justify-between p-3 rounded-xl border border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</span>
                                                <button
                                                    onClick={() => toggleField(field.id)}
                                                    className="text-indigo-500"
                                                >
                                                    {field.enabled ? <ToggleRight className="w-8 h-8 text-indigo-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Cutoff Rules' && (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-500" /> Freeze Dates
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-ink-black dark:text-pearl">Attendance Lock Date</div>
                                                <div className="text-xs text-silver-mist">Day after which no attendance changes are allowed.</div>
                                            </div>
                                            <select className="p-2 rounded-lg border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none">
                                                <option>25th of Month</option>
                                                <option>28th of Month</option>
                                                <option>Last Day</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-ink-black dark:text-pearl">Expense Claim Deadline</div>
                                                <div className="text-xs text-silver-mist">Claims submitted after this date move to next cycle.</div>
                                            </div>
                                            <select className="p-2 rounded-lg border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none">
                                                <option>20th of Month</option>
                                                <option>25th of Month</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-ink-black dark:text-pearl">Tax Declaration Window</div>
                                                <div className="text-xs text-silver-mist">Period during which employees can update investments.</div>
                                            </div>
                                            <select className="p-2 rounded-lg border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none">
                                                <option>Always Open</option>
                                                <option>Jan - Mar Only</option>
                                                <option>Start of Fiscal Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Live Preview / Schedule */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Schedule Widget */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shrink-0">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Next Payroll Run
                        </h3>
                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">28 Dec</div>
                        <div className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                            Processing for <span className="font-bold">December 2024</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                            <div className="flex justify-between items-center text-xs font-bold text-indigo-800 dark:text-indigo-300">
                                <span>Cutoff in</span>
                                <span>12 Days</span>
                            </div>
                            <div className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full mt-2">
                                <div className="w-[60%] h-full bg-indigo-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Payslip Preview */}
                    {activeTab === 'Payslip Design' && (
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col">
                            <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-500" /> Live Preview
                            </h3>

                            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-lg p-4 font-mono text-[10px] text-slate-500 overflow-hidden relative">
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold uppercase tracking-wider text-[8px]">Private</div>

                                <div className="text-center font-bold text-xs mb-4 text-slate-800 dark:text-slate-200">PAYSLIP - DEC 2024</div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="p-2 border border-dashed border-slate-300 rounded">Employee Name</div>
                                    {payslipConfig.filter(f => f.enabled).slice(0, 3).map(f => (
                                        <div key={f.id} className="p-2 border border-dashed border-slate-300 rounded">{f.label}</div>
                                    ))}
                                </div>

                                <div className="mb-2 font-bold text-slate-800 dark:text-slate-200">Earnings</div>
                                <div className="space-y-1 mb-4">
                                    <div className="flex justify-between"><span>Basic</span><span>10,000</span></div>
                                    <div className="flex justify-between"><span>HRA</span><span>4,000</span></div>
                                </div>

                                <div className="mb-2 font-bold text-slate-800 dark:text-slate-200">Deductions</div>
                                <div className="space-y-1 mb-4">
                                    <div className="flex justify-between"><span>PF</span><span>1,800</span></div>
                                </div>

                                {payslipConfig.find(f => f.id === 'f10')?.enabled && (
                                    <div className="mt-4 pt-2 border-t border-slate-300">
                                        <div className="font-bold mb-1">Leave Balance</div>
                                        <div className="flex justify-between"><span>PL</span><span>12.0</span></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


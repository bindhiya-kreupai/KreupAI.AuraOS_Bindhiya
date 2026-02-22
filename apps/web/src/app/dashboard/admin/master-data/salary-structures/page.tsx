"use client";

import React, { useState } from 'react';
import {
    LayoutTemplate,
    Calculator,
    Plus,
    CheckCircle2,
    X,
    FileText,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    DollarSign,
    PieChart,
    GripVertical,
    Save,
    Copy,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const STRUCTURES = [
    {
        id: 'STR-001',
        name: 'Regular FTE',
        description: 'Standard structure for full-time employees with PF and Gratuity.',
        components: 12,
        activeEmployees: 145,
        status: 'Active',
        color: 'bg-indigo-500'
    },
    {
        id: 'STR-002',
        name: 'Internship Stipend',
        description: 'Simplified structure for interns. No PF/ESI deductions.',
        components: 2,
        activeEmployees: 12,
        status: 'Active',
        color: 'bg-emerald-500'
    },
    {
        id: 'STR-003',
        name: 'Consultant (Retainer)',
        description: 'Flat monthly fee structure. TDS u/s 194J applicable.',
        components: 1,
        activeEmployees: 8,
        status: 'Draft',
        color: 'bg-amber-500'
    }
];

const AVAILABLE_COMPONENTS = [
    { id: 'PAY-101', name: 'Basic Salary', type: 'Earning', formula: '40% of CTC' },
    { id: 'PAY-102', name: 'HRA', type: 'Earning', formula: '40% of Basic' },
    { id: 'PAY-103', name: 'Special Allowance', type: 'Earning', formula: 'Balancing' },
    { id: 'PAY-104', name: 'LTA', type: 'Earning', formula: 'Fixed' },
    { id: 'DED-201', name: 'Provident Fund', type: 'Deduction', formula: '12% of Basic' },
    { id: 'DED-202', name: 'Professional Tax', type: 'Deduction', formula: 'Slab' },
];

export default function SalaryStructuresPage() {
    const [activeTab, setActiveTab] = useState<'Templates' | 'Simulator'>('Templates');
    const [showBuilder, setShowBuilder] = useState(false);
    const [ctcInput, setCtcInput] = useState<number>(1200000);

    // Simulator Logic
    const simulateBreakdown = (ctc: number) => {
        const basic = ctc * 0.40;
        const hra = basic * 0.40;
        const pf = Math.min(basic * 0.12, 1800 * 12); // Mock cap logic
        const special = ctc - basic - hra - pf; // Simple balancing
        return [
            { name: 'Basic Salary', amount: basic, color: 'bg-indigo-500' },
            { name: 'HRA', amount: hra, color: 'bg-sky-500' },
            { name: 'Special Allowance', amount: special, color: 'bg-emerald-500' },
            { name: 'Provident Fund (Employer)', amount: pf, color: 'bg-rose-500' },
        ];
    };

    const breakdown = simulateBreakdown(ctcInput);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-indigo-500" />
                        Salary Structures
                    </h1>
                    <p className="text-silver-mist text-sm">Define pay mix templates and simulate CTC distribution.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowBuilder(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> New Structure
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['Templates', 'Simulator'].map(tab => (
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
                        {activeTab === 'Templates' ? (
                            <div className="space-y-4">
                                {STRUCTURES.map(str => (
                                    <div key={str.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${str.color}`}></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2 text-lg">
                                                    {str.name}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium
                                                        ${str.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                                                    `}>
                                                        {str.status}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-silver-mist mt-1">{str.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-4 pt-4 border-t border-cloud dark:border-slate-800 text-xs font-bold text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <LayoutTemplate className="w-4 h-4 text-indigo-500" />
                                                {str.components} Components
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                {str.activeEmployees} Employees Assigned
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                        <Calculator className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Annual CTC (Cost to Company)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                value={ctcInput}
                                                onChange={(e) => setCtcInput(Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Structure Template</label>
                                        <select className="w-full p-3.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            {STRUCTURES.map(s => <option key={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-indigo-500" /> Projected Breakdown
                                    </h3>

                                    <div className="flex h-4 rounded-full overflow-hidden w-full">
                                        {breakdown.map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.amount / ctcInput) * 100}%` }}
                                                className={`h-full ${item.color}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {breakdown.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-cloud dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                                </div>
                                                <div className="text-sm font-mono font-bold text-ink-black dark:text-pearl">
                                                    ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Info / Builder */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Stats Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Compliance Check
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Minimum WageMet</div>
                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Basic salary in all structures meets the minimum wage requirements for Karnataka.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">PF Wages Valid</div>
                                    <div className="text-[10px] text-indigo-700 dark:text-indigo-400">PF calculation base is capped correctly at ₹15,000 where applicable.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Builder Modal */}
            <AnimatePresence>
                {showBuilder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-stellar-blue w-full max-w-4xl h-[600px] rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative flex flex-col"
                        >
                            <button
                                onClick={() => setShowBuilder(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">Structure Builder</h2>
                            <p className="text-sm text-silver-mist mb-6">Drag and drop components to define the pay structure.</p>

                            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                                {/* Left: Available Components */}
                                <div className="border-r border-cloud dark:border-slate-800 pr-6 overflow-y-auto">
                                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Available Components</h3>
                                    <div className="space-y-2">
                                        {AVAILABLE_COMPONENTS.map(comp => (
                                            <div key={comp.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-cloud dark:border-slate-800 cursor-grab hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="w-4 h-4 text-slate-300" />
                                                    <div>
                                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">{comp.name}</div>
                                                        <div className="text-[10px] text-slate-500">{comp.formula}</div>
                                                    </div>
                                                </div>
                                                <Plus className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Selected Structure */}
                                <div className="overflow-y-auto pl-2">
                                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Current Structure</h3>
                                    <div className="space-y-2">
                                        {/* Mock selected - simulates drop zone */}
                                        <div className="p-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 flex flex-col items-center justify-center text-indigo-400 text-sm font-bold min-h-[100px]">
                                            Drag components here
                                        </div>
                                        <div className="p-3 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-slate-800 shadow-sm flex justify-between items-center">
                                            <span className="font-bold text-sm">Basic Salary</span>
                                            <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-500 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-cloud dark:border-slate-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBuilder(false)}
                                    className="px-6 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save Structure
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


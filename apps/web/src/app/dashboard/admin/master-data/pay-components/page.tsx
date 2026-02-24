"use client";

import React, { useState, useEffect } from 'react';
import {
    Coins,
    Calculator,
    Percent,
    Plus,
    CheckCircle2,
    X,
    FileText,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    DollarSign,
    ShieldAlert,
    Info,
    Trash2,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PayComponent {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: string; // earning, deduction, reimbursement, benefit
    category: string; // fixed, variable, statutory
    calculationType: string; // flat, percentage, formula
    calculation: string | null;
    frequency: string;
    isTaxable: boolean;
    isPFApplicable: boolean;
    isESIApplicable: boolean;
    isProrated: boolean;
    displayOrder: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

type TabType = 'Earnings' | 'Deductions' | 'Reimbursements';

const typeColorMap: Record<string, string> = {
    earning: 'bg-indigo-500',
    deduction: 'bg-rose-500',
    reimbursement: 'bg-purple-500',
    benefit: 'bg-emerald-500',
};

const categoryColorFallbacks = [
    'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
];

function getComponentColor(comp: PayComponent, index: number): string {
    return typeColorMap[comp.type] || categoryColorFallbacks[index % categoryColorFallbacks.length];
}

function mapTaxableDisplay(comp: PayComponent): string | boolean {
    if (comp.type === 'reimbursement') return 'Partial';
    return comp.isTaxable;
}

function mapTypeLabel(comp: PayComponent): string {
    if (comp.category === 'statutory') return 'Statutory';
    if (comp.calculationType === 'formula' || comp.calculationType === 'percentage') return 'Formula';
    if (comp.calculationType === 'flat') return 'Fixed';
    return comp.category.charAt(0).toUpperCase() + comp.category.slice(1);
}

function mapTabToApiType(tab: TabType): string {
    switch (tab) {
        case 'Earnings': return 'earning';
        case 'Deductions': return 'deduction';
        case 'Reimbursements': return 'reimbursement';
    }
}

export default function PayComponentsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('Earnings');
    const [showWizard, setShowWizard] = useState(false);
    const [step, setStep] = useState(1);
    const [components, setComponents] = useState<PayComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Wizard State
    const [newComponent, setNewComponent] = useState({
        name: '',
        type: 'Fixed',
        isTaxable: true,
        formula: ''
    });

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch('/api/master-data/pay-components?limit=100')
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setComponents(result.data || []);
                } else {
                    setError(result.error || 'Failed to load pay components');
                }
            })
            .catch(err => {
                console.error('Failed to fetch pay components:', err);
                setError('Failed to load pay components. Please try again.');
            })
            .finally(() => setLoading(false));
    }, []);

    const activeType = mapTabToApiType(activeTab);
    const activeList = components.filter(c => c.type === activeType);

    const earningsCount = components.filter(c => c.type === 'earning').length;
    const deductionsCount = components.filter(c => c.type === 'deduction').length;
    const reimbursementsCount = components.filter(c => c.type === 'reimbursement').length;

    if (loading) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
                <div className="animate-pulse">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 mb-6">
                        <div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-80" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-36" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                                {['Earnings', 'Deductions', 'Reimbursements'].map(tab => (
                                    <div key={tab} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
                                ))}
                            </div>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 h-32" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl h-40" />
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl h-40" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Coins className="w-6 h-6 text-indigo-500" />
                            Pay Components
                        </h1>
                    </div>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Coins className="w-6 h-6 text-indigo-500" />
                        Pay Components
                    </h1>
                    <p className="text-silver-mist text-sm">Configure salary heads, taxability rules, and calculation formulas.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setStep(1); setShowWizard(true); }}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add Component
                    </button>
                    <button className="p-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl text-slate-500 hover:text-indigo-500 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Component List */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {(['Earnings', 'Deductions', 'Reimbursements'] as TabType[]).map(tab => {
                            const count = tab === 'Earnings' ? earningsCount : tab === 'Deductions' ? deductionsCount : reimbursementsCount;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                                        ${activeTab === tab
                                            ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                    `}
                                >
                                    {tab} {count > 0 && <span className="ml-1 text-xs opacity-60">({count})</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active List */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-4">
                        {activeList.length === 0 ? (
                            <div className="text-center py-12">
                                <Coins className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No {activeTab.toLowerCase()} components found.</p>
                                <p className="text-sm text-slate-400 mt-1">Create one using the &quot;Add Component&quot; button.</p>
                            </div>
                        ) : (
                            activeList.map((item, index) => {
                                const color = getComponentColor(item, index);
                                const taxable = mapTaxableDisplay(item);
                                const typeLabel = mapTypeLabel(item);

                                return (
                                    <div key={item.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${color.replace('500', '100')} ${color.replace('bg-', 'text-')} flex items-center justify-center font-bold text-lg`}>
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                                        {item.name}
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-medium">{item.code}</span>
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-silver-mist mt-0.5">
                                                        <span className="font-bold text-indigo-500">{typeLabel}</span>
                                                        {item.calculation && <span>&bull; {item.calculation}</span>}
                                                        {item.frequency && <span>&bull; {item.frequency}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-300 ml-13 pl-13 mb-3">
                                            {item.description || 'No description available.'}
                                        </p>

                                        <div className="flex items-center gap-3 ml-13 pl-13 text-xs font-bold border-t border-cloud dark:border-slate-800 pt-3">
                                            <div className={`flex items-center gap-1
                                                ${taxable === true ? 'text-rose-500' : taxable === 'Partial' ? 'text-amber-500' : 'text-emerald-500'}
                                            `}>
                                                <ShieldAlert className="w-3 h-3" />
                                                {taxable === true ? 'Fully Taxable' : taxable === 'Partial' ? 'Partially Exempt' : 'Tax Exempt'}
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                {activeTab === 'Earnings' ? 'Include in CTC' : 'Deducted from Gross'}
                                            </div>
                                            {item.isPFApplicable && (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Info className="w-3 h-3 text-blue-500" />
                                                    PF Applicable
                                                </div>
                                            )}
                                            {activeTab === 'Reimbursements' && (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <FileText className="w-3 h-3 text-indigo-500" />
                                                    Active Flexible Benefit Plan (FBP)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Config & Rules */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Logic Box */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shrink-0">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                            <Calculator className="w-5 h-5" /> Config Logic
                        </h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed mb-4">
                            Components are processed in sequence:
                            <br />
                            1. Fixed Amounts &rarr; 2. Formula Based &rarr; 3. Balancing Figure.
                            <br /><br />
                            <strong>Statutory Deductions</strong> (PF/ESI) are auto-calculated based on government slabs unless overridden.
                        </p>
                        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1">
                            View Calculation Chain <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Tax Rules */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex-1">
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                            <Percent className="w-5 h-5" /> Tax Regimes
                        </h3>
                        <div className="space-y-3 mt-4">
                            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-xs">
                                <span className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">New Regime (Default)</span>
                                <span className="text-emerald-700 dark:text-emerald-400">Most exemptions (HRA, LTA) are NOT applicable. Standard deduction applies.</span>
                            </div>
                            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-xs">
                                <span className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">Old Regime</span>
                                <span className="text-emerald-700 dark:text-emerald-400">Allows Section 80C, HRA, and medical insurance deductions.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wizard Modal */}
            <AnimatePresence>
                {showWizard && (
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
                            className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowWizard(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">
                                {step === 1 ? 'Basic Details' : 'Calculation Logic'}
                            </h2>
                            <p className="text-sm text-silver-mist mb-6">Step {step} of 2</p>

                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Component Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Uniform Allowance"
                                            className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={newComponent.name}
                                            onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Component Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Earnings', 'Deductions', 'Reimbursements'].map(t => (
                                                <button
                                                    key={t}
                                                    className={`p-3 rounded-xl border text-sm font-bold transition-all
                                                        ${activeTab === t ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600' : 'border-cloud dark:border-slate-800 text-slate-500 hover:bg-slate-50'}
                                                    `}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Display Name in Payslip</label>
                                        <input type="text" placeholder="Short name (max 15 chars)" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Calculation Method</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                                            value={newComponent.type}
                                            onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value })}
                                        >
                                            <option value="Fixed">Flat Amount</option>
                                            <option value="Formula">Formula (% of Basic/CTC)</option>
                                            <option value="Balancing">Balancing Figure (Residual)</option>
                                        </select>
                                    </div>

                                    {newComponent.type === 'Formula' && (
                                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Formula Expression</label>
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {['Basic', 'CTC', 'Gross'].map(v => (
                                                    <span key={v} className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-cloud dark:border-slate-600 text-[10px] font-mono cursor-pointer hover:bg-indigo-50 hover:border-indigo-200">
                                                        [{v}]
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g., 0.50 * [Basic]"
                                                className="w-full p-2 rounded-lg border border-cloud dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono outline-none"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 border border-cloud dark:border-slate-800 rounded-xl">
                                        <input type="checkbox" className="w-5 h-5 accent-indigo-500" checked={newComponent.isTaxable} onChange={(e) => setNewComponent({ ...newComponent, isTaxable: e.target.checked })} />
                                        <div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">Is Taxable?</div>
                                            <div className="text-xs text-silver-mist">Include this component in income tax projections.</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                {step === 2 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={() => step === 1 ? setStep(2) : setShowWizard(false)}
                                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                >
                                    {step === 1 ? 'Next Step' : 'Create Component'}
                                    {step === 1 && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


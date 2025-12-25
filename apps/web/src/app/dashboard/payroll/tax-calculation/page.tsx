"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    UploadCloud,
    Calculator,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Briefcase,
    Home,
    Heart,
    Plane,
    TrendingUp,
    Info,
    X,
    FileIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaxDeclarationService } from '../services';

// --- MOCK DATA ---

const INVESTMENT_CATEGORIES = [
    {
        id: '80c',
        name: 'Section 80C',
        limit: 150000,
        declared: 150000,
        verified: 120000,
        icon: Briefcase,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        items: [
            { id: 1, name: 'EPF', amount: 45000, status: 'Verified' },
            { id: 2, name: 'PPF', amount: 75000, status: 'Verified' },
            { id: 3, name: 'ELSS Mutual Fund', amount: 30000, status: 'Pending' }
        ]
    },
    {
        id: 'hra',
        name: 'HRA Exemption',
        limit: 240000,
        declared: 180000,
        verified: 150000,
        icon: Home,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        items: [
            { id: 4, name: 'Rent Receipts (Apr-Sep)', amount: 150000, status: 'Verified' },
            { id: 5, name: 'Rent Receipts (Oct-Dec)', amount: 30000, status: 'Pending' }
        ]
    },
    {
        id: '80d',
        name: 'Medical (80D)',
        limit: 25000,
        declared: 15000,
        verified: 15000,
        icon: Heart,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        items: [
            { id: 6, name: 'Health Insurance Premium', amount: 15000, status: 'Verified' }
        ]
    },
    {
        id: 'lta',
        name: 'LTA',
        limit: 50000,
        declared: 0,
        verified: 0,
        icon: Plane,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        items: []
    }
];

export default function TaxDeclarationsPage() {
    const [regime, setRegime] = useState<'old' | 'new'>('old');
    const [selectedCategory, setSelectedCategory] = useState<typeof INVESTMENT_CATEGORIES[0] | null>(null);
    const [declarations, setDeclarations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await TaxDeclarationService.getTaxDeclarations();
            if (result.length > 0) {
                setDeclarations(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    const toggleRegime = () => setRegime(prev => prev === 'old' ? 'new' : 'old');

    // Simple Tax Calculation Mock
    const grossIncome = 2400000;
    const totalDeductions = regime === 'old' ? 345000 : 50000; // Standard deduction only for new
    const taxableIncome = grossIncome - totalDeductions;
    const taxPayable = taxableIncome * (regime === 'old' ? 0.25 : 0.18); // Simplified average rate

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Tax Declarations
                    </h1>
                    <p className="text-silver-mist text-sm">Manage tax regime, declared investments, and file details.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-stellar-blue p-1 rounded-xl border border-cloud dark:border-nebula-purple/50">
                    <button
                        onClick={() => setRegime('old')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${regime === 'old' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-indigo-500'}`}
                    >
                        Old Regime
                    </button>
                    <button
                        onClick={() => setRegime('new')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${regime === 'new' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-emerald-500'}`}
                    >
                        New Regime
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Left: Summary & Categories */}
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                    {/* Tax Summary Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white shrink-0">
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <div className="text-sm font-bold opacity-70 mb-1">Gross Income</div>
                                <div className="text-2xl font-bold">${(grossIncome / 1000).toFixed(0)}k</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold opacity-70 mb-1">Exemptions</div>
                                <div className="text-2xl font-bold text-emerald-400">-${(totalDeductions / 1000).toFixed(0)}k</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold opacity-70 mb-1">Proj. Tax</div>
                                <div className="text-2xl font-bold text-rose-400">${(taxPayable / 1000).toFixed(0)}k</div>
                            </div>
                        </div>
                        {regime === 'new' && (
                            <div className="mt-4 p-3 bg-white/10 rounded-lg text-xs flex gap-2 items-center border border-white/20">
                                <Info className="w-4 h-4 text-emerald-300" />
                                <span>Note: Most exemptions (HRA, 80C) are <strong>not applicable</strong> under the New Tax Regime.</span>
                            </div>
                        )}
                    </div>

                    {/* Investment Categories */}
                    <div className="flex-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col overflow-hidden">
                        <h3 className="p-5 font-bold text-ink-black dark:text-pearl flex items-center gap-2 border-b border-cloud dark:border-nebula-purple/20">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Declared Investments
                        </h3>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {INVESTMENT_CATEGORIES.map(cat => {
                                const progress = (cat.declared / cat.limit) * 100;
                                const isMaxed = cat.declared >= cat.limit;
                                const isDisabled = regime === 'new' && cat.id !== '80d'; // Example logic: only 80D allowed (usually not even that, but for demo)

                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => !isDisabled && setSelectedCategory(cat)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer relative group
                                            ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-cloud' :
                                                selectedCategory?.id === cat.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 ring-1 ring-indigo-500/30' :
                                                    'bg-white dark:bg-slate-800/20 border-cloud dark:border-slate-800 hover:border-indigo-300'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.bg} ${cat.color}`}>
                                                    <cat.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-ink-black dark:text-pearl">{cat.name}</div>
                                                    <div className="text-xs text-silver-mist">Max Limit: ${(cat.limit / 1000).toFixed(0)}k</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold text-lg ${isMaxed ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    ${(cat.declared / 1000).toFixed(0)}k
                                                </div>
                                                <div className="text-[10px] text-silver-mist font-bold uppercase">Declared</div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${cat.color.replace('text', 'bg')}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>

                                        {isDisabled && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px] rounded-xl">
                                                <span className="text-xs font-bold bg-slate-800 text-white px-3 py-1 rounded-full shadow-lg">Not available in New Regime</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Upload & Verification */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        {selectedCategory ? (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                <div className="p-5 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                    <h3 className="font-bold">{selectedCategory.name} Proofs</h3>
                                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                                        <X className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {selectedCategory.items.length > 0 ? selectedCategory.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-3 border border-cloud dark:border-slate-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="w-8 h-8 text-indigo-400 stroke-1" />
                                                <div>
                                                    <div className="text-sm font-bold text-ink-black dark:text-pearl">{item.name}</div>
                                                    <div className="text-xs text-silver-mist">${item.amount.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            {item.status === 'Verified' ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center text-slate-400 py-4 text-sm">No proofs uploaded yet.</div>
                                    )}

                                    {/* Upload Area */}
                                    <div className="mt-6 border-2 border-dashed border-cloud dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-400 transition-colors">
                                        <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">Click to upload receipts</div>
                                        <div className="text-xs text-silver-mist mt-1">PDF, JPG, PNG up to 5MB</div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-center text-sm font-bold mb-2">
                                        <span>Verified Amount</span>
                                        <span className="text-emerald-500">${(selectedCategory.verified / 1000).toFixed(1)}k</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold opacity-50">
                                        <span>Pending Verification</span>
                                        <span>${((selectedCategory.declared - selectedCategory.verified) / 1000).toFixed(1)}k</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <Calculator className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">Select a Category</h3>
                                <p className="text-sm max-w-xs">Click on an investment category from the list to view details and upload proof documents.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

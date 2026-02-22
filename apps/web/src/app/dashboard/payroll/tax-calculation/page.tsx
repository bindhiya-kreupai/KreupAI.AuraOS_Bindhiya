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
    FileIcon,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaxDeclarationService } from '../services';
import type { TaxDeclaration, TaxCategory } from '../types';

const CATEGORY_ICONS: Record<string, { icon: typeof Briefcase; color: string; bg: string }> = {
    '80C': { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    '80c': { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    'HRA': { icon: Home, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    'hra': { icon: Home, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    '80D': { icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    '80d': { icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    'LTA': { icon: Plane, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    'lta': { icon: Plane, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
};

function getCategoryStyle(section: string) {
    return CATEGORY_ICONS[section] || { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' };
}

export default function TaxDeclarationsPage() {
    const [regime, setRegime] = useState<'old' | 'new'>('old');
    const [selectedCategory, setSelectedCategory] = useState<TaxCategory | null>(null);
    const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await TaxDeclarationService.getTaxDeclarations();
            setDeclarations(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Use the first declaration that matches the selected regime, or fallback to first one
    const activeDeclaration = declarations.find(d => d.regime === regime) || declarations[0];
    const categories = activeDeclaration?.categories || [];

    const totalDeclared = activeDeclaration?.totalDeclared || 0;
    const totalVerified = activeDeclaration?.totalVerified || 0;

    // Tax calculation from declaration data
    const grossIncome = totalDeclared > 0 ? totalDeclared * 7 : 0; // Estimate if available
    const totalDeductionsAmt = regime === 'old' ? totalDeclared : 50000;
    const taxableIncome = grossIncome - totalDeductionsAmt;
    const taxPayable = taxableIncome > 0 ? taxableIncome * (regime === 'old' ? 0.25 : 0.18) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading tax declarations...</p>
                </div>
            </div>
        );
    }

    if (declarations.length === 0) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <FileText className="w-6 h-6 text-indigo-500" />
                            Tax Declarations
                        </h1>
                        <p className="text-silver-mist text-sm">Manage tax regime, declared investments, and file details.</p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Calculator className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Tax Declarations</h3>
                        <p className="text-sm text-silver-mist max-w-md">No tax declarations have been submitted yet. Submit your investment proofs to get started.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Left: Summary & Categories */}
                <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
                    {/* Tax Summary Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white shrink-0">
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <div className="text-sm font-bold opacity-70 mb-1">Total Declared</div>
                                <div className="text-2xl font-bold">${(totalDeclared / 1000).toFixed(0)}k</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold opacity-70 mb-1">Total Verified</div>
                                <div className="text-2xl font-bold text-emerald-400">${(totalVerified / 1000).toFixed(0)}k</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold opacity-70 mb-1">Status</div>
                                <div className="text-2xl font-bold capitalize">{activeDeclaration?.status?.replace(/_/g, ' ') || 'N/A'}</div>
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
                            {categories.length === 0 ? (
                                <div className="text-center text-slate-400 py-8 text-sm">No investment categories declared.</div>
                            ) : categories.map(cat => {
                                const style = getCategoryStyle(cat.section);
                                const IconComponent = style.icon;
                                const progress = cat.limit > 0 ? (cat.declared / cat.limit) * 100 : 0;
                                const isMaxed = cat.declared >= cat.limit;
                                const isDisabled = regime === 'new' && cat.section.toUpperCase() !== '80D';

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
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg} ${style.color}`}>
                                                    <IconComponent className="w-5 h-5" />
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
                                            <div className={`h-full rounded-full ${style.color.replace('text', 'bg')}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
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
                                    {selectedCategory.proofs && selectedCategory.proofs.length > 0 ? selectedCategory.proofs.map(proof => (
                                        <div key={proof.id} className="flex justify-between items-center p-3 border border-cloud dark:border-slate-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="w-8 h-8 text-indigo-400 stroke-1" />
                                                <div>
                                                    <div className="text-sm font-bold text-ink-black dark:text-pearl">{proof.name}</div>
                                                    <div className="text-xs text-silver-mist">${proof.amount.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            {proof.status === 'verified' ? (
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


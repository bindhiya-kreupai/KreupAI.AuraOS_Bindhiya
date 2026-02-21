"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Calculator,
    PieChart,
    Plus,
    Edit2,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { SalaryComponentService, SalaryStructureService } from '../services';

export default function SalaryStructurePage() {
    const [structures, setStructures] = useState<any[]>([]);
    const [components, setComponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [structData, compData] = await Promise.all([
                SalaryStructureService.getStructures(),
                SalaryComponentService.getComponents(),
            ]);
            setStructures(structData);
            setComponents(compData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const earnings = components.filter((c: any) => c.type === 'earning' || c.componentType === 'earning');
    const deductions = components.filter((c: any) => c.type === 'deduction' || c.componentType === 'deduction');

    // Calculate CTC from components
    const totalCTC = components.reduce((sum: number, c: any) => sum + (Number(c.defaultValue) || Number(c.amount) || 0), 0);
    const fixedPay = earnings.reduce((sum: number, c: any) => sum + (Number(c.defaultValue) || Number(c.amount) || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Salary Structure Configuration
                    </h1>
                    <p className="text-slate-500 text-sm">Define components, formulas, and deduction rules.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Add Component
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Components List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Earnings</h3>
                        {earnings.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4">No earning components configured yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {earnings.map((comp: any, i: number) => (
                                    <div key={comp.id || i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${comp.isActive !== false ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{comp.componentName || comp.name}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                    <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{comp.calculationType}</span>
                                                    <span>{comp.componentCode || comp.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${comp.isTaxable ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {comp.isTaxable ? 'Taxable' : 'Exempt'}
                                            </span>
                                            <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h3 className="font-bold text-lg mb-4 mt-8">Deductions</h3>
                        {deductions.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4">No deduction components configured yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {deductions.map((comp: any, i: number) => (
                                    <div key={comp.id || i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                                                <MinusIcon />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{comp.componentName || comp.name}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                    <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{comp.isStatutory ? 'Statutory' : 'Custom'}</span>
                                                    <span>{comp.calculationType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-rose-50 text-rose-700">{comp.isStatutory ? 'Mandatory' : 'Optional'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Preview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold mb-6">Structure Preview</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center opacity-80">
                                <span>Total CTC</span>
                                <span className="font-bold text-lg">${totalCTC > 0 ? totalCTC.toLocaleString() : '--'}</span>
                            </div>
                            <div className="h-px bg-white/20"></div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Earnings ({earnings.length})</span>
                                    <span>${fixedPay > 0 ? fixedPay.toLocaleString() : '--'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Deductions ({deductions.length})</span>
                                    <span>--</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Structures</span>
                                    <span>{structures.length}</span>
                                </div>
                            </div>
                            <div className="h-px bg-white/20 mt-4"></div>
                            <div className="pt-2 text-indigo-100 text-xs">
                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                {components.length} components configured
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MinusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
    )
}

"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift,
    Calendar,
    Users,
    TrendingUp,
    Download,
    Eye,
    Loader2
} from 'lucide-react';
import { BonusService } from '../services';

export default function BonusManagementPage() {
    const [schemes, setSchemes] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [schemesData, payoutsData] = await Promise.all([
                BonusService.getSchemes(),
                BonusService.getPayouts()
            ]);
            setSchemes(schemesData);
            setPayouts(payoutsData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const totalBonusAmount = payouts.reduce((sum: number, p: any) => sum + (Number(p.amount) || Number(p.payoutAmount) || Number(p.finalBonusAmount) || 0), 0);
    const totalEligible = payouts.length;

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Bonus Management
                    </h1>
                    <p className="text-slate-500 text-sm">Configure and distribute performance bonuses.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    Release Bonus
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left Panel: Campaigns */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Bonus Schemes & Payouts</h3>
                        {schemes.length === 0 && payouts.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4">No bonus schemes or payouts found.</p>
                        ) : (
                            <div className="space-y-4">
                                {schemes.map((scheme: any, i: number) => {
                                    const schemePayouts = payouts.filter((p: any) => p.schemeId === scheme.id);
                                    const schemeTotal = schemePayouts.reduce((sum: number, p: any) => sum + (Number(p.amount) || Number(p.payoutAmount) || 0), 0);
                                    return (
                                        <div key={scheme.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="flex items-start gap-3 mb-4 sm:mb-0">
                                                <div className={`p-3 rounded-xl ${
                                                    scheme.status === 'processed' || scheme.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                    scheme.status === 'active' || scheme.status === 'Processing' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-200 text-slate-500'
                                                }`}>
                                                    <Gift className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{scheme.schemeName || scheme.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                        <Calendar className="w-3 h-3" /> {scheme.payoutDate || scheme.fiscalYear || '--'}
                                                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                                        <Users className="w-3 h-3" /> {schemePayouts.length} Payouts
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-indigo-600">
                                                        ${schemeTotal > 0 ? schemeTotal.toLocaleString() : (scheme.budgetAmount ? Number(scheme.budgetAmount).toLocaleString() : '--')}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${
                                                        scheme.status === 'processed' ? 'bg-emerald-100 text-emerald-700' :
                                                        scheme.status === 'active' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-200 text-slate-600'
                                                    }`}>
                                                        {scheme.status}
                                                    </span>
                                                </div>
                                                <div className="text-slate-400 hover:text-indigo-600">
                                                    <Eye className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {schemes.length === 0 && payouts.length > 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{payouts.length} Individual Bonus Payouts</h4>
                                        <div className="text-lg font-bold text-indigo-600 mt-2">
                                            Total: ${totalBonusAmount.toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Rules */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-indigo-500">
                                <div className="text-sm font-bold">Total Bonus Budget</div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <span>Schemes</span>
                                    <span className="font-bold text-indigo-600">{schemes.length}</span>
                                </div>
                                <div className="flex justify-between mt-1 text-xs">
                                    <span>Payouts</span>
                                    <span className="font-bold text-emerald-500">{payouts.length}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-amber-500">
                                <div className="text-sm font-bold">Total Payout Amount</div>
                                <div className="text-lg font-bold text-indigo-600 mt-1">
                                    ${totalBonusAmount > 0 ? totalBonusAmount.toLocaleString() : '--'}
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Edit Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


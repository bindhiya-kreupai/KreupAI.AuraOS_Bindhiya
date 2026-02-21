'use client';

import React, { useState, useEffect } from 'react';
import { GitPullRequest, Users, Edit, Trash2, Shield, Loader2 } from 'lucide-react';
import { ApprovalChainService } from '../services';

export default function ApprovalChainsPage() {
    const [chains, setChains] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChains();
    }, []);

    const fetchChains = async () => {
        try {
            setLoading(true);
            const data = await ApprovalChainService.getChains();
            setChains(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitPullRequest className="w-6 h-6 text-blue-500" />
                        Approval Chains
                    </h1>
                    <p className="text-slate-500 text-sm">Manage multi-step approval hierarchies.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    + New Approval Chain
                </button>
            </div>

            {chains.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 mb-2">No Approval Chains</h3>
                    <p className="text-sm text-slate-400">Create your first approval chain to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {chains.map((chain: any) => (
                        <div key={chain.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {chain.name || chain.chainName}
                                        {chain.isActive !== false ? (
                                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase rounded-full">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase rounded-full">Draft</span>
                                        )}
                                    </h3>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {chain.version || 1} Version(s)</span>
                                        <span>Trigger: {chain.trigger || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0 pl-0 md:pl-4">
                                <div className="text-xs text-right hidden md:block mr-4">
                                    <div className="text-slate-400">Last Updated</div>
                                    <div className="font-medium">{chain.updatedAt ? new Date(chain.updatedAt).toLocaleDateString() : 'N/A'}</div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Siren, ShieldAlert, Phone, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { EmergencySuccessionService } from '../services';
import type { EmergencySuccession } from '../types';

export default function EmergencySuccessionPage() {
    const [plans, setPlans] = useState<EmergencySuccession[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await EmergencySuccessionService.getEmergencyPlans();
                setPlans(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Siren className="w-8 h-8 text-rose-500" />
                        Emergency Succession
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">&quot;Hit the bus&quot; protocols and interim continuity plans.</p>
                </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                <div>
                    <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mb-1">Confidential Operational Protocols</h3>
                    <p className="text-rose-600/80 dark:text-rose-300/80 text-sm">
                        These plans are for emergency use only. Access is logged and monitored.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {plans.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                        No emergency succession plans configured.
                    </div>
                ) : (
                    plans.map((protocol) => (
                        <div key={protocol.emergencyPlanId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div
                                onClick={() => setExpanded(expanded === protocol.emergencyPlanId ? null : protocol.emergencyPlanId)}
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-full ${expanded === protocol.emergencyPlanId ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{protocol.criticalPositionTitle || 'Emergency Plan'}</h3>
                                        <div className="text-sm font-medium text-slate-500 mt-1">
                                            <span className="font-bold text-indigo-600">Interim:</span> {protocol.interimSuccessorName || 'TBD'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden md:block">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Last Review</div>
                                        <div className="font-mono text-sm">{protocol.lastReviewDate || 'N/A'}</div>
                                    </div>
                                    <button className="text-slate-400">
                                        {expanded === protocol.emergencyPlanId ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>

                            {expanded === protocol.emergencyPlanId && (
                                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 bg-slate-50/50 dark:bg-slate-900/50">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 mt-6 uppercase text-sm tracking-wider">Activation Checklist</h4>
                                    <div className="space-y-3">
                                        {(protocol.activationSteps || []).map((step: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 font-medium">{step}</p>
                                            </div>
                                        ))}
                                        {(!protocol.activationSteps || protocol.activationSteps.length === 0) && (
                                            <div className="text-center py-4 text-slate-400 text-sm">No activation steps defined.</div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                                            <Phone className="w-4 h-4" /> View Emergency Contacts
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


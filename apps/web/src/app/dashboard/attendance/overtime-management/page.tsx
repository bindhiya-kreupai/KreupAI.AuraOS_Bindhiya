// Overtime management configuration using OvertimeService.getOvertimeManagement()
"use client";

import React, { useState, useEffect } from 'react';
import {
    Banknote,
    Clock,
    Settings,
    Users,
    ChevronDown
} from 'lucide-react';
import { OvertimeService } from '../services';

interface OTPolicy {
    calculationBase: string;
    minimumDuration: number;
    monthlyCap: number;
    normalMultiplier: number;
    weekendMultiplier: number;
    holidayMultiplier: number;
    payoutMode: 'paid' | 'banked';
}

export default function OvertimeManagementPage() {
    const [policy, setPolicy] = useState<OTPolicy>({
        calculationBase: 'Gross Salary / 240',
        minimumDuration: 2,
        monthlyCap: 20,
        normalMultiplier: 1.25,
        weekendMultiplier: 1.5,
        holidayMultiplier: 2.0,
        payoutMode: 'paid'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicy();
    }, []);

    const fetchPolicy = async () => {
        try {
            setLoading(true);
            // Using OvertimeService.getOvertimeManagement() for overtime policy data
            const result = await OvertimeService.getOvertimeManagement();
            if (result && (Array.isArray(result) ? result.length > 0 : true)) {
                const policyData = Array.isArray(result) ? result[0] : result;
                if (policyData) {
                    setPolicy({
                        calculationBase: policyData.calculationBase || policy.calculationBase,
                        minimumDuration: policyData.minimumDuration ?? policy.minimumDuration,
                        monthlyCap: policyData.monthlyCap ?? policy.monthlyCap,
                        normalMultiplier: policyData.normalMultiplier ?? policy.normalMultiplier,
                        weekendMultiplier: policyData.weekendMultiplier ?? policy.weekendMultiplier,
                        holidayMultiplier: policyData.holidayMultiplier ?? policy.holidayMultiplier,
                        payoutMode: policyData.payoutMode || policy.payoutMode,
                    });
                }
            }
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // TODO: Add updateOvertimePolicy method to OvertimeService when API supports it
                        await fetchPolicy();
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof OTPolicy, value: any) => {
        setPolicy({ ...policy, [field]: value });
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-indigo-500" />
                        Overtime Management
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Configure OT rates, thresholds, and payout policies.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        <Clock className="w-4 h-4" /> View Logs
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <Settings className="w-4 h-4" /> Save Policy
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* OT Policy Card */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-6 border-b border-cloud dark:border-nebula-purple/20 pb-4">
                        General Policy
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">OT Calculation Base</h4>
                                <p className="text-xs text-silver-mist">Formula for hourly rate</p>
                            </div>
                            <select
                                value={policy.calculationBase}
                                onChange={(e) => handleInputChange('calculationBase', e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 font-bold">
                                <option>Gross Salary / 240</option>
                                <option>Basic Salary / 240</option>
                                <option>Flat Rate</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Minimum OT Duration</h4>
                                <p className="text-xs text-silver-mist">Min hours needed to qualify</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={policy.minimumDuration}
                                    onChange={(e) => handleInputChange('minimumDuration', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-right font-bold bg-transparent" />
                                <span className="text-sm font-bold text-slate-500">Hours</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Monthly Cap</h4>
                                <p className="text-xs text-silver-mist">Max allowable OT per emp</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={policy.monthlyCap}
                                    onChange={(e) => handleInputChange('monthlyCap', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-right font-bold bg-transparent" />
                                <span className="text-sm font-bold text-slate-500">Hours</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multipliers */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-6 border-b border-cloud dark:border-nebula-purple/20 pb-4">
                        Rate Multipliers
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Normal Workday</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">x</span>
                                <input
                                    type="number"
                                    value={policy.normalMultiplier}
                                    onChange={(e) => handleInputChange('normalMultiplier', parseFloat(e.target.value))}
                                    step={0.25}
                                    className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-800" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Weekly Off (Weekend)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">x</span>
                                <input
                                    type="number"
                                    value={policy.weekendMultiplier}
                                    onChange={(e) => handleInputChange('weekendMultiplier', parseFloat(e.target.value))}
                                    step={0.25}
                                    className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-800" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Public Holiday</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">x</span>
                                <input
                                    type="number"
                                    value={policy.holidayMultiplier}
                                    onChange={(e) => handleInputChange('holidayMultiplier', parseFloat(e.target.value))}
                                    step={0.5}
                                    className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-800" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Payout vs Bank */}
            <div className="bg-indigo-900 text-white rounded-xl p-6 relative overflow-hidden flex items-center justify-between px-10">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Payout Config</h3>
                    <p className="text-indigo-200 max-w-lg">
                        Define if overtime is paid out in the payroll cycle or banked as "Comp-off" leave credits.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-indigo-800 p-1.5 rounded-lg relative z-10">
                    <button className="px-6 py-2 bg-white text-indigo-900 font-bold rounded shadow-sm">Paid Out</button>
                    <button className="px-6 py-2 text-indigo-200 hover:text-white font-bold transition-colors">Banked (Comp-off)</button>
                </div>

                {/* Decor */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            </div>

        </div>
    );
}


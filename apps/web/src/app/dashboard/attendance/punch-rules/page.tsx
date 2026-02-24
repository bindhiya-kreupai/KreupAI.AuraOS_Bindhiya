"use client";

import React, { useState, useEffect } from 'react';
import {
    Save,
    RotateCcw,
    MousePointer2,
    Clock,
    UserCheck,
    Coffee,
    Moon
} from 'lucide-react';
import { PunchRulesService } from '../services';

interface PunchRulesConfig {
    lateInTolerance: number;
    earlyOutTolerance: number;
    maxLogins: number;
    deductLeave: boolean;
    autoLogoutTime: string;
    sessionTimeout: number;
    markAbsentBy: boolean;
    crossDayLogic: boolean;
    nightShiftAllowance: boolean;
}

export default function PunchRulesPage() {
    const [config, setConfig] = useState<PunchRulesConfig>({
        lateInTolerance: 15,
        earlyOutTolerance: 10,
        maxLogins: 4,
        deductLeave: true,
        autoLogoutTime: "23:59",
        sessionTimeout: 30,
        markAbsentBy: true,
        crossDayLogic: true,
        nightShiftAllowance: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const result = await PunchRulesService.getPunchRules();
            if (result) {
                setConfig({
                    lateInTolerance: result.gracePeriodMinutes || 15,
                    earlyOutTolerance: 10,
                    maxLogins: 4,
                    deductLeave: true,
                    autoLogoutTime: `${result.autoCheckOutAfterHours}:00` || "23:59",
                    sessionTimeout: 30,
                    markAbsentBy: true,
                    crossDayLogic: true,
                    nightShiftAllowance: false
                });
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await PunchRulesService.updatePunchRules(config);
            await fetchRules();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof PunchRulesConfig, value: number | boolean | string) => {
        setConfig({ ...config, [field]: value });
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <MousePointer2 className="w-6 h-6 text-indigo-500" />
                        Punch & Login Rules
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Configure global rules for attendance marking and system access.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchRules}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                        <RotateCcw className="w-4 h-4" /> Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save Attributes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Grace Period Settings */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Grace Periods</h3>
                            <p className="text-xs text-silver-mist">Tolerances for late in / early out.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Late In Tolerance (mins)</label>
                            <input
                                type="number"
                                value={config.lateInTolerance}
                                onChange={(e) => handleInputChange('lateInTolerance', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-right font-bold" />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Early Out Tolerance (mins)</label>
                            <input
                                type="number"
                                value={config.earlyOutTolerance}
                                onChange={(e) => handleInputChange('earlyOutTolerance', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-right font-bold" />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Logins (per day)</label>
                            <input
                                type="number"
                                value={config.maxLogins}
                                onChange={(e) => handleInputChange('maxLogins', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-right font-bold" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={config.deductLeave}
                                    onChange={(e) => handleInputChange('deductLeave', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Deduct valid leaves for violations</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auto-Action Rules */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Auto-Actions</h3>
                            <p className="text-xs text-silver-mist">System triggered events.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto Logout Time</span>
                                <span className="text-xs text-silver-mist">Force logout if valid session expires</span>
                            </div>
                            <input
                                type="time"
                                value={config.autoLogoutTime}
                                onChange={(e) => handleInputChange('autoLogoutTime', e.target.value)}
                                className="w-32 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent font-bold" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Session Timeout (Idle)</span>
                                <span className="text-xs text-silver-mist">Minutes of inactivity</span>
                            </div>
                            <input
                                type="number"
                                value={config.sessionTimeout}
                                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-right font-bold" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={config.markAbsentBy}
                                    onChange={(e) => handleInputChange('markAbsentBy', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Mark "Absent" if no punch by 12:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Break Rules */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Break Logic</h3>
                            <p className="text-xs text-silver-mist">Mandatory and optional breaks.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Lunch Break</span>
                            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">60 mins</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Tea Break (Morning)</span>
                            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">15 mins</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Tea Break (Evening)</span>
                            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">15 mins</span>
                        </div>
                    </div>
                </div>

                {/* Night Shift Rules */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <Moon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Shift Differentials</h3>
                            <p className="text-xs text-silver-mist">Night shift policies.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={config.crossDayLogic}
                                onChange={(e) => handleInputChange('crossDayLogic', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cross-day logic enabled</span>
                                <span className="text-xs text-silver-mist">Allow shifts to span across midnight (e.g., 8 PM - 5 AM)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={config.nightShiftAllowance}
                                onChange={(e) => handleInputChange('nightShiftAllowance', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Night Shift Allowance</span>
                                <span className="text-xs text-silver-mist">Auto-calculate allowance if shift &gt; 4 hours after 10 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}


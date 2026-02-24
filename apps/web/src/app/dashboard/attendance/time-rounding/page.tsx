"use client";

import React, { useState, useEffect } from 'react';
import {
    Hourglass,
    Save,
    RotateCcw,
    ArrowRight
} from 'lucide-react';
import { TimeRoundingService } from '../services';

interface RoundingConfig {
    interval: string;
    direction: string;
    preview: {
        punchIn: string;
        punchOut: string;
        roundedIn: string;
        roundedOut: string;
        totalHours: number;
    };
}

export default function TimeRoundingPage() {
    const [config, setConfig] = useState<RoundingConfig>({
        interval: 'Nearest 15 Minutes',
        direction: 'Normal Rounding',
        preview: {
            punchIn: '09:07 AM',
            punchOut: '06:23 PM',
            roundedIn: '09:00 AM',
            roundedOut: '06:30 PM',
            totalHours: 9.5
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRounding();
    }, []);

    const fetchRounding = async () => {
        try {
            setLoading(true);
            const result = await TimeRoundingService.getRoundingRules();
            if (result) {
                const intervalMap: Record<number, string> = {
                    0: 'None (Exact Time)',
                    5: 'Nearest 5 Minutes',
                    15: 'Nearest 15 Minutes',
                    30: 'Nearest 30 Minutes'
                };
                const directionMap: Record<string, string> = {
                    nearest: 'Normal Rounding',
                    down: 'Floor (Always Down)',
                    up: 'Ceiling (Always Up)'
                };
                setConfig({
                    ...config,
                    interval: intervalMap[result.roundingInterval] || 'Nearest 15 Minutes',
                    direction: directionMap[result.roundingType] || 'Normal Rounding'
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
            await TimeRoundingService.updateRoundingRules(config);
            await fetchRounding();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleIntervalChange = (interval: string) => {
        setConfig({ ...config, interval });
    };

    const handleDirectionChange = (direction: string) => {
        setConfig({ ...config, direction });
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Hourglass className="w-6 h-6 text-indigo-500" />
                        Time Rounding Rules
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Configure how system calculates billable hours from raw punches.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchRounding}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                        <RotateCcw className="w-4 h-4" /> Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save Rules
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                {/* Rounding Mode */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-4">Rounding Interval</h3>
                    <div className="space-y-3">
                        {['None (Exact Time)', 'Nearest 5 Minutes', 'Nearest 15 Minutes', 'Nearest 30 Minutes'].map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <input
                                    type="radio"
                                    name="interval"
                                    checked={config.interval === opt}
                                    onChange={() => handleIntervalChange(opt)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rounding Direction */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-4">Rounding Direction</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Normal Rounding', desc: '0-7 min ↓, 8-14 min ↑' },
                            { label: 'Floor (Always Down)', desc: '9:14 -> 9:00' },
                            { label: 'Ceiling (Always Up)', desc: '9:01 -> 9:15' }
                        ].map((opt, i) => (
                            <label key={i} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <input
                                    type="radio"
                                    name="direction"
                                    checked={config.direction === opt.label}
                                    onChange={() => handleDirectionChange(opt.label)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt.label}</div>
                                    <div className="text-xs text-silver-mist">{opt.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Simulation Preview */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-4">Live Preview</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Punch In</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400">{config.preview.punchIn}</span>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                <span className="font-bold text-indigo-600 font-mono">{config.preview.roundedIn}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Punch Out</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400">{config.preview.punchOut}</span>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                <span className="font-bold text-indigo-600 font-mono">{config.preview.roundedOut}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-700 dark:text-slate-200">Total Hours</span>
                                <span className="text-emerald-500">{config.preview.totalHours} Hours</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 italic">
                            * Based on '{config.interval}' and '{config.direction}' settings.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}


"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    Star,
    Award,
    TrendingUp,
    MessageSquare
} from 'lucide-react';

export default function VendorPerformancePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-indigo-500" />
                        Vendor Performance
                    </h1>
                    <p className="text-slate-500 text-sm">Scorecards and quarterly reviews for staffing partners.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { vendor: 'TechStaff Solutions', score: 4.8, trend: '+0.2', color: 'bg-emerald-500' },
                    { vendor: 'Design Hive', score: 4.5, trend: '0.0', color: 'bg-indigo-500' },
                    { vendor: 'Global Manpower', score: 3.9, trend: '-0.3', color: 'bg-amber-500' },
                ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg">{card.vendor}</h3>
                            <div className={`${card.color} text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md`}>
                                {card.score}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Candidate Quality</span>
                                    <span>92%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[92%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Time to Fill</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[85%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Compliance</span>
                                    <span>100%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[100%] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <TrendingUp className="w-3 h-3" /> Trend: {card.trend}
                            </div>
                            <button className="text-slate-400 hover:text-indigo-600">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


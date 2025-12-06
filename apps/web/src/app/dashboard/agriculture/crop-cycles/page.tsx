"use client";

import React, { useState } from 'react';
import {
    Sprout,
    Calendar,
    CloudRain,
    BarChart3
} from 'lucide-react';

export default function CropCyclesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sprout className="w-6 h-6 text-indigo-500" />
                        Crop Cycles
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor growth stages and harvest windows.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { crop: 'Corn (Sweet)', field: 'Field 4', stage: 'Maturation', harvest: '12 days', progress: 85 },
                    { crop: 'Soybeans', field: 'Field 2', stage: 'Flowering', harvest: '45 days', progress: 40 },
                    { crop: 'Wheat (Winter)', field: 'Field 1', stage: 'Emergence', harvest: '6 months', progress: 15 },
                    { crop: 'Tomatoes', field: 'Greenhouse B', stage: 'Harvesting', harvest: 'Now', progress: 95 },
                ].map((crop, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{crop.crop}</h3>
                                <div className="text-sm text-slate-500">{crop.field}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-400 uppercase">Est. Harvest</span>
                                <span className={`font-bold ${crop.harvest === 'Now' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{crop.harvest}</span>
                            </div>
                        </div>

                        <div className="mb-2 flex justify-between text-sm">
                            <span className="font-bold text-indigo-600">{crop.stage}</span>
                            <span className="text-slate-500">{crop.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${crop.progress}%` }}></div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600">
                                <CloudRain className="w-4 h-4" /> Irrigation Log
                            </button>
                            <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600">
                                <BarChart3 className="w-4 h-4" /> Yield Est.
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

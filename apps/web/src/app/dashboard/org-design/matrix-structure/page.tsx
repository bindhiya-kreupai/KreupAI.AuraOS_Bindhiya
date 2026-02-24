"use client";

import React from 'react';
import {
    Network,
    Users,
    ZoomIn,
    ZoomOut,
    Search,
    UserPlus,
    MoreHorizontal
} from 'lucide-react';

export default function MatrixPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Network className="w-6 h-6 text-indigo-500" />
                        Matrix Org Structure
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize dual-reporting relationships and project-based hierarchies.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                {/* Search Overlay */}
                <div className="absolute top-4 left-4 z-10 w-80 bg-white dark:bg-slate-900 shadow-lg rounded-xl p-2 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                    <Search className="w-5 h-5 text-slate-400 ml-2" />
                    <input type="text" placeholder="Find Employee or Department..." className="w-full bg-transparent outline-none text-sm font-bold" />
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 z-10 bg-white dark:bg-slate-900 shadow-lg rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-xs mb-2">Relationship Types</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <div className="w-8 h-0.5 bg-slate-400"></div> Direct Report
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <div className="w-8 h-0.5 bg-indigo-500 border-t border-dashed border-indigo-500 h-0"></div> Dotted Line
                        </div>
                    </div>
                </div>

                {/* Canvas Area (Mock) */}
                <div className="w-full h-full overflow-auto flex items-center justify-center p-20 min-w-[800px]">
                    {/* Structure */}
                    <div className="flex flex-col items-center gap-12">
                        {/* Level 1 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border-2 border-indigo-500 w-64 relative group cursor-pointer hover:scale-105 transition-transform">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CEO</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center font-bold text-indigo-600">MJ</div>
                                    <div>
                                        <div className="font-bold text-sm">Michael Johnson</div>
                                        <div className="text-xs text-slate-500">Chief Executive</div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-12 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
                        </div>

                        {/* Level 2 */}
                        <div className="flex gap-16 relative">
                            {/* Connector Line */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[400px] h-12 border-t-2 border-x-2 border-slate-300 dark:border-slate-700 rounded-t-xl"></div>

                            {/* Node 2.1 */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 w-56 relative group hover:border-indigo-400 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center font-bold text-emerald-600">JS</div>
                                        <div>
                                            <div className="font-bold text-sm">Jane Smith</div>
                                            <div className="text-xs text-slate-500">VP, Engineering</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-12 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
                                {/* Level 3 - Under Jane */}
                                <div className="flex gap-3 pt-12 relative">
                                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-[120px] h-12 border-t-2 border-x-2 border-slate-300 dark:border-slate-700 rounded-t-xl"></div>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-48 text-center">
                                        <div className="font-bold text-xs text-indigo-600 mb-1">Product A Team</div>
                                        <div className="text-xs font-bold">Sarah Connor (Lead)</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-48 text-center">
                                        <div className="font-bold text-xs text-indigo-600 mb-1">Product B Team</div>
                                        <div className="text-xs font-bold">Kyle Reese (Lead)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Node 2.2 */}
                            <div className="flex flex-col items-center relative">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 w-56 relative group hover:border-indigo-400 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center font-bold text-purple-600">JD</div>
                                        <div>
                                            <div className="font-bold text-sm">John Doe</div>
                                            <div className="text-xs text-slate-500">VP, Marketing</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Dotted Line Example */}
                                <svg className="absolute top-1/2 left-full w-32 h-20 -translate-y-1/2 pointer-events-none">
                                    <path d="M 0 0 C 40 0, 40 80, 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-indigo-400" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState } from 'react';
import {
    Users,
    Plus,
    Minus,
    Move,
    Download,
    Share2,
    Settings,
    Search,
    UserPlus,
    MoreVertical,
    ChevronDown
} from 'lucide-react';

export default function OrgChartBuilderPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Org Chart Builder
                    </h1>
                    <p className="text-slate-500 text-sm">Design and restructure your organization visually.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col">

                {/* Toolbar */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500" title="Add Node">
                            <UserPlus className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500" title="Move Canvas">
                            <Move className="w-5 h-5" />
                        </button>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-1"></div>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500" title="Zoom In">
                            <Plus className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500" title="Zoom Out">
                            <Minus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Properties Side Panel (Right) */}
                <div className="absolute top-4 right-4 z-10 w-72 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100%-2rem)]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Node Properties</h3>
                        <Settings className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                            <input type="text" defaultValue="Michael Johnson" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Title</label>
                            <input type="text" defaultValue="CEO" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                            <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium">
                                <option>Executive</option>
                                <option>Engineering</option>
                                <option>Product</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Headcount</label>
                            <input type="number" defaultValue="1" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium" />
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-bold transition-colors">
                                Delete Node
                            </button>
                        </div>
                    </div>
                </div>

                {/* Canvas Graphics (Mock) */}
                <div className="flex items-center justify-center flex-1 overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                    <div className="transform scale-100 transition-transform origin-center">
                        {/* Root Node */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white dark:bg-slate-900 w-64 p-4 rounded-xl shadow-lg border-2 border-indigo-500 relative group z-20">
                                <div className="absolute top-2 right-2 cursor-pointer text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">MJ</div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100">Michael Johnson</div>
                                        <div className="text-xs text-indigo-500 font-bold uppercase">CEO</div>
                                    </div>
                                </div>
                                {/* Drag Handles */}
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform z-30">
                                    <Plus className="w-4 h-4 text-indigo-500" />
                                </div>
                            </div>
                            <div className="h-16 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
                        </div>

                        {/* Level 2 Container */}
                        <div className="flex gap-16 relative">
                            {/* Connector Lines */}
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[400px] h-16 border-t-2 border-x-2 border-slate-300 dark:border-slate-700 rounded-t-xl"></div>

                            {/* Node A */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white dark:bg-slate-900 w-56 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors cursor-pointer relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">CTO</div>
                                        <div>
                                            <div className="font-bold text-sm">Sarah Connor</div>
                                            <div className="text-xs text-slate-500">Technology</div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 z-30">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Node B */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white dark:bg-slate-900 w-56 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors cursor-pointer relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">CPO</div>
                                        <div>
                                            <div className="font-bold text-sm">James Cameron</div>
                                            <div className="text-xs text-slate-500">Product</div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 z-30">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import {
    PenTool,
    MousePointer2,
    Type,
    StickyNote,
    Image as ImageIcon,
    Undo,
    Redo,
    Share2,
    Download,
    ZoomIn,
    ZoomOut,
    MoreHorizontal
} from 'lucide-react';

export default function WhiteboardPage() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col relative bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 z-20">
                <button className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                    <MousePointer2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <PenTool className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <StickyNote className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Type className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Undo className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Redo className="w-5 h-5" />
                </button>
            </div>

            {/* Header / Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800"></div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">+4</div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/20 text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Canvas Area (Mock) */}
            <div className="flex-1 w-full h-full relative cursor-crosshair bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]">

                {/* Mock Elements */}
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-40 bg-yellow-100 border border-yellow-200 shadow-xl rotate-[-2deg] p-4 font-handwriting text-slate-800">
                    <h3 className="font-bold mb-2">Brainstorming Session 🧠</h3>
                    <p className="text-sm">Key objectives for Q1:</p>
                    <ul className="list-disc pl-4 text-sm">
                        <li>Launch new dashboard</li>
                        <li>Integrate AI features</li>
                    </ul>
                </div>

                <div className="absolute top-1/3 left-1/2 w-80 h-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <span className="font-bold text-sm">User Flow</span>
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs font-bold">
                        <div className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded border border-indigo-200">Login</div>
                        <div className="w-8 h-px bg-slate-300"></div>
                        <div className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded border border-indigo-200">Dashboard</div>
                        <div className="w-8 h-px bg-slate-300"></div>
                        <div className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">Profile</div>
                    </div>
                </div>

                <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-pink-100 border border-pink-200 shadow-lg rotate-[3deg] p-4 flex items-center justify-center text-center font-bold text-pink-800">
                    "Great design is invisible."
                </div>
            </div>

            {/* Scale Controls */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 z-20">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-12 text-center">100%</span>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500">
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}


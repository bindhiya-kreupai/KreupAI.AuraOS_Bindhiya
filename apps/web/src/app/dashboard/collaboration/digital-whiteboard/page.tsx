"use client";

import React, { useState } from 'react';
import {
    PenTool,
    MousePointer2,
    StickyNote,
    Image as ImageIcon,
    Undo2,
    Redo2,
    Share2,
    MoreHorizontal
} from 'lucide-react';

export default function DigitalWhiteboardPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-indigo-500" />
                        Digital Whiteboard
                    </h1>
                    <p className="text-slate-500 text-sm">Brainstorm, sketch, and collaborate in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700">Export</button>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-center mb-4">
                <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
                    {[MousePointer2, PenTool, StickyNote, ImageIcon, Undo2, Redo2].map((Icon, i) => (
                        <button key={i} className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${i === 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-slate-500'}`}>
                            <Icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas Area (Mock) */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden pattern-dots">
                {/* Mock sticky notes */}
                <div className="absolute top-20 left-20 w-48 h-48 bg-yellow-200 shadow-lg transform -rotate-1 p-4 font-handwriting text-slate-800 text-lg flex flex-col">
                    <span className="font-bold mb-2">Q4 Strategy</span>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Expand to APAC</li>
                        <li>Launch Mobile App</li>
                        <li>Hire 5 Devs</li>
                    </ul>
                </div>

                <div className="absolute top-40 right-1/4 w-48 h-48 bg-blue-200 shadow-lg transform rotate-2 p-4 font-handwriting text-slate-800 text-lg">
                    <span className="font-bold block mb-2">User Feedback</span>
                    "The new dashboard is super fast! Love the dark mode."
                </div>

                <div className="absolute bottom-20 left-1/3 w-64 p-4 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold uppercase text-slate-500">Live User</span>
                    </div>
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center text-xs font-bold">JD</div>
                        <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center text-xs font-bold">AS</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 text-slate-500 flex items-center justify-center text-xs font-bold">+3</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

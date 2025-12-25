"use client";

import React, { useState, useEffect } from 'react';
import {
    MonitorPlay,
    List,
    MessageCircle,
    Download
} from 'lucide-react';
import { CourseService } from '../services';

export default function ELearningPlatformPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result);
            } catch (error) {
            console.error('Error:', error);
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Player Layout */}
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Video Area */}
                <div className="flex-1 flex flex-col">
                    <div className="aspect-video bg-black rounded-2xl flex items-center justify-center text-white relative group cursor-pointer mb-4">
                        <MonitorPlay className="w-16 h-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Advanced React Patterns: Compound Components</h1>
                    <p className="text-slate-500 text-sm mb-6">Learn how to build flexible and reusable components using the compound component pattern.</p>

                    <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                        <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-bold text-sm">Overview</button>
                        <button className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 dark:hover:text-slate-200">Q&A</button>
                        <button className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 dark:hover:text-slate-200">Resources</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <h3 className="font-bold mb-2">About this lesson</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            In this lesson, we will explore the compound component pattern, a powerful way to share state between related components without prop drilling. We'll start by refactoring a rigid component into a flexible set of compound components.
                        </p>
                    </div>
                </div>

                {/* Playlist / Sidebar */}
                <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-full lg:h-auto lg:min-h-[600px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold flex justify-between items-center">
                        <span>Course Content</span>
                        <span className="text-xs text-slate-500">4/12 Completed</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {[
                            { title: 'Introduction', time: '5:00', done: true },
                            { title: 'Why Compound Components?', time: '8:20', done: true },
                            { title: 'Context API Basics', time: '12:15', done: true },
                            { title: 'Building the Context', time: '15:30', done: true },
                            { title: 'Creating Child Components', time: '20:00', done: false, active: true },
                            { title: 'Handling Edge Cases', time: '18:45', done: false },
                            { title: 'Flexible Compound Components', time: '22:10', done: false },
                        ].map((lesson, i) => (
                            <div key={i} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 ${lesson.active ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}>
                                <div className="pt-1">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${lesson.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {lesson.done && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`text-sm font-medium ${lesson.active ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{lesson.title}</h4>
                                    <span className="text-xs text-slate-500">{lesson.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

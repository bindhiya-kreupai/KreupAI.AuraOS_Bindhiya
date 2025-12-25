"use client";

import React, { useState } from 'react';
import {
    CheckSquare,
    FileText,
    Laptop,
    User,
    Calendar,
    ArrowRight,
    Utensils,
    Shirt,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function PreBoardingPage() {
    const [tasks, setTasks] = useState([
        { id: 1, category: 'Documents', title: 'Sign Offer Letter', status: 'Completed', dueDate: 'Oct 15', icon: FileText },
        { id: 2, category: 'Documents', title: 'Upload ID Proofs', status: 'Pending', dueDate: 'Oct 20', icon: User },
        { id: 3, category: 'Asset', title: 'Laptop Preference', status: 'Completed', dueDate: 'Oct 18', icon: Laptop },
        { id: 4, category: 'Asset', title: 'T-Shirt Size', status: 'Pending', dueDate: 'Oct 22', icon: Shirt },
        { id: 5, category: 'Preference', title: 'Dietary Restrictions', status: 'Pending', dueDate: 'Oct 22', icon: Utensils },
    ]);

    const stats = {
        daysToJoin: 5,
        completedTasks: tasks.filter(t => t.status === 'Completed').length,
        totalTasks: tasks.length
    };

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
        ));
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-indigo-500" />
                        Pre-boarding Checklist
                    </h1>
                    <p className="text-slate-500 text-sm">Complete these items before your first day.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
                    <Clock className="w-4 h-4" />
                    <span>Join Date: Oct 25, 2024</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Progress Card */}
                <div className="md:col-span-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2">{stats.daysToJoin} Days to Go! 🚀</h2>
                            <p className="opacity-90">You&apos;re almost there. Complete {stats.totalTasks - stats.completedTasks} more tasks to be fully ready.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</div>
                                <div className="text-xs opacity-75 uppercase font-bold">Ready</div>
                            </div>
                            <div className="w-16 h-16 relative">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="opacity-30" />
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                                        strokeDasharray={175.93}
                                        strokeDashoffset={175.93 * (1 - stats.completedTasks / stats.totalTasks)}
                                        className="text-white" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">Your Tasks</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase">{stats.completedTasks}/{stats.totalTasks} Done</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tasks.map(task => (
                                <div key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${task.status === 'Completed' ? 'opacity-60' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <task.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${task.status === 'Completed' ? 'line-through decoration-slate-400' : ''}`}>{task.title}</div>
                                        <div className="text-xs text-slate-500">Due: {task.dueDate} • {task.category}</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                        {task.status === 'Completed' && <CheckSquare className="w-4 h-4" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Info Panel */}
                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-1">Laptop Policy</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                    Please ensure you select your laptop preference by Oct 20. Default assignment is MacBook Air (M2).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" /> Hiring Manager
                        </h4>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">JD</div>
                            <div>
                                <div className="font-bold text-sm">John Doe</div>
                                <div className="text-xs text-slate-500">VP of Engineering</div>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                            Contact Manager
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

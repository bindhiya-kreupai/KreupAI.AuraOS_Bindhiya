"use client";

import React, { useState, useEffect } from 'react';
import {
    Zap,
    GripVertical,
    Plus,
    Trash2,
    CalendarPlus,
    Camera,
    FileText,
    MapPin,
    Phone,
    MessageSquare,
    Clock,
    Briefcase
} from 'lucide-react';
import { QuickActionsService } from '../services';

export default function QuickActionsPage() {
    const [quickActions, setQuickActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await QuickActionsService.getAllQuickActions();
            if (result.length > 0) {
                setQuickActions(result);
            }
        } catch (error) {
            console.error('Error fetching quick actions:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-indigo-500" />
                        Quick Actions
                    </h1>
                    <p className="text-slate-500 text-sm">Customize the shortcut grid on the mobile home screen.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    Publish Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Actions Library */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider px-2">Available Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { name: 'Request Leave', icon: CalendarPlus, color: 'text-rose-500', bg: 'bg-rose-50' },
                            { name: 'Scan Receipt', icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { name: 'Payslip', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { name: 'Check-In', icon: MapPin, color: 'text-sky-500', bg: 'bg-sky-50' },
                            { name: 'Team Calls', icon: Phone, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { name: 'Chat', icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-50' },
                        ].map((action, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing hover:border-indigo-500 hover:shadow-md transition-all group">
                                <span className={`w-10 h-10 rounded-full flex items-center justify-center ${action.bg} dark:bg-slate-800`}>
                                    <action.icon className={`w-5 h-5 ${action.color}`} />
                                </span>
                                <span className="text-xs font-semibold text-center">{action.name}</span>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-4 h-4 text-indigo-500" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <p className="text-xs text-slate-500 mb-2">Need a custom action?</p>
                        <button className="text-sm font-bold text-indigo-600 hover:underline">Create Custom Action</button>
                    </div>
                </div>

                {/* Mobile Preview / Drop Zone */}
                <div className="lg:col-span-2 flex justify-center bg-slate-100 dark:bg-slate-950/50 rounded-3xl p-8">
                    <div className="bg-white dark:bg-slate-900 w-[320px] rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>

                        {/* Screen Content */}
                        <div className="h-[600px] flex flex-col">
                            {/* App Header Mock */}
                            <div className="h-40 bg-indigo-600 p-6 pt-12 flex flex-col justify-between text-white">
                                <div className="flex justify-between items-center">
                                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                    <div className="w-6 h-6 rounded-full bg-white/20"></div>
                                </div>
                                <div>
                                    <div className="text-indigo-200 text-xs">Good Morning,</div>
                                    <div className="font-bold text-lg">John Doe</div>
                                </div>
                            </div>

                            {/* Quick Actions Grid (Drop Zone) */}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-950 px-4 py-6">
                                <h3 className="text-xs font-bold text-slate-400 mb-4 px-1">QUICK ACTIONS</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { name: 'Punch In', icon: Clock, color: 'text-white', bg: 'bg-indigo-500' },
                                        { name: 'Leave', icon: CalendarPlus, color: 'text-indigo-500', bg: 'bg-white' },
                                        { name: 'Claim', icon: Camera, color: 'text-indigo-500', bg: 'bg-white' },
                                        { name: 'Tasks', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-white' },
                                        { name: 'Directory', icon: Phone, color: 'text-indigo-500', bg: 'bg-white' },
                                        { name: 'Profile', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-white' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 group relative">
                                            <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center ${item.bg} dark:bg-slate-800`}>
                                                <item.icon className={`w-6 h-6 ${item.color}`} />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{item.name}</span>

                                            {/* Hover Delete */}
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer shadow-md transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </div>
                                            {/* Drag Handle */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab">
                                                <GripVertical className="w-6 h-6 text-slate-400 drop-shadow-md" />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty Slot Placeholder */}
                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                        <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                            <Plus className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400">Add</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Nav Mock */}
                            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center text-slate-300">
                                <div className="w-6 h-6 bg-indigo-500 rounded-lg"></div>
                                <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
                                <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
                                <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

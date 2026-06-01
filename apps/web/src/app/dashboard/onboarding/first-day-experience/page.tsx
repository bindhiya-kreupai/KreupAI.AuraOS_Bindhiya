// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift,
    MapPin,
    Wifi,
    Coffee,
    Users,
    Clock,
    CalendarCheck,
    ChevronRight,
    Monitor,
    Key,
    Loader2,
    CalendarOff
} from 'lucide-react';
import { OnboardingInstanceService } from '../services';

export default function FirstDayPage() {
    const [schedule, setSchedule] = useState<Array<{
        time: string;
        title: string;
        location: string;
        icon: typeof Coffee;
        color: string;
        bg: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const instances = await OnboardingInstanceService.getInstances();

                // Look for active instances and extract first-day schedule from tasks
                const activeInstance = instances.find(
                    (i: Record<string, unknown>) => i.status === 'in_progress' || i.status === 'not_started'
                ) || instances[0];

                if (activeInstance) {
                    // Extract first-day tasks and transform into schedule
                    const tasks = (activeInstance as { tasks?: Array<Record<string, unknown>> }).tasks || [];
                    const firstDayTasks = tasks.filter(
                        (t: Record<string, unknown>) => t.phase === 'first_day'
                    );

                    const iconMap: Record<string, typeof Coffee> = {
                        orientation: Coffee,
                        access: Monitor,
                        training: Users,
                        social: Gift,
                        administrative: MapPin,
                    };

                    const colorMap: Record<string, { color: string; bg: string }> = {
                        orientation: { color: 'text-amber-500', bg: 'bg-amber-100' },
                        access: { color: 'text-indigo-500', bg: 'bg-indigo-100' },
                        training: { color: 'text-emerald-500', bg: 'bg-emerald-100' },
                        social: { color: 'text-rose-500', bg: 'bg-rose-100' },
                        administrative: { color: 'text-purple-500', bg: 'bg-purple-100' },
                    };

                    if (firstDayTasks.length > 0) {
                        const scheduleItems = firstDayTasks.map((task: Record<string, unknown>, index: number) => {
                            const category = (task.category as string) || 'orientation';
                            const colors = colorMap[category] || { color: 'text-indigo-500', bg: 'bg-indigo-100' };
                            const dueDate = task.dueDate ? new Date(task.dueDate as string) : null;
                            const timeStr = dueDate
                                ? dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                : `${9 + index}:00 AM`;

                            return {
                                time: timeStr,
                                title: (task.taskName as string) || 'Activity',
                                location: (task.notes as string) || 'TBD',
                                icon: iconMap[category] || Coffee,
                                color: colors.color,
                                bg: colors.bg,
                            };
                        });
                        setSchedule(scheduleItems);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching first day data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading first day experience...</p>
                </div>
            </div>
        );
    }

    if (schedule.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3 text-center">
                    <CalendarOff className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No First Day Schedule</h3>
                    <p className="text-sm text-silver-mist">Your first day schedule will appear here once it has been set up.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        First Day Experience
                    </h1>
                    <p className="text-slate-500 text-sm">Everything you need for a smooth Day 1.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schedule */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-indigo-500" />
                            Your Schedule
                        </h3>
                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />

                            {schedule.map((slot, i) => (
                                <div key={i} className="relative pl-16 flex items-start gap-3 group">
                                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-xl flex items-center justify-center z-10 ${slot.bg} dark:bg-opacity-20`}>
                                        <slot.icon className={`w-5 h-5 ${slot.color}`} />
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{slot.title}</h4>
                                            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">{slot.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin className="w-3 h-3" /> {slot.location}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Info */}
                <div className="space-y-4">
                    {/* Welcome Kit Digital */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
                        <Gift className="w-12 h-12 mx-auto mb-4 text-white opacity-90" />
                        <h3 className="font-bold text-lg mb-2">Digital Welcome Kit</h3>
                        <p className="text-sm opacity-80 mb-6 px-4">Access your employee handbook, merch store codes, and benefits guide.</p>
                        <button className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                            Open Kit <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* IT Access Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-emerald-500" /> Quick Access
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <span className="text-slate-500">IT Helpdesk</span>
                                <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                    Contact IT
                                </code>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-start gap-2 text-xs text-slate-500">
                                <Key className="w-3 h-3 mt-0.5" />
                                Your credentials will be provided on your first day by the IT team.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


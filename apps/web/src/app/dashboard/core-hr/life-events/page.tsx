"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    Baby,
    Home,
    GraduationCap,
    CalendarCheck,
    ArrowRight
} from 'lucide-react';
import { LifeEventService } from '../services';
import type { LifeEvent } from '../types';

const formatEventType = (eventType: string): string => {
    return eventType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatEventDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const getStatusLabel = (status: string): string => {
    switch (status) {
        case 'reported': return 'Pending Review';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
};

const getStatusStyle = (status: string): string => {
    switch (status) {
        case 'reported': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
        case 'in_progress': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
        case 'completed': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
        default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
    }
};

const getInitials = (name: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function LifeEventsPage() {
    const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLifeEvents();
    }, []);

    const fetchLifeEvents = async () => {
        try {
            const data = await LifeEventService.getAllLifeEvents();
            setLifeEvents(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeRequestsCount = lifeEvents.filter(e => e.status !== 'completed').length;
    const pendingEvents = lifeEvents.filter(e => e.status !== 'completed');

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        Life Events
                    </h1>
                    <p className="text-slate-500 text-sm">Manage major milestones: Marriage, Childbirth, Relocation, and Education.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                    <CalendarCheck className="w-4 h-4" /> {loading ? '...' : `${activeRequestsCount} Active Request${activeRequestsCount !== 1 ? 's' : ''}`}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Event Types */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-lg">Report a Life Event</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Marriage', desc: 'Update name, add spouse to insurance, request leave.', icon: <Heart className="w-6 h-6 text-pink-500" />, color: 'bg-pink-50 dark:bg-pink-900/20' },
                            { title: 'Childbirth / Adoption', desc: 'Add dependent, apply for parental leave, update benefits.', icon: <Baby className="w-6 h-6 text-sky-500" />, color: 'bg-sky-50 dark:bg-sky-900/20' },
                            { title: 'Relocation', desc: 'Change address, update tax region, request relocation allowance.', icon: <Home className="w-6 h-6 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-900/20' },
                            { title: 'Higher Education', desc: 'Log new degree, request tuition reimbursement.', icon: <GraduationCap className="w-6 h-6 text-purple-500" />, color: 'bg-purple-50 dark:bg-purple-900/20' },
                        ].map((e, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                    {e.icon}
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${e.color}`}>
                                    {e.icon}
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{e.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">{e.desc}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">
                                    Start Workflow <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Pending Approvals</h3>

                        {loading && (
                            <div className="flex items-center justify-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        )}

                        {!loading && pendingEvents.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <Heart className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No pending approvals</p>
                                <p className="text-sm">Life event requests will appear here once submitted.</p>
                            </div>
                        )}

                        {!loading && pendingEvents.length > 0 && (
                            <div className="space-y-4">
                                {pendingEvents.map((row) => (
                                    <div key={row.eventId} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                                                {getInitials(row.employeeName)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{row.employeeName}</h4>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">{formatEventType(row.eventType)} {'\u2022'} {formatEventDate(row.eventDate)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-bold px-2 py-1 rounded ${getStatusStyle(row.status)}`}>
                                                {getStatusLabel(row.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Automation Rules */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4">Auto-Trigger Rules</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 bg-emerald-400 rounded-full shrink-0"></div>
                                <div className="opacity-90">
                                    <span className="font-bold text-white">Marriage:</span> Auto-enroll spouse in medical plan (Tier 2).
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 bg-emerald-400 rounded-full shrink-0"></div>
                                <div className="opacity-90">
                                    <span className="font-bold text-white">Childbirth:</span> Trigger 26-week maternity leave workflow + Payout.
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 bg-emerald-400 rounded-full shrink-0"></div>
                                <div className="opacity-90">
                                    <span className="font-bold text-white">Relocation:</span> Update payroll tax slab based on new state.
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
                            Configure Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

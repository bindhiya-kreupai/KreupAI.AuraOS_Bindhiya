"use client";

import React, { useState, useEffect } from 'react';
import { InterviewService } from '../services';
import type { Interview } from '../types';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Video,
    MapPin,
    MoreHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

function getInterviewDisplayName(interview: Interview): string {
    return interview.candidateName || 'Interview';
}

function getInterviewTime(interview: Interview): string {
    if (interview.scheduledDate) {
        return new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return 'TBD';
}

function getInterviewDate(interview: Interview): string {
    if (!interview.scheduledDate) {
        return 'Not scheduled';
    }

    const date = new Date(interview.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
}

function getInterviewLocation(interview: Interview): string {
    return interview.location || interview.meetingLink || 'TBD';
}

function formatInterviewType(type: Interview['type']): string {
    return String(type || 'Interview')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
}

export default function InterviewSchedulingPage() {
    const [view, setView] = useState<'Day' | 'Week'>('Day');
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const data = await InterviewService.getInterviews();
            setInterviews(data);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (interviewData: Interview) => {
        try {
            await InterviewService.scheduleInterview(interviewData);
            await fetchInterviews();
        } catch (error: any) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading interviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-celestial-indigo" />
                        Interview Scheduling
                    </h1>
                    <p className="text-silver-mist text-sm">Manage candidate interviews and panel availability.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setView('Day')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'Day' ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm' : 'text-slate-500'}`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setView('Week')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'Week' ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm' : 'text-slate-500'}`}
                        >
                            Week
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                        <Plus className="w-4 h-4" /> Schedule New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Left: Upcoming List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl text-sm">Upcoming</h3>
                            <button className="text-xs text-celestial-indigo font-bold hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            {interviews.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">No upcoming interviews</p>
                                </div>
                            )}
                            {interviews.map(interview => {
                                const loc = getInterviewLocation(interview);
                                const isRemote = loc.includes('Meet') || loc.includes('Zoom') || loc.includes('http');

                                return (
                                    <div key={interview.id} className="p-3 bg-slate-50 dark:bg-deep-cosmos/30 rounded-lg border border-cloud dark:border-nebula-purple/20 group hover:border-celestial-indigo/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs font-bold text-slate-500 uppercase">{getInterviewDate(interview)}</div>
                                            <div className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
                                                <MoreHorizontal className="w-3 h-3 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-celestial-indigo flex items-center justify-center text-xs font-bold">
                                                {getInterviewDisplayName(interview).charAt(0)}
                                            </div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl truncate">{getInterviewDisplayName(interview)}</div>
                                        </div>
                                        <div className="text-xs text-silver-mist mb-2">{formatInterviewType(interview.type)}</div>

                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                            <span className="flex items-center gap-1 bg-white dark:bg-stellar-blue px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                                                <Clock className="w-3 h-3" /> {getInterviewTime(interview)}
                                            </span>
                                            {isRemote ? (
                                                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                                                    <Video className="w-3 h-3" /> Remote
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                                                    <MapPin className="w-3 h-3" /> {loc}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Calendar Area */}
                <div className="lg:col-span-3 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    {/* Calendar Toolbar */}
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex items-center gap-1">
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                                <input
                                    type="text"
                                    placeholder="Search interviewer..."
                                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-deep-cosmos/30 border border-cloud dark:border-nebula-purple/20 rounded-lg text-xs focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-8 divide-x divide-cloud dark:divide-nebula-purple/20 h-full">
                            {/* Time Column */}
                            <div className="col-span-1 bg-slate-50 dark:bg-deep-cosmos/10">
                                {TIME_SLOTS.map(time => (
                                    <div key={time} className="h-20 border-b border-cloud dark:border-nebula-purple/20 text-xs text-slate-400 font-medium p-2 text-right">
                                        {time}
                                    </div>
                                ))}
                            </div>

                            {/* Days Columns */}
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                const today = new Date();
                                const startOfWeek = new Date(today);
                                startOfWeek.setDate(today.getDate() - today.getDay() + 1 + i);
                                const dayLabel = `${day} ${startOfWeek.getDate()}`;

                                return (
                                    <div key={day} className="col-span-1 relative">
                                        <div className="sticky top-0 bg-white dark:bg-stellar-blue z-10 border-b border-cloud dark:border-nebula-purple/20 py-2 text-center text-xs font-bold text-ink-black dark:text-pearl uppercase tracking-wide">
                                            {dayLabel}
                                        </div>
                                        <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                            {TIME_SLOTS.map(time => (
                                                <div key={time} className="h-20 group hover:bg-slate-50 dark:hover:bg-deep-cosmos/20 transition-colors relative">
                                                    {/* Add button on hover */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                        <Plus className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


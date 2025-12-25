"use client";

import React, { useState, useEffect } from 'react';
import { InterviewService } from '../services';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    User,
    Video,
    MapPin,
    MoreHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
    Users
} from 'lucide-react';

// --- MOCK DATA ---

interface Interview {
    id: string;
    candidate: string;
    role: string;
    type: 'Technical' | 'Behavioral' | 'System Design' | 'HR Round';
    interviewer: string;
    date: string;
    time: string;
    duration: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    location: 'Google Meet' | 'Room 304' | 'Zoom';
    isConflict?: boolean;
}

const UPCOMING_INTERVIEWS: Interview[] = [
    {
        id: 'INT-101',
        candidate: 'Liam Johnson',
        role: 'Senior Frontend Dev',
        type: 'Technical',
        interviewer: 'Alice Chen',
        date: 'Today',
        time: '10:00 AM',
        duration: '1h',
        status: 'Scheduled',
        location: 'Google Meet'
    },
    {
        id: 'INT-102',
        candidate: 'Sophia Williams',
        role: 'Product Manager',
        type: 'Behavioral',
        interviewer: 'Bob Smith',
        date: 'Today',
        time: '02:00 PM',
        duration: '45m',
        status: 'Scheduled',
        location: 'Room 304'
    },
    {
        id: 'INT-103',
        candidate: 'Ethan Hunt',
        role: 'Security Engineer',
        type: 'System Design',
        interviewer: 'Charlie Kim',
        date: 'Tomorrow',
        time: '11:00 AM',
        duration: '1h',
        status: 'Scheduled',
        location: 'Zoom',
        isConflict: true
    }
];

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function InterviewSchedulingPage() {
    const [view, setView] = useState<'Day' | 'Week'>('Day');
    const [interviews, setInterviews] = useState<Interview[]>(UPCOMING_INTERVIEWS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const data = await InterviewService.getInterviews();
            if (data.length > 0) {
                setInterviews(data);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (interviewData: any) => {
        try {
            await InterviewService.scheduleInterview(interviewData);
            await fetchInterviews();
        } catch (error) {
            console.error('Error:', error);
                    }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Upcoming List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl text-sm">Upcoming</h3>
                            <button className="text-xs text-celestial-indigo font-bold hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            {UPCOMING_INTERVIEWS.map(interview => (
                                <div key={interview.id} className="p-3 bg-slate-50 dark:bg-deep-cosmos/30 rounded-lg border border-cloud dark:border-nebula-purple/20 group hover:border-celestial-indigo/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-xs font-bold text-slate-500 uppercase">{interview.date}</div>
                                        <div className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
                                            <MoreHorizontal className="w-3 h-3 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-celestial-indigo flex items-center justify-center text-xs font-bold">
                                            {interview.candidate.charAt(0)}
                                        </div>
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl truncate">{interview.candidate}</div>
                                    </div>
                                    <div className="text-xs text-silver-mist mb-2">{interview.role}</div>

                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1 bg-white dark:bg-stellar-blue px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                                            <Clock className="w-3 h-3" /> {interview.time}
                                        </span>
                                        {interview.location.includes('Meet') || interview.location.includes('Zoom') ? (
                                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                                                <Video className="w-3 h-3" /> Remote
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                                                <MapPin className="w-3 h-3" /> {interview.location}
                                            </span>
                                        )}
                                    </div>

                                    {interview.isConflict && (
                                        <div className="mt-2 text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-1">
                                            ⚠️ Potential Conflict
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Calendar Area */}
                <div className="lg:col-span-3 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    {/* Calendar Toolbar */}
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">December 2024</h2>
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

                            {/* Days Columns (Mocked for view) */}
                            {['Mon 11', 'Tue 12', 'Wed 13', 'Thu 14', 'Fri 15', 'Sat 16', 'Sun 17'].map((day, i) => (
                                <div key={day} className="col-span-1 relative">
                                    <div className="sticky top-0 bg-white dark:bg-stellar-blue z-10 border-b border-cloud dark:border-nebula-purple/20 py-2 text-center text-xs font-bold text-ink-black dark:text-pearl uppercase tracking-wide">
                                        {day}
                                    </div>
                                    <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                        {TIME_SLOTS.map(time => (
                                            <div key={time} className="h-20 group hover:bg-slate-50 dark:hover:bg-deep-cosmos/20 transition-colors relative">
                                                {/* Mock Event Placements */}
                                                {(i === 0 && time === '10:00 AM') && (
                                                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-indigo-100 dark:bg-indigo-900/40 border-l-4 border-celestial-indigo rounded p-1.5 cursor-pointer hover:shadow-md transition-all z-10">
                                                        <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 truncate">L. Johnson - Frontend</div>
                                                        <div className="text-[9px] text-indigo-500 dark:text-indigo-400">Alice Chen</div>
                                                    </div>
                                                )}
                                                {(i === 1 && time === '02:00 PM') && (
                                                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-emerald-100 dark:bg-emerald-900/40 border-l-4 border-emerald-500 rounded p-1.5 cursor-pointer hover:shadow-md transition-all z-10">
                                                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 truncate">S. Williams - PM</div>
                                                        <div className="text-[9px] text-emerald-500 dark:text-emerald-400">Bob Smith</div>
                                                    </div>
                                                )}
                                                {(i === 4 && time === '11:00 AM') && (
                                                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-rose-100 dark:bg-rose-900/40 border-l-4 border-rose-500 rounded p-1.5 cursor-pointer hover:shadow-md transition-all z-10">
                                                        <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 truncate">E. Hunt - Security</div>
                                                        <div className="text-[8px] text-rose-600 font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-2 h-2" /> Conflict</div>
                                                    </div>
                                                )}

                                                {/* Add button on hover */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                    <Plus className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    );
}

"use client";

import React, { useState } from 'react';
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    MessageSquare,
    Phone,
    Mail,
    Calendar,
    Briefcase,
    TrendingUp,
    AlertCircle,
    ThumbsUp,
    Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const TEAM_MEMBERS = [
    { id: 1, name: 'Sarah Jenkins', role: 'Senior Developer', status: 'Online', avatar: 'SJ', mood: 'Happy', location: 'Office' },
    { id: 2, name: 'Mike Chen', role: 'UX Designer', status: 'In Meeting', avatar: 'MC', mood: 'Focused', location: 'Remote' },
    { id: 3, name: 'Jessica Wu', role: 'Product Manager', status: 'Offline', avatar: 'JW', mood: 'Neutral', location: 'Office' },
    { id: 4, name: 'David Kim', role: 'Backend Dev', status: 'On Leave', avatar: 'DK', mood: 'Relaxed', location: 'Home' },
    { id: 5, name: 'Alex Thompson', role: 'QA Lead', status: 'Online', avatar: 'AT', mood: 'Happy', location: 'Office' },
];

const APPROVALS = [
    { id: 1, type: 'Leave Request', requester: 'David Kim', details: 'Sick Leave • 2 Days', date: 'Today, 9:30 AM', status: 'Pending' },
    { id: 2, type: 'Expense Claim', requester: 'Sarah Jenkins', details: 'Client Lunch • $45.00', date: 'Yesterday', status: 'Pending' },
    { id: 3, type: 'Timesheet', requester: 'Mike Chen', details: 'Week 48 • 40 Hours', date: 'Yesterday', status: 'Pending' },
];

const TEAM_STATS = {
    attendance: '92%',
    avgMood: '4.2/5',
    productivity: 'On Track',
    deadlines: '2 Upcoming'
};

export default function TeamManagerPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Team Hub: Engineering
                    </h1>
                    <p className="text-silver-mist text-sm">Manage your direct reports, approvals, and team health.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Briefcase className="w-4 h-4" /> Team Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Team Grid & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <Clock className="w-3 h-3" /> Attendance
                            </div>
                            <div className="text-xl font-bold text-ink-black dark:text-pearl">{TEAM_STATS.attendance}</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <Smile className="w-3 h-3" /> Avg Mood
                            </div>
                            <div className="text-xl font-bold text-emerald-500">{TEAM_STATS.avgMood}</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <TrendingUp className="w-3 h-3" /> Productivity
                            </div>
                            <div className="text-xl font-bold text-indigo-500">{TEAM_STATS.productivity}</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <AlertCircle className="w-3 h-3" /> Deadlines
                            </div>
                            <div className="text-xl font-bold text-amber-500">{TEAM_STATS.deadlines}</div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-500" /> Direct Reports ({TEAM_MEMBERS.length})
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search team..."
                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {TEAM_MEMBERS.map(member => (
                                <div key={member.id} className="p-4 border border-cloud dark:border-slate-800 rounded-xl hover:border-indigo-300 transition-all hover:shadow-md bg-white dark:bg-slate-900/40 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                    {member.avatar}
                                                </div>
                                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 
                                                    ${member.status === 'Online' ? 'bg-emerald-500' :
                                                        member.status === 'In Meeting' ? 'bg-amber-500' :
                                                            member.status === 'On Leave' ? 'bg-rose-500' : 'bg-slate-400'}
                                                `}></span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-ink-black dark:text-pearl">{member.name}</div>
                                                <div className="text-xs text-silver-mist">{member.role}</div>
                                            </div>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Smile className="w-3 h-3 text-emerald-500" /> {member.mood}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-3 h-3 text-indigo-500" /> {member.location}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 transition-colors">
                                            <MessageSquare className="w-3 h-3" /> Message
                                        </button>
                                        <button className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500">
                                            <Phone className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Approvals Queue */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Pending Approvals
                        </h3>
                        <span className="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold px-2 py-1 rounded-full">{APPROVALS.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {APPROVALS.map(approval => (
                            <div key={approval.id} className="p-4 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border 
                                        ${approval.type === 'Leave Request' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            approval.type === 'Expense Claim' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                'bg-indigo-50 text-indigo-600 border-indigo-200'}
                                    `}>
                                        {approval.type}
                                    </span>
                                    <span className="text-[10px] text-silver-mist">{approval.date}</span>
                                </div>

                                <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-1">
                                    {approval.requester}
                                </h4>
                                <p className="text-xs text-silver-mist mb-3">{approval.details}</p>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Approve
                                    </button>
                                    <button className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-lg text-xs font-bold transition-colors text-slate-500 flex items-center justify-center gap-1">
                                        <XCircle className="w-3 h-3" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}

                        {APPROVALS.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-2" />
                                <div className="text-sm font-bold text-slate-500">All caught up!</div>
                                <div className="text-xs text-slate-400">No pending approvals</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-cloud dark:border-slate-800 text-center">
                        <button className="text-xs font-bold text-indigo-500 hover:underline">
                            View Approval History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

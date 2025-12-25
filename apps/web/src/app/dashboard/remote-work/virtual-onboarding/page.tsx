"use client";

import React from 'react';
import {
    UserPlus,
    CheckSquare,
    Mail,
    Video,
    Calendar,
    Users
} from 'lucide-react';

export default function VirtualOnboardingPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-indigo-500" />
                        Virtual Onboarding
                    </h1>
                    <p className="text-slate-500 text-sm">Remote-first onboarding checklists and welcome kits.</p>
                </div>
            </div>

            {/* Featured Onboarding Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div className="space-y-4 max-w-lg">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md border border-white/20">Active Session</span>
                    <h2 className="text-3xl font-black">Welcome, Batch of Dec &apos;25!</h2>
                    <p className="text-indigo-100 opacity-90">
                        3 new remote joiners starting today. Their equipment has been delivered and accounts are provisioned.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-50 transition-colors">Start Orientation</button>
                        <button className="px-6 py-2 bg-indigo-700/50 text-white rounded-xl font-bold text-sm border border-white/20 hover:bg-indigo-700 transition-colors">View Schedule</button>
                    </div>
                </div>

                <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-xl font-bold">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checklist */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-emerald-500" /> Day 1 Checklist
                    </h3>
                    <div className="space-y-3">
                        {[
                            { task: 'IT Setup & Login Verification', status: 'done' },
                            { task: 'Welcome Meeting with Manager', status: 'done' },
                            { task: 'Team Introduction (Slack/Teams)', status: 'pending' },
                            { task: 'HR Orientation Session', status: 'pending' },
                            { task: 'Review Remote Work Policy', status: 'pending' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${item.status === 'done'
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-300 dark:border-slate-600 text-transparent'
                                    }`}>
                                    <CheckSquare className="w-3 h-3" />
                                </div>
                                <span className={`font-bold text-sm ${item.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{item.task}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Events */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg mb-2">Upcoming Sessions</h3>

                    {[
                        { title: 'HR Orientation', time: '10:00 AM', icon: Users, color: 'bg-blue-50 text-blue-600' },
                        { title: 'IT Security Walkthrough', time: '02:00 PM', icon: Video, color: 'bg-rose-50 text-rose-600' },
                        { title: 'Virtual Coffee Break', time: '04:30 PM', icon: Calendar, color: 'bg-amber-50 text-amber-600' },
                    ].map((event, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${event.color}`}>
                                <event.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold">{event.title}</h4>
                                <p className="text-xs text-slate-500">Today • {event.time}</p>
                            </div>
                            <button className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Join Link</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

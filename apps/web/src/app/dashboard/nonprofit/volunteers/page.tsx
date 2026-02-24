"use client";

import React from 'react';
import {
    HeartHandshake,
    Calendar,
    Award,
    Clock,
    UserPlus,
    Search
} from 'lucide-react';

export default function VolunteersPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HeartHandshake className="w-6 h-6 text-rose-500" />
                        Volunteer Management
                    </h1>
                    <p className="text-slate-500 text-sm">Organize volunteer corps, track hours, and impact metrics.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                    <UserPlus className="w-4 h-4" /> Recruit Volunteers
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
                {/* Filters */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4">Filters</h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input type="text" placeholder="Search by name..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-rose-500/50" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Skills</label>
                            <div className="space-y-2">
                                {['First Aid', 'Teaching', 'Logistics', 'Fundraising', 'Translation'].map(s => (
                                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" className="rounded text-rose-500 focus:ring-rose-500" /> {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Availability</label>
                            <div className="space-y-2">
                                {['Weekdays', 'Weekends', 'Remote', 'On-Site'].map(s => (
                                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" className="rounded text-rose-500 focus:ring-rose-500" /> {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volunteer List */}
                <div className="lg:col-span-3 space-y-4 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg text-indigo-600"><Clock className="w-6 h-6" /></div>
                            <div>
                                <div className="text-2xl font-bold">12,450</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Hours Donated</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-emerald-600"><UserPlus className="w-6 h-6" /></div>
                            <div>
                                <div className="text-2xl font-bold">850</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Active Volunteers</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-amber-600"><Award className="w-6 h-6" /></div>
                            <div>
                                <div className="text-2xl font-bold">24</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Gold Status</div>
                            </div>
                        </div>
                    </div>

                    {[
                        { name: 'Diana Prince', skills: ['First Aid', 'Translation'], hours: 320, status: 'Active', location: 'London' },
                        { name: 'Clark Kent', skills: ['Logistics', 'Heavy Lifting'], hours: 150, status: 'Active', location: 'Metropolis' },
                        { name: 'Bruce Wayne', skills: ['Fundraising', 'Strategy'], hours: 50, status: 'On Leave', location: 'Gotham' },
                        { name: 'Barry Allen', skills: ['Logistics', 'Rapid Response'], hours: 410, status: 'Active', location: 'Central City' },
                    ].map((v, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {v.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        {v.name}
                                        {v.hours > 300 && <Award className="w-4 h-4 text-amber-500" />}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                        {v.skills.map((s, j) => (
                                            <span key={j} className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 text-slate-500">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{v.hours} h</div>
                                    <div className="text-xs text-slate-400">Total Contribution</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${v.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-slate-100 text-slate-600'}
                                    `}>
                                        {v.status}
                                    </span>
                                    <button className="text-xs font-bold text-rose-500 hover:underline">View Profile</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


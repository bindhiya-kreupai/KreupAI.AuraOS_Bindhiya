"use client";

import React from 'react';
import {
    Heart,
    HandCoins,
    Users,
    MessageCircle,
    CalendarCheck,
    Phone
} from 'lucide-react';

export default function DonorPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HandCoins className="w-6 h-6 text-emerald-500" />
                        Donor Relations (HR)
                    </h1>
                    <p className="text-slate-500 text-sm">Assign staff to major donors, manage event staffing.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <CalendarCheck className="w-4 h-4" /> Schedule Gala Staff
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Major Donor Portfolios */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Relationship Manager Portfolios</h3>
                    {[
                        { manager: 'Sarah Jenkins', role: 'Senior Gift Officer', portfolio: '$4.2M', donors: 12, health: 'Excellent' },
                        { manager: 'Mike Ross', role: 'Corporate Partnerships', portfolio: '$12.5M', donors: 5, health: 'Good' },
                        { manager: 'Rachel Zane', role: 'Planned Giving', portfolio: '$2.1M', donors: 25, health: 'Needs Attention' },
                    ].map((p, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {p.manager.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{p.manager}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{p.role}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Users className="w-3 h-3" /> {p.donors} Managed Donors
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-emerald-600 font-mono">{p.portfolio}</div>
                                    <div className="text-xs text-slate-400">Total Value</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${p.health === 'Excellent' ? 'bg-emerald-100 text-emerald-600' :
                                            p.health === 'Good' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-rose-100 text-rose-600'}
                                    `}>
                                        {p.health}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">Reassign List</button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <h3 className="font-bold text-lg mt-8 mb-2">Upcoming Donor Events (Staffing)</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center opacity-90 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Annual Charity Gala</h4>
                                <div className="text-xs text-slate-500">Dec 24 • Grand Hotel Ballroom</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-rose-500">Staff Shortage</div>
                            <div className="text-xs text-slate-400">Needs 5 more ushers</div>
                        </div>
                    </div>
                </div>

                {/* Engagement Stats */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Touchpoints (This Month)</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                                <Phone className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                                <div className="text-xl font-bold">142</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">Calls Made</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                                <div className="text-xl font-bold">45</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">Meetings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


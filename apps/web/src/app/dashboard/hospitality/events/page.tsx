"use client";

import React from 'react';
import {
    Utensils,
    Calendar,
    Shirt,
    UserPlus,
    Clock,
    Users
} from 'lucide-react';

export default function EventsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-purple-500" />
                        Banquet & Event Staffing
                    </h1>
                    <p className="text-slate-500 text-sm">Managing casual roasters for weddings, conferences, and galas.</p>
                </div>
                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20">
                    <UserPlus className="w-4 h-4" /> Book Casuals
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Event Calendar List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Upcoming Events</h3>

                    {[
                        { title: 'Tech Giants Gala Dinner', date: 'Dec 12, 18:00', venue: 'Grand Ballroom', staff: '45/50 Required', status: 'Short Staffed' },
                        { title: 'Smith Wedding Reception', date: 'Dec 14, 16:00', venue: 'Garden Terrace', staff: '22/22 Full', status: 'Ready' },
                        { title: 'Medical Conference Lunch', date: 'Dec 15, 11:30', venue: 'Conference Hall A', staff: '15/15 Full', status: 'Ready' },
                    ].map((e, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center font-bold text-purple-600 text-center leading-none text-xs">
                                    DEC<br /><span className="text-lg">{e.date.split(',')[0].split(' ')[1]}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{e.title}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{e.venue}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {e.date.split(',')[1]}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{e.staff.split(' ')[0]}</div>
                                    <div className="text-xs text-slate-400">Staffing</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${e.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-rose-100 text-rose-600'}
                                    `}>
                                        {e.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">Manage Roster</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Uniform & Casual Pool */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Shirt className="w-5 h-5 text-indigo-500" /> Uniform Inventory
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-sm">Black Vests (M)</div>
                                    <div className="text-xs text-slate-400">Main Laundry</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-emerald-600">45 Avail</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-sm">Aprons (Logo)</div>
                                    <div className="text-xs text-slate-400">Storage B</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-amber-600">12 Low</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Casual Pool
                        </h3>
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">240</div>
                                <div className="text-xs text-indigo-700 dark:text-indigo-400">Registered Casuals</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-600">18</div>
                                <div className="text-xs text-emerald-700 dark:text-emerald-400">Available Now</div>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                            Send Shift Blast
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React from 'react';
import {
    Plane,
    Calendar,
    MapPin,
    Briefcase,
    CheckCircle2,
    Clock,
    PlusCircle,
    ArrowRight
} from 'lucide-react';

export default function TripRequestsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plane className="w-6 h-6 text-sky-500" />
                        Travel Requests
                    </h1>
                    <p className="text-slate-500 text-sm">Plan upcoming business trips, book flights, and request approvals.</p>
                </div>
                <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20">
                    <PlusCircle className="w-4 h-4" /> New Trip
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Active Trips */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">My Trips</h3>
                    {[
                        { dest: 'London, UK', purpose: 'Q4 Sales Conference', dates: 'Dec 10 - Dec 15', status: 'Approved', type: 'International' },
                        { dest: 'New York, USA', purpose: 'Client Workshop', dates: 'Jan 05 - Jan 08', status: 'Pending Approval', type: 'International' },
                        { dest: 'Dubai, UAE', purpose: 'Site Visit', dates: 'Jan 20 - Jan 22', status: 'Draft', type: 'Domestic' },
                    ].map((t, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all group">
                            {/* Icon / Status */}
                            <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-slate-100 dark:border-slate-800 pr-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 
                                    ${t.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : t.status === 'Draft' ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-sky-600'}
                                `}>
                                    <Plane className={`w-6 h-6 ${t.status === 'Approved' ? '' : 'animate-pulse'}`} />
                                </div>
                                <div className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 
                                    ${t.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : t.status === 'Draft' ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-sky-600'}
                                `}>
                                    {t.status}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        {t.dest}
                                        <span className="text-[10px] border border-slate-200 dark:border-slate-700 font-normal px-1.5 py-0.5 rounded text-slate-400 uppercase">{t.type}</span>
                                    </h3>
                                    <button className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {t.purpose}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.dates}</span>
                                </div>

                                {/* Timeline Preview */}
                                <div className="flex items-center gap-1 w-full">
                                    <div className={`h-1 flex-1 rounded-full ${t.status === 'Draft' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-emerald-500'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${t.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                    <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold uppercase">
                                    <span>Request</span>
                                    <span>Manager</span>
                                    <span>Booking</span>
                                    <span>Expense</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Travel Desk
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><Plane className="w-4 h-4" /></div>
                                <div>
                                    <div className="text-sm font-bold">Book Flights</div>
                                    <div className="text-[10px] text-slate-400">Via Corporate Portal</div>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600"><MapPin className="w-4 h-4" /></div>
                                <div>
                                    <div className="text-sm font-bold">Hotel Booking</div>
                                    <div className="text-[10px] text-slate-400">Partner Rates Available</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

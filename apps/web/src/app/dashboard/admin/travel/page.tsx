"use client";

import React, { useState } from 'react';
import {
    Plane,
    Hotel,
    Calendar,
    MapPin,
    Plus,
    Briefcase,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    FileText,
    ArrowRight,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const MY_TRIPS = [
    {
        id: 'TR-2024-001',
        destination: 'London, UK',
        dates: 'Dec 15 - Dec 20, 2024',
        purpose: 'Client Meeting',
        status: 'Approved',
        amount: '$2,450',
        image: '🇬🇧',
        type: 'International'
    },
    {
        id: 'TR-2024-002',
        destination: 'New York, USA',
        dates: 'Jan 10 - Jan 14, 2025',
        purpose: 'Conference',
        status: 'Pending',
        amount: '$1,800',
        image: '🇺🇸',
        type: 'International'
    },
    {
        id: 'TR-2024-003',
        destination: 'Mumbai, India',
        dates: 'Feb 05 - Feb 06, 2025',
        purpose: 'Internal Review',
        status: 'Draft',
        amount: '$350',
        image: '🇮🇳',
        type: 'Domestic'
    }
];

const POLICIES = [
    { category: 'Flights (Domestic)', limit: '$500', status: 'Good' },
    { category: 'Flights (Intl)', limit: '$3,000', status: 'Good' },
    { category: 'Hotel (Per Night)', limit: '$250', status: 'Warning' },
    { category: 'Daily Allowance', limit: '$100', status: 'Good' },
];

export default function TravelPage() {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Plane className="w-6 h-6 text-indigo-500" />
                        Travel Desk
                    </h1>
                    <p className="text-silver-mist text-sm">Manage business trips, bookings, and expenses.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> New Trip Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: My Trips */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 shrink-0">
                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="text-xs font-bold text-silver-mist uppercase mb-1">Total Spend (YTD)</div>
                            <div className="text-2xl font-black text-ink-black dark:text-pearl">$12,450</div>
                        </div>
                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="text-xs font-bold text-silver-mist uppercase mb-1">Upcoming Trips</div>
                            <div className="text-2xl font-black text-indigo-500">2</div>
                        </div>
                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="text-xs font-bold text-silver-mist uppercase mb-1">Days Traveled</div>
                            <div className="text-2xl font-black text-emerald-500">14</div>
                        </div>
                    </div>

                    {/* Trips List */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-20">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> My Trips
                        </h3>
                        {MY_TRIPS.map(trip => (
                            <div key={trip.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col sm:flex-row gap-5 items-center hover:shadow-lg transition-all group cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner shrink-0">
                                    {trip.image}
                                </div>
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row justify-between items-center mb-1">
                                        <h3 className="font-bold text-ink-black dark:text-pearl text-lg">{trip.destination}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide
                                            ${trip.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                                trip.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'}
                                        `}>
                                            {trip.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs text-silver-mist justify-center sm:justify-start">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.dates}</span>
                                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {trip.purpose}</span>
                                        <span className="font-mono font-bold text-slate-500">{trip.id}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-bold text-slate-400">Est. Cost</div>
                                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{trip.amount}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Policy & Quick Actions */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Policy Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" /> Travel Policy Limits
                        </h3>

                        <div className="space-y-4">
                            {POLICIES.map((pol, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300">{pol.category}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold">{pol.limit}</span>
                                        {pol.status === 'Warning' && <AlertCircle className="w-3 h-3 text-amber-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2 text-xs font-bold text-indigo-500 hover:text-indigo-600">
                            View Full Travel Policy
                        </button>
                    </div>

                    {/* Quick Tools */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                            <Globe className="w-6 h-6" />
                            <span className="text-xs font-bold">Visa Checker</span>
                        </button>
                        <button className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                            <DollarSign className="w-6 h-6" />
                            <span className="text-xs font-bold">Currency Rates</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">Trip Request</h2>
                            <p className="text-sm text-silver-mist mb-6">Plan your business travel. Approvals required.</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">From</label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input type="text" placeholder="Origin City" className="w-full pl-9 pr-4 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">To</label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input type="text" placeholder="Destination City" className="w-full pl-9 pr-4 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Start Date</label>
                                        <input type="date" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">End Date</label>
                                        <input type="date" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Purpose of Visit</label>
                                    <select className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                        <option>Client Meeting</option>
                                        <option>Conference / Seminar</option>
                                        <option>Internal Review</option>
                                        <option>Training</option>
                                        <option>Project Deployment</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Requirements</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 accent-indigo-500" defaultChecked /> Flight
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 accent-indigo-500" defaultChecked /> Hotel
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 accent-indigo-500" /> Car Rental
                                        </label>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                                        JD
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Approver: John Doe (Manager)</p>
                                        <p className="text-[10px] text-slate-500">Request will be forwarded automatically.</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Submit Request
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import {
    Car,
    MapPin,
    Clock,
    Calendar,
    Phone,
    ShieldAlert,
    Navigation,
    User,
    ChevronRight,
    Search,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const UPCOMING_RIDES = [
    {
        id: 1,
        type: 'Pickup',
        time: '08:30 AM',
        date: 'Today',
        driver: 'Rajesh Kumar',
        car: 'Toyota Innova',
        plate: 'KA-01-AB-1234',
        status: 'On the way',
        eta: '10 mins',
        contact: '+91 98765 43210'
    },
    {
        id: 2,
        type: 'Drop',
        time: '06:30 PM',
        date: 'Today',
        driver: 'ToBe Assigned',
        car: '-',
        plate: '-',
        status: 'Scheduled',
        eta: '-',
        contact: '-'
    },
    {
        id: 3,
        type: 'Pickup',
        time: '08:30 AM',
        date: 'Tomorrow',
        driver: 'Suresh R.',
        car: 'Maruti Ertiga',
        plate: 'KA-05-XY-9876',
        status: 'Scheduled',
        eta: '-',
        contact: '+91 91234 56789'
    }
];

export default function TransportPage() {
    const [activeTab, setActiveTab] = useState<'roster' | 'book'>('roster');
    const [sosActive, setSosActive] = useState(false);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Car className="w-6 h-6 text-indigo-500" />
                        Transport
                    </h1>
                    <p className="text-silver-mist text-sm">Manage your daily commute and ad-hoc travel requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSosActive(!sosActive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg 
                            ${sosActive
                                ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20'
                                : 'bg-white dark:bg-slate-800 text-rose-500 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/20'}
                        `}
                    >
                        <ShieldAlert className="w-4 h-4" /> {sosActive ? 'SOS ACTIVE' : 'SOS Emergency'}
                    </button>
                    <button
                        onClick={() => setActiveTab('book')}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Book Ride
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Active Ride & Roster */}
                <div className="lg:col-span-1 space-y-4 flex flex-col">
                    {/* Active Ride Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Navigation className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs font-bold opacity-80 uppercase tracking-wide">Next Ride</div>
                                    <div className="text-2xl font-bold">Office Pickup</div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold">
                                    {UPCOMING_RIDES[0].eta} away
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">RK</div>
                                    <div>
                                        <div className="font-bold">{UPCOMING_RIDES[0].driver}</div>
                                        <div className="text-xs opacity-70">Driver • 4.8 ★</div>
                                    </div>
                                    <button className="ml-auto p-2 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg transition-colors">
                                        <Phone className="w-4 h-4 text-emerald-300" />
                                    </button>
                                </div>

                                <div className="p-3 bg-white/10 rounded-xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70">Vehicle</span>
                                        <span className="font-bold">{UPCOMING_RIDES[0].car}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70">License Plate</span>
                                        <span className="font-bold font-mono bg-black/20 px-2 rounded">{UPCOMING_RIDES[0].plate}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-4 py-2 bg-white text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors">
                                Track Ride Live
                            </button>
                        </div>
                    </div>

                    {/* Roster List */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 overflow-hidden flex flex-col">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2 shrink-0">
                            <Calendar className="w-5 h-5 text-indigo-500" /> Your Roster
                        </h3>

                        <div className="overflow-y-auto space-y-4 pr-1">
                            {UPCOMING_RIDES.slice(1).map(ride => (
                                <div key={ride.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${ride.type === 'Pickup' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                                <Car className="w-3 h-3" />
                                            </div>
                                            <span className="font-bold text-sm text-ink-black dark:text-pearl">{ride.type}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{ride.date}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-silver-mist mb-3 pl-8">
                                        <Clock className="w-3 h-3" /> {ride.time}
                                    </div>

                                    <div className="flex items-center justify-between pl-8">
                                        <div className="text-xs">
                                            <span className="text-slate-400">Status: </span>
                                            <span className="font-bold text-slate-600 dark:text-slate-300">{ride.status}</span>
                                        </div>
                                        {ride.status === 'Scheduled' && (
                                            <button className="text-[10px] font-bold text-rose-500 hover:underline">Cancel</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Map & Booking Form */}
                <div className="lg:col-span-2 space-y-4 flex flex-col h-full">
                    <div className="bg-white dark:bg-stellar-blue p-0 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex-1 relative flex flex-col">
                        {/* Tabs */}
                        <div className="flex border-b border-cloud dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('roster')}
                                className={`flex-1 py-4 text-sm font-bold transition-colors relative
                                    ${activeTab === 'roster' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}
                                `}
                            >
                                Live Tracking
                                {activeTab === 'roster' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('book')}
                                className={`flex-1 py-4 text-sm font-bold transition-colors relative
                                    ${activeTab === 'book' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}
                                `}
                            >
                                Book Ad-hoc Ride
                                {activeTab === 'book' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></div>}
                            </button>
                        </div>

                        <div className="flex-1 relative bg-slate-100 dark:bg-slate-900">
                            {/* Content based on Tab */}
                            {activeTab === 'roster' ? (
                                <div className="absolute inset-0">
                                    {/* Mock Map Background */}
                                    <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-10 pointer-events-none"></div>

                                    {/* Mock Cab Pin */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                        <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-lg mb-2 text-xs font-bold border border-cloud">
                                            {UPCOMING_RIDES[0].plate} • {UPCOMING_RIDES[0].eta} away
                                        </div>
                                        <div className="relative">
                                            <div className="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-500/20 rounded-full animate-ping"></div>
                                        </div>
                                    </div>

                                    {/* Route Line (Mock) */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <path d="M 400 300 Q 500 400 600 350" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="5,5" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="p-8 max-w-lg mx-auto">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Request Type</label>
                                            <div className="flex gap-3">
                                                <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700 rounded-xl flex-1 cursor-pointer hover:border-indigo-500 transition-colors">
                                                    <input type="radio" name="type" className="accent-indigo-500" defaultChecked />
                                                    <span className="text-sm font-bold">One Way</span>
                                                </label>
                                                <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700 rounded-xl flex-1 cursor-pointer hover:border-indigo-500 transition-colors">
                                                    <input type="radio" name="type" className="accent-indigo-500" />
                                                    <span className="text-sm font-bold">Round Trip</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Pickup Date</label>
                                                <input type="date" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Time</label>
                                                <input type="time" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Pickup Location</label>
                                            <div className="relative">
                                                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input type="text" placeholder="e.g., Home Address" className="w-full pl-9 pr-4 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Drop Location</label>
                                            <div className="relative">
                                                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input type="text" placeholder="e.g., Office Campus" className="w-full pl-9 pr-4 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Purpose</label>
                                            <textarea rows={3} placeholder="Reason for travel..." className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                                        </div>

                                        <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4">
                                            Request Cab <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


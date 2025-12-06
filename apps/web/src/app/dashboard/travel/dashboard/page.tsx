"use client";

import React from 'react';
import {
    Plane,
    MapPin,
    Calendar,
    CreditCard,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Plus,
    TrendingUp,
    FileText,
    Globe
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// --- MOCK DATA ---

const ACTIVE_TRIPS = [
    {
        id: '1',
        traveler: 'Sarah Anderson',
        role: 'Product Lead',
        destination: 'London, UK',
        dates: 'Aug 12 - Aug 18',
        purpose: 'Client Workshop',
        avatar: 'https://i.pravatar.cc/150?u=EMP001',
        status: 'In Progress',
        coords: { top: '30%', left: '48%' } // Mock coords for map
    },
    {
        id: '2',
        traveler: 'Michael Chen',
        role: 'Snr Developer',
        destination: 'Tokyo, Japan',
        dates: 'Aug 15 - Aug 20',
        purpose: 'Tech Conference',
        avatar: 'https://i.pravatar.cc/150?u=EMP002',
        status: 'In Progress',
        coords: { top: '35%', left: '85%' }
    },
    {
        id: '3',
        traveler: 'Elena Rodriguez',
        role: 'Sales Director',
        destination: 'New York, USA',
        dates: 'Aug 20 - Aug 25',
        purpose: 'Quarterly Review',
        avatar: 'https://i.pravatar.cc/150?u=EMP007',
        status: 'Upcoming',
        coords: { top: '32%', left: '25%' }
    }
];

const APPROVAL_QUEUE = [
    { id: '1', request: 'TR-2024-89', traveler: 'David Kim', destination: 'Singapore', amount: 2400, dates: 'Sep 01 - Sep 05' },
    { id: '2', request: 'TR-2024-90', traveler: 'Priya Sharma', destination: 'Berlin', amount: 1800, dates: 'Sep 10 - Sep 14' },
];

const EXPENSE_DATA = [
    { month: 'Mar', Sales: 4000, Eng: 2400, Exec: 2400 },
    { month: 'Apr', Sales: 3000, Eng: 1398, Exec: 2210 },
    { month: 'May', Sales: 2000, Eng: 9800, Exec: 2290 },
    { month: 'Jun', Sales: 2780, Eng: 3908, Exec: 2000 },
    { month: 'Jul', Sales: 1890, Eng: 4800, Exec: 2181 },
    { month: 'Aug', Sales: 2390, Eng: 3800, Exec: 2500 },
];

export default function TravelDashboardPage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Plane className="w-6 h-6 text-celestial-indigo" />
                        Travel Command Center
                    </h1>
                    <p className="text-silver-mist text-sm">Monitor global travel activity and manage expenses.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Travel Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Map Visualization */}
                <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl overflow-hidden shadow-lg relative h-96 group">
                    {/* Background Map Placeholder */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat grayscale" />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />

                    <div className="relative p-6 h-full flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" /> Live View</h3>
                                <p className="text-xs text-slate-400">3 Employees currently traveling</p>
                            </div>
                            <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>

                        {/* Map Dots */}
                        <div className="absolute inset-0 pointer-events-none">
                            {ACTIVE_TRIPS.map(trip => (
                                <div key={trip.id} className="absolute w-3 h-3 group/pin" style={{ top: trip.coords.top, left: trip.coords.left }}>
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white text-slate-900 p-3 rounded-lg shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <img src={trip.avatar} className="w-6 h-6 rounded-full" />
                                            <span className="font-bold text-xs">{trip.traveler}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.destination}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats / Approvals */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-amber-500" />
                            Pending Approvals
                        </h3>
                        <div className="space-y-4">
                            {APPROVAL_QUEUE.map(req => (
                                <div key={req.id} className="p-3 bg-slate-50 dark:bg-deep-cosmos/50 rounded-xl border border-cloud dark:border-nebula-purple/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-sm text-ink-black dark:text-pearl">{req.traveler}</div>
                                            <div className="text-xs text-silver-mist">{req.request}</div>
                                        </div>
                                        <span className="font-bold text-celestial-indigo text-sm">${req.amount}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                                        <Calendar className="w-3 h-3" /> {req.dates} • {req.destination}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded hover:bg-emerald-600 transition-colors">Approve</button>
                                        <button className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-colors">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Trends */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-80 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Expense Trends
                        </h3>
                        <select className="text-xs bg-slate-50 dark:bg-deep-cosmos border-none rounded-md px-2 py-1">
                            <option>Last 6 Months</option>
                            <option>YTD</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={EXPENSE_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="Sales" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Eng" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Exec" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Itineraries */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-80 overflow-y-auto">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-celestial-indigo" />
                        Active & Upcoming Trips
                    </h3>
                    <div className="space-y-4">
                        {ACTIVE_TRIPS.map(trip => (
                            <div key={trip.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors rounded-xl cursor-pointer group">
                                <div className="relative">
                                    <img src={trip.avatar} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${trip.status === 'In Progress' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                        <Plane className="w-2 h-2 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-ink-black dark:text-pearl text-sm">{trip.destination}</span>
                                        <span className="text-xs font-medium text-celestial-indigo bg-celestial-indigo/10 px-2 py-0.5 rounded-full">{trip.status}</span>
                                    </div>
                                    <div className="text-xs text-silver-mist mt-0.5">
                                        {trip.traveler} • {trip.dates}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { ChevronRight } from 'lucide-react';

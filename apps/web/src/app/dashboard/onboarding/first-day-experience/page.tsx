"use client";

import React from 'react';
import {
    Gift,
    MapPin,
    Wifi,
    Coffee,
    Users,
    Clock,
    CalendarCheck,
    ChevronRight,
    Monitor,
    Key
} from 'lucide-react';

export default function FirstDayPage() {
    const schedule = [
        { time: '09:30 AM', title: 'Welcome Breakfast', location: 'Cafeteria', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-100' },
        { time: '10:30 AM', title: 'IT Setup & Access', location: 'IT Desk (Floor 2)', icon: Monitor, color: 'text-indigo-500', bg: 'bg-indigo-100' },
        { time: '11:45 AM', title: 'HR Induction', location: 'Conf Room A', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-100' },
        { time: '01:00 PM', title: 'Team Lunch', location: 'The Bistro', icon: Gift, color: 'text-rose-500', bg: 'bg-rose-100' },
        { time: '02:30 PM', title: 'Office Tour', location: 'Lobby', icon: MapPin, color: 'text-purple-500', bg: 'bg-purple-100' },
    ];

    const credentials = [
        { label: 'Wi-Fi SSID', value: 'Aura_Secure' },
        { label: 'Wi-Fi Password', value: 'WelcomeToAura24!' },
        { label: 'Email', value: 'sarah.j@aura.inc' },
        { label: 'Temp Password', value: 'ChangeMe#123' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        First Day Experience
                    </h1>
                    <p className="text-slate-500 text-sm">Everything you need for a smooth Day 1 at Aura.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schedule */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-indigo-500" />
                            Your Schedule
                        </h3>
                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />

                            {schedule.map((slot, i) => (
                                <div key={i} className="relative pl-16 flex items-start gap-4 group">
                                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-xl flex items-center justify-center z-10 ${slot.bg} dark:bg-opacity-20`}>
                                        <slot.icon className={`w-5 h-5 ${slot.color}`} />
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{slot.title}</h4>
                                            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">{slot.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin className="w-3 h-3" /> {slot.location}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Info */}
                <div className="space-y-6">
                    {/* Welcome Kit Digital */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
                        <Gift className="w-12 h-12 mx-auto mb-4 text-white opacity-90" />
                        <h3 className="font-bold text-lg mb-2">Digital Welcome Kit</h3>
                        <p className="text-sm opacity-80 mb-6 px-4">Access your employee handbook, merch store codes, and benefits guide.</p>
                        <button className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                            Open Kit <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* IT Access Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-emerald-500" /> Quick Access
                        </h3>
                        <div className="space-y-3">
                            {credentials.map((cred, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <span className="text-slate-500">{cred.label}</span>
                                    <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                        {cred.value}
                                    </code>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-start gap-2 text-xs text-slate-500">
                                <Key className="w-3 h-3 mt-0.5" />
                                Please change your temporary password upon first login to the internal portal.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

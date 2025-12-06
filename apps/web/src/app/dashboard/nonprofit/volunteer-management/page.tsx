"use client";

import React, { useState } from 'react';
import {
    HeartHandshake,
    Users,
    MapPin,
    Award
} from 'lucide-react';

export default function VolunteerManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HeartHandshake className="w-6 h-6 text-indigo-500" />
                        Volunteer Management
                    </h1>
                    <p className="text-slate-500 text-sm">Recruit, onboard, and track volunteer engagement.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                    Add Volunteer
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Volunteers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Skillset</th>
                                    <th className="px-6 py-4">Hours (YTD)</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { name: 'Alice Walker', role: 'Event Coord', skills: 'Logistics, Planning', hours: 142, status: 'Active' },
                                    { name: 'Bob Smith', role: 'Driver', skills: 'Heavy License', hours: 85, status: 'Active' },
                                    { name: 'Charlie Green', role: 'Mentor', skills: 'Teaching', hours: 12, status: 'Onboarding' },
                                    { name: 'Diana Prince', role: 'Fundraiser', skills: 'Events', hours: 210, status: 'Active' },
                                ].map((vol, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold">{vol.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{vol.role}</td>
                                        <td className="px-6 py-4">{vol.skills}</td>
                                        <td className="px-6 py-4 font-bold text-indigo-600">{vol.hours}h</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${vol.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                }`}>{vol.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Users className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Volunteer Force</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1">1,248</h3>
                        <div className="flex items-center gap-2 text-indigo-100 text-sm mb-4">
                            <span className="bg-white/20 px-1.5 rounded text-xs">+12%</span> vs last month
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                            <div>
                                <div className="opacity-70 text-xs uppercase">Active</div>
                                850
                            </div>
                            <div>
                                <div className="opacity-70 text-xs uppercase">Reserve</div>
                                398
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Top Contributors</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Diana Prince', hours: 210, badge: 'Gold' },
                                { name: 'Clark Kent', hours: 195, badge: 'Silver' },
                                { name: 'Bruce Wayne', hours: 180, badge: 'Silver' },
                            ].map((person, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-bold text-indigo-600">
                                            {i + 1}
                                        </div>
                                        <div className="font-bold text-sm">{person.name}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500">{person.hours}h</span>
                                        <Award className={`w-4 h-4 ${person.badge === 'Gold' ? 'text-amber-400' : 'text-slate-400'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

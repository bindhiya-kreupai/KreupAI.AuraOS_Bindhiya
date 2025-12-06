"use client";

import React from 'react';
import {
    Search,
    Mail,
    Phone,
    MessageCircle,
    Copy,
    Share2
} from 'lucide-react';

export default function TeamDirectoryPage() {
    const team = [
        { name: 'Sarah Connor', role: 'Head of Product', email: 'sarah.c@aura.os', phone: '+1 555-0101', status: 'Online', img: 'https://i.pravatar.cc/150?u=sarah' },
        { name: 'Kyle Reese', role: 'Senior Developer', email: 'kyle.r@aura.os', phone: '+1 555-0102', status: 'Offline', img: 'https://i.pravatar.cc/150?u=kyle' },
        { name: 'John Connor', role: 'Team Lead', email: 'john.c@aura.os', phone: '+1 555-0103', status: 'In Meeting', img: 'https://i.pravatar.cc/150?u=john' },
        { name: 'T-800', role: 'System Admin', email: 'admin@aura.os', phone: '+1 555-0000', status: 'Online', img: 'https://i.pravatar.cc/150?u=robot' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-indigo-500" />
                        Team Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Find and connect with your colleagues.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 flex items-center gap-2 w-full md:w-auto">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by name, role..." className="bg-transparent outline-none text-sm py-2 w-full md:w-64" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center hover:shadow-xl transition-all relative group">
                        <div className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {member.status}
                        </div>

                        <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white dark:border-slate-800 shadow-sm relative">
                            <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                            {member.status === 'Online' && (
                                <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                            )}
                        </div>

                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <div className="text-sm text-indigo-600 font-medium mb-4">{member.role}</div>

                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm">
                                <div className="flex items-center gap-2 text-slate-500 overflow-hidden">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                                <button className="text-slate-400 hover:text-indigo-600"><Copy className="w-3 h-3" /></button>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>{member.phone}</span>
                                </div>
                                <button className="text-slate-400 hover:text-indigo-600"><Copy className="w-3 h-3" /></button>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2 w-full">
                            <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Chat
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

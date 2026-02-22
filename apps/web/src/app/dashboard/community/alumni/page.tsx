"use client";

import React from 'react';
import {
    Users,
    Search,
    Linkedin,
    Mail,
    MapPin,
    Briefcase,
    MessageCircle
} from 'lucide-react';

export default function AlumniDirectoryPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Alumni Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Connect with former colleagues and grow your professional network.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search alumni..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Alumni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 h-full min-h-0 overflow-y-auto pb-20">
                {[
                    { name: 'Michael Scott', role: 'Regional Manager', company: 'Self-Employed', location: 'Scranton, PA', tenure: '2005-2011', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
                    { name: 'Pam Beesly', role: 'Art Director', company: 'Pratt Institute', location: 'New York, NY', tenure: '2005-2013', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pam' },
                    { name: 'Jim Halpert', role: 'VP of Sales', company: 'Athlead', location: 'Austin, TX', tenure: '2005-2013', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jim' },
                    { name: 'Dwight Schrute', role: 'Owner', company: 'Schrute Farms', location: 'Scranton, PA', tenure: '2005-2013', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dwight' },
                    { name: 'Oscar Martinez', role: 'Senator', company: 'Govt', location: 'Harrisburg, PA', tenure: '2005-2013', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar' },
                ].map((alum, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>

                        <img src={alum.img} alt={alum.name} className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 border-4 border-white dark:border-slate-900 z-10" />

                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{alum.name}</h3>
                        <div className="text-sm font-bold text-indigo-600 mb-1">{alum.role}</div>
                        <div className="text-xs text-slate-500 mb-4">at {alum.company}</div>

                        <div className="w-full space-y-2 mb-6">
                            <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                                <MapPin className="w-3 h-3" /> {alum.location}
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-mono">
                                <Briefcase className="w-3 h-3" /> AuraOS: {alum.tenure}
                            </div>
                        </div>

                        <div className="flex gap-2 w-full mt-auto">
                            <button className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all">
                                Connect
                            </button>
                            <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <Linkedin className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


"use client";

import React from 'react';
import {
    Briefcase,
    FileText,
    Monitor,
    DollarSign,
    Plane,
    HeartPulse,
    ChevronRight,
    Search
} from 'lucide-react';

export default function ServiceCatalogPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Service Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">Browse and request HR services.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'HR Administration', icon: FileText, desc: 'Employment letters, address changes, personal data updates.', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { title: 'IT & Equipment', icon: Monitor, desc: 'Laptop requests, software licenses, peripheral replacements.', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                    { title: 'Payroll & Finance', icon: DollarSign, desc: 'Salary advances, tax declaration updates, expense claims.', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { title: 'Travel & Relocation', icon: Plane, desc: 'Flight bookings, visa assistance, hotel accommodation.', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { title: 'Benefits & Wellness', icon: HeartPulse, desc: 'Insurance enrollment, gym membership, counseling sessions.', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                ].map((cat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                            <cat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                        <p className="text-sm text-slate-500 mb-4">{cat.desc}</p>
                        <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all">
                            Browse Services <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

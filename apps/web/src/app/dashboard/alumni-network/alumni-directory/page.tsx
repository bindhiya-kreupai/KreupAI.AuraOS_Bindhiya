"use client";

import React, { useState } from 'react';
import {
    Users,
    Search,
    MapPin,
    Briefcase,
    Linkedin,
    Mail
} from 'lucide-react';

export default function AlumniDirectoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Alumni Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Find and connect with former colleagues.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search alumni..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                    { name: 'Alice Chen', role: 'Former Sr. Engineer', company: 'Tech Corp', location: 'San Francisco', years: '2018-2022' },
                    { name: 'Bob Wilson', role: 'Former Mktg Director', company: 'AdGlobal', location: 'New York', years: '2015-2020' },
                    { name: 'Charlie Davis', role: 'Former Product Mgr', company: 'StartUp Inc', location: 'London', years: '2019-2023' },
                    { name: 'Diana Prince', role: 'Former HR BP', company: 'PeopleFirst', location: 'Singapore', years: '2016-2021' },
                    { name: 'Evan Wright', role: 'Former Sales Lead', company: 'SalesForce', location: 'Austin', years: '2020-2024' },
                ].map((alum, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center text-2xl font-bold text-slate-400">
                            {alum.name[0]}
                        </div>
                        <h3 className="font-bold text-lg mb-1">{alum.name}</h3>
                        <p className="text-xs text-indigo-500 font-bold mb-3">{alum.years}</p>

                        <div className="space-y-2 w-full mb-6">
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span className="truncate max-w-[150px]">{alum.role} at {alum.company}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{alum.location}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                <Linkedin className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                <Mail className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

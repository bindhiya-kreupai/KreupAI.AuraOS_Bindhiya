"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import {
    Users,
    Search,
    Filter,
    MapPin,
    Briefcase,
    Mail
} from 'lucide-react';

export default function TalentPoolPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTalentPool();
    }, []);

    const fetchTalentPool = async () => {
        try {
            const data = await CandidateApplicationService.getApplications();
            setCandidates(data);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Talent Pool
                    </h1>
                    <p className="text-slate-500 text-sm">Database of potential candidates for future opportunities.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    + Add Candidate
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search by name, skills, or location..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 font-bold text-sm flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {/* Candidate List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {[
                        { name: 'David Kim', title: 'Senior UX Designer', loc: 'San Francisco', skills: ['Figma', 'Prototyping', 'User Research'], status: 'Available' },
                        { name: 'Elena Rodriguez', title: 'Marketing Specialist', loc: 'Remote', skills: ['SEO', 'Content Strategy', 'Analytics'], status: 'Considering' },
                        { name: 'Marcus Johnson', title: 'DevOps Engineer', loc: 'London', skills: ['AWS', 'Kubernetes', 'Terraform'], status: 'Do Not Contact' },
                        { name: 'Priya Patel', title: 'Product Manager', loc: 'New York', skills: ['Agile', 'Roadmapping', 'SQL'], status: 'Available' },
                        { name: 'Tom Baker', title: 'Sales Representative', loc: 'Chicago', skills: ['CRM', 'Lead Gen', 'Communication'], status: 'Hired' },
                        { name: 'Lisa Chen', title: 'Data Scientist', loc: 'Boston', skills: ['Python', 'Machine Learning', 'R'], status: 'Available' },
                    ].map((person, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-500 text-lg">
                                    {person.name.charAt(0)}
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${person.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        person.status === 'Do Not Contact' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                    {person.status}
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1">{person.name}</h3>
                            <div className="text-sm text-indigo-600 font-medium mb-3">{person.title}</div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                <MapPin className="w-3 h-3" /> {person.loc}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {person.skills.map((skill, j) => (
                                    <span key={j} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1">
                                    <Mail className="w-3 h-3" /> Email
                                </button>
                                <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

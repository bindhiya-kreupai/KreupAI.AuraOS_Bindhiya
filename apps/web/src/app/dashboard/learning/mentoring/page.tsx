"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    MessageCircle,
    Calendar,
    UserPlus
} from 'lucide-react';
import { MentoringService } from '../services';

export default function MentoringPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await MentoringService.getMentoringPrograms();
                setData(result);
            } catch {
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Mentorship Program
                    </h1>
                    <p className="text-slate-500 text-sm">Connect mentors and mentees for career growth.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Find a Mentor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Mentorships */}
                {[{
                    mentor: 'Sarah Connor', position: 'VP of Engineering', mentee: 'You', status: 'Active', next: 'Oct 30, 2:00 PM'
                }].map((rel, i) => (
                    <div key={i} className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="font-bold text-lg mb-1">{rel.mentor}</h3>
                        <p className="text-indigo-200 text-sm mb-6">{rel.position}</p>

                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4">
                            <div className="text-xs font-bold uppercase text-indigo-200 mb-1">Next Session</div>
                            <div className="flex items-center gap-2 font-bold">
                                <Calendar className="w-4 h-4" /> {rel.next}
                            </div>
                        </div>

                        <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50">
                            Message Mentor
                        </button>
                    </div>
                ))}

                {/* Recommended Mentors */}
                {[
                    { name: 'Dr. Alan Grant', position: 'Chief Scientist', expertise: ['Research', 'Data Science', 'Leadership'] },
                    { name: 'Ellie Sattler', position: 'Head of Product', expertise: ['Product Strategy', 'UX', 'Agile'] },
                ].map((mentor, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                            <div>
                                <h4 className="font-bold text-lg">{mentor.name}</h4>
                                <p className="text-sm text-slate-500">{mentor.position}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {mentor.expertise.map((exp, k) => (
                                <span key={k} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">{exp}</span>
                            ))}
                        </div>
                        <button className="w-full py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/10">
                            Request Mentorship
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

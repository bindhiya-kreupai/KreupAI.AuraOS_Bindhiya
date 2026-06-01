"use client";

import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Users,
    MessageSquare,
    Calendar,
    Star,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { MentorshipService } from '../services';

export default function MentorshipProgramPage() {
    const [activeTab, setActiveTab] = useState('find');
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await MentorshipService.getAllPrograms();
                setPrograms(data as any[]);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Mock Mentors
    const mentors = [
        {
            name: 'Sarah Connor',
            role: 'VP of Engineering',
            expertise: ['Leadership', 'System Design', 'Public Speaking'],
            availability: '2 slots open',
            rating: 4.9,
            image: 'https://i.pravatar.cc/150?u=sarah'
        },
        {
            name: 'James Bond',
            role: 'Head of Security',
            expertise: ['Risk Management', 'Conflict Resolution', 'Strategy'],
            availability: 'Fully Booked',
            rating: 4.8,
            image: 'https://i.pravatar.cc/150?u=james'
        },
        {
            name: 'Elena Fisher',
            role: 'Product Director',
            expertise: ['Product Management', 'UX Research', 'Agile'],
            availability: '1 slot open',
            rating: 5.0,
            image: 'https://i.pravatar.cc/150?u=elena'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-indigo-500" />
                        Mentorship Program
                    </h1>
                    <p className="text-slate-500 text-sm">Connect with career mentors and mentees across the organization.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('find')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'find' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Find a Mentor
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        My Mentorships
                    </button>
                </div>
            </div>

            {activeTab === 'find' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mentors.map((mentor, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all group flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">{mentor.name}</h3>
                                    <div className="text-xs text-slate-500">{mentor.role}</div>
                                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="font-bold">{mentor.rating}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {mentor.expertise.map((skill, j) => (
                                    <span key={j} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded text-xs font-bold">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className={`text-xs font-bold ${mentor.availability.includes('open') ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {mentor.availability}
                                </span>
                                <button
                                    disabled={!mentor.availability.includes('open')}
                                    className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                >
                                    Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="font-bold text-xl mb-2">Active Mentorship</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">You are current mentored by <span className="font-bold text-slate-900 dark:text-white">Sarah Connor</span>. Your next session is scheduled for Tuesday at 2:00 PM.</p>
                    <div className="flex justify-center gap-3">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Message
                        </button>
                        <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Reschedule
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


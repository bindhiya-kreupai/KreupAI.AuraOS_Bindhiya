'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Heart, Calendar, Users, ArrowRight, Play, Star, Loader2 } from 'lucide-react';
import { HealthProgramService } from '../services';

const PROGRAMS = [
    {
        id: 1,
        title: 'Couch to 5K',
        category: 'Fitness',
        duration: '8 Weeks',
        participants: 128,
        rating: 4.8,
        image: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600',
        description: 'A beginner-friendly running program to get you race-ready.'
    },
    {
        id: 2,
        title: 'Mindfulness Masterclass',
        category: 'Mental',
        duration: '4 Weeks',
        participants: 340,
        rating: 4.9,
        image: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
        description: 'Guided meditation and stress reduction techniques.'
    },
    {
        id: 3,
        title: 'Nutrition 101',
        category: 'Nutrition',
        duration: '6 Weeks',
        participants: 215,
        rating: 4.6,
        image: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
        description: 'Learn the basics of balanced eating and meal prepping.'
    },
    {
        id: 4,
        title: 'Sleep Hygiene',
        category: 'Wellness',
        duration: '2 Weeks',
        participants: 89,
        rating: 4.7,
        image: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
        description: 'Optimize your sleep patterns for better productivity.'
    },
];

export default function HealthProgramsPage() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await HealthProgramService.getPrograms();
                setPrograms(Array.isArray(data) ? data : []);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-500" />
                        Health Programs
                    </h1>
                    <p className="text-slate-500 text-sm">Curated programs to help you achieve your health goals.</p>
                </div>
            </div>

            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-lg">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">New Program</span>
                    <h2 className="text-3xl font-bold mb-2">Holistic Heart Health</h2>
                    <p className="text-emerald-50 opacity-90 mb-6">Join our comprehensive 12-week program designed to improve cardiovascular health through diet, exercise, and stress management.</p>
                    <button className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                        Enroll Now
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                    <Heart className="w-64 h-64" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PROGRAMS.map(program => (
                    <div key={program.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${program.image}`}>
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">
                                {program.category}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-500 transition-colors">{program.title}</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">{program.description}</p>

                        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> {program.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" /> {program.participants}
                                </span>
                            </div>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-4 h-4 fill-current" /> {program.rating}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


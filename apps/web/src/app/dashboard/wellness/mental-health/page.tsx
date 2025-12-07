'use client';

import React from 'react';
import { Brain, Calendar, MessageSquare, Phone, Play, Music, Video } from 'lucide-react';

const RESOURCES = [
    { id: 1, title: 'Guided Meditation', type: 'Audio', duration: '10 min', category: 'Stress', icon: Music, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 2, title: 'Anxiety Workshop', type: 'Video', duration: '45 min', category: 'Education', icon: Video, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    { id: 3, title: 'Sleep Stories', type: 'Audio', duration: '20 min', category: 'Sleep', icon: Music, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
];

const COUNSELORS = [
    { id: 1, name: 'Dr. Sarah Smith', specialization: 'Clinical Psychologist', available: 'Today, 2:00 PM', image: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=f43f5e&color=fff' },
    { id: 2, name: 'James Wilson', specialization: 'Licensed Therapist', available: 'Tomorrow, 10:00 AM', image: 'https://ui-avatars.com/api/?name=James+Wilson&background=3b82f6&color=fff' },
];

export default function MentalHealthPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="w-6 h-6 text-purple-500" />
                        Mental Health & Wellbeing
                    </h1>
                    <p className="text-slate-500 text-sm">Confidential support and resources for your mind.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                        <Phone className="w-4 h-4" /> 24/7 Helpline
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                        <Calendar className="w-4 h-4" /> Book Session
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Self-care Resources */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="font-bold text-lg mb-4">Recommended for You</h2>
                        <div className="space-y-4">
                            {RESOURCES.map(resource => (
                                <div key={resource.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${resource.color}`}>
                                        <resource.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold group-hover:text-indigo-500 transition-colors">{resource.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span>{resource.category}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span>{resource.type} • {resource.duration}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                                        <Play className="w-4 h-4 fill-current" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Counselors */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            Talk to Someone
                        </h3>
                        <div className="space-y-4">
                            {COUNSELORS.map(counselor => (
                                <div key={counselor.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={counselor.image} alt={counselor.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="font-bold text-sm">{counselor.name}</div>
                                            <div className="text-xs text-slate-500">{counselor.specialization}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                            Avaialble {counselor.available}
                                        </span>
                                        <button className="text-indigo-600 font-bold hover:underline">Book</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-indigo-600 font-medium">View All Counselors</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

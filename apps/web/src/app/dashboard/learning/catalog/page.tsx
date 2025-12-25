"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    PlayCircle,
    Star,
    Clock,
    Search,
    Filter,
    Award
} from 'lucide-react';
import { CourseService } from '../services';

export default function CourseCatalogPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data as fallback
    const mockCourses = [
        { title: 'Advanced React Patterns', author: 'Frontend Mastery', time: '4h 30m', rating: 4.8, students: '1.2k', img: 'bg-cyan-500', type: 'Technical' },
        { title: 'Effective Leadership', author: 'HR Academy', time: '2h 15m', rating: 4.5, students: '850', img: 'bg-indigo-500', type: 'Soft Skills' },
        { title: 'Fire Safety 101', author: 'Compliance Team', time: '45m', rating: 4.2, students: '3.5k', img: 'bg-rose-500', type: 'Compliance' },
        { title: 'Data Analysis with SQL', author: 'Data Camp', time: '6h 00m', rating: 4.9, students: '2.1k', img: 'bg-emerald-500', type: 'Technical' },
        { title: 'Communication Skills', author: 'HR Academy', time: '1h 30m', rating: 4.6, students: '1.5k', img: 'bg-purple-500', type: 'Soft Skills' },
        { title: 'Cyber Security Basics', author: 'IT Security', time: '1h 00m', rating: 4.7, students: '4.2k', img: 'bg-slate-500', type: 'Compliance' },
        { title: 'Agile Methodology', author: 'Project Mgmt', time: '3h 15m', rating: 4.4, students: '900', img: 'bg-amber-500', type: 'Process' },
        { title: 'Sales Negotiation', author: 'Sales Enablement', time: '2h 45m', rating: 4.8, students: '600', img: 'bg-orange-500', type: 'Sales' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result.length > 0 ? result : mockCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setData(mockCourses);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const displayData = data.length > 0 ? data : mockCourses;

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-sky-500" />
                        Learning & Development
                    </h1>
                    <p className="text-slate-500 text-sm">Browse courses, enroll in training, and upskill yourself.</p>
                </div>
                <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-xl text-sm font-bold border border-sky-100 dark:border-sky-800/30">
                    <Award className="w-4 h-4" /> My Credits: 450
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 shrink-0">
                <div className="flex-1 bg-white dark:bg-slate-900 p-2 pl-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search for Python, Leadership, Safety..." className="bg-transparent outline-none flex-1 text-sm font-bold" />
                </div>
                <button className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {/* Content Grid */}
            <div className="overflow-y-auto pb-20">
                <h3 className="font-bold text-lg mb-4">Recommended for You</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayData.map((c, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col h-full">
                            <div className={`h-32 ${c.img} relative`}>
                                <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                    {c.type}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 line-clamp-1">{c.title}</h3>
                                <p className="text-xs text-slate-500 mb-3">{c.author}</p>

                                <div className="mt-auto flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {c.time}
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-3 h-3 fill-current" /> {c.rating}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

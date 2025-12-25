"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Filter,
    Star,
    Clock,
    PlayCircle
} from 'lucide-react';
import { CourseService } from '../services';

export default function CourseCatalogPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data as fallback
    const mockCourses = [
        { title: 'Intro to React Native', category: 'Technical', rating: 4.8, students: 120, duration: '4h 30m', author: 'Frontend Team', image: 'bg-indigo-100' },
        { title: 'Effective Leadership', category: 'Soft Skills', rating: 4.5, students: 85, duration: '2h', author: 'L&D Dept', image: 'bg-emerald-100' },
        { title: 'Cybersecurity Basics', category: 'Compliance', rating: 4.9, students: 300, duration: '1h', author: 'IT Security', image: 'bg-rose-100' },
        { title: 'Agile Methodologies', category: 'Process', rating: 4.6, students: 150, duration: '3h 15m', author: 'Project Mgmt', image: 'bg-amber-100' },
        { title: 'Advanced Excel', category: 'Technical', rating: 4.7, students: 210, duration: '5h', author: 'Finance', image: 'bg-cyan-100' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result.length > 0 ? result : mockCourses);
            } catch (error) {
            console.error('Error:', error);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Course Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">Browse and enroll in training courses.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-sm font-bold">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData.map((course, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                        <div className={`h-40 ${course.image} flex items-center justify-center`}>
                            <PlayCircle className="w-12 h-12 text-black/20 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                    {course.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" /> {course.rating}
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">by {course.author}</p>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {course.duration}
                                </div>
                                <div>{course.students} Enrolled</div>
                            </div>

                            <button className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

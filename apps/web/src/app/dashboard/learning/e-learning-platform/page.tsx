"use client";

import React, { useState, useEffect } from 'react';
import {
    MonitorPlay,
    Loader2
} from 'lucide-react';
import { CourseService } from '../services';

export default function ELearningPlatformPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result);
                if (result.length > 0) setSelectedCourse(result[0]);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <MonitorPlay className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-bold">No courses available</p>
                <p className="text-sm">Online courses will appear here once published.</p>
            </div>
        );
    }

    const modules = selectedCourse?.modules ? (Array.isArray(selectedCourse.modules) ? selectedCourse.modules : []) : [];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                <div className="flex-1 flex flex-col">
                    <div className="aspect-video bg-black rounded-2xl flex items-center justify-center text-white relative group cursor-pointer mb-4">
                        <MonitorPlay className="w-16 h-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{selectedCourse?.title || 'Select a Course'}</h1>
                    <p className="text-slate-500 text-sm mb-6">{selectedCourse?.description || ''}</p>

                    <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                        <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-bold text-sm">Overview</button>
                        <button className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 dark:hover:text-slate-200">Q&A</button>
                        <button className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 dark:hover:text-slate-200">Resources</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <h3 className="font-bold mb-2">About this course</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {selectedCourse?.description || 'Course details will be available once content is loaded.'}
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-full lg:h-auto lg:min-h-[600px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold flex justify-between items-center">
                        <span>Course Content</span>
                        <span className="text-xs text-slate-500">{data.length} courses</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {data.map((course, i) => (
                            <div
                                key={course.id || i}
                                onClick={() => setSelectedCourse(course)}
                                className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 ${
                                    selectedCourse?.id === course.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                                <div>
                                    <h4 className={`text-sm font-medium ${selectedCourse?.id === course.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {course.title}
                                    </h4>
                                    <span className="text-xs text-slate-500">{course.duration ? `${course.duration}m` : course.level}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

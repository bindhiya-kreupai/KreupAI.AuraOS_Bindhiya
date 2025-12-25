"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    PlayCircle,
    Award,
    Clock,
    TrendingUp,
    Star
} from 'lucide-react';
import { ldRecommendation } from '@/lib/services/ai-automation-client';

export default function LDRecommendationsPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [skillGaps, setSkillGaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recommendationsResult, skillGapsResult] = await Promise.all([
                ldRecommendation.getRecommendations(),
                ldRecommendation.getSkillGaps(),
            ]);

            if (recommendationsResult.success) {
                setCourses(recommendationsResult.data?.courses || []);
            }
            if (skillGapsResult.success) {
                setSkillGaps(skillGapsResult.data?.gaps || []);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId: string) => {
        setLoading(true);
        try {
            await ldRecommendation.enrollCourse(courseId);
            await fetchData();
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        AI Learning Path
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Personalized course recommendations based on your skill gaps and career goals.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-2xl font-bold mb-4">Upskill for your next promotion</h2>
                        <p className="text-indigo-100 mb-6 text-lg">
                            Our AI identified a gap in <strong>Cloud Architecture</strong>.
                            Mastering this skill increases your promotion probability by <strong>24%</strong>.
                        </p>
                        <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <PlayCircle className="w-5 h-5" /> Start Recommended Course
                        </button>
                    </div>
                    {/* Abstract shape decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                </div>

                {/* Course Grid */}
                <div>
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Top Picks for You
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                                <div className={`h-32 ${course.image} relative`}>
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {course.duration}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-xs font-bold text-indigo-500 mb-1">{course.provider}</div>
                                    <h4 className="text-lg font-bold text-ink-black dark:text-pearl mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h4>

                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-3 h-3 ${star <= Math.round(course.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                        ))}
                                        <span className="text-xs text-slate-500 ml-1">({course.rating})</span>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Why: </span>
                                        <span className="text-slate-500">{course.reason}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

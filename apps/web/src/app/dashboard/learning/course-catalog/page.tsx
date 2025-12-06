"use client";

import React, { useState } from 'react';
import {
    PlayCircle,
    Star,
    Clock,
    BookOpen,
    Search,
    Filter,
    Award,
    MoreHorizontal,
    Heart,
    Share2,
    Bookmark
} from 'lucide-react';

// --- MOCK DATA ---

const COURSES = [
    {
        id: '1',
        title: 'Advanced React Patterns',
        author: 'Sarah Drasner',
        rating: 4.8,
        reviews: 1240,
        duration: '4h 30m',
        lessons: 24,
        level: 'Advanced',
        category: 'Development',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
        progress: 0
    },
    {
        id: '2',
        title: 'Effective Leadership Skills',
        author: 'Simon Sinek',
        rating: 4.9,
        reviews: 3500,
        duration: '2h 15m',
        lessons: 12,
        level: 'Intermediate',
        category: 'Leadership',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
        progress: 45
    },
    {
        id: '3',
        title: 'Financial Analysis 101',
        author: 'Wall St. Prep',
        rating: 4.5,
        reviews: 890,
        duration: '6h 00m',
        lessons: 30,
        level: 'Beginner',
        category: 'Finance',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2026&auto=format&fit=crop',
        progress: 0
    },
    {
        id: '4',
        title: 'Design Systems Architecture',
        author: 'Brad Frost',
        rating: 4.7,
        reviews: 560,
        duration: '3h 45m',
        lessons: 18,
        level: 'Advanced',
        category: 'Design',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
        progress: 10
    },
    {
        id: '5',
        title: 'Data Science with Python',
        author: 'Jose Portilla',
        rating: 4.6,
        reviews: 2100,
        duration: '12h 00m',
        lessons: 50,
        level: 'Intermediate',
        category: 'Data Science',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
        progress: 0
    },
    {
        id: '6',
        title: 'Public Speaking Mastery',
        author: 'Chris Anderson',
        rating: 4.9,
        reviews: 1800,
        duration: '1h 30m',
        lessons: 8,
        level: 'Beginner',
        category: 'Soft Skills',
        thumbnail: 'https://images.unsplash.com/photo-1475721027767-4d06cba3b9bc?q=80&w=2070&auto=format&fit=crop',
        progress: 0
    },
];

const CATEGORIES = ['All', 'Development', 'Leadership', 'Design', 'Finance', 'Data Science', 'Soft Skills'];

export default function CourseCatalogPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = COURSES.filter(course => {
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const inProgressCourses = COURSES.filter(c => c.progress > 0);

    return (
        <div className="pb-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Learning & Development</h1>
                    <p className="text-silver-mist">Expand your skills with our curated course catalog.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    <input
                        type="text"
                        placeholder="Search for courses, skills, or authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-sm shadow-sm"
                    />
                </div>
            </div>

            {/* Resume Learning Rail */}
            {inProgressCourses.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-celestial-indigo" />
                        Continue Learning
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inProgressCourses.map(course => (
                            <div key={course.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex gap-4 items-center">
                                <img src={course.thumbnail} alt={course.title} className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-silver-mist font-medium mb-1">{course.category}</div>
                                    <h3 className="font-bold text-ink-black dark:text-pearl truncate mb-2">{course.title}</h3>
                                    <div className="w-full h-1.5 bg-cloud dark:bg-deep-cosmos rounded-full overflow-hidden mb-1">
                                        <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${course.progress}%` }} />
                                    </div>
                                    <div className="text-xs text-silver-mist">{course.progress}% Complete</div>
                                </div>
                                <button className="p-2 bg-celestial-indigo/10 text-celestial-indigo rounded-full hover:bg-celestial-indigo hover:text-white transition-colors">
                                    <PlayCircle className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                ? 'bg-celestial-indigo text-white shadow-md'
                                : 'bg-white dark:bg-stellar-blue text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20 text-silver-mist">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}

// --- SUB COMPONENTS ---

function CourseCard({ course }: { course: typeof COURSES[0] }) {
    return (
        <div className="group bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative">
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">{course.level}</span>
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-quantum-rose transition-colors">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-celestial-indigo bg-celestial-indigo/5 px-2 py-0.5 rounded">{course.category}</span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {course.rating.toFixed(1)} <span className="text-silver-mist font-normal">({course.reviews})</span>
                    </div>
                </div>

                <h3 className="font-bold text-ink-black dark:text-pearl text-lg leading-tight mb-2 group-hover:text-celestial-indigo transition-colors line-clamp-2">
                    {course.title}
                </h3>

                <p className="text-sm text-silver-mist mb-4 line-clamp-1">By {course.author}</p>

                <div className="mt-auto pt-4 border-t border-cloud dark:border-nebula-purple/20 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {course.duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.lessons} Lessons
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

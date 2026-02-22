"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Clock,
    Book,
    Download,
    PlayCircle,
    Bookmark,
    Star,
    Loader2
} from 'lucide-react';
import { CourseService } from '../services';

export default function LibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const categories = ['All', ...Array.from(new Set(data.map((c) => c.category).filter(Boolean)))];

    const filteredItems = data.filter(item =>
        (selectedCategory === 'All' || item.category === selectedCategory) &&
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.instructor?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const coverColors = ['bg-emerald-600', 'bg-indigo-600', 'bg-orange-500', 'bg-amber-500', 'bg-cyan-600', 'bg-slate-700', 'bg-rose-500', 'bg-purple-600'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Library & Resources
                    </h1>
                    <p className="text-silver-mist text-sm">Expand your knowledge with our curated collection.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                        <Bookmark className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-ink-black dark:text-pearl">{data.length} Resources</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    <div className="flex flex-col gap-3 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by title or instructor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border
                                        ${selectedCategory === cat
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Book className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm">No resources found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-20">
                            {filteredItems.map((item, idx) => (
                                <div key={item.id || idx} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group flex flex-col h-full">
                                    <div className={`aspect-[3/4] rounded-lg ${coverColors[idx % coverColors.length]} mb-4 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform`}>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                            <Book className="w-12 h-12 text-white/50 mb-2" />
                                            <h3 className="text-white font-serif font-bold text-lg leading-tight line-clamp-3">{item.title}</h3>
                                            <p className="text-white/80 text-xs mt-1">{item.instructor || item.category}</p>
                                        </div>
                                        {item.rating && (
                                            <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" /> {item.rating}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-silver-mist uppercase">{item.type || item.level}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                {item.status}
                                            </span>
                                        </div>
                                        <button className="w-full py-2 rounded-lg text-sm font-bold transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Book className="w-5 h-5 text-emerald-500" /> Quick Resources
                        </h3>
                        <div className="space-y-3">
                            {data.slice(0, 3).map((item, i) => (
                                <div key={item.id || i} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 hover:border-indigo-300 transition-colors group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-tight mb-1">{item.title}</h4>
                                    <div className="text-[10px] text-silver-mist">{item.duration ? `${item.duration}m` : item.level}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


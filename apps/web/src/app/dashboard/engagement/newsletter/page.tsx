"use client";

import React, { useState, useEffect } from 'react';
import {
    Newspaper,
    Mail,
    ArrowRight,
    TrendingUp,
    Users,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { NewsletterService } from '../services';

export default function NewsletterPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const newsletters = await NewsletterService.getNewsletters();
            setArticles(Array.isArray(newsletters) ? newsletters : []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-indigo-500" />
                        The Aura Insider
                    </h1>
                    <p className="text-slate-500 text-sm">Monthly updates, stories, and insights from across the organization.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Subscribe
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-indigo-900 rounded-3xl overflow-hidden relative group cursor-pointer h-80 lg:h-96 flex items-end">
                    <div className="p-8">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 block">Featured Story</span>
                        <h2 className="text-3xl font-bold text-white mb-2">Company Newsletter</h2>
                        <p className="text-slate-200 max-w-lg mb-4">Stay up to date with the latest company news, stories, and insights.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Trending Topics
                        </h3>
                        <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
                            Trending topics will appear as more content is published.
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl text-white flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Contributor of the Month</h3>
                            <p className="text-sm opacity-90">To be announced</p>
                        </div>
                        <Users className="w-10 h-10 opacity-50" />
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-xl pt-4">Latest Stories</h3>
            {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Newspaper className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No articles published yet.</p>
                    <p className="text-sm">Newsletter articles will appear here once published.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article: any, i: number) => (
                        <div key={article.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                            <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                                {article.img && (
                                    <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                )}
                                {article.category && (
                                    <span className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-indigo-600">
                                        {article.category}
                                    </span>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h4 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{article.title}</h4>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{article.excerpt || article.content || ''}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                    <span className="text-xs font-bold text-slate-400">{article.readTime || ''}</span>
                                    <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

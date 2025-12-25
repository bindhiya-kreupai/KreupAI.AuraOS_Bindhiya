"use client";

import React, { useState, useEffect } from 'react';
import {
    Newspaper,
    Mail,
    ArrowRight,
    TrendingUp,
    Users,
    ChevronRight
} from 'lucide-react';
import { NewsletterService } from '../services';

export default function NewsletterPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const newsletters = await NewsletterService.getNewsletters();
            setData(newsletters);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    // Fallback mock data
    const articles = data.length > 0 ? data : [
        { title: 'AuraOS hits 1M Users!', category: 'Company News', readTime: '5 min read', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300&h=200', excerpt: 'A milestone achievement for our entire team as we celebrate strictly organic growth...' },
        { title: 'Meet the New Product Team', category: 'Team Spotlight', readTime: '3 min read', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300&h=200', excerpt: 'Get to know the brilliant minds behind our latest feature drops...' },
        { title: 'Q4 Strategic Goals', category: 'Leadership', readTime: '8 min read', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300&h=200', excerpt: 'Our CEO outlines the roadmap for the upcoming quarter and beyond...' },
    ];

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

            {/* Featured Article */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-indigo-900 rounded-3xl overflow-hidden relative group cursor-pointer h-80 lg:h-96">
                    <img src="https://images.unsplash.com/photo-1504384308090-c54be98519b6?auto=format&fit=crop&q=80&w=1200" alt="Featured" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 block">Featured Story</span>
                        <h2 className="text-3xl font-bold text-white mb-2">Annual Innovation Hackathon 2023</h2>
                        <p className="text-slate-200 line-clamp-2 max-w-lg mb-4">Join us for 48 hours of coding, creativity, and collaboration as we aim to build the next generation of Aura tools.</p>
                        <div className="flex items-center text-sm font-bold text-white group-hover:gap-2 transition-all">
                            Read Full Story <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Trending Topics
                        </h3>
                        <div className="space-y-4">
                            {['#RemoteWork', '#MentalHealth', '#TechTalks', '#Sustainability'].map((tag, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-indigo-600 transition-colors">{tag}</span>
                                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">12 articles</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl text-white flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Contributor of the Month</h3>
                            <p className="text-sm opacity-90">Emily Chen (Marketing)</p>
                        </div>
                        <Users className="w-10 h-10 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Latest Articles */}
            <h3 className="font-bold text-xl pt-4">Latest Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className="h-48 overflow-hidden relative">
                            <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <span className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-indigo-600">
                                {article.category}
                            </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h4 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{article.title}</h4>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                <span className="text-xs font-bold text-slate-400">{article.readTime}</span>
                                <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

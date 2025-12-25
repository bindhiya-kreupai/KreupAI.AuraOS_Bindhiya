"use client";

import React, { useState, useEffect } from 'react';
import {
    Lightbulb,
    Send,
    ThumbsUp,
    MessageSquare,
    Filter
} from 'lucide-react';
import { InnovationService } from '../services';

export default function SuggestionBoxPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const ideas = await InnovationService.getIdeas();
            setData(ideas);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-amber-500" />
                        Suggestion Box
                    </h1>
                    <p className="text-slate-500 text-sm">Have an idea? Share it with the leadership anonymously or publicly.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submission Form */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-4">Submit a New Idea</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Topic</label>
                            <input type="text" placeholder="Saving electricity in office..." className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 border border-transparent transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                            <textarea rows={4} placeholder="Describe your suggestion..." className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 border border-transparent transition-all resize-none"></textarea>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                            <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500" />
                            Submit Anonymously
                        </label>

                        <button className="w-full py-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" /> Submit Idea
                        </button>
                    </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">Popular Suggestions</h3>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
                            <Filter className="w-3 h-3" /> Sort by: Top Voted
                        </button>
                    </div>

                    {[
                        { title: 'Flexible Friday Hours', author: 'Anonymous', votes: 156, comments: 23, desc: 'Allow employees to start early and leave early on Fridays to beat the traffic.', badge: 'Work-Life Balance' },
                        { title: 'Healthy Snacks in Vending Machine', author: 'Jane Doe', votes: 89, comments: 12, desc: 'Replace sugary sodas with fruit juices and protein bars.', badge: 'Health & Wellness' },
                        { title: 'Company Library', author: 'Mark Smith', votes: 45, comments: 5, desc: 'Create a shared space for technical and leisure books.', badge: 'Office Facilities' },
                    ].map((idea, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                    {idea.badge}
                                </span>
                                <span className="text-xs text-slate-400">By {idea.author}</span>
                            </div>

                            <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{idea.desc}</p>

                            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                    <ThumbsUp className="w-4 h-4" /> {idea.votes}
                                </button>
                                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900">
                                    <MessageSquare className="w-4 h-4" /> {idea.comments}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

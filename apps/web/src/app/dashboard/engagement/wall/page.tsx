"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    MessageCircle,
    Share2,
    Trophy,
    User,
    Send,
    ThumbsUp
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function KudosWallPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const posts = await SocialFeedService.getPosts();
            setData(posts.filter(p => p.type === 'kudos' || p.type === 'recognition'));
        } catch (error) {
            console.error('Error fetching kudos posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback mock data
    const POSTS = data.length > 0 ? data : [
        { id: 1, from: 'Sarah Jenkins', to: 'Design Team', message: 'Incredible work on the new mobile app design! The user feedback has been amazing.', tags: ['Teamwork', 'Excellence'], time: '2 hours ago', likes: 12, comments: 2 },
        { id: 2, from: 'Mike Ross', to: 'David Kim', message: 'Huge thanks for debugging that critical issue on production last night. You are a lifesaver!', tags: ['Going Above & Beyond'], time: '4 hours ago', likes: 24, comments: 5 },
        { id: 3, from: 'Alice Chen', to: 'Bob Smith', message: 'Congratulations on your 5 year work anniversary! Here is to many more.', tags: ['Milestone'], time: 'Yesterday', likes: 45, comments: 10 },
    ];
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        Kudos Wall
                    </h1>
                    <p className="text-slate-500 text-sm">Celebrate wins and recognize your colleagues.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                    <Send className="w-4 h-4" /> Give Kudos
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Feed */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {POSTS.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                    {post.from.substring(0, 1)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">
                                        <span className="text-indigo-600 dark:text-indigo-400">{post.from}</span> recognized <span className="text-indigo-600 dark:text-indigo-400">{post.to}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">{post.time}</div>
                                </div>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                                {post.message}
                            </p>

                            <div className="flex gap-2 mb-4">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors text-sm font-bold">
                                    <ThumbsUp className="w-4 h-4" /> {post.likes}
                                </button>
                                <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors text-sm font-bold">
                                    <MessageCircle className="w-4 h-4" /> {post.comments} Comments
                                </button>
                                <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors text-sm font-bold ml-auto">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar: Leaderboard */}
                <div className="w-full lg:w-80 space-y-6 shrink-0">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-2 font-bold mb-4 opacity-90">
                            <Trophy className="w-5 h-5" /> Top Receivers
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="font-bold opacity-50 text-xl">#{i}</div>
                                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">Employee Name</div>
                                        <div className="text-xs opacity-70">12 Kudos this month</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold mb-4">Trending Values</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Teamwork', 'Innovation', 'Customer Obsession', 'Integrity', 'Speed'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    MessageCircle,
    Share2,
    Trophy,
    Send,
    ThumbsUp,
    Loader2
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function KudosWallPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await SocialFeedService.getPosts();
            const data = (result as any)?.data || result;
            const allPosts = Array.isArray(data) ? data : [];
            setPosts(allPosts.filter((p: any) => p.type === 'kudos' || p.type === 'recognition'));
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
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            <div className="flex flex-col lg:flex-row gap-3 h-full min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Heart className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium">No kudos yet.</p>
                            <p className="text-sm">Be the first to give kudos to a colleague!</p>
                        </div>
                    ) : (
                        posts.map((post: any) => (
                            <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                        {(post.authorName || post.from || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">
                                            <span className="text-indigo-600 dark:text-indigo-400">{post.authorName || post.from || 'Team Member'}</span> recognized <span className="text-indigo-600 dark:text-indigo-400">{post.receiverId || post.to || 'a colleague'}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">{post.createdDate || post.time || ''}</div>
                                    </div>
                                </div>

                                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                                    {post.content || post.message || ''}
                                </p>

                                {(post.tags || post.coreValue) && (
                                    <div className="flex gap-2 mb-4">
                                        {post.coreValue && (
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg font-bold">
                                                #{post.coreValue}
                                            </span>
                                        )}
                                        {(post.tags || []).map((tag: string) => (
                                            <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg font-bold">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors text-sm font-bold">
                                        <ThumbsUp className="w-4 h-4" /> {post.points || (post.likes || []).length || 0}
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors text-sm font-bold">
                                        <MessageCircle className="w-4 h-4" /> {(post.comments || []).length || 0} Comments
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors text-sm font-bold ml-auto">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="w-full lg:w-80 space-y-4 shrink-0">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-2 font-bold mb-4 opacity-90">
                            <Trophy className="w-5 h-5" /> Top Receivers
                        </div>
                        <div className="flex items-center justify-center h-24 text-white/60 text-sm">
                            Leaderboard data will appear as kudos are given.
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


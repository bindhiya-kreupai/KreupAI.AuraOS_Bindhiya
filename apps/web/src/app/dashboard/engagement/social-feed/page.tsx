"use client";

import React, { useState, useEffect } from 'react';
import {
    Image,
    Smile,
    Send,
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function SocialFeedPage() {
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
            setPosts(Array.isArray(data) ? data : []);
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
                        <Smile className="w-6 h-6 text-indigo-500" />
                        Aura Social
                    </h1>
                    <p className="text-slate-500 text-sm">Connect, share, and engage with your community.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">U</div>
                        <textarea placeholder="What's going on?" className="flex-1 bg-transparent outline-none resize-none pt-2" rows={2}></textarea>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-indigo-500">
                                <Image className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-amber-500">
                                <Smile className="w-5 h-5" />
                            </button>
                        </div>
                        <button className="px-6 py-1.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            Post <Send className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Smile className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium">No posts yet.</p>
                            <p className="text-sm">Be the first to share something with the team!</p>
                        </div>
                    ) : (
                        posts.map((post: any, i: number) => (
                            <div key={post.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                                            {(post.authorName || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{post.authorName || 'Team Member'}</h4>
                                            <p className="text-xs text-slate-500">{post.createdDate || ''}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-slate-700 dark:text-slate-300 mb-4">
                                    {post.content || post.message || ''}
                                </p>

                                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <button className="flex items-center gap-2 hover:text-rose-500 transition-colors">
                                        <Heart className="w-5 h-5" /> <span className="text-sm font-bold">{(post.likes || []).length}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                                        <MessageCircle className="w-5 h-5" /> <span className="text-sm font-bold">{(post.comments || []).length} Comments</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                                        <Share2 className="w-5 h-5" /> <span className="text-sm font-bold">Share</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


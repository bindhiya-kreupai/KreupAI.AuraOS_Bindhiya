"use client";

import React, { useState, useEffect } from 'react';
import {
    Award,
    Heart,
    MessageCircle,
    Share2,
    Loader2
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function RecognitionWallPage() {
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
            setPosts(allPosts.filter((p: any) => p.type === 'recognition'));
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
                        <Award className="w-6 h-6 text-indigo-500" />
                        Recognition Wall
                    </h1>
                    <p className="text-slate-500 text-sm">Celebrate wins and appreciate your colleagues.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Award className="w-4 h-4" /> Give Kudos
                </button>
            </div>

            <div className="max-w-2xl mx-auto space-y-4 w-full">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Award className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">No recognitions yet.</p>
                        <p className="text-sm">Be the first to recognize a colleague!</p>
                    </div>
                ) : (
                    posts.map((post: any, i: number) => (
                        <div key={post.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                                    {(post.authorName || 'U').charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-bold flex items-center gap-1">
                                        {post.authorName || 'Team Member'} <span className="text-slate-400 font-normal">recognized</span> {post.receiverId || 'a colleague'}
                                    </div>
                                    <div className="text-xs text-slate-500">{post.createdDate || ''}</div>
                                </div>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                                {post.content || post.message || ''}
                            </p>

                            {post.coreValue && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                        #{post.coreValue}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors group">
                                    <Heart className="w-5 h-5 group-hover:fill-current" /> {post.points || 0}
                                </button>
                                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors">
                                    <MessageCircle className="w-5 h-5" /> {(post.comments || []).length} Comments
                                </button>
                                <button className="text-slate-400 hover:text-indigo-500">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


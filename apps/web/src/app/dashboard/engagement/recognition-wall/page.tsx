"use client";

import React, { useState, useEffect } from 'react';
import {
    Award,
    Heart,
    MessageCircle,
    Share2,
    Plus,
    ThumbsUp
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function RecognitionWallPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const posts = await SocialFeedService.getPosts();
            setData(posts.filter(p => p.type === 'recognition'));
        } catch (error) {
            console.error('Error fetching recognition posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback mock data
    const posts = data.length > 0 ? data : [
        {
            author: 'Sarah Connor',
            authorRole: 'Head of Product',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
            recipient: 'Kyle Reese',
            message: 'Big shoutout to Kyle for his incredible work on the new deployment pipeline. You saved us hours of debugging!',
            tags: ['#Innovation', '#TeamWork'],
            likes: 24,
            comments: 5,
            time: '2 hours ago',
            badge: 'bg-indigo-100 text-indigo-600'
        },
        {
            author: 'John Connor',
            authorRole: 'Team Lead',
            avatar: 'https://i.pravatar.cc/150?u=john',
            recipient: 'Designing Team',
            message: 'The new UI kit looks absolutely stunning. Great job maintaining consistency across all modules.',
            tags: ['#DesignExcellence', '#AuraOS'],
            likes: 42,
            comments: 8,
            time: '5 hours ago',
            badge: 'bg-emerald-100 text-emerald-600'
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="max-w-2xl mx-auto space-y-6 w-full">
                {posts.map((post, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <div className="text-sm font-bold flex items-center gap-1">
                                    {post.author} <span className="text-slate-400 font-normal">recognized</span> {post.recipient}
                                </div>
                                <div className="text-xs text-slate-500">{post.time}</div>
                            </div>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                            {post.message}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, j) => (
                                <span key={j} className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors group">
                                <Heart className="w-5 h-5 group-hover:fill-current" /> {post.likes}
                            </button>
                            <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors">
                                <MessageCircle className="w-5 h-5" /> {post.comments} Comments
                            </button>
                            <button className="text-slate-400 hover:text-indigo-500">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

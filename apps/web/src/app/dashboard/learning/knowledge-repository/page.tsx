"use client";

import React, { useState, useEffect } from 'react';
import {
    Library,
    FileText,
    Video,
    Download,
    Loader2
} from 'lucide-react';
import { KnowledgeBaseService } from '../services';

export default function KnowledgeRepositoryPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await KnowledgeBaseService.getKnowledgeArticles();
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

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Library className="w-6 h-6 text-indigo-500" />
                        Knowledge Repository
                    </h1>
                    <p className="text-slate-500 text-sm">Central library for training materials and documentation.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Library className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No knowledge articles found</p>
                    <p className="text-sm">Articles and resources will appear here once created.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((article, i) => {
                        const isVideo = article.categoryName?.toLowerCase().includes('video');
                        const IconComponent = isVideo ? Video : FileText;
                        const color = isVideo ? 'text-indigo-500' : 'text-rose-500';

                        return (
                            <div key={article.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <IconComponent className={`w-8 h-8 ${color}`} />
                                    </div>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                                <h4 className="font-bold text-sm mb-1 truncate" title={article.title}>{article.title}</h4>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>{article.categoryName || 'Article'}</span>
                                    <span>{article.viewCount || 0} views</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

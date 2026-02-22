"use client";

import React, { useState, useEffect } from 'react';
import {
    Book,
    Search,
    ChevronRight,
    FileText,
    Loader2
} from 'lucide-react';
import { KnowledgeBaseService } from '../services';
import type { KnowledgeBaseArticle } from '../types';

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await KnowledgeBaseService.getAllArticles();
                setArticles(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const categories = articles.reduce<Record<string, KnowledgeBaseArticle[]>>((acc, article) => {
        const cat = article.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(article);
        return acc;
    }, {});

    const categoryEntries = Object.entries(categories);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold mb-2">How can we help you today?</h1>
                <p className="text-indigo-100 mb-6">Search our knowledge base for answers to common questions.</p>
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for articles, policies, or guides..."
                        className="w-full pl-12 pr-6 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                    />
                </div>
            </div>

            {categoryEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No knowledge base articles found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryEntries.map(([cat, arts], i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Book className="w-5 h-5 text-indigo-500" />
                                {cat}
                            </h3>
                            <ul className="space-y-3">
                                {arts.map((art, j) => (
                                    <li key={art.articleId || j} className="flex items-start gap-2 group cursor-pointer">
                                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-indigo-500" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline">
                                            {art.title}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                                View All <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


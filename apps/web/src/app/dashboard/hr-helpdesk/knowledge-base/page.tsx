"use client";

import React, { useState } from 'react';
import {
    Search,
    BookOpen,
    CreditCard,
    Shield,
    Monitor,
    Heart,
    FileText,
    ChevronRight,
    Star,
    HelpCircle,
    ArrowRight
} from 'lucide-react';

// --- MOCK DATA ---

interface Category {
    id: string;
    title: string;
    icon: any;
    count: number;
    color: string;
    description: string;
}

interface Article {
    id: string;
    title: string;
    category: string;
    views: number;
    readTime: string;
    popular?: boolean;
}

const CATEGORIES: Category[] = [
    {
        id: 'payroll',
        title: 'Payroll & Tax',
        icon: CreditCard,
        count: 42,
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20',
        description: 'Payslips, tax declarations, and salary structure.'
    },
    {
        id: 'benefits',
        title: 'Benefits & Insurance',
        icon: Heart,
        count: 28,
        color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/20',
        description: 'Health plans, enrollment guides, and claims.'
    },
    {
        id: 'it',
        title: 'IT & Access',
        icon: Monitor,
        count: 35,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
        description: 'Password resets, software requests, and VPN.'
    },
    {
        id: 'policy',
        title: 'Company Policy',
        icon: Shield,
        count: 19,
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20',
        description: 'Code of conduct, leave rules, and compliance.'
    },
];

const ARTICLES: Article[] = [
    { id: '1', title: 'How to download my Form 16?', category: 'Payroll & Tax', views: 1240, readTime: '2 min', popular: true },
    { id: '2', title: 'Adding a dependent to health insurance', category: 'Benefits & Insurance', views: 980, readTime: '5 min', popular: true },
    { id: '3', title: 'Setting up VPN on macOS', category: 'IT & Access', views: 850, readTime: '3 min' },
    { id: '4', title: 'Leave encashment policy 2024', category: 'Company Policy', views: 720, readTime: '4 min' },
    { id: '5', title: 'Resetting your SSO password', category: 'IT & Access', views: 650, readTime: '1 min', popular: true },
    { id: '6', title: 'Understanding your salary breakdown', category: 'Payroll & Tax', views: 500, readTime: '6 min' },
];

export default function KnowledgeBasePage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = ARTICLES.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
            {/* Hero Section */}
            <div className="bg-celestial-indigo relative overflow-hidden rounded-b-3xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="max-w-4xl mx-auto px-6 py-16 relative z-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">How can we help you today?</h1>
                    <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                        Search our knowledge base for answers to common questions about payroll, benefits, IT, and more.
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="e.g. How to apply for leave?"
                            className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border-2 border-transparent focus:border-indigo-300 focus:outline-none text-slate-900 placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {CATEGORIES.map(category => (
                        <div key={category.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl shadow-lg border border-cloud dark:border-nebula-purple/20 hover:-translate-y-1 transition-transform cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.color}`}>
                                <category.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-2 group-hover:text-celestial-indigo transition-colors">{category.title}</h3>
                            <p className="text-xs text-silver-mist mb-4 leading-relaxed line-clamp-2">{category.description}</p>
                            <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-celestial-indigo transition-colors">
                                {category.count} Articles <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Popular Articles */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Popular Articles</h2>
                        </div>

                        <div className="bg-white dark:bg-stellar-blue rounded-2xl shadow-sm border border-cloud dark:border-nebula-purple/50 divide-y divide-cloud dark:divide-nebula-purple/20 overflow-hidden">
                            {filteredArticles.map(article => (
                                <div key={article.id} className="p-5 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors cursor-pointer group flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">{article.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-silver-mist mt-1">
                                            <span>{article.category}</span>
                                            <span>•</span>
                                            <span>{article.readTime} read</span>
                                            <span>•</span>
                                            <span>{article.views} views</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-celestial-indigo transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Support */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl shadow-sm border border-cloud dark:border-nebula-purple/50">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-2">Still need help?</h3>
                            <p className="text-sm text-silver-mist mb-6">Can&apos;t find what you're looking for? Raise a ticket and our HR team will get back to you.</p>
                            <button className="w-full py-2.5 bg-celestial-indigo text-white rounded-xl font-bold text-sm hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                                Create Support Ticket
                            </button>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                            <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2">System Status</h3>
                            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                All systems operational
                            </div>
                            <div className="text-xs text-emerald-600/70">
                                Last updated: 5 mins ago
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

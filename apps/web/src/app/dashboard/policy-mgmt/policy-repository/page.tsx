"use client";

import React, { useState, useEffect } from 'react';
import {
    Folder,
    FileText,
    Search,
    MoreHorizontal,
    Plus,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Download,
    Share2,
    File,
    Loader2
} from 'lucide-react';
import { PolicyService } from '../services';
import type { Policy } from '../types';

interface PolicyFolder {
    id: string;
    name: string;
    count: number;
    color: string;
}

export default function PolicyRepositoryPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await PolicyService.getAll();
                setPolicies(data);
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

    // Build folder categories from actual data
    const categoryMap = policies.reduce<Record<string, number>>((acc, p) => {
        const cat = p.category || 'General';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const folderColors = ['text-blue-500 fill-blue-500/20', 'text-emerald-500 fill-emerald-500/20', 'text-amber-500 fill-amber-500/20', 'text-purple-500 fill-purple-500/20'];
    const folders: PolicyFolder[] = Object.entries(categoryMap).map(([name, count], i) => ({
        id: String(i + 1),
        name,
        count,
        color: folderColors[i % folderColors.length],
    }));

    const filteredDocs = policies.filter(doc => {
        const matchesSearch = doc.policyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? doc.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <FileText className="w-6 h-6 text-celestial-indigo" />
                        Policy Repository
                    </h1>
                    <p className="text-silver-mist text-sm">Centralized library for all company policies and procedures.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                        <Plus className="w-4 h-4" /> Upload New
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-mist" />
                <input
                    type="text"
                    placeholder="Search documents by name..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Folders Grid */}
            {folders.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-silver-mist uppercase mb-3">Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setSelectedCategory(selectedCategory === folder.name ? null : folder.name)}
                                className={`p-4 bg-white dark:bg-stellar-blue rounded-xl border transition-all text-left group ${selectedCategory === folder.name
                                        ? 'border-celestial-indigo shadow-md ring-1 ring-celestial-indigo'
                                        : 'border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50'
                                    }`}
                            >
                                <Folder className={`w-8 h-8 mb-3 ${folder.color}`} />
                                <div className="font-bold text-ink-black dark:text-pearl text-sm truncate">{folder.name}</div>
                                <div className="text-xs text-silver-mist mt-1">{folder.count} files</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Documents List */}
            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center">
                    <h3 className="font-bold text-ink-black dark:text-pearl">Recent Documents</h3>
                    <span className="text-xs text-silver-mist">{filteredDocs.length} result(s)</span>
                </div>

                <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                    {filteredDocs.map((doc, i) => (
                        <div key={doc.policyId || i} className="p-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                <File className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-ink-black dark:text-pearl text-sm truncate">{doc.policyName}</h4>
                                    {doc.status === 'published' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                    {doc.status === 'draft' && <Clock className="w-3 h-3 text-amber-500" />}
                                    {doc.status === 'archived' && <AlertCircle className="w-3 h-3 text-slate-400" />}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-silver-mist mt-0.5">
                                    <span>v{doc.version}</span>
                                    <span>•</span>
                                    <span>{doc.category}</span>
                                    <span>•</span>
                                    <span>{doc.policyNumber}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Preview">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Download">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Share">
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredDocs.length === 0 && (
                        <div className="p-10 text-center text-silver-mist">
                            <Folder className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No documents found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState, useEffect } from 'react';
import {
    Library,
    FileText,
    Video,
    Download
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Employee Handbook 2024', type: 'PDF', size: '4.2 MB', icon: FileText, color: 'text-rose-500' },
                    { title: 'Sales Process Walkthrough', type: 'Video', size: '128 MB', icon: Video, color: 'text-indigo-500' },
                    { title: 'Brand Guidelines', type: 'PDF', size: '15 MB', icon: FileText, color: 'text-rose-500' },
                    { title: 'IT Security Policy', type: 'Doc', size: '2.1 MB', icon: FileText, color: 'text-blue-500' },
                    { title: 'Onboarding Checklist', type: 'XLS', size: '0.5 MB', icon: FileText, color: 'text-emerald-500' },
                ].map((file, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <file.icon className={`w-8 h-8 ${file.color}`} />
                            </div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        <h4 className="font-bold text-sm mb-1 truncate" title={file.title}>{file.title}</h4>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{file.type}</span>
                            <span>{file.size}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

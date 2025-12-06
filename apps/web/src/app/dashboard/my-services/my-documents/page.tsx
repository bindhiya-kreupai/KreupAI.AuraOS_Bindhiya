"use client";

import React, { useState } from 'react';
import {
    Folder,
    FileText,
    MoreVertical,
    Upload,
    Search,
    Grid,
    List
} from 'lucide-react';

export default function MyDocumentsPage() {
    const [viewMode, setViewMode] = useState('grid');

    const docs = [
        { name: 'Offer Letter.pdf', type: 'PDF', size: '1.2 MB', date: 'Jun 15, 2022' },
        { name: 'Employment Agmt.pdf', type: 'PDF', size: '2.5 MB', date: 'Jun 15, 2022' },
        { name: 'Latest Payslip.pdf', type: 'PDF', size: '0.8 MB', date: 'Nov 30, 2023' },
        { name: 'Passport Copy.jpg', type: 'Image', size: '3.1 MB', date: 'Jul 01, 2022' },
        { name: 'Resume_v4.docx', type: 'Doc', size: '0.5 MB', date: 'Sep 10, 2023' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Folder className="w-6 h-6 text-indigo-500" />
                        My Documents
                    </h1>
                    <p className="text-slate-500 text-sm">Securely store and manage your personal files.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search files..." className="bg-transparent outline-none text-sm py-2 w-32 md:w-48" />
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">All Files</h3>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {docs.map((doc, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group cursor-pointer flex flex-col items-center text-center relative">
                            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-3 text-indigo-500">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-sm truncate w-full" title={doc.name}>{doc.name}</h4>
                            <div className="text-xs text-slate-400 mt-1">{doc.size} • {doc.date}</div>
                        </div>
                    ))}
                    {/* Add New Placeholder */}
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-bold">Upload New</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Size</th>
                                <th className="px-6 py-3">Date Modified</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {docs.map((doc, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        {doc.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                                    <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

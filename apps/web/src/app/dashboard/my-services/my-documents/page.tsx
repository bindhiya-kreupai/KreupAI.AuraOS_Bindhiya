"use client";

import React, { useState, useEffect } from 'react';
import {
    Folder,
    FileText,
    MoreVertical,
    Upload,
    Search,
    Grid,
    List,
    Loader2
} from 'lucide-react';
import { DocumentService } from '../services';

export default function MyDocumentsPage() {
    const [viewMode, setViewMode] = useState('grid');
    const [fetching, setFetching] = useState(true);
    const [docs, setDocs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await DocumentService.getDocuments();
                if (res?.success && Array.isArray(res.data)) {
                    setDocs(res.data.map((d: any) => ({
                        id: d.id,
                        name: d.name || d.fileName || d.title || 'Document',
                        type: d.fileType || d.mimeType || d.type || 'PDF',
                        size: d.fileSize || d.size || 'N/A',
                        date: d.updatedAt || d.createdAt ? new Date(d.updatedAt || d.createdAt).toLocaleDateString('en', { month: 'short', day: '2-digit', year: 'numeric' }) : '',
                    })));
                }
            } catch (err) {
                console.error('Failed to fetch documents:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchDocs();
    }, []);

    const filteredDocs = searchQuery
        ? docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : docs;

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-sm py-2 w-32 md:w-48"
                        />
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                </div>
            </div>

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

            {filteredDocs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No documents found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredDocs.map((doc, i) => (
                        <div key={doc.id || i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group cursor-pointer flex flex-col items-center text-center relative">
                            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-3 text-indigo-500">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-sm truncate w-full" title={doc.name}>{doc.name}</h4>
                            <div className="text-xs text-slate-400 mt-1">{doc.size} {doc.date ? `\u2022 ${doc.date}` : ''}</div>
                        </div>
                    ))}
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
                            {filteredDocs.map((doc, i) => (
                                <tr key={doc.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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


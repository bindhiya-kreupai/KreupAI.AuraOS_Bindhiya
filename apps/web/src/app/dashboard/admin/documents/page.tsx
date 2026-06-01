"use client";

import React, { useState, useEffect } from 'react';
import {
    Folder,
    FileText,
    Search,
    Plus,
    MoreVertical,
    Download,
    Eye,
    Clock,
    CheckCircle2,
    File,
    ChevronRight,
    PenTool,
    Shield,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- TYPES ---

interface Document {
    id: string;
    documentName: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    category: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    uploadedBy: string;
    isVerified: boolean;
    isConfidential: boolean;
    accessLevel: string;
    description?: string;
    documentType?: {
        id: string;
        name: string;
        code: string;
    };
}

interface FolderInfo {
    id: string;
    name: string;
    count: number;
    color: string;
}

interface SignRequest {
    id: string;
    title: string;
    recipient: string;
    date: string;
    status: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    'CONTRACT': 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    'ID_PROOF': 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
    'EDUCATION': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
    'MEDICAL': 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
    'TAX': 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    'OTHER': 'text-slate-500 bg-slate-50 dark:bg-slate-500/10',
};

const CATEGORY_LABELS: Record<string, string> = {
    'CONTRACT': 'Contracts',
    'ID_PROOF': 'ID Documents',
    'EDUCATION': 'Education',
    'MEDICAL': 'Medical',
    'TAX': 'Tax Documents',
    'OTHER': 'Other',
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getFileTypeLabel(fileType: string): string {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('docx')) return 'DOC';
    if (fileType.includes('sheet') || fileType.includes('xlsx')) return 'XLS';
    if (fileType.includes('presentation') || fileType.includes('pptx')) return 'PPT';
    if (fileType.includes('image')) return 'IMG';
    return fileType.split('/').pop()?.toUpperCase() || 'FILE';
}

export default function DocumentsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/v1/documents');
                const json = await res.json();
                if (json.success) {
                    setDocuments(json.data || []);
                } else {
                    setError(json.error?.message || 'Failed to fetch documents');
                }
            } catch (err: any) {
                console.error('Failed to fetch documents:', err);
                setError('Failed to load documents. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Derive folders from document categories
    const folders: FolderInfo[] = React.useMemo(() => {
        const categoryMap: Record<string, number> = {};
        documents.forEach(doc => {
            categoryMap[doc.category] = (categoryMap[doc.category] || 0) + 1;
        });
        return Object.entries(categoryMap).map(([category, count], index) => ({
            id: category,
            name: CATEGORY_LABELS[category] || category,
            count,
            color: CATEGORY_COLORS[category] || CATEGORY_COLORS['OTHER'],
        }));
    }, [documents]);

    // Recent files sorted by most recently updated
    const recentFiles = React.useMemo(() => {
        return [...documents]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .filter(doc => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return doc.documentName.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q);
            });
    }, [documents, searchQuery]);

    // Derive sign requests from confidential/verified docs (a reasonable proxy)
    const signRequests: SignRequest[] = React.useMemo(() => {
        return documents
            .filter(doc => doc.isConfidential || doc.accessLevel === 'HR_ONLY')
            .slice(0, 5)
            .map(doc => ({
                id: doc.id,
                title: doc.documentName,
                recipient: doc.uploadedBy || 'Unknown',
                date: formatDate(doc.updatedAt),
                status: doc.isVerified ? 'Signed' : 'Pending',
            }));
    }, [documents]);

    // Storage info
    const totalSize = React.useMemo(() => {
        return documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
    }, [documents]);
    const storageLimit = 20 * 1024 * 1024 * 1024; // 20GB
    const storagePercent = Math.min(Math.round((totalSize / storageLimit) * 100), 100);

    if (loading) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Folder className="w-6 h-6 text-indigo-500" />
                            Document Center
                        </h1>
                        <p className="text-silver-mist text-sm">Central repository for policies, templates, and contracts.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 animate-pulse">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 h-24" />
                            ))}
                        </div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 h-16" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 h-48" />
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl h-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <p className="text-lg font-bold text-ink-black dark:text-pearl">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Folder className="w-6 h-6 text-indigo-500" />
                        Document Center
                    </h1>
                    <p className="text-silver-mist text-sm">Central repository for policies, templates, and contracts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" /> Upload New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Search Bar */}
                    <div className="relative shrink-0">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Folders */}
                    <div className="shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-3 text-sm flex items-center gap-2">
                            <Folder className="w-4 h-4 text-slate-400" /> Folders
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {folders.length === 0 ? (
                                <p className="col-span-4 text-sm text-silver-mist text-center py-4">No folders yet</p>
                            ) : (
                                folders.map(folder => (
                                    <div key={folder.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:shadow-md transition-all cursor-pointer group">
                                        <div className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl truncate">{folder.name}</h4>
                                        <p className="text-xs text-silver-mist">{folder.count} items</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Files */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-3 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> Recent Files
                        </h3>
                        <div className="space-y-3">
                            {recentFiles.length === 0 ? (
                                <p className="text-sm text-silver-mist text-center py-8">
                                    {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
                                </p>
                            ) : (
                                recentFiles.map(file => (
                                    <div key={file.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm text-ink-black dark:text-pearl truncate">{file.documentName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-silver-mist">
                                                    <span>{formatFileSize(file.fileSize)}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(file.updatedAt)}</span>
                                                    <span>•</span>
                                                    <span>{getFileTypeLabel(file.fileType)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions & E-Signs */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* E-Sign Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-indigo-500" /> E-Sign Requests
                        </h3>

                        <div className="space-y-4">
                            {signRequests.length === 0 ? (
                                <p className="text-sm text-silver-mist text-center py-4">No sign requests</p>
                            ) : (
                                signRequests.map(req => (
                                    <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                                ${req.status === 'Signed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                                            `}>
                                                {req.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{req.date}</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-1 line-clamp-1">{req.title}</h4>
                                        <div className="text-xs text-silver-mist">To: {req.recipient}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> New Sign Request
                        </button>
                    </div>

                    {/* Storage Info */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Storage
                            </h3>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{storagePercent}% Used</span>
                        </div>
                        <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full mb-4 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${storagePercent}%` }}></div>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400">
                            You have used {formatFileSize(totalSize)} of your 20GB allocation. Items in &quot;Trash&quot; are deleted after 30 days.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


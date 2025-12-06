"use client";

import React, { useState } from 'react';
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
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const FOLDERS = [
    { id: 1, name: 'HR Policies', count: 12, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
    { id: 2, name: 'Legal Contracts', count: 5, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
    { id: 3, name: 'Brand Assets', count: 24, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
    { id: 4, name: 'Finance Forms', count: 8, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
];

const RECENT_FILES = [
    {
        id: 1,
        name: 'Employee Handbook 2025.pdf',
        type: 'PDF',
        size: '4.2 MB',
        modified: 'Dec 01, 2024',
        owner: 'HR Team',
        status: 'Published'
    },
    {
        id: 2,
        name: 'NDA_Template_v2.docx',
        type: 'DOC',
        size: '1.5 MB',
        modified: 'Nov 28, 2024',
        owner: 'Legal',
        status: 'Draft'
    },
    {
        id: 3,
        name: 'Q1_Marketing_Plan.pptx',
        type: 'PPT',
        size: '12.8 MB',
        modified: 'Nov 25, 2024',
        owner: 'Marketing',
        status: 'Review'
    },
    {
        id: 4,
        name: 'Travel_Reimbursement_Form.xlsx',
        type: 'XLS',
        size: '850 KB',
        modified: 'Nov 20, 2024',
        owner: 'Finance',
        status: 'Published'
    }
];

const SIGN_REQUESTS = [
    { id: 101, title: 'Offer Letter - Senior Dev', recipient: 'Alex M.', date: 'Sent 2 days ago', status: 'Pending' },
    { id: 102, title: 'IT Policy Acknowledgement', recipient: 'Sarah J.', date: 'Signed Yesterday', status: 'Signed' }
];

export default function DocumentsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Search Bar */}
                    <div className="relative shrink-0">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Folders */}
                    <div className="shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-3 text-sm flex items-center gap-2">
                            <Folder className="w-4 h-4 text-slate-400" /> Folders
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {FOLDERS.map(folder => (
                                <div key={folder.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:shadow-md transition-all cursor-pointer group">
                                    <div className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-sm text-ink-black dark:text-pearl truncate">{folder.name}</h4>
                                    <p className="text-xs text-silver-mist">{folder.count} items</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Files */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-3 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> Recent Files
                        </h3>
                        <div className="space-y-3">
                            {RECENT_FILES.map(file => (
                                <div key={file.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl truncate">{file.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-silver-mist">
                                                <span>{file.size}</span>
                                                <span>•</span>
                                                <span>{file.modified}</span>
                                                <span>•</span>
                                                <span>{file.owner}</span>
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
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Actions & E-Signs */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* E-Sign Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-indigo-500" /> E-Sign Requests
                        </h3>

                        <div className="space-y-4">
                            {SIGN_REQUESTS.map(req => (
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
                            ))}
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
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">75% Used</span>
                        </div>
                        <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full mb-4 overflow-hidden">
                            <div className="h-full w-3/4 bg-indigo-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400">
                            You have used 15GB of your 20GB allocation. Items in "Trash" are deleted after 30 days.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

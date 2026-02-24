"use client";

import React, { useState, useEffect } from 'react';
import {
    Database,
    UploadCloud,
    FileSpreadsheet,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Download
} from 'lucide-react';
import { MassUpdateService } from '../services';
import type { MassUpdate } from '../types';

const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
        return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getStatusDisplay = (status: string) => {
    switch (status) {
        case 'executed':
            return { label: 'Success', style: 'success' };
        case 'failed':
            return { label: 'Partial Error', style: 'error' };
        case 'pending_approval':
        case 'approved':
        case 'draft':
            return { label: 'Processing', style: 'processing' };
        default:
            return { label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '), style: 'processing' };
    }
};

export default function MassUpdatesPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [massUpdates, setMassUpdates] = useState<MassUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMassUpdates();
    }, []);

    const fetchMassUpdates = async () => {
        try {
            const data = await MassUpdateService.getAllMassUpdates();
            setMassUpdates(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = () => {
        alert("Simulating file upload...");
        setTimeout(() => {
            fetchMassUpdates();
        }, 1000);
    };

    const handleDownloadTemplate = () => {
        alert("Downloading template: Employee_Data_Template_v2.xlsx");
    };

    const handleRetry = (jobName: string) => {
        alert(`Retrying job: ${jobName}`);
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-500" />
                        Mass Data Updates
                    </h1>
                    <p className="text-slate-500 text-sm">Bulk update employee records via CSV or Excel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Upload Area */}
                <div
                    className={`bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all duration-200
                        ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800'}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(); }}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors
                        ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}
                    `}>
                        <UploadCloud className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Drag & Drop your file here</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs">
                        Supports .csv, .xls, .xlsx. Ensure you follow the data template.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleUpload}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                            Browse Files
                        </button>
                        <button
                            onClick={handleDownloadTemplate}
                            className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Download Template
                        </button>
                    </div>
                </div>

                {/* Recent History */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-y-auto max-h-[500px]">
                    <h3 className="font-bold text-lg mb-4">Recent Import Jobs</h3>

                    {loading && (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

                    {!loading && massUpdates.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <Database className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No import jobs found</p>
                            <p className="text-sm">Import jobs will appear here once data is uploaded.</p>
                        </div>
                    )}

                    {!loading && massUpdates.length > 0 && (
                        <div className="space-y-4">
                            {massUpdates.map((job) => {
                                const statusInfo = getStatusDisplay(job.status);
                                const recordCount = job.targetEmployees?.length ?? 0;

                                return (
                                    <div key={job.updateId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div>
                                            <div className="font-bold text-sm">{job.updateName}</div>
                                            <div className="text-xs text-slate-500 mt-1">{formatDate(job.createdDate)} {recordCount > 0 ? `\u2022 ${recordCount} Records` : ''}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {statusInfo.style === 'success' && (
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Success
                                                </span>
                                            )}
                                            {statusInfo.style === 'error' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Errors
                                                    </span>
                                                    <button
                                                        onClick={() => handleRetry(job.updateName)}
                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                                                        title="Retry Failed Records"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                    </button>
                                                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500" title="Download Error Log">
                                                        <Download className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            {statusInfo.style === 'processing' && (
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                                                    <RefreshCw className="w-3 h-3 animate-spin" /> {statusInfo.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


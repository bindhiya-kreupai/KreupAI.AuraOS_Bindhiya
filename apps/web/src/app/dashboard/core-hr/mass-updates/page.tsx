"use client";

import React, { useState } from 'react';
import {
    Database,
    UploadCloud,
    FileSpreadsheet,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Download
} from 'lucide-react';

export default function MassUpdatesPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [jobs, setJobs] = useState([
        { name: 'Salary_Revision_2024.csv', date: 'Today, 10:30 AM', status: 'Success', records: 142 },
        { name: 'New_Hires_Nov_Batch.xlsx', date: 'Yesterday, 4:15 PM', status: 'Partial Error', records: 12 },
        { name: 'Dept_Restruct_Data.csv', date: 'Dec 01, 2023', status: 'Success', records: 450 },
    ]);

    const handleUpload = () => {
        alert("Simulating file upload...");
        setTimeout(() => {
            setJobs(prev => [{
                name: `Bulk_Update_${new Date().toLocaleTimeString()}.csv`,
                date: 'Just now',
                status: 'Processing',
                records: 0
            }, ...prev]);
        }, 1000);
    };

    const handleDownloadTemplate = () => {
        alert("Downloading template: Employee_Data_Template_v2.xlsx");
    };

    const handleRetry = (jobName: string) => {
        alert(`Retrying job: ${jobName}`);
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-500" />
                        Mass Data Updates
                    </h1>
                    <p className="text-slate-500 text-sm">Bulk update employee records via CSV or Excel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="flex gap-4">
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
                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                    <div className="font-bold text-sm">{job.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{job.date} • {job.records} Records</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {job.status === 'Success' && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Success
                                        </span>
                                    )}
                                    {job.status === 'Partial Error' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Errors
                                            </span>
                                            <button
                                                onClick={() => handleRetry(job.name)}
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
                                    {job.status === 'Processing' && (
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                                            <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

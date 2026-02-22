"use client";

import React, { useState } from 'react';
import {
    UploadCloud,
    DownloadCloud,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    Database,
    Table,
    History,
    X,
    FolderOpen,
    Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const IMPORT_JOBS = [
    { id: 'JOB-901', name: 'Bulk Employee Import', file: 'employees_nov_v2.csv', date: 'Just now', records: 145, status: 'Processing', progress: 45 },
    { id: 'JOB-900', name: 'Attendance Adjustments', file: 'att_corrections.xlsx', date: '2 hours ago', records: 12, status: 'Completed', progress: 100 },
    { id: 'JOB-899', name: 'Salary Increments', file: 'hike_letters_batch1.csv', date: 'Yesterday', records: 50, status: 'Failed', progress: 100, error: 'Column mismatch at Row 4' },
];

const SYSTEM_FIELDS = [
    { id: 'sys_1', name: 'Employee ID', required: true },
    { id: 'sys_2', name: 'First Name', required: true },
    { id: 'sys_3', name: 'Last Name', required: true },
    { id: 'sys_4', name: 'Email Address', required: true },
    { id: 'sys_5', name: 'Department', required: false },
    { id: 'sys_6', name: 'Designation', required: false },
];

const CSV_HEADERS = [
    'Emp_Ref_No', 'F_Name', 'L_Name', 'Work_Email', 'Dept_Code', 'Job_Role', 'DoJ'
];

export default function ImportExportPage() {
    const [activeTab, setActiveTab] = useState<'Import' | 'Export' | 'History'>('Import');
    const [wizardStep, setWizardStep] = useState(1); // 1: Upload, 2: Map, 3: Validate, 4: Done
    const [mappedFields, setMappedFields] = useState<Record<string, string>>({});

    const autoMap = () => {
        // Mock auto-mapping logic
        setMappedFields({
            sys_1: 'Emp_Ref_No',
            sys_2: 'F_Name',
            sys_3: 'L_Name',
            sys_4: 'Work_Email'
        });
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-500" />
                        Data Management
                    </h1>
                    <p className="text-silver-mist text-sm">Bulk import data and schedule export jobs.</p>
                </div>

                {activeTab === 'Import' && wizardStep === 2 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={autoMap}
                            className="text-sm font-bold text-indigo-500 hover:text-indigo-600 px-4 py-2"
                        >
                            Auto-Map Fields
                        </button>
                        <button
                            onClick={() => setWizardStep(3)}
                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Next: Validate <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['Import', 'Export', 'History'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                                    ${activeTab === tab
                                        ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        {activeTab === 'Import' && (
                            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                                {/* Wizard Progress */}
                                <div className="flex items-center justify-between mb-8 relative z-10 px-4">
                                    {[
                                        { s: 1, l: 'Upload' },
                                        { s: 2, l: 'Map' },
                                        { s: 3, l: 'Validate' },
                                        { s: 4, l: 'Finish' }
                                    ].map((step, idx, arr) => (
                                        <div key={step.s} className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                                ${wizardStep >= step.s
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
                                            `}>
                                                {step.s}
                                            </div>
                                            <span className={`text-sm font-bold ${wizardStep >= step.s ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                                {step.l}
                                            </span>
                                            {idx < arr.length - 1 && <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2"></div>}
                                        </div>
                                    ))}
                                </div>

                                {wizardStep === 1 && (
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer" onClick={() => setWizardStep(2)}>
                                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mb-4">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-1">Click to upload or drag and drop</h3>
                                        <p className="text-sm text-silver-mist text-center max-w-sm">
                                            Supported formats: CSV, XLSX, XLS. Maximum file size: 10MB.
                                        </p>
                                        <div className="mt-6 flex gap-3">
                                            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">Download Template</button>
                                        </div>
                                    </div>
                                )}

                                {wizardStep === 2 && (
                                    <div className="space-y-4">
                                        <div className="flex bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-cloud dark:border-slate-800 font-bold text-xs text-slate-500">
                                            <div className="w-1/2">System Field</div>
                                            <div className="w-1/2">CSV Header</div>
                                        </div>
                                        {SYSTEM_FIELDS.map(field => (
                                            <div key={field.id} className="flex items-center gap-3 py-2 border-b border-cloud dark:border-slate-800 last:border-0">
                                                <div className="w-1/2 flex items-center gap-2">
                                                    <span className="text-sm font-bold text-ink-black dark:text-pearl">{field.name}</span>
                                                    {field.required && <span className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 rounded font-bold">REQ</span>}
                                                </div>
                                                <div className="w-1/2">
                                                    <select
                                                        className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-indigo-500"
                                                        value={mappedFields[field.id] || ''}
                                                        onChange={(e) => setMappedFields({ ...mappedFields, [field.id]: e.target.value })}
                                                    >
                                                        <option value="">Select Column...</option>
                                                        {CSV_HEADERS.map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {wizardStep === 3 && (
                                    <div className="flex flex-col items-center justify-center p-10 text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-pulse">
                                            <Database className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">Validating Data...</h3>
                                        <p className="text-silver-mist mb-6">Checking 145 records for formatting errors and duplicates.</p>
                                        <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 2 }}
                                                className="h-full bg-emerald-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setWizardStep(4)}
                                            className="mt-8 text-sm font-bold text-indigo-500"
                                        >
                                            Simulate Success
                                        </button>
                                    </div>
                                )}

                                {wizardStep === 4 && (
                                    <div className="flex flex-col items-center justify-center p-10 text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">Import Successful!</h3>
                                        <p className="text-silver-mist mb-6">145 records have been added to the Employee Directory.</p>
                                        <button
                                            onClick={() => setWizardStep(1)}
                                            className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors"
                                        >
                                            Process Another File
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Export' && (
                            <div className="grid grid-cols-2 gap-3">
                                {['Employee Master', 'Payroll Register', 'Attendance Logs', 'Leave Balances'].map(report => (
                                    <div key={report} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                                                <FileSpreadsheet className="w-5 h-5" />
                                            </div>
                                            <button className="w-8 h-8 rounded-full border border-cloud dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all">
                                                <DownloadCloud className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-ink-black dark:text-pearl">{report}</h4>
                                        <p className="text-xs text-silver-mist mt-1">Full system dump in CSV/XLSX format.</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Job History */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2 shrink-0">
                            <History className="w-5 h-5 text-indigo-500" /> Job History
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {IMPORT_JOBS.map(job => (
                                <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-slate-400">{job.id}</span>
                                            {job.status === 'Processing' && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>}
                                        </div>
                                        <span className="text-[10px] text-slate-400">{job.date}</span>
                                    </div>

                                    <h4 className="text-sm font-bold text-ink-black dark:text-pearl mb-1">{job.name}</h4>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <FolderOpen className="w-3 h-3" /> {job.file}
                                    </div>

                                    {job.status === 'Processing' ? (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                                <span>Processing...</span>
                                                <span>{job.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${job.progress}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                                                ${job.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                            `}>
                                                {job.status}
                                            </span>
                                            {job.status === 'Failed' && (
                                                <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Error Details
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


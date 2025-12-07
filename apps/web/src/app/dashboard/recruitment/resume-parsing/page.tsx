"use client";

import React, { useState } from 'react';
import {
    FileText,
    UploadCloud,
    ScanLine,
    CheckCircle,
    BrainCircuit,
    AlertCircle
} from 'lucide-react';

export default function ResumeParsingPage() {
    const [isParsing, setIsParsing] = useState(false);

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ScanLine className="w-6 h-6 text-indigo-500" />
                        Resume Parsing
                    </h1>
                    <p className="text-slate-500 text-sm">AI-powered extraction of candidate data from CVs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 border-indigo-100 dark:border-indigo-900/50">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500">
                        <UploadCloud className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Drop resumes here</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Support for PDF, DOCX, and TXT files. Bulk upload supported.</p>
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors">
                        Select Files
                    </button>
                </div>

                {/* Parsing Status / Demo */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-emerald-500" /> Extraction Preview</h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                            <FileText className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">john_doe_cv.pdf</div>
                                            <div className="text-xs text-slate-500">Uploaded just now</div>
                                        </div>
                                    </div>
                                    <span className="text-emerald-500 font-bold text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Success</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="block text-slate-400 font-bold uppercase mb-1">Name</span>
                                        <span className="font-mono bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded">Johnathan Doe</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 font-bold uppercase mb-1">Email</span>
                                        <span className="font-mono bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded">j.doe@example.com</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-slate-400 font-bold uppercase mb-1">Skills</span>
                                        <div className="flex flex-wrap gap-1">
                                            {['React', 'Node.js', 'PostgreSQL', 'AWS'].map(s => (
                                                <span key={s} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-bold">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 opacity-60">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">sarah_smith_resume.docx</div>
                                            <div className="text-xs text-slate-500">Processing...</div>
                                        </div>
                                    </div>
                                    <span className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

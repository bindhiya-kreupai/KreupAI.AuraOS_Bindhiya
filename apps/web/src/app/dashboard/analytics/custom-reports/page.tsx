"use client";

import React, { useState, useEffect } from 'react';
import {
    PencilRuler,
    Database,
    Columns,
    Filter,
    ArrowRight,
    Save,
    Play
} from 'lucide-react';
import { CustomReportService } from '../services';

export default function CustomReportsPage() {
    const [step, setStep] = useState(1);
    const [selectedSource, setSelectedSource] = useState('');
    const [savedReports, setSavedReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await CustomReportService.getAllReports();
            setSavedReports(data);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    const handleCreateReport = async () => {
        try {
            await CustomReportService.createReport({
                reportName: 'New Custom Report',
                filters: [],
                columns: [],
                groupings: [],
                sortOrder: [],
            });
            await fetchReports();
        } catch {
                    }
    };

    const DATA_SOURCES = [
        { id: 'src-emp', name: 'Employees', desc: 'Core employee master data', count: '1,240 Records' },
        { id: 'src-att', name: 'Attendance', desc: 'Daily punch logs and shifts', count: '45,200 Records' },
        { id: 'src-pay', name: 'Payroll', desc: 'Salary and tax information', count: '3,600 Records' },
        { id: 'src-rec', name: 'Recruitment', desc: 'Candidates and applications', count: '850 Records' },
    ];

    return (
        <div className="p-6 space-y-8 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <PencilRuler className="w-8 h-8 text-indigo-500" />
                    Custom Report Builder
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Create bespoke reports by selecting data sources, columns, and filters.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {s}
                        </div>
                        <span className={`text-sm font-bold ${step >= s ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                            {s === 1 ? 'Data Source' : s === 2 ? 'Columns' : 'Filters & Preview'}
                        </span>
                        {s < 3 && <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2" />}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Controls */}
                <div className="lg:col-span-1 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-left duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-500" /> Select Data Source
                            </h2>
                            <div className="space-y-3">
                                {DATA_SOURCES.map((source) => (
                                    <div
                                        key={source.id}
                                        onClick={() => setSelectedSource(source.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSource === source.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'}`}
                                    >
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{source.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{source.desc}</div>
                                        <div className="text-xs font-mono text-indigo-600 mt-2 bg-indigo-100 dark:bg-indigo-500/20 w-fit px-2 py-0.5 rounded">
                                            {source.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-left duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Columns className="w-5 h-5 text-indigo-500" /> Select Columns
                            </h2>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 max-h-[400px] overflow-y-auto">
                                {['ID', 'Full Name', 'Department', 'Job Title', 'Join Date', 'Salary', 'Manager', 'Status', 'Location', 'Email'].map((col, i) => (
                                    <label key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked={i < 4} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{col}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-left duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Filter className="w-5 h-5 text-indigo-500" /> Apply Filters
                            </h2>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Department</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm">
                                        <option>All Departments</option>
                                        <option>Engineering</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm">
                                        <option>Active</option>
                                        <option>Terminated</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex-1"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={() => selectedSource && setStep(s => s + 1)}
                                disabled={!selectedSource}
                                className="px-4 py-2 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold hover:bg-indigo-700 flex-1 flex items-center justify-center gap-2"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 flex-1 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                <Play className="w-4 h-4" /> Run Report
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel: Preview Placeholder */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4 max-w-sm mx-auto p-6">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <Database className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Live Preview</h3>
                        <p className="text-sm text-slate-500">
                            Select a data source and configure columns to see a live preview of your report data here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

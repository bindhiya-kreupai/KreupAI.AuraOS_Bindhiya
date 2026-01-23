"use client";

import React, { useState } from 'react';
import {
    Upload,
    FileSpreadsheet,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Loader2,
    Table,
    ClipboardCheck,
    Download,
    Clock,
    FileText,
    ArrowLeft,
    X
} from 'lucide-react';

// --- MOCK DATA ---

const STEPS = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Map Columns', icon: Table },
    { id: 3, label: 'Validate', icon: ClipboardCheck },
    { id: 4, label: 'Import', icon: Download },
];

const COLUMN_MAPPINGS = [
    { source: 'emp_name', target: 'Full Name', sample: ['John Smith', 'Jane Doe', 'Bob Wilson'] },
    { source: 'emp_email', target: 'Email Address', sample: ['john@example.com', 'jane@example.com', 'bob@example.com'] },
    { source: 'department', target: 'Department', sample: ['Engineering', 'Marketing', 'Sales'] },
    { source: 'hire_date', target: 'Date of Joining', sample: ['2024-01-15', '2024-02-20', '2024-03-10'] },
    { source: 'salary', target: 'Base Salary', sample: ['75000', '68000', '72000'] },
    { source: 'manager', target: 'Reporting Manager', sample: ['Alice Brown', 'Alice Brown', 'Charlie Lee'] },
];

const TARGET_FIELDS = ['Full Name', 'Email Address', 'Department', 'Date of Joining', 'Base Salary', 'Reporting Manager', 'Employee ID', 'Phone Number', 'Location'];

const VALIDATION_RESULTS = {
    errors: [
        { row: 45, field: 'Email Address', message: 'Invalid email format: john@' },
        { row: 102, field: 'Date of Joining', message: 'Invalid date: 2024-13-45' },
        { row: 389, field: 'Base Salary', message: 'Non-numeric value: "N/A"' },
    ],
    warnings: [
        { row: 12, field: 'Reporting Manager', message: 'Manager not found in system: "Unknown User"' },
        { row: 256, field: 'Department', message: 'New department will be created: "AI Research"' },
    ],
    validRows: 495,
    totalRows: 500,
};

const IMPORT_HISTORY = [
    { id: 1, filename: 'employees_q4_2024.csv', date: '2025-01-10', rows: 150, status: 'completed' },
    { id: 2, filename: 'new_hires_jan.xlsx', date: '2025-01-08', rows: 25, status: 'completed' },
    { id: 3, filename: 'payroll_update.csv', date: '2025-01-05', rows: 500, status: 'completed' },
    { id: 4, filename: 'department_reorg.csv', date: '2024-12-20', rows: 80, status: 'failed' },
    { id: 5, filename: 'benefits_enrollment.xlsx', date: '2024-12-15', rows: 320, status: 'completed' },
];

export default function DataImportPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [importProgress, setImportProgress] = useState(0);
    const [mappings, setMappings] = useState(COLUMN_MAPPINGS.map(m => m.target));

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
            if (currentStep === 3) {
                // Simulate import progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                    }
                    setImportProgress(Math.min(100, Math.round(progress)));
                }, 300);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-celestial-indigo" />
                        Data Import Wizard
                    </h1>
                    <p className="text-silver-mist text-sm">Import employee data from CSV or Excel files.</p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === step.id
                                    ? 'bg-celestial-indigo text-white'
                                    : currentStep > step.id
                                        ? 'bg-aurora-green text-white'
                                        : 'bg-gray-100 dark:bg-deep-cosmos text-silver-mist'
                                    }`}>
                                    {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                                </div>
                                <span className={`text-sm font-medium hidden sm:inline ${currentStep === step.id ? 'text-celestial-indigo' : currentStep > step.id ? 'text-aurora-green' : 'text-silver-mist'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-3 ${currentStep > step.id ? 'bg-aurora-green' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm min-h-[320px]">
                {/* Step 1: Upload */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Upload File</h2>
                        <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-xl p-12 text-center hover:border-celestial-indigo/50 transition-colors cursor-pointer">
                            <Upload className="w-12 h-12 text-silver-mist mx-auto mb-4" />
                            <p className="text-ink-black dark:text-pearl font-medium">Drag and drop your file here</p>
                            <p className="text-silver-mist text-sm mt-1">or click to browse files</p>
                            <button className="mt-4 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                                Choose File
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-silver-mist">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Supported formats: CSV, XLSX, XLS (Max 10MB, 10,000 rows)</span>
                        </div>
                    </div>
                )}

                {/* Step 2: Map Columns */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Map Columns</h2>
                        <p className="text-sm text-silver-mist">Match your file columns to the system fields. Preview shows first 3 rows.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-cloud dark:border-nebula-purple/30">
                                        <th className="text-left py-2 px-3 font-semibold text-ink-black dark:text-pearl">Source Column</th>
                                        <th className="text-center py-2 px-3"></th>
                                        <th className="text-left py-2 px-3 font-semibold text-ink-black dark:text-pearl">Target Field</th>
                                        <th className="text-left py-2 px-3 font-semibold text-ink-black dark:text-pearl">Sample Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {COLUMN_MAPPINGS.map((mapping, idx) => (
                                        <tr key={mapping.source} className="border-b border-cloud dark:border-nebula-purple/30 last:border-0">
                                            <td className="py-2 px-3">
                                                <code className="text-xs bg-gray-100 dark:bg-deep-cosmos px-2 py-0.5 rounded font-mono text-ink-black dark:text-pearl">{mapping.source}</code>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <ArrowRight className="w-4 h-4 text-silver-mist mx-auto" />
                                            </td>
                                            <td className="py-2 px-3">
                                                <select
                                                    value={mappings[idx]}
                                                    onChange={(e) => {
                                                        const newMappings = [...mappings];
                                                        newMappings[idx] = e.target.value;
                                                        setMappings(newMappings);
                                                    }}
                                                    className="px-2 py-1 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded text-xs text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo/50"
                                                >
                                                    {TARGET_FIELDS.map(field => (
                                                        <option key={field} value={field}>{field}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 px-3">
                                                <div className="flex gap-1">
                                                    {mapping.sample.map((s, i) => (
                                                        <span key={i} className="text-[10px] bg-gray-100 dark:bg-deep-cosmos px-1.5 py-0.5 rounded text-silver-mist">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Step 3: Validate */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Validation Results</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg text-center">
                                <AlertCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                                <div className="text-lg font-bold text-rose-600">{VALIDATION_RESULTS.errors.length}</div>
                                <div className="text-xs text-rose-500">Errors</div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                                <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                <div className="text-lg font-bold text-amber-600">{VALIDATION_RESULTS.warnings.length}</div>
                                <div className="text-xs text-amber-500">Warnings</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                <div className="text-lg font-bold text-emerald-600">{VALIDATION_RESULTS.validRows}</div>
                                <div className="text-xs text-emerald-500">Valid Rows</div>
                            </div>
                        </div>
                        {VALIDATION_RESULTS.errors.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-rose-600 mb-2">Errors</h3>
                                <div className="space-y-1">
                                    {VALIDATION_RESULTS.errors.map((err, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg">
                                            <X className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                                            <span className="text-ink-black dark:text-pearl">
                                                <span className="font-medium">Row {err.row}, {err.field}:</span> {err.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {VALIDATION_RESULTS.warnings.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-amber-600 mb-2">Warnings</h3>
                                <div className="space-y-1">
                                    {VALIDATION_RESULTS.warnings.map((warn, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                            <span className="text-ink-black dark:text-pearl">
                                                <span className="font-medium">Row {warn.row}, {warn.field}:</span> {warn.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Import */}
                {currentStep === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Importing Data</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ink-black dark:text-pearl font-medium">
                                    {importProgress < 100 ? 'Processing records...' : 'Import Complete!'}
                                </span>
                                <span className="text-celestial-indigo font-bold">{importProgress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-celestial-indigo rounded-full transition-all duration-300"
                                    style={{ width: `${importProgress}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-silver-mist">
                                {importProgress < 100 ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing {VALIDATION_RESULTS.validRows} valid rows...</>
                                ) : (
                                    <><CheckCircle2 className="w-3.5 h-3.5 text-aurora-green" /> Successfully imported {VALIDATION_RESULTS.validRows} records</>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-ink-black dark:text-pearl hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentStep === 4}
                    className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {currentStep === 3 ? 'Start Import' : 'Next'}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Import History */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-celestial-indigo" />
                    Import History
                </h2>
                <div className="space-y-2">
                    {IMPORT_HISTORY.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/30 last:border-0">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="w-4 h-4 text-silver-mist" />
                                <div>
                                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{item.filename}</p>
                                    <p className="text-xs text-silver-mist">{item.date} - {item.rows} rows</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                }`}>
                                {item.status === 'completed' ? 'Completed' : 'Failed'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

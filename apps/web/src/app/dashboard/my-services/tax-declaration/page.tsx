"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    UploadCloud,
    Plus,
    X,
    Save,
    Loader2
} from 'lucide-react';
import { TaxService } from '../services';

export default function TaxDeclarationPage() {
    const [activeSection, setActiveSection] = useState('80C');
    const [fetching, setFetching] = useState(true);
    const [declarations, setDeclarations] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchDeclarations = async () => {
            try {
                const res = await TaxService.getDeclarations({ category: 'TAX_DECLARATION' });
                if (res?.success && Array.isArray(res.data)) {
                    setDeclarations(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch tax declarations:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchDeclarations();
    }, []);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await TaxService.submitDeclaration({
                category: 'TAX_DECLARATION',
                section: activeSection,
                status: 'SUBMITTED',
            });
            alert('Declaration submitted successfully!');
        } catch (err) {
            console.error('Failed to submit declaration:', err);
            alert('Failed to submit. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const uploadedDocs = declarations.filter(d => d.section === activeSection || d.category === 'TAX_DECLARATION');

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Tax Declarations
                    </h1>
                    <p className="text-slate-500 text-sm">Submit investment proofs for tax exemptions.</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs font-bold text-indigo-500 uppercase">Submission Deadline</div>
                    <div className="font-bold text-indigo-700 dark:text-indigo-300">Jan 31, 2026</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="space-y-2">
                    {['80C Investments', 'HRA Exemption', 'LTA / Travel', 'Medical Insurance', 'Other Income'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveSection(item.split(' ')[0])}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === item.split(' ')[0]
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Section 80C Declarations (Max Limit: 1.5L)</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Life Insurance Premium (LIC)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                                    <input type="number" className="w-full pl-8 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Public Provident Fund (PPF)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                                    <input type="number" className="w-full pl-8 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">ELSS Mutual Funds</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                                    <input type="number" className="w-full pl-8 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tuition Fees</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                                    <input type="number" className="w-full pl-8 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h4 className="font-bold text-slate-600 dark:text-slate-300">Upload Investment Proofs</h4>
                            <p className="text-xs text-slate-400 mt-1">Drag and drop or click to browse. Supported formats: PDF, JPG, PNG.</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-slate-500">Uploaded Documents</h4>
                            {uploadedDocs.length > 0 ? (
                                uploadedDocs.map((doc: any, i: number) => (
                                    <div key={doc.id || i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-indigo-500" />
                                            <span className="text-sm font-bold">{doc.name || doc.fileName || `Document_${i + 1}`}</span>
                                        </div>
                                        <button className="text-slate-400 hover:text-rose-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400">No documents uploaded yet for this section.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save & Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState, useEffect } from 'react';
import {
    LayoutTemplate,
    Download,
    Eye
} from 'lucide-react';
import { BudgetTemplateService } from '../../services';

export default function BudgetTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await BudgetTemplateService.getTemplates();
            if (result.length > 0) {
                setTemplates(result);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback mock data when no templates from API
    const displayTemplates = templates.length > 0 ? templates : [
        { id: '1', templateName: 'Standard Dept Budget', description: 'Basic OPEX and CAPEX planning sheet.', format: 'Excel' },
        { id: '2', templateName: 'Headcount Plan 2024', description: 'Role-based hiring projection template.', format: 'Google Sheets' },
        { id: '3', templateName: 'Event Cost Calculator', description: 'Detailed breakdown for offsites and conferences.', format: 'Excel' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-indigo-500" />
                        Budget Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Standardized templates for departmental forecasting.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500">Loading templates...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayTemplates.map((tmpl, i) => (
                        <div key={tmpl.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                                <LayoutTemplate className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{tmpl.templateName || tmpl.title}</h3>
                            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{tmpl.description || tmpl.desc}</p>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200">
                                    <Eye className="w-4 h-4" /> Preview
                                </button>
                                <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700">
                                    <Download className="w-4 h-4" /> Use
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

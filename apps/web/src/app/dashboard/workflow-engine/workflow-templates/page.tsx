'use client';

import React, { useState, useEffect } from 'react';
import { LayoutTemplate, ArrowRight, Loader2 } from 'lucide-react';
import { WorkflowService } from '../services';

const CATEGORY_COLORS: Record<string, string> = {
    MANUAL: 'bg-blue-500',
    EVENT: 'bg-emerald-500',
    SCHEDULED: 'bg-purple-500',
};

export default function WorkflowTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await WorkflowService.getWorkflows();
            const activeWorkflows = (data || []).filter((w: any) => w.isActive);
            setTemplates(activeWorkflows.map((wf: any) => ({
                id: wf.id,
                name: wf.name,
                category: wf.trigger || 'MANUAL',
                uses: wf._count?.instances || 0,
                color: CATEGORY_COLORS[wf.trigger] || 'bg-indigo-500',
                description: wf.description,
            })));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-indigo-500" />
                        Workflow Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Start faster with pre-configured workflow blueprints.</p>
                </div>
            </div>

            {templates.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 mb-2">No Templates Available</h3>
                    <p className="text-sm text-slate-400">Activate workflows to make them available as templates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-lg ${template.color} bg-opacity-10 flex items-center justify-center`}>
                                    <LayoutTemplate className={`w-5 h-5 text-current ${template.color.replace('bg-', 'text-')}`} />
                                </div>
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500 uppercase">{template.category}</span>
                            </div>

                            <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{template.description || 'Pre-built steps for approval, notification, and data recording.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400">{template.uses} executions</span>
                                <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
                                    Use Template <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


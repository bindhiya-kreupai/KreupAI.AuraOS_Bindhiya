'use client';

import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Copy, ArrowRight } from 'lucide-react';
import { WorkflowService } from '../services';

const TEMPLATES = [
    { id: 1, name: 'Leave Approval Standard', category: 'HR', uses: 1240, color: 'bg-pink-500' },
    { id: 2, name: 'Expense Reimbursement', category: 'Finance', uses: 890, color: 'bg-emerald-500' },
    { id: 3, name: 'New Hire Onboarding', category: 'HR', uses: 450, color: 'bg-blue-500' },
    { id: 4, name: 'IT Access Request', category: 'IT', uses: 2300, color: 'bg-indigo-500' },
    { id: 5, name: 'Document Sign-off', category: 'Legal', uses: 150, color: 'bg-slate-500' },
    { id: 6, name: 'Performance Review Cycle', category: 'HR', uses: 60, color: 'bg-purple-500' },
];

export default function WorkflowTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>(TEMPLATES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await WorkflowService.getWorkflows();
            const templateWorkflows = data.filter((w: any) => w.isTemplate === true);
            if (templateWorkflows.length > 0) {
                setTemplates(templateWorkflows);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-indigo-500" />
                        Workflow Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Start faster with pre-configured workflow blueprints.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-lg ${template.color} bg-opacity-10 flex items-center justify-center`}>
                                <LayoutTemplate className={`w-5 h-5 text-current ${template.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500 uppercase">{template.category}</span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">Pre-built steps for approval, notification, and data recording.</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400">{template.uses} installs</span>
                            <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
                                Use Template <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

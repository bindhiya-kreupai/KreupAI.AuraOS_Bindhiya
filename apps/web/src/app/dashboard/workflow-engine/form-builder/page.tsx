'use client';

import React, { useState, useEffect } from 'react';
import { FileText, GripVertical, Plus, BoxSelect } from 'lucide-react';
import { FormBuilderService } from '../services';

const FORM_FIELDS = [
    { id: 1, label: 'Employee Name', type: 'Text Input', required: true },
    { id: 2, label: 'Department', type: 'Dropdown', required: true },
    { id: 3, label: 'Start Date', type: 'Date Picker', required: true },
    { id: 4, label: 'Justification', type: 'Text Area', required: false },
];

export default function FormBuilderPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [formFields, setFormFields] = useState<any[]>(FORM_FIELDS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const data = await FormBuilderService.getForms();
            setForms(data);
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
                        <FileText className="w-6 h-6 text-pink-500" />
                        Form Builder
                    </h1>
                    <p className="text-slate-500 text-sm">Drag and drop to create custom data collection forms.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Preview
                    </button>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/20">
                        Save Form
                    </button>
                </div>
            </div>

            <div className="flex gap-6 h-[600px]">
                {/* Field Library */}
                <div className="w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Fields</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {['Text', 'Number', 'Date', 'Email', 'Select', 'Checkbox', 'File', 'Signature'].map(field => (
                            <div key={field} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-center hover:bg-pink-50 dark:hover:bg-pink-900/10 cursor-grab transition-colors">
                                {field}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto min-h-[500px]">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Travel Request Form</h2>
                            <p className="text-slate-400">Please fill out details for business travel.</p>
                        </div>

                        <div className="space-y-4">
                            {FORM_FIELDS.map(field => (
                                <div key={field.id} className="group relative p-4 border border-transparent hover:border-pink-200 dark:hover:border-pink-900 rounded-lg transition-colors cursor-move">
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 cursor-grab text-slate-400">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="w-full h-10 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 pointer-events-none" />
                                </div>
                            ))}

                            <div className="h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 gap-2">
                                <Plus className="w-5 h-5" /> Drop fields here
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

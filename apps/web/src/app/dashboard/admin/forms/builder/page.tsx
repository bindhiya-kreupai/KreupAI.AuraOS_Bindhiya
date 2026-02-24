"use client";

import React from 'react';
import {
    LayoutTemplate,
    Type,
    CheckSquare,
    Calendar,
    Upload,
    Save,
    Eye,
    Move
} from 'lucide-react';

export default function FormBuilderPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-pink-500" />
                        Form Builder
                    </h1>
                    <p className="text-slate-500 text-sm">Design custom forms for surveys, data collection, and requests.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-pink-500/20 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Publish Form
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row h-full min-h-0 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Field Palette */}
                <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 overflow-y-auto">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Form Elements</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { name: 'Text Input', icon: <Type className="w-4 h-4" /> },
                                { name: 'Checkbox', icon: <CheckSquare className="w-4 h-4" /> },
                                { name: 'Date Picker', icon: <Calendar className="w-4 h-4" /> },
                                { name: 'File Upload', icon: <Upload className="w-4 h-4" /> },
                            ].map((e, i) => (
                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold text-center flex flex-col items-center gap-2 cursor-grab hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    {e.icon} {e.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/10 rounded-xl text-xs text-pink-700 dark:text-pink-300">
                        Drag and drop elements onto the canvas to add them to your form.
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto p-10 flex justify-center bg-slate-100 dark:bg-black/20">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl min-h-[600px] shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-800 relative">
                        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 pb-4 mb-6">
                            <input type="text" defaultValue="Employee Feedback Survey 2025" className="text-2xl font-bold bg-transparent w-full outline-none border-none placeholder-slate-300" />
                            <input type="text" defaultValue="We value your opinion. Please help us improve." className="text-sm text-slate-500 bg-transparent w-full outline-none border-none mt-1" />
                        </div>

                        <div className="space-y-4">
                            {/* Form Item 1 */}
                            <div className="group relative p-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-move">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-move text-slate-400">
                                    <Move className="w-4 h-4" />
                                </div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Which department do you belong to? <span className="text-rose-500">*</span>
                                </label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm">
                                    <option>Select Department...</option>
                                </select>
                            </div>

                            {/* Form Item 2 */}
                            <div className="group relative p-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-move">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-move text-slate-400">
                                    <Move className="w-4 h-4" />
                                </div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    How would you rate the new cafeteria menu?
                                </label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="r1" /> Good</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="r1" /> Average</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="r1" /> Poor</label>
                                </div>
                            </div>

                            {/* Form Item 3 */}
                            <div className="group relative p-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-move">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-move text-slate-400">
                                    <Move className="w-4 h-4" />
                                </div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Any additional comments?
                                </label>
                                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm" rows={3}></textarea>
                            </div>

                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex items-center justify-center text-slate-400 text-sm font-bold bg-slate-50/50 dark:bg-slate-800/10">
                                Drop new fields here
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState } from 'react';
import {
    Globe,
    Palette,
    Clock,
    Layout,
    Image,
    Save,
    CheckCircle2,
    Type,
    Languages
} from 'lucide-react';

export default function LocalizationPage() {
    const [themeColor, setThemeColor] = useState('indigo');
    const [logo, setLogo] = useState<string | null>(null);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Localization & Branding
                    </h1>
                    <p className="text-slate-500 text-sm">Customize the look, feel, and regional settings.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {/* Branding Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-500" /> Branding
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Primary Color</label>
                            <div className="flex gap-3 mt-2">
                                {['indigo', 'emerald', 'rose', 'blue', 'violet', 'orange'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setThemeColor(color)}
                                        className={`w-10 h-10 rounded-full bg-${color}-500 flex items-center justify-center transition-transform hover:scale-110 ring-offset-2 dark:ring-offset-slate-900 ${themeColor === color ? 'ring-2 ring-slate-400' : ''}`}
                                    >
                                        {themeColor === color && <CheckCircle2 className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Company Logo</label>
                            <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Image className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Upload Logo</span>
                                <span className="text-xs text-slate-400 max-w-[200px] text-center mt-1">PNG or SVG. Max 2MB. Transparent background recommended.</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Font Family</label>
                            <select className="w-full mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none">
                                <option>Inter (Default)</option>
                                <option>Roboto</option>
                                <option>Open Sans</option>
                                <option>Lato</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Languages className="w-5 h-5 text-indigo-500" /> Regional
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Default Language</label>
                                <select className="w-full mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none">
                                    <option>English (US)</option>
                                    <option>English (UK)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>Arabic</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Date Format</label>
                                <select className="w-full mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none">
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Timezone</label>
                            <div className="flex items-center gap-2 mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <select className="bg-transparent w-full text-sm outline-none">
                                    <option>(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                                    <option>(UTC+04:00) Dubai, Abu Dhabi</option>
                                    <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                                    <option>(UTC+00:00) London</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-300 mb-1">Preview</h4>
                        <div className="flex gap-4 items-center mt-3">
                            <button className={`px-4 py-2 bg-${themeColor}-500 text-white rounded-lg text-sm font-bold shadow-md`}>Primary Button</button>
                            <div className={`text-${themeColor}-500 font-bold text-sm underline`}>Text Link</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Regular body text.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

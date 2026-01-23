"use client";

import React, { useState } from 'react';
import {
    Palette,
    Upload,
    Image,
    RotateCcw,
    Save,
    Monitor,
    Sidebar,
    Eye,
    CheckCircle2,
    FileImage
} from 'lucide-react';

// --- MOCK DATA ---

const DEFAULT_COLORS = {
    primary: '#4F46E5',
    secondary: '#10B981',
    accent: '#F59E0B',
};

export default function BrandingPage() {
    const [colors, setColors] = useState(DEFAULT_COLORS);
    const [logoName, setLogoName] = useState('company-logo.png');
    const [faviconName, setFaviconName] = useState('favicon.ico');
    const [saved, setSaved] = useState(false);

    const handleColorChange = (key: string, value: string) => {
        setColors(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setColors(DEFAULT_COLORS);
        setSaved(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Palette className="w-6 h-6 text-celestial-indigo" />
                        Branding & White-labeling
                    </h1>
                    <p className="text-silver-mist text-sm">Customize the look and feel of your application.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 text-ink-black dark:text-pearl"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2"
                    >
                        {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Settings */}
                <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5 text-celestial-indigo" />
                            Logo
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-deep-cosmos rounded-xl border-2 border-dashed border-cloud dark:border-nebula-purple/30 flex items-center justify-center">
                                <FileImage className="w-10 h-10 text-silver-mist" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-ink-black dark:text-pearl font-medium">{logoName}</p>
                                <p className="text-xs text-silver-mist mt-1">Recommended: 200x50px, PNG or SVG</p>
                                <button className="mt-3 px-3 py-1.5 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-xs font-medium text-ink-black dark:text-pearl hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors flex items-center gap-1.5">
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload New Logo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-celestial-indigo" />
                            Brand Colors
                        </h2>
                        <div className="space-y-4">
                            {[
                                { key: 'primary', label: 'Primary Color' },
                                { key: 'secondary', label: 'Secondary Color' },
                                { key: 'accent', label: 'Accent Color' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg border border-cloud dark:border-nebula-purple/30 shadow-sm"
                                            style={{ backgroundColor: colors[item.key as keyof typeof colors] }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-ink-black dark:text-pearl">{item.label}</p>
                                            <p className="text-xs text-silver-mist font-mono">{colors[item.key as keyof typeof colors]}</p>
                                        </div>
                                    </div>
                                    <input
                                        type="color"
                                        value={colors[item.key as keyof typeof colors]}
                                        onChange={(e) => handleColorChange(item.key, e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favicon Upload */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-celestial-indigo" />
                            Favicon
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-deep-cosmos rounded-lg border-2 border-dashed border-cloud dark:border-nebula-purple/30 flex items-center justify-center">
                                <FileImage className="w-6 h-6 text-silver-mist" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-ink-black dark:text-pearl font-medium">{faviconName}</p>
                                <p className="text-xs text-silver-mist mt-1">Recommended: 32x32px, ICO or PNG</p>
                                <button className="mt-3 px-3 py-1.5 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-xs font-medium text-ink-black dark:text-pearl hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors flex items-center gap-1.5">
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload Favicon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-celestial-indigo" />
                        Live Preview
                    </h2>
                    <div className="border border-cloud dark:border-nebula-purple/30 rounded-xl overflow-hidden">
                        {/* Preview Header */}
                        <div className="h-12 flex items-center px-4 gap-3" style={{ backgroundColor: colors.primary }}>
                            <div className="w-6 h-6 bg-white/30 rounded" />
                            <span className="text-white text-sm font-bold">AuraOS</span>
                            <div className="flex-1" />
                            <div className="w-20 h-5 bg-white/20 rounded" />
                        </div>
                        <div className="flex">
                            {/* Preview Sidebar */}
                            <div className="w-48 bg-gray-50 dark:bg-deep-cosmos p-3 space-y-2 border-r border-cloud dark:border-nebula-purple/30 min-h-[280px]">
                                {['Dashboard', 'Employees', 'Attendance', 'Payroll', 'Reports'].map((item, i) => (
                                    <div
                                        key={item}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? 'text-white' : 'text-ink-black dark:text-pearl opacity-70'}`}
                                        style={i === 0 ? { backgroundColor: colors.primary } : {}}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                            {/* Preview Content */}
                            <div className="flex-1 p-4 space-y-3">
                                <div className="flex gap-2">
                                    <div className="h-16 flex-1 rounded-lg opacity-20" style={{ backgroundColor: colors.primary }} />
                                    <div className="h-16 flex-1 rounded-lg opacity-20" style={{ backgroundColor: colors.secondary }} />
                                    <div className="h-16 flex-1 rounded-lg opacity-20" style={{ backgroundColor: colors.accent }} />
                                </div>
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="mt-4 flex gap-2">
                                    <div className="px-3 py-1.5 rounded text-xs text-white font-medium" style={{ backgroundColor: colors.primary }}>Primary</div>
                                    <div className="px-3 py-1.5 rounded text-xs text-white font-medium" style={{ backgroundColor: colors.secondary }}>Secondary</div>
                                    <div className="px-3 py-1.5 rounded text-xs text-white font-medium" style={{ backgroundColor: colors.accent }}>Accent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-silver-mist mt-3 text-center">Preview updates as you change colors above</p>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import {
    Languages,
    Plus,
    CheckCircle2,
    Download
} from 'lucide-react';
import { LanguageService, TranslationService } from '../services';

export default function MultiLingualPage() {
    const [languages, setLanguages] = useState<any[]>([]);
    const [translations, setTranslations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [languagesData, translationsData] = await Promise.all([
                LanguageService.getAllLanguages(),
                TranslationService.getAllTranslations()
            ]);
            if (languagesData.length > 0) {
                setLanguages(languagesData);
            }
            if (translationsData.length > 0) {
                setTranslations(translationsData);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Languages className="w-6 h-6 text-indigo-500" />
                        Multi-lingual Support
                    </h1>
                    <p className="text-slate-500 text-sm">Manage language packs and translations.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Add Language
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { lang: 'English (US)', code: 'en-US', status: 'Default', completeness: 100 },
                    { lang: 'Spanish (ES)', code: 'es-ES', status: 'Active', completeness: 98 },
                    { lang: 'French (FR)', code: 'fr-FR', status: 'Active', completeness: 92 },
                    { lang: 'German (DE)', code: 'de-DE', status: 'Draft', completeness: 45 },
                    { lang: 'Japanese (JP)', code: 'ja-JP', status: 'Draft', completeness: 10 },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{item.lang}</h3>
                                <div className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                                    {item.code}
                                </div>
                            </div>
                            {item.status === 'Default' ? (
                                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Primary</span>
                            ) : (
                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                            <div
                                className={`h-full ${item.completeness === 100 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                                style={{ width: `${item.completeness}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-slate-500 mb-6 flex justify-between">
                            <span>Translation Progress</span>
                            <span className="font-bold">{item.completeness}%</span>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Edit Keys
                            </button>
                            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

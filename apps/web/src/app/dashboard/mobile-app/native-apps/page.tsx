"use client";

import React from 'react';
import {
    Smartphone,
    Download,
    UploadCloud,
    QrCode,
    ShieldCheck,
    GitBranch,
    Calendar,
    Apple,
    Play
} from 'lucide-react';

export default function NativeAppsPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-indigo-500" />
                        Native Apps
                    </h1>
                    <p className="text-slate-500 text-sm">Manage iOS and Android build versions and deployments.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Release New Build
                </button>
            </div>

            {/* Version Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* iOS Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-lg">
                                <Apple className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-emerald-600">Live</div>
                                <div className="text-2xl font-bold">v2.4.1</div>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-1">AuraOS for iOS</h3>
                        <p className="text-slate-500 text-sm mb-6">Last updated: Mar 15, 2024</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Downloads</div>
                                <div className="font-bold flex items-center gap-1">
                                    <Download className="w-3 h-3 text-slate-400" /> 12.5k
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Rating</div>
                                <div className="font-bold flex items-center gap-1">
                                    ⭐ 4.8
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                                View in Store
                            </button>
                            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                                <QrCode className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Android Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                                <Play className="w-6 h-6 fill-current" />
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-emerald-600">Live</div>
                                <div className="text-2xl font-bold">v2.4.0</div>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-1">AuraOS for Android</h3>
                        <p className="text-slate-500 text-sm mb-6">Last updated: Mar 10, 2024</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Downloads</div>
                                <div className="font-bold flex items-center gap-1">
                                    <Download className="w-3 h-3 text-slate-400" /> 18.2k
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Rating</div>
                                <div className="font-bold flex items-center gap-1">
                                    ⭐ 4.6
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                                View in Store
                            </button>
                            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                                <QrCode className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Release History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Release History</h3>
                    <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { v: 'v2.4.1', platform: 'iOS', date: 'Mar 15, 2024', author: 'Sabujohn Bosco', type: 'Patch', desc: 'Fixed login timeout issue on iOS 17.' },
                        { v: 'v2.4.0', platform: 'Android', date: 'Mar 10, 2024', author: 'Sarah Connor', type: 'Minor', desc: 'Added biometric login support and improved offline syncing.' },
                        { v: 'v2.4.0', platform: 'iOS', date: 'Mar 10, 2024', author: 'Sarah Connor', type: 'Minor', desc: 'Added FaceID support and expense claims module.' },
                        { v: 'v2.3.5', platform: 'Both', date: 'Feb 28, 2024', author: 'Mike Ross', type: 'Patch', desc: 'UI improvements for dark mode.' },
                    ].map((release, i) => (
                        <div key={i} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{release.v}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${release.platform === 'iOS' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : (release.platform === 'Android' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400')}`}>
                                        {release.platform}
                                    </span>
                                    <span className="text-xs text-slate-400">• {release.type}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{release.desc}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {release.date}</div>
                                <div>by {release.author}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

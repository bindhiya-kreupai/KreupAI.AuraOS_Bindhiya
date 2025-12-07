"use client";

import React, { useState } from 'react';
import {
    Bell,
    Send,
    History,
    Users,
    Smartphone,
    Image as ImageIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3
} from 'lucide-react';

export default function PushNotificationsPage() {
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('All Users');

    const history = [
        { id: 1, title: 'Server Maintenance Alert', message: 'System will be down for 30 mins tonight at 2 AM.', audience: 'All Users', sentAt: 'Mar 15, 10:00 AM', openRate: '68%', status: 'Sent' },
        { id: 2, title: 'New Benefits Policy', message: 'Check out the new health insurance options available.', audience: 'All Users', sentAt: 'Mar 12, 09:30 AM', openRate: '45%', status: 'Sent' },
        { id: 3, title: 'Sales Team Meeting', message: 'Urgent meeting in Conference Room B.', audience: 'Sales Dept', sentAt: 'Mar 10, 02:15 PM', openRate: '92%', status: 'Sent' },
        { id: 4, title: 'Holiday Announcement', message: 'Office will be closed on Friday for Good Friday.', audience: 'All Users', sentAt: 'Mar 08, 11:00 AM', openRate: '88%', status: 'Sent' },
        { id: 5, title: 'Check-in Reminder', message: 'Don\'t forget to mark your attendance.', audience: 'Remote Employees', sentAt: 'Mar 05, 08:50 AM', openRate: '35%', status: 'Failed' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-500" />
                        Push Notifications
                    </h1>
                    <p className="text-slate-500 text-sm">Send instant alerts and announcements to mobile app users.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'compose'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <Send className="w-4 h-4" />
                    Compose
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <History className="w-4 h-4" />
                    History & Analytics
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    {activeTab === 'compose' ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-6">New Notification</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['All Users', 'Department', 'Location', 'Specific Users'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setAudience(opt)}
                                                className={`px-4 py-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-2 transition-all ${audience === opt
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                    }`}
                                            >
                                                <Users className={`w-5 h-5 ${audience === opt ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {audience !== 'All Users' && (
                                        <div className="mt-2">
                                            <select className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                                <option>Select Department...</option>
                                                <option>Sales</option>
                                                <option>Engineering</option>
                                                <option>HR</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notification Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Important Announcement"
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Body</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Type your message here..."
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    ></textarea>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Supports emojis 🎉</span>
                                        <span>{message.length}/140 chars</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rich Media (Optional)</label>
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">Click to upload image</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" /> Send Now
                                    </button>
                                    <button className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                        <Clock className="w-4 h-4" /> Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Content</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Audience</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Sent At</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Engagement</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {history.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.title}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.message}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        {item.audience}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{item.sentAt}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="w-4 h-4 text-slate-400" />
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.openRate}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.status === 'Sent' ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sent</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                                                <span className="text-rose-600 dark:text-rose-400 font-medium">Failed</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Preview Sidebar */}
                <div className="hidden lg:block">
                    <div className="sticky top-6">
                        <div className="bg-slate-900 rounded-[3rem] p-4 border-[8px] border-slate-950 shadow-2xl max-w-xs mx-auto relative aspect-[9/19]">
                            {/* Phone Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>

                            {/* Screen Content */}
                            <div className="bg-slate-100 w-full h-full rounded-[2rem] overflow-hidden relative flex flex-col pt-10">
                                <div className="px-4 pb-2 border-b border-slate-200 bg-white z-10">
                                    <div className="text-xs font-bold text-slate-400 mb-1">AuraOS • Now</div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                                            <Bell className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{title || 'Notification Title'}</div>
                                            <div className="text-xs text-slate-600 leading-relaxed mt-0.5">
                                                {message || 'Your notification message will appear here exactly as users see it.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background illustration */}
                                <div className="flex-1 bg-slate-100 flex items-center justify-center opacity-10">
                                    <Smartphone className="w-32 h-32 text-slate-900" />
                                </div>
                            </div>

                            {/* Home Indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-700 rounded-full opacity-50"></div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-6 font-medium uppercase tracking-wide">Live Lock Screen Preview</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

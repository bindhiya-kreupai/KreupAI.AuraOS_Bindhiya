"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell,
    Mail,
    AlertTriangle,
    CheckCircle2,
    Send
} from 'lucide-react';
import { BenefitSettingsService } from '../services';

export default function NotificationPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await BenefitSettingsService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching benefit settings:', error);
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
                        <Bell className="w-6 h-6 text-indigo-500" />
                        Benefit Notifications
                    </h1>
                    <p className="text-slate-500 text-sm">Send automated alerts and reminders to employees.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <Send className="w-4 h-4" /> Create New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pb-20">
                {/* Active Campaigns */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 text-sm uppercase mb-2">Active Campaigns</h3>

                    {[
                        { title: 'Open Enrollment Reminder', status: 'Sending', sent: 340, total: 450, type: 'Urgent' },
                        { title: 'New Dental Plan Info', status: 'Scheduled', sent: 0, total: 450, type: 'Info' },
                    ].map((camp, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                            {camp.status === 'Sending' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg">{camp.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${camp.type === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {camp.type}
                                        </span>
                                        <span className="text-xs text-slate-400">• Email & Push</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${camp.status === 'Sending' ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                                    {camp.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400">
                                    <span>Progress</span>
                                    <span>{Math.round((camp.sent / camp.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${(camp.sent / camp.total) * 100}%` }}
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                    ></div>
                                </div>
                                <div className="text-xs text-slate-400 text-right">
                                    {camp.sent} / {camp.total} Recipients
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Templates */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 text-sm uppercase mb-2">Quick Templates</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { name: 'Enrollment Closing Soon', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
                            { name: 'Plan Change Confirmation', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
                            { name: 'ID Card Digital Copy', icon: Mail, color: 'text-blue-500 bg-blue-50' },
                        ].map((temp, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors group">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${temp.color} dark:bg-slate-800`}>
                                    <temp.icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">{temp.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

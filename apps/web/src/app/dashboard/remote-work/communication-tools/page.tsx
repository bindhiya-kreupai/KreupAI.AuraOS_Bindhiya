"use client";

import React from 'react';
import {
    MessageSquare,
    Video,
    Phone,
    Zap,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { useRemoteWork } from '../hooks/useRemoteWork';

export default function CommunicationToolsPage() {
    const { employees, loading, error } = useRemoteWork();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const totalUsers = employees.length;
    const enrolledUsers = employees.filter(e => e.status === 'active').length;

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Communication Tools
                    </h1>
                    <p className="text-slate-500 text-sm">Status and provisioning of collaboration platforms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Slack', category: 'Messaging', status: 'Operational', uptime: '99.9%', users: `${enrolledUsers}/${totalUsers}`, icon: MessageSquare, color: 'bg-purple-100 text-purple-600' },
                    { name: 'Zoom', category: 'Video Conf', status: 'Operational', uptime: '99.5%', users: `${enrolledUsers}/${totalUsers}`, icon: Video, color: 'bg-blue-100 text-blue-600' },
                    { name: 'Notion', category: 'Documentation', status: 'Degraded', uptime: '98.0%', users: `${totalUsers}/${totalUsers}`, icon: Zap, color: 'bg-slate-100 text-slate-800' },
                    { name: 'Google Meet', category: 'Video Conf', status: 'Operational', uptime: '99.9%', users: 'Fallback', icon: Video, color: 'bg-emerald-100 text-emerald-600' },
                    { name: 'Jira', category: 'Proj Mgmt', status: 'Operational', uptime: '99.9%', users: `${Math.round(totalUsers * 0.7)}/${totalUsers}`, icon: CheckCircle, color: 'bg-indigo-100 text-indigo-600' },
                ].map((tool, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${tool.status === 'Operational' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                tool.status === 'Degraded' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 text-slate-500'
                                }`}>
                                {tool.status}
                            </span>
                        </div>

                        <h3 className="font-bold text-xl mb-1">{tool.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">{tool.category}</p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Uptime</span>
                                <span className="font-mono text-sm font-bold">{tool.uptime}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Provisions</span>
                                <span className="font-mono text-sm font-bold">{tool.users}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-white/10 rounded-full">
                        <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">IT Helpdesk Support</h3>
                        <p className="text-slate-300 text-sm">Having trouble? Contact support instantly.</p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors">
                    Chat with IT
                </button>
            </div>
        </div>
    );
}

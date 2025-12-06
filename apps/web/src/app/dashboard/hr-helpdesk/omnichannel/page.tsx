"use client";

import React, { useState } from 'react';
import {
    Share2,
    Mail,
    Phone,
    Slack,
    MessageCircle
} from 'lucide-react';

export default function OmnichannelPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-indigo-500" />
                        Omnichannel Integration
                    </h1>
                    <p className="text-slate-500 text-sm">Manage support channels and integrations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Email Support', icon: Mail, status: 'Connected', desc: 'support@ura-os.com', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
                    { name: 'Slack Integration', icon: Slack, status: 'Connected', desc: '#hr-helpdesk channel', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { name: 'Microsoft Teams', icon: MessageCircle, status: 'Not Configured', desc: 'Bot integration', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { name: 'Phone System', icon: Phone, status: 'Connected', desc: '+1 (800) 123-4567', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                ].map((chan, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${chan.bg} ${chan.color}`}>
                                <chan.icon className="w-6 h-6" />
                            </div>
                            <div className={`w-3 h-3 rounded-full ${chan.status === 'Connected' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        </div>
                        <h3 className="font-bold text-lg">{chan.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">{chan.desc}</p>

                        <button className={`mt-auto py-2 rounded-lg text-sm font-bold border ${chan.status === 'Connected' ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                            }`}>
                            {chan.status === 'Connected' ? 'Manage Settings' : 'Connect Now'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

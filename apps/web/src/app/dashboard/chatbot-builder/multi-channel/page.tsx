"use client";

import React, { useState, useEffect } from 'react';
import {
    Share2,
    MessageCircle,
    Globe,
    Slack,
    MessagesSquare,
    ToggleRight
} from 'lucide-react';
import { ChannelService } from '../services';

export default function MultiChannelPage() {
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ChannelService.getAllChannels();
            if (result.length > 0) {
                setChannels(result);
            }
        } catch {
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
                        <Share2 className="w-6 h-6 text-indigo-500" />
                        Multi-Channel Support
                    </h1>
                    <p className="text-slate-500 text-sm">Deploy your bot across various platforms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Web Widget', icon: Globe, status: 'Active', color: 'text-indigo-500', desc: 'Embedded chat on employee portal' },
                    { name: 'Slack', icon: Slack, status: 'Active', color: 'text-rose-500', desc: 'Direct messages and channel mentions' },
                    { name: 'Microsoft Teams', icon: MessagesSquare, status: 'Connect', color: 'text-blue-600', desc: 'Teams app integration' },
                    { name: 'WhatsApp', icon: MessageCircle, status: 'Connect', color: 'text-emerald-500', desc: 'Enterprise business API' },
                ].map((channel, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-48">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${channel.color}`}>
                                <channel.icon className="w-8 h-8" />
                            </div>
                            <div className={`flex items-center gap-2 text-sm font-bold ${channel.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {channel.status === 'Active' ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleRight className="w-6 h-6 text-slate-300" />}
                                {channel.status}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg">{channel.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{channel.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mt-6">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Web Widget Installation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Copy and paste this snippet into your intranet's HTML header.
                </p>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    &lt;script src="https://cdn.auraos.ai/widget/v2.js" data-id="bot_12345"&gt;&lt;/script&gt;
                </div>
            </div>
        </div>
    );
}

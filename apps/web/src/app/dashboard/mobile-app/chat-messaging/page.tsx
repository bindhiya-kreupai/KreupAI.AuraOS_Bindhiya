"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Settings,
    Shield,
    Trash2,
    FileText,
    Image as ImageIcon,
    Users,
    Search
} from 'lucide-react';
import { ChatService } from '../services';

export default function ChatMessagingPage() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ChatService.getAllConversations();
            if (result.length > 0) {
                setConversations(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Chat & Messaging
                    </h1>
                    <p className="text-slate-500 text-sm">Manage enterprise chat settings and data retention policies.</p>
                </div>
                <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" /> Compliance Audit
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Retention Policy */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-rose-500" /> Data Retention
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Message History</label>
                            <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                <option>Keep Forever</option>
                                <option>1 Year</option>
                                <option>6 Months</option>
                                <option>30 Days</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-2">Messages older than this will be permanently deleted.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">File Attachments</label>
                            <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                <option>6 Months</option>
                                <option>3 Months</option>
                                <option>30 Days</option>
                            </select>
                        </div>

                        <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <label className="flex items-center justify-between text-sm font-bold text-rose-700 dark:text-rose-400 mb-1">
                                <span>Allow Message Deletion</span>
                                <input type="checkbox" className="accent-rose-500 w-4 h-4" defaultChecked />
                            </label>
                            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">If disabled, users cannot delete sent messages.</p>
                        </div>
                    </div>
                </div>

                {/* File & Media Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> File Sharing
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="w-5 h-5 text-slate-500" />
                                <span className="text-sm font-medium">Images</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-slate-500" />
                                <span className="text-sm font-medium">Documents (PDF, Docx)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                            <label className="block text-sm font-medium mb-2">Max File Size</label>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>5MB</span>
                                <input type="range" className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600" />
                                <span>100MB</span>
                            </div>
                            <div className="text-center font-bold text-indigo-600 mt-1">25 MB</div>
                        </div>
                    </div>
                </div>

                {/* Group Chat Controls */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-500" /> Group Chats
                    </h2>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between text-sm font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                            <span>Allow Broadcast Groups</span>
                            <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-indigo-600 border-indigo-600 text-white">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </label>
                        <label className="flex items-center justify-between text-sm font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                            <span>Allow Private Groups</span>
                            <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-indigo-600 border-indigo-600 text-white">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </label>
                        <label className="flex items-center justify-between text-sm font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                            <span>Users can create groups</span>
                            <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"></div>
                        </label>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Monitoring</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search message logs..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

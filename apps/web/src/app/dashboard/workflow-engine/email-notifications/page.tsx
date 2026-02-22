'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Edit, Send, Loader2 } from 'lucide-react';
import { WorkflowSettingsService, WorkflowService } from '../services';

export default function EmailNotificationsPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [, workflows] = await Promise.all([
                WorkflowSettingsService.getSettings(),
                WorkflowService.getWorkflows(),
            ]);
            const notificationTemplates = (workflows || []).map((wf: any) => ({
                id: wf.id,
                name: wf.name,
                subject: `Notification: ${wf.name}`,
                type: wf.trigger || 'System',
                isActive: wf.isActive,
            }));
            setTemplates(notificationTemplates);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="w-6 h-6 text-purple-500" />
                        Email Notifications
                    </h1>
                    <p className="text-slate-500 text-sm">Customize email templates and notification triggers.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20">
                    + New Template
                </button>
            </div>

            {templates.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 mb-2">No Notification Templates</h3>
                    <p className="text-sm text-slate-400">Create workflows to generate notification templates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{template.type}</span>
                            </div>

                            <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                            <p className="text-xs text-slate-400 font-mono mb-4 truncate bg-slate-50 dark:bg-slate-950 p-2 rounded border border-dashed border-slate-200 dark:border-slate-800">
                                Subject: {template.subject}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div className="text-xs text-slate-500">
                                    Status: <span className={`font-bold ${template.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>{template.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Send className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


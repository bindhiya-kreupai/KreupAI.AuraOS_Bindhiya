"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../services';
import type { EmailTemplate } from '../types';
import {
    Mail,
    Plus,
    Edit3,
    Eye,
    MessageSquare,
    Send
} from 'lucide-react';

type EmailTemplateCard = EmailTemplate & {
    usage: number;
    label: string;
};

const EMAIL_TEMPLATE_LABELS: Record<EmailTemplate['type'], string> = {
    application_received: 'Application Received',
    interview_scheduled: 'Interview Scheduled',
    offer_sent: 'Offer Sent',
    rejection: 'Rejection',
    other: 'Other',
};

function mapEmailTemplates(templates: EmailTemplate[]): EmailTemplateCard[] {
    return templates.map((template) => ({
        ...template,
        usage: 0,
        label: EMAIL_TEMPLATE_LABELS[template.type] || EMAIL_TEMPLATE_LABELS.other,
    }));
}

export default function RecruitmentEmailsPage() {
    const [templates, setTemplates] = useState<EmailTemplateCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await RecruitmentSettingsService.getSettings();
            setTemplates(mapEmailTemplates(data?.emailTemplates || []));
        } catch (error: any) {
            console.error('Error:', error);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="w-6 h-6 text-indigo-500" />
                        Recruitment Emails
                    </h1>
                    <p className="text-slate-500 text-sm">Automated communication templates for candidates.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pb-20">
                {!loading && templates.length === 0 && (
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No email templates configured</p>
                        <p className="mt-2 text-sm text-slate-500">Recruitment email templates will appear here once they are added to recruitment settings.</p>
                    </div>
                )}

                {templates.map(tpl => (
                    <div key={tpl.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">{tpl.name}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{tpl.label}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Send className="w-3 h-3" />
                                {tpl.usage} sent
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Subject</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">{tpl.subject}</div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800">
                                <Eye className="w-4 h-4" /> Preview
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


"use client";

import React, { useState } from 'react';
import {
    Mail,
    MessageSquare,
    Bell,
    Edit3,
    Eye,
    Save,
    RotateCcw,
    CheckCircle2,
    Copy,
    Variable,
    Smartphone,
    Search,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const DEFAULT_TEMPLATES = [
    {
        id: 'TPL-001',
        name: 'Welcome Email',
        category: 'Onboarding',
        channel: 'Email',
        subject: 'Welcome to AuraOS, {{employee.firstName}}!',
        body: `Dear {{employee.firstName}},\n\nWe are thrilled to have you join us at AuraOS! Your journey starts on {{employee.joiningDate}}.\n\nPlease log in to your portal using the credentials shared separately.\n\nBest Regards,\nHR Team`,
        lastUpdated: '2 days ago'
    },
    {
        id: 'TPL-002',
        name: 'Leave Approval',
        category: 'Attendance',
        channel: 'Email',
        subject: 'Leave Approved: {{leave.type}}',
        body: `Hi {{employee.firstName}},\n\nYour leave request for {{leave.dates}} has been approved by {{manager.name}}.\n\nEnjoy your time off!\n\nCheers,\nAuraOS Notifications`,
        lastUpdated: '1 month ago'
    },
    {
        id: 'TPL-003',
        name: 'Payslip Generated',
        category: 'Payroll',
        channel: 'In-App',
        subject: '',
        body: `Your payslip for {{payroll.month}} is now available. Click here to view.`,
        lastUpdated: '1 week ago'
    }
];

const VARIABLES = [
    { category: 'Employee', vars: ['{{employee.firstName}}', '{{employee.lastName}}', '{{employee.designation}}', '{{employee.joiningDate}}'] },
    { category: 'Manager', vars: ['{{manager.name}}', '{{manager.email}}'] },
    { category: 'Leave', vars: ['{{leave.type}}', '{{leave.startDate}}', '{{leave.endDate}}', '{{leave.reason}}'] },
    { category: 'Payroll', vars: ['{{payroll.month}}', '{{payroll.netPay}}'] },
];

export default function NotificationTemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0]);
    const [viewMode, setViewMode] = useState<'Edit' | 'Preview'>('Edit');
    const [editContent, setEditContent] = useState(DEFAULT_TEMPLATES[0]);

    const handleTemplateSelect = (tpl: any) => {
        setSelectedTemplate(tpl);
        setEditContent(tpl); // Reset edit state
        setViewMode('Edit');
    };

    const insertVariable = (variable: string) => {
        // Mock insertion logic - ideally would use ref to insert at cursor
        setEditContent({ ...editContent, body: editContent.body + ' ' + variable });
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Mail className="w-6 h-6 text-indigo-500" />
                        Notification Templates
                    </h1>
                    <p className="text-silver-mist text-sm">Customize automated system emails and alerts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Save className="w-4 h-4" /> Save Template
                    </button>
                </div>
            </div>

            <div className="flex h-full min-h-0 gap-3 overflow-hidden">
                {/* Left: Template List */}
                <div className="w-72 lg:w-80 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col shrink-0">
                    <div className="p-4 border-b border-cloud dark:border-slate-800">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {DEFAULT_TEMPLATES.map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => handleTemplateSelect(tpl)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group
                                    ${selectedTemplate.id === tpl.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center 
                                    ${tpl.channel === 'Email' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'}
                                `}>
                                    {tpl.channel === 'Email' ? <Mail className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <div className={`text-sm font-bold truncate ${selectedTemplate.id === tpl.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {tpl.name}
                                    </div>
                                    <div className="text-xs text-slate-400">{tpl.category}</div>
                                </div>
                                {selectedTemplate.id === tpl.id && <ChevronRight className="w-4 h-4 text-indigo-500 ml-auto self-center" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center: Editor / Preview */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-4 border-b border-cloud dark:border-slate-800 shrink-0">
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                            {['Edit', 'Preview'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode as any)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all
                                        ${viewMode === mode
                                            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {mode === 'Edit' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Last saved {selectedTemplate.lastUpdated}
                            </span>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {viewMode === 'Edit' ? (
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {editContent.channel === 'Email' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Subject Line</label>
                                        <input
                                            type="text"
                                            value={editContent.subject}
                                            onChange={(e) => setEditContent({ ...editContent, subject: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Message Body</label>
                                    <textarea
                                        value={editContent.body}
                                        onChange={(e) => setEditContent({ ...editContent, body: e.target.value })}
                                        className="w-full h-80 p-4 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                    />
                                    <div className="text-xs text-slate-400 mt-2 text-right">Supported Format: Plain Text / Markdown</div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-8 border border-cloud dark:border-slate-800 shadow-sm">
                                    {editContent.channel === 'Email' && (
                                        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 space-y-2">
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                                {editContent.subject.replace('{{employee.firstName}}', 'John').replace('{{leave.type}}', 'Sick Leave')}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
                                                <span>AuraOS Notifications &lt;no-reply@auraos.com&gt;</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                        {editContent.body
                                            .replace('{{employee.firstName}}', 'John')
                                            .replace('{{employee.joiningDate}}', 'Dec 15, 2024')
                                            .replace('{{leave.dates}}', 'Dec 20 - Dec 22')
                                            .replace('{{manager.name}}', 'Sarah Connor')
                                            .replace('{{payroll.month}}', 'December 2024')
                                        }
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 text-xs text-amber-800 dark:text-amber-300">
                                    This is a preview with mock data. Actual variables will be replaced at runtime.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Variable Picker */}
                <div className="w-64 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col shrink-0 overflow-hidden">
                    <div className="p-4 border-b border-cloud dark:border-slate-800 bg-white dark:bg-stellar-blue">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Variable className="w-4 h-4 text-indigo-500" /> Variables
                        </h3>
                        <p className="text-xs text-silver-mist">Click to copy/insert.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {VARIABLES.map((group, idx) => (
                            <div key={idx}>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{group.category}</h4>
                                <div className="space-y-1">
                                    {group.vars.map(v => (
                                        <button
                                            key={v}
                                            onClick={() => insertVariable(v)}
                                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700 hover:border-indigo-300 transition-colors truncate flex items-center justify-between group"
                                        >
                                            {v}
                                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


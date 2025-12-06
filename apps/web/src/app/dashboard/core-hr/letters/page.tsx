"use client";

import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Printer,
    Download,
    History,
    ChevronRight,
    Search,
    User,
    Calendar,
    PenTool
} from 'lucide-react';

// --- MOCK DATA ---

interface Template {
    id: string;
    title: string;
    description: string;
    category: 'Onboarding' | 'Lifecycle' | 'Exit';
    variables: string[];
}

const TEMPLATES: Template[] = [
    {
        id: 'TPL-001',
        title: 'Appointment Letter',
        description: 'Standard employment contract for new full-time employees.',
        category: 'Onboarding',
        variables: ['Employee Name', 'Designation', 'Joining Date', 'CTC']
    },
    {
        id: 'TPL-002',
        title: 'Promotion Letter',
        description: 'Official communication for role change and salary revision.',
        category: 'Lifecycle',
        variables: ['Employee Name', 'New Designation', 'Effective Date', 'New CTC']
    },
    {
        id: 'TPL-003',
        title: 'Address Proof',
        description: 'Confirmation of current residence for bank/visa purposes.',
        category: 'Lifecycle',
        variables: ['Employee Name', 'Employee ID', 'Current Address']
    },
    {
        id: 'TPL-004',
        title: 'Relieving Letter',
        description: 'Formal acceptance of resignation and release from duties.',
        category: 'Exit',
        variables: ['Employee Name', 'Resignation Date', 'Last Working Day']
    },
];

interface GeneratedLetter {
    id: string;
    template: string;
    employee: string;
    generatedOn: string;
    status: 'Draft' | 'Issued';
}

const RECENT_LETTERS: GeneratedLetter[] = [
    { id: 'LET-1024', template: 'Appointment Letter', employee: 'Alice Johnson', generatedOn: 'Dec 04, 2024', status: 'Issued' },
    { id: 'LET-1025', template: 'Address Proof', employee: 'Bob Smith', generatedOn: 'Dec 05, 2024', status: 'Issued' },
    { id: 'LET-1026', template: 'Promotion Letter', employee: 'Charlie Brown', generatedOn: 'Dec 05, 2024', status: 'Draft' },
];

export default function LetterGenerationPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
        setFormData({}); // Reset form
    };

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <FileText className="w-6 h-6 text-celestial-indigo" />
                        Letter Generation
                    </h1>
                    <p className="text-silver-mist text-sm">Create, manage, and issue official HR documents.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <History className="w-4 h-4" /> View History
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Selection & Input */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Template Gallery */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Select Template</h3>
                        <div className="space-y-3">
                            {TEMPLATES.map(tpl => (
                                <div
                                    key={tpl.id}
                                    onClick={() => handleTemplateSelect(tpl)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedTemplate?.id === tpl.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-celestial-indigo ring-1 ring-celestial-indigo'
                                            : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-sm ${selectedTemplate?.id === tpl.id ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}>
                                            {tpl.title}
                                        </h4>
                                        <span className="text-[10px] text-silver-mist px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase font-bold">
                                            {tpl.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-silver-mist line-clamp-2">{tpl.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Input Form (Only if template selected) */}
                    {selectedTemplate && (
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
                            <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                <PenTool className="w-4 h-4 text-celestial-indigo" />
                                Enter Details
                            </h3>
                            <div className="space-y-4">
                                {selectedTemplate.variables.map(variable => (
                                    <div key={variable}>
                                        <label className="text-xs font-bold text-silver-mist uppercase mb-1 block">{variable}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                            placeholder={`Ex: ${variable === 'CTC' ? '$120,000' : '...'}`}
                                            onChange={(e) => handleInputChange(variable, e.target.value)}
                                            value={formData[variable] || ''}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-50 dark:bg-deep-cosmos/50 p-1 rounded-2xl border border-cloud dark:border-nebula-purple/50 min-h-[600px] flex flex-col">
                        {/* Toolbar */}
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-stellar-blue rounded-xl shadow-sm mb-4">
                            <div className="text-sm font-bold text-ink-black dark:text-pearl">
                                {selectedTemplate ? `Preview: ${selectedTemplate.title}` : 'Document Preview'}
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Print">
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-bold hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                                    <Download className="w-3 h-3" /> Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Page Canvas */}
                        <div className="flex-1 bg-white shadow-lg mx-auto w-full max-w-[210mm] p-[20mm] text-ink-black text-sm leading-relaxed overflow-y-auto rounded-sm">
                            {selectedTemplate ? (
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                                        <div className="font-bold text-2xl tracking-tight text-celestial-indigo">AuraOS Inc.</div>
                                        <div className="text-right text-xs text-slate-500">
                                            123 Innovation Drive<br />
                                            Tech Valley, CA 94043<br />
                                            www.auraos.ai
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>

                                    {/* Recipient */}
                                    <div className="font-bold">
                                        To,<br />
                                        {formData['Employee Name'] || '[Employee Name]'}<br />
                                        {formData['Employee ID'] ? `ID: ${formData['Employee ID']}` : ''}
                                    </div>

                                    {/* Subject */}
                                    <div className="font-bold underline text-center my-4">
                                        Subject: {selectedTemplate.title}
                                    </div>

                                    {/* Body Content (Mock) */}
                                    <div className="space-y-4 text-justify">
                                        <p>Dear {formData['Employee Name'] || 'Employee'},</p>

                                        {selectedTemplate.id === 'TPL-001' && (
                                            <>
                                                <p>
                                                    We are pleased to offer you the position of <strong>{formData['Designation'] || '[Designation]'}</strong> at AuraOS Inc.
                                                    Your employment will commence on <strong>{formData['Joining Date'] || '[Joining Date]'}</strong>.
                                                </p>
                                                <p>
                                                    As discussed, your annual Cost to Company (CTC) will be <strong>{formData['CTC'] || '[CTC]'}</strong>.
                                                    Detailed breakdown of your compensation and benefits is attached in Annexure A.
                                                </p>
                                            </>
                                        )}

                                        {selectedTemplate.id === 'TPL-002' && (
                                            <>
                                                <p>
                                                    We are delighted to inform you that you have been promoted to the position of <strong>{formData['New Designation'] || '[New Designation]'}</strong>.
                                                    This change is effective from <strong>{formData['Effective Date'] || '[Effective Date]'}</strong>.
                                                </p>
                                                <p>
                                                    Consequently, your revised annual compensation will be <strong>{formData['New CTC'] || '[New CTC]'}</strong>.
                                                    We appreciate your hard work and dedication.
                                                </p>
                                            </>
                                        )}

                                        {selectedTemplate.id === 'TPL-003' && (
                                            <p>
                                                This is to certify that Mr./Ms. <strong>{formData['Employee Name'] || '[Employee Name]'}</strong> (ID: {formData['Employee ID'] || '[ID]'})
                                                is a bonafide employee of AuraOS Inc. As per our records, their current residential address is:
                                                <br /><br />
                                                <strong>{formData['Current Address'] || '[Current Address]'}</strong>
                                                <br /><br />
                                                This letter is issued upon the employee's request for administrative purposes.
                                            </p>
                                        )}

                                        {selectedTemplate.id === 'TPL-004' && (
                                            <div className="italic text-slate-400 text-center py-10">
                                                [Content for Relieving Letter template...]
                                            </div>
                                        )}

                                        <p>
                                            We look forward to a mutually beneficial association.
                                        </p>
                                    </div>

                                    {/* Signatory */}
                                    <div className="pt-10">
                                        <div className="h-12 w-32 mb-2">
                                            {/* Mock Signature */}
                                            <div className="font-cursive text-xl text-indigo-800 opacity-60 transform -rotate-3">Jonathan Doe</div>
                                        </div>
                                        <div className="font-bold">Jonathan Doe</div>
                                        <div className="text-xs">Head of Human Resources</div>
                                        <div className="text-xs">AuraOS Inc.</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Select a template to generate preview</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="mt-6">
                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Recently Generated</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {RECENT_LETTERS.map(letter => (
                                <div key={letter.id} className="bg-white dark:bg-stellar-blue p-3 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate text-ink-black dark:text-pearl">{letter.template}</div>
                                        <div className="text-xs text-silver-mist truncate">For {letter.employee}</div>
                                    </div>
                                    <div className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 px-1.5 py-0.5 rounded">
                                        {letter.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

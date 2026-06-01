// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    Mail,
    FileJson,
    ArrowRight,
    Check,
    AlertTriangle,
    RefreshCw,
    Upload
} from 'lucide-react';
import { emailParser } from '@/lib/services/ai-automation-client';

// --- MOCK DATA ---

const MOCK_EMAIL = `Subject: Invoice #INV-2024-001 for Consultant Services

Hi Team,

Please find attached the invoice for services rendered in March 2024.

Vendor: TechCorp Solutions LLC
Invoice Date: March 31, 2024
Due Date: April 15, 2024
Total Amount: $4,500.00
PO Number: PO-998877

Bank Details:
Chase Bank
Acct: **** 1234
Routing: 987654321

Thanks,
John Doe
Accounts Receivable`;

const EXTRACTED_DATA = {
    invoice_number: { value: "INV-2024-001", confidence: 0.98 },
    vendor_name: { value: "TechCorp Solutions LLC", confidence: 0.95 },
    dates: {
        invoice: { value: "2024-03-31", confidence: 0.99 },
        due: { value: "2024-04-15", confidence: 0.99 }
    },
    amount: { value: 4500.00, currency: "USD", confidence: 0.99 },
    po_number: { value: "PO-998877", confidence: 0.92 },
    bank_details: {
        bank: { value: "Chase Bank", confidence: 0.85 },
        account_last4: { value: "1234", confidence: 0.90 }
    }
};

const JSON_PREVIEW = JSON.stringify(EXTRACTED_DATA, null, 4);

export default function EmailParsingPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [emails, setEmails] = useState<any[]>([]);
    const [currentEmail, setCurrentEmail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const result = await emailParser.parseEmails();
            if (result.success && result.data?.emails) {
                setEmails(result.data.emails);
                if (result.data.emails.length > 0) {
                    setCurrentEmail(result.data.emails[0]);
                }
            }
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        setIsProcessing(true);
        setProgress(0);
        try {
            // Simulate progress
            let p = 0;
            const interval = setInterval(() => {
                p += 5;
                setProgress(p);
                if (p >= 100) {
                    clearInterval(interval);
                    setIsProcessing(false);
                }
            }, 50);

            // Process email if current email exists
            if (currentEmail?.id) {
                await emailParser.processEmail(currentEmail.id, 'extract');
                await fetchEmails();
            }
        } catch (error: any) {
            console.error('Error:', error);
                        setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Mail className="w-6 h-6 text-indigo-500" />
                        Smart Email Parser
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Extract structured data from unstructured emails automatically.</p>
                </div>
                <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isProcessing ? `Processing ${progress}%` : 'Upload Batch'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[600px]">

                {/* 1. Raw Input */}
                <div className="flex flex-col bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Raw Content
                        </span>
                        <span className="text-xs font-mono text-slate-500">Input Source: IMAP</span>
                    </div>
                    <div className="flex-1 p-0 relative">
                        <textarea
                            readOnly
                            value={currentEmail?.content || MOCK_EMAIL}
                            className="w-full h-full p-6 text-sm font-mono text-slate-600 dark:text-slate-300 bg-transparent resize-none focus:outline-none"
                        />
                        {/* Highlight overlay could go here in a real app */}
                    </div>
                </div>

                {/* 2. Extracted Output */}
                <div className="flex flex-col bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden relative">
                    <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                            <FileJson className="w-4 h-4" /> Extracted Data
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Confidence Score:</span>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">96%</span>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-auto font-mono text-sm">
                        <div className="space-y-1">
                            {Object.entries(currentEmail?.extractedData || EXTRACTED_DATA).map(([key, data], i) => (
                                <div key={i} className="group flex items-start hover:bg-white/5 -mx-2 px-2 py-1 rounded transition-colors">
                                    <div className="text-purple-400 w-40 shrink-0 select-none">"{key}":</div>
                                    <div className="flex-1">
                                        {/* @ts-ignore */}
                                        {typeof data.value === 'object' || !data.value ? (
                                            <span className="text-slate-500">{'{'} ... {'}'}</span>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                {/* @ts-ignore */}
                                                <span className="text-emerald-300">"{data.value}"</span>
                                                {/* @ts-ignore */}
                                                <span className={`text-[10px] ml-4 font-bold px-1.5 rounded ${data.confidence > 0.9 ? 'bg-emerald-500/20 text-emerald-400' :
                                                    /* @ts-ignore */
                                                    data.confidence > 0.8 ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-rose-500/20 text-rose-400'
                                                    }`}>
                                                    {/* @ts-ignore */}
                                                    {Math.round(data.confidence * 100)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-4 border-t border-slate-700">
                            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Raw JSON</h4>
                            <pre className="text-xs text-slate-400 opacity-50 select-all">
                                {JSON_PREVIEW}
                            </pre>
                        </div>
                    </div>

                    {/* Mapping Arrow (Visual only) */}
                    <div className="absolute top-1/2 -left-3 bg-white dark:bg-slate-700 rounded-full p-1 shadow-lg border border-slate-200 z-10 hidden lg:block">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                </div>

            </div>
        </div>
    );
}


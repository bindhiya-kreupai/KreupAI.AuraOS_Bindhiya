"use client";

import React, { useState, useEffect } from 'react';
import {
    Landmark,
    CreditCard,
    FileSpreadsheet,
    Settings,
    Plus,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    History,
    Download,
    Upload,
    MoreVertical,
    RefreshCw,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankFileService } from '../../payroll/services';

// --- MOCK DATA ---

const ACCOUNTS = [
    {
        id: 'ACC-001',
        bank: 'HDFC Bank',
        type: 'Corporate Current',
        number: '**** **** 1234',
        ifsc: 'HDFC0001234',
        balance: '₹45,00,000',
        status: 'Active',
        apiStatus: 'Connected',
        logo: 'text-blue-600 bg-blue-100'
    },
    {
        id: 'ACC-002',
        bank: 'State Bank of India',
        type: 'Salary Disbursement',
        number: '**** **** 5678',
        ifsc: 'SBIN0005678',
        balance: '₹12,50,000',
        status: 'Active',
        apiStatus: 'Disconnected',
        logo: 'text-sky-600 bg-sky-100'
    }
];

const DISBURSEMENT_LOGS = [
    { id: 101, ref: 'TXN-OCT-001', date: 'Oct 31, 2024', type: 'Salary Run', amount: '₹42,50,000', count: 145, status: 'Success' },
    { id: 102, ref: 'TXN-OCT-002', date: 'Oct 15, 2024', type: 'Expense Reimburse', amount: '₹1,25,000', count: 12, status: 'Success' },
    { id: 103, ref: 'TXN-SEP-001', date: 'Sep 30, 2024', type: 'Salary Run', amount: '₹41,80,000', count: 142, status: 'Partial Failure' },
];

export default function BankIntegrationPage() {
    const [activeTab, setActiveTab] = useState<'Accounts' | 'Configuration' | 'History'>('Accounts');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('NACH');
    const [bankFiles, setBankFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // BankFileService doesn't have a getAll method, so we'll just set loading to false
            // In a real implementation, you might need to add this method
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-indigo-500" />
                        Bank Integration
                    </h1>
                    <p className="text-silver-mist text-sm">Manage corporate accounts and disbursement gateways.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add Account
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['Accounts', 'Configuration', 'History'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                                    ${activeTab === tab
                                        ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        {activeTab === 'Accounts' && (
                            <div className="space-y-4">
                                {ACCOUNTS.map(acc => (
                                    <div key={acc.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-xl ${acc.logo} flex items-center justify-center`}>
                                                    <Landmark className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl">{acc.bank}</h3>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{acc.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1
                                                    ${acc.apiStatus === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                                                `}>
                                                    {acc.apiStatus === 'Connected' ? <RefreshCw className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    {acc.apiStatus}
                                                </span>
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                            <div>
                                                <div className="text-xs font-bold text-slate-500 mb-1">Account Number</div>
                                                <div className="font-mono font-bold text-ink-black dark:text-pearl tracking-wider">{acc.number}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-500 mb-1">IFSC Code</div>
                                                <div className="font-mono font-bold text-ink-black dark:text-pearl">{acc.ifsc}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center text-sm">
                                            <div className="text-slate-500 font-medium">Available Balance</div>
                                            <div className="font-black text-xl text-ink-black dark:text-pearl">{acc.balance}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Configuration' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50">
                                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                        <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Output File Format
                                    </h3>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        {['NACH', 'Excel', 'CSV'].map(fmt => (
                                            <button
                                                key={fmt}
                                                onClick={() => setSelectedFormat(fmt)}
                                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                                                    ${selectedFormat === fmt
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600'
                                                        : 'bg-white dark:bg-stellar-blue border-cloud dark:border-slate-800 text-slate-500 hover:bg-slate-50'}
                                                `}
                                            >
                                                <span className="text-sm font-bold">{fmt}</span>
                                                {selectedFormat === fmt && <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-bold text-ink-black dark:text-pearl">File Header Structure</div>
                                                <div className="text-xs text-silver-mist">Define column mapping for bank validation.</div>
                                            </div>
                                            <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600">Edit Mapping</button>
                                        </div>
                                        <div className="font-mono text-xs text-slate-500 bg-white dark:bg-slate-900 p-3 rounded border border-cloud dark:border-slate-800">
                                            Beneficiary_Name | Account_No | IFSC | Amount | Ref_ID
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'History' && (
                            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold">
                                        <tr>
                                            <th className="p-4">Reference ID</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-cloud dark:divide-slate-800">
                                        {DISBURSEMENT_LOGS.map((log, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="p-4 font-mono text-slate-500">{log.ref}</td>
                                                <td className="p-4 font-medium text-ink-black dark:text-pearl">{log.date}</td>
                                                <td className="p-4 text-slate-500">{log.type}</td>
                                                <td className="p-4 font-bold text-ink-black dark:text-pearl">{log.amount}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                                        ${log.status === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
                                                    `}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Security & Gateways */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Security Badge */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shrink-0">
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Secure Environment
                        </h3>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">
                            All bank details are encrypted using AES-256. API requests are signed with rotating keys.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" /> SSL/TLS Verified
                        </div>
                    </div>

                    {/* Gateway Config */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-500" /> Gateway Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Client ID</label>
                                <input type="password" value="****************" disabled className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono tracking-widest outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Client Secret</label>
                                <input type="password" value="****************" disabled className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono tracking-widest outline-none" />
                            </div>

                            <div className="pt-4 border-t border-cloud dark:border-slate-800">
                                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                    Rotate API Keys
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import {
    Laptop,
    Monitor,
    Smartphone,
    Plus,
    Wrench,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    FileText,
    AlertCircle,
    Download,
    Cpu,
    Mouse,
    Wifi,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const MY_ASSETS = [
    {
        id: 'AST-001',
        name: 'MacBook Pro 16"',
        type: 'Laptop',
        serial: 'C02YW123ABCD',
        assigned: 'Jan 15, 2024',
        warranty: 'Active (Expires Jan 2027)',
        status: 'Good',
        specs: 'M3 Pro, 32GB RAM, 1TB SSD',
        image: '💻',
        color: 'bg-slate-100'
    },
    {
        id: 'AST-002',
        name: 'Dell UltraSharp 27"',
        type: 'Monitor',
        serial: 'DL-CN-0X123',
        assigned: 'Feb 01, 2024',
        warranty: 'Active (Expires Feb 2026)',
        status: 'Good',
        specs: '4K USB-C Hub Monitor',
        image: '🖥️',
        color: 'bg-slate-100'
    },
    {
        id: 'AST-003',
        name: 'Magic Keyboard & Mouse',
        type: 'Accessories',
        serial: 'N/A',
        assigned: 'Feb 01, 2024',
        warranty: 'N/A',
        status: 'Good',
        specs: 'Wireless, Space Grey',
        image: '⌨️',
        color: 'bg-slate-100'
    }
];

const CATALOG = [
    { id: 1, name: 'iPad Pro 12.9"', category: 'Tablet', type: 'Hardware', image: '📱' },
    { id: 2, name: 'JetBrains All Products', category: 'License', type: 'Software', image: '🛠️' },
    { id: 3, name: 'Ergonomic Chair', category: 'Furniture', type: 'Furniture', image: '🪑' },
    { id: 4, name: 'Adobe Creative Cloud', category: 'License', type: 'Software', image: '🎨' },
    { id: 5, name: 'Testing Device (Android)', category: 'Mobile', type: 'Hardware', image: '🤖' },
];

const TICKETS = [
    { id: 'TKT-1029', title: 'VPN Access Issue', status: 'In Progress', date: 'Today', priority: 'High' },
    { id: 'TKT-0992', title: 'Monitor Flicker', status: 'Resolved', date: 'Last Week', priority: 'Medium' }
];

export default function AssetsPage() {
    const [activeTab, setActiveTab] = useState<'My Assets' | 'Catalog' | 'Tickets'>('My Assets');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Laptop className="w-6 h-6 text-indigo-500" />
                        IT Asset Management
                    </h1>
                    <p className="text-silver-mist text-sm">Manage your devices, software licenses, and support requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setSelectedItem(null); setShowRequestModal(true); }}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> New Request
                    </button>
                    <button className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                        <Wrench className="w-4 h-4" /> Report Issue
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content (Assets/Catalog) */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['My Assets', 'Catalog'].map(tab => (
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
                        {activeTab === 'My Assets' ? (
                            <div className="space-y-4">
                                {MY_ASSETS.map(asset => (
                                    <div key={asset.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col sm:flex-row gap-5 items-start">
                                        <div className={`w-20 h-20 rounded-xl ${asset.color} flex items-center justify-center text-4xl shadow-inner shrink-0`}>
                                            {asset.image}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-ink-black dark:text-pearl text-lg">{asset.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-silver-mist mt-1 font-mono">
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{asset.id}</span>
                                                        <span>•</span>
                                                        <span>{asset.serial}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    {asset.status}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                                <div>
                                                    <span className="block text-xs font-bold text-slate-500 mb-0.5">Specifications</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{asset.specs}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold text-slate-500 mb-0.5">Warranty Status</span>
                                                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {asset.warranty}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-cloud dark:border-slate-800 flex gap-3">
                                                <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                    <Wrench className="w-3 h-3" /> Report Issue
                                                </button>
                                                <button className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" /> View History
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CATALOG.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setSelectedItem(item); setShowRequestModal(true); }}
                                        className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-left transition-all group flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            {item.image}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-ink-black dark:text-pearl group-hover:text-indigo-500 transition-colors">{item.name}</h3>
                                            <div className="text-xs text-silver-mist mt-1">{item.category} • {item.type}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Status & Info */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Tickets */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-indigo-500" /> Recent Tickets
                        </h3>

                        <div className="space-y-4">
                            {TICKETS.map(ticket => (
                                <div key={ticket.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-mono font-bold text-slate-400">{ticket.id}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                            ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                                        `}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-1">{ticket.title}</h4>
                                    <div className="flex justify-between items-center text-xs text-silver-mist">
                                        <span>{ticket.date}</span>
                                        <span className={`font-bold ${ticket.priority === 'High' ? 'text-rose-500' : 'text-indigo-500'}`}>{ticket.priority} Priority</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            View All Support Tickets
                        </button>
                    </div>

                    {/* Policy Snippet */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Policy Reminder
                        </h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed mb-4">
                            All assigned assets are monitored. Please report any theft, loss, or damage immediately to IT Support to avoid liability.
                        </p>
                        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1">
                            Download IT Policy <Download className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">
                                {selectedItem ? `Request ${selectedItem.name}` : 'New IT Request'}
                            </h2>
                            <p className="text-sm text-silver-mist mb-6">Submit a request for hardware, software, or peripherals.</p>

                            <div className="space-y-4">
                                {!selectedItem && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                                        <select className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            <option>Hardware (Laptop, Monitor)</option>
                                            <option>Software / License</option>
                                            <option>Accessories</option>
                                            <option>Network / VPN Access</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Justification</label>
                                    <textarea rows={4} placeholder="Why is this requested? (e.g., Project requirement, Replacement)" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                                </div>

                                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex gap-3 items-start">
                                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">Approval Required</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500/80">
                                            Requests typically require Manager and IT Head approval. Processing time: 3-5 business days.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Submit Request
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

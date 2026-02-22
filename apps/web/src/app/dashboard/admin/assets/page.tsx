"use client";

import React, { useState, useEffect } from 'react';
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

// --- TYPES ---

interface Asset {
    id: string;
    assetCode: string;
    assetName: string;
    assetType: string;
    category: string;
    serialNumber?: string;
    status: string;
    condition?: string;
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    warrantyProvider?: string;
    description?: string;
    manufacturer?: string;
    brand?: string;
    modelNumber?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    imageUrl?: string;
    tags?: string;
    notes?: string;
    assignments?: Array<{
        id: string;
        employeeId: string;
        assignedDate: string;
        status: string;
    }>;
    maintenances?: Array<{
        id: string;
        maintenanceType: string;
        scheduledDate: string;
        status: string;
    }>;
    location?: {
        id: string;
        name: string;
    } | null;
}

interface DashboardStats {
    total: number;
    available: number;
    assigned: number;
    inRepair: number;
    retired: number;
    categoryBreakdown: Array<{ category: string; _count: number }>;
    upcomingMaintenance: number;
    expiringWarranty: number;
}

// Catalog items are also assets from the API, but we show available ones
// Tickets don't have a dedicated API yet, so we fetch from assets with IN_REPAIR status

function getAssetEmoji(category: string): string {
    switch (category) {
        case 'COMPUTER': return '\u{1F4BB}';
        case 'MOBILE': return '\u{1F4F1}';
        case 'FURNITURE': return '\u{1FA91}';
        case 'VEHICLE': return '\u{1F697}';
        case 'EQUIPMENT': return '\u{1F527}';
        default: return '\u{1F4E6}';
    }
}

function formatWarranty(startDate?: string, endDate?: string): string {
    if (!endDate) return 'N/A';
    const end = new Date(endDate);
    const now = new Date();
    if (end < now) return 'Expired';
    return `Active (Expires ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssetsPage() {
    const [activeTab, setActiveTab] = useState<'My Assets' | 'Catalog'>('My Assets');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Data state
    const [myAssets, setMyAssets] = useState<Asset[]>([]);
    const [catalog, setCatalog] = useState<Asset[]>([]);
    const [tickets, setTickets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [assignedRes, availableRes, repairRes] = await Promise.all([
                    fetch('/api/v1/assets?status=ASSIGNED'),
                    fetch('/api/v1/assets?status=AVAILABLE'),
                    fetch('/api/v1/assets?status=IN_REPAIR'),
                ]);

                const [assignedJson, availableJson, repairJson] = await Promise.all([
                    assignedRes.json(),
                    availableRes.json(),
                    repairRes.json(),
                ]);

                if (assignedJson.success) setMyAssets(assignedJson.data || []);
                if (availableJson.success) setCatalog(availableJson.data || []);
                if (repairJson.success) setTickets(repairJson.data || []);
            } catch (err) {
                console.error('Failed to fetch assets:', err);
                setError('Failed to load asset data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Laptop className="w-6 h-6 text-indigo-500" />
                            IT Asset Management
                        </h1>
                        <p className="text-silver-mist text-sm">Manage your devices, software licenses, and support requests.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 animate-pulse">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-48" />
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 h-32" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 h-48" />
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl h-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <p className="text-lg font-bold text-ink-black dark:text-pearl">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content (Assets/Catalog) */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
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
                                {myAssets.length === 0 ? (
                                    <div className="text-center py-12 text-silver-mist">
                                        <Laptop className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p className="font-bold">No assets assigned to you</p>
                                        <p className="text-sm mt-1">Request a device from the catalog</p>
                                    </div>
                                ) : (
                                    myAssets.map(asset => (
                                        <div key={asset.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col sm:flex-row gap-5 items-start">
                                            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-4xl shadow-inner shrink-0">
                                                {getAssetEmoji(asset.category)}
                                            </div>
                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-ink-black dark:text-pearl text-lg">{asset.assetName}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-silver-mist mt-1 font-mono">
                                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{asset.assetCode}</span>
                                                            <span>•</span>
                                                            <span>{asset.serialNumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                        {asset.condition || asset.status}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                                                    <div>
                                                        <span className="block text-xs font-bold text-slate-500 mb-0.5">Specifications</span>
                                                        <span className="text-slate-700 dark:text-slate-300">{asset.description || `${asset.manufacturer || ''} ${asset.modelNumber || ''} ${asset.assetType}`.trim()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-bold text-slate-500 mb-0.5">Warranty Status</span>
                                                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {formatWarranty(asset.warrantyStartDate, asset.warrantyEndDate)}
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
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {catalog.length === 0 ? (
                                    <div className="col-span-2 text-center py-12 text-silver-mist">
                                        <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p className="font-bold">No items available in the catalog</p>
                                    </div>
                                ) : (
                                    catalog.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setSelectedItem(item); setShowRequestModal(true); }}
                                            className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-left transition-all group flex items-start gap-3"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                {getAssetEmoji(item.category)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-ink-black dark:text-pearl group-hover:text-indigo-500 transition-colors">{item.assetName}</h3>
                                                <div className="text-xs text-silver-mist mt-1">{item.category} • {item.assetType}</div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Status & Info */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Tickets (Assets in Repair) */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-indigo-500" /> Recent Tickets
                        </h3>

                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <p className="text-sm text-silver-mist text-center py-4">No open tickets</p>
                            ) : (
                                tickets.slice(0, 5).map(ticket => (
                                    <div key={ticket.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{ticket.assetCode}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-600">
                                                In Repair
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-1">{ticket.assetName}</h4>
                                        <div className="flex justify-between items-center text-xs text-silver-mist">
                                            <span>{formatDate(ticket.purchaseDate)}</span>
                                            <span className="font-bold text-rose-500">Needs Attention</span>
                                        </div>
                                    </div>
                                ))
                            )}
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
                                {selectedItem ? `Request ${selectedItem.assetName || selectedItem.name}` : 'New IT Request'}
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


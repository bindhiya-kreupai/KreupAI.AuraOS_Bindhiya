"use client";

import React, { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    MapPin,
    Calendar,
    Tag,
    Image as ImageIcon,
    CheckCircle2,
    Briefcase,
    HelpCircle,
    X,
    Eye,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const ITEMS = [
    {
        id: 1,
        title: 'Apple AirPods Pro',
        type: 'Found',
        category: 'Electronics',
        location: 'Conference Room B',
        date: 'Today, 10:30 AM',
        status: 'Held at Reception',
        description: 'Found on the table, white case with a cat sticker.',
        image: '🎧',
        color: 'bg-slate-100'
    },
    {
        id: 2,
        title: 'Black Umbrella',
        type: 'Lost',
        category: 'Accessories',
        location: 'Cafeteria',
        date: 'Yesterday, 01:00 PM',
        status: 'Searching',
        description: 'Large black umbrella with wooden handle.',
        image: '☂️',
        color: 'bg-slate-800 text-white'
    },
    {
        id: 3,
        title: 'Water Bottle (Blue)',
        type: 'Found',
        category: 'Personal',
        location: 'Gym',
        date: '2 Days Ago',
        status: 'Claimed',
        description: 'Metal bottle, Nike brand.',
        image: '🧴',
        color: 'bg-blue-100'
    },
    {
        id: 4,
        title: 'Car Keys',
        type: 'Found',
        category: 'Keys',
        location: 'Parking Level B1',
        date: 'Today, 09:00 AM',
        status: 'Held at Security',
        description: 'Toyota key fob with a leather keychain.',
        image: '🔑',
        color: 'bg-amber-100'
    },
    {
        id: 5,
        title: 'Notebook (Moleskine)',
        type: 'Lost',
        category: 'Stationery',
        location: 'Workstation Area',
        date: 'Yesterday',
        status: 'Searching',
        description: 'Black hardcover notebook, confidential notes inside.',
        image: '📓',
        color: 'bg-stone-200'
    }
];

export default function LostFoundPage() {
    const [activeTab, setActiveTab] = useState<'All' | 'Lost' | 'Found'>('All');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState<'Lost' | 'Found'>('Lost');

    const filteredItems = activeTab === 'All'
        ? ITEMS
        : ITEMS.filter(item => item.type === activeTab);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-indigo-500" />
                        Lost & Found
                    </h1>
                    <p className="text-silver-mist text-sm">Report lost items or browse found belongings.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setReportType('Lost'); setShowReportModal(true); }}
                        className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-rose-500/20"
                    >
                        <Plus className="w-4 h-4" /> I Lost Something
                    </button>
                    <button
                        onClick={() => { setReportType('Found'); setShowReportModal(true); }}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4" /> I Found Something
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left side - Filters & List */}
                <div className="lg:col-span-4 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Tabs & Search */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            {['All', 'Lost', 'Found'].map(tab => (
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

                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search items..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden">
                                {/* Type Badge */}
                                <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl text-[10px] font-bold uppercase tracking-wide
                                    ${item.type === 'Found' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}
                                `}>
                                    {item.type}
                                </div>

                                <div className={`w-full aspect-video ${item.color} rounded-xl mb-4 flex items-center justify-center text-5xl shadow-inner mt-4`}>
                                    {item.image}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-ink-black dark:text-pearl text-lg mb-1">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-silver-mist mb-3">
                                        <Tag className="w-3 h-3" /> {item.category}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                                        {item.description}
                                    </p>

                                    <div className="space-y-2 text-xs text-slate-500 border-t border-cloud dark:border-slate-800 pt-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-indigo-500" /> {item.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-indigo-500" /> {item.date}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-cloud dark:border-slate-800 flex justify-between items-center">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                        ${item.status === 'Claimed' ? 'bg-slate-100 text-slate-500' :
                                            item.status === 'Searching' ? 'bg-amber-100 text-amber-600' :
                                                'bg-indigo-100 text-indigo-600'}
                                    `}>
                                        {item.status}
                                    </span>
                                    {item.status !== 'Claimed' && (
                                        <button className="text-xs font-bold text-indigo-500 hover:underline">
                                            {item.type === 'Found' ? 'Claim This' : 'I Found This'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
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
                                onClick={() => setShowReportModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center
                                    ${reportType === 'Found' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                `}>
                                    {reportType === 'Found' ? <Eye className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl">
                                        Report {reportType} Item
                                    </h2>
                                    <p className="text-sm text-silver-mist">
                                        {reportType === 'Found'
                                            ? 'Help us reunite this item with its owner.'
                                            : 'Provide details to help us find your belonging.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Item Name</label>
                                    <input type="text" placeholder="e.g., Blue Umbrella" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                                        <select className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            <option>Electronics</option>
                                            <option>Accessories</option>
                                            <option>Clothing</option>
                                            <option>Keys/Cards</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Date {reportType}</label>
                                        <input type="date" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Location {reportType}</label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder={reportType === 'Found' ? 'Where did you find it?' : 'Where did you last see it?'} className="w-full pl-9 pr-4 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                                    <textarea rows={3} placeholder="Distinguishing marks, color, brand, etc." className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                                </div>

                                {reportType === 'Found' && (
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-3">
                                        <input type="checkbox" className="w-4 h-4 mt-0.5 accent-indigo-500" />
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            I have handed this item over to the <strong>Reception Desk</strong> / <strong>Security</strong>.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button className={`w-full py-3 text-white font-bold rounded-xl mt-6 shadow-lg flex items-center justify-center gap-2
                                ${reportType === 'Found' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'}
                            `}>
                                <CheckCircle2 className="w-4 h-4" /> Submit Report
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

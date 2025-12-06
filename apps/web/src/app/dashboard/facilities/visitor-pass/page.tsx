"use client";

import React, { useState } from 'react';
import {
    QrCode,
    UserPlus,
    Calendar,
    Clock,
    MapPin,
    Mail,
    Phone,
    Share2,
    CheckCircle2,
    XCircle,
    Copy,
    Search,
    Filter,
    MoreHorizontal,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const VISITORS = [
    {
        id: 1,
        name: 'Alex Morgan',
        company: 'Tech Solutions Inc.',
        purpose: 'Client Meeting',
        host: 'Sarah Jenkins',
        time: '10:00 AM - 11:30 AM',
        date: 'Today',
        status: 'Checked In',
        photo: 'AM',
        code: 'VIS-8392'
    },
    {
        id: 2,
        name: 'David Miller',
        company: 'Freelance',
        purpose: 'Interview',
        host: 'Mike Ross',
        time: '02:00 PM - 03:00 PM',
        date: 'Today',
        status: 'Expected',
        photo: 'DM',
        code: 'VIS-9921'
    },
    {
        id: 3,
        name: 'Elena Fisher',
        company: 'Design Co.',
        purpose: 'Vendor Visit',
        host: 'Jessica Wu',
        time: '11:00 AM',
        date: 'Tomorrow',
        status: 'Upcoming',
        photo: 'EF',
        code: 'VIS-1120'
    }
];

export default function VisitorPassPage() {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<typeof VISITORS[0] | null>(null);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-indigo-500" />
                        Visitor Pass
                    </h1>
                    <p className="text-silver-mist text-sm">Manage guest invitations and digital entry passes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <UserPlus className="w-4 h-4" /> Invite Guest
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Visitor List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" /> Expected Guests
                            </h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search visitors..."
                                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {VISITORS.map(visitor => (
                                <div
                                    key={visitor.id}
                                    onClick={() => setSelectedVisitor(visitor)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative
                                        ${selectedVisitor?.id === visitor.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500/30' :
                                            'bg-slate-50 dark:bg-slate-900/40 border-cloud dark:border-slate-800 hover:border-indigo-300'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-lg">
                                                {visitor.photo}
                                            </div>
                                            <div>
                                                <div className="font-bold text-ink-black dark:text-pearl text-lg">{visitor.name}</div>
                                                <div className="text-sm text-silver-mist">{visitor.company} • {visitor.purpose}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase 
                                                ${visitor.status === 'Checked In' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                    visitor.status === 'Expected' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                                                        'bg-slate-100 text-slate-600'}
                                            `}>
                                                {visitor.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-slate-500 pl-[4rem]">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-indigo-500" /> {visitor.time}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-indigo-500" /> Host: {visitor.host}
                                        </span>
                                    </div>

                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Pass Preview */}
                <div className="lg:col-span-1 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedVisitor ? (
                            <motion.div
                                key={selectedVisitor.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-stellar-blue p-0 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-lg overflow-hidden flex flex-col items-center"
                            >
                                {/* Digital Pass Header */}
                                <div className="w-full bg-indigo-600 p-6 text-center text-white relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <h3 className="text-lg font-bold relative z-10">Visitor Pass</h3>
                                    <p className="text-xs opacity-80 relative z-10">AuraOS Headquarters</p>
                                </div>

                                {/* Pass Content */}
                                <div className="p-8 flex flex-col items-center w-full">
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg -mt-16 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500 z-10 mb-4">
                                        {selectedVisitor.photo}
                                    </div>

                                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">{selectedVisitor.name}</h2>
                                    <p className="text-sm text-silver-mist mb-6">{selectedVisitor.company}</p>

                                    {/* Mock QR */}
                                    <div className="p-4 bg-white rounded-xl shadow-inner border border-slate-200 mb-6 group cursor-pointer relative">
                                        <QrCode className="w-32 h-32 text-slate-800" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold text-indigo-600">Scan at Gate</span>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-3 mb-6">
                                        <div className="flex justify-between text-sm py-2 border-b border-cloud dark:border-slate-800">
                                            <span className="text-slate-500">Pass ID</span>
                                            <span className="font-bold font-mono">{selectedVisitor.code}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-cloud dark:border-slate-800">
                                            <span className="text-slate-500">Valid For</span>
                                            <span className="font-bold">{selectedVisitor.date}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-cloud dark:border-slate-800">
                                            <span className="text-slate-500">Host</span>
                                            <span className="font-bold">{selectedVisitor.host}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                                            <Share2 className="w-4 h-4" /> Share
                                        </button>
                                        <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                            <Copy className="w-4 h-4" /> Save
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-cloud dark:border-slate-800 rounded-2xl bg-slate-50/50">
                                <QrCode className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-500">Select a Guest</h3>
                                <p className="text-sm text-slate-400">Click on a visitor to view their digital pass details.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
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
                            className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">New Invitation</h2>
                            <p className="text-sm text-silver-mist mb-6">Send a digital pass to your guest.</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">First Name</label>
                                        <input type="text" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Last Name</label>
                                        <input type="text" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Email Address</label>
                                    <input type="email" placeholder="guest@company.com" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Company / Purpose</label>
                                    <input type="text" placeholder="e.g., Design Agency - Briefing" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Date</label>
                                        <input type="date" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Time</label>
                                        <input type="time" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" /> Send Invite
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

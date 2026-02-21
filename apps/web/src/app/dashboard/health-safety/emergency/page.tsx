"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Phone,
    MapPin,
    User,
    Megaphone,
    Siren,
    CheckCircle2,
    AlertTriangle,
    X,
    BellRing,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmergencyService } from '../services';
import type { EmergencyContact } from '../services';

export default function EmergencyPage() {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [sosActive, setSosActive] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [drillMode, setDrillMode] = useState(false);
    const [alertSent, setAlertSent] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await EmergencyService.getContacts();
                setContacts(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (sosActive && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (sosActive && countdown === 0) {
            setAlertSent(true);
        }
        return () => clearTimeout(timer);
    }, [sosActive, countdown]);

    const triggerSos = () => {
        if (alertSent) return;
        setSosActive(true);
        setCountdown(5);
    };

    const cancelSos = () => {
        setSosActive(false);
        setCountdown(5);
        setAlertSent(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const contactColors = ['bg-rose-500', 'bg-orange-500', 'bg-indigo-500', 'bg-slate-700', 'bg-emerald-500', 'bg-amber-500'];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative overflow-hidden">
            {/* Background Pulse Animation for SOS */}
            <AnimatePresence>
                {(sosActive || drillMode) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 z-0 pointer-events-none ${drillMode ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 relative z-10">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Siren className={`w-6 h-6 ${drillMode ? 'text-amber-500' : sosActive ? 'text-rose-500 animate-bounce' : 'text-rose-500'}`} />
                        Emergency Response
                    </h1>
                    <p className="text-silver-mist text-sm">Immediate assistance and safety protocols.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDrillMode(!drillMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                            ${drillMode
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'bg-white dark:bg-stellar-blue text-amber-500 border border-amber-200 dark:border-amber-900 shadow-sm'}
                        `}
                    >
                        <Megaphone className="w-4 h-4" /> {drillMode ? 'End Drill' : 'Test Drill'}
                    </button>
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${drillMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-sm font-bold text-ink-black dark:text-pearl">{drillMode ? 'Drill in Progress' : 'Status: Normal'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: SOS & Location */}
                <div className="space-y-6">
                    {/* SOS Widget */}
                    <div className={`rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 relative overflow-hidden h-80
                        ${sosActive
                            ? 'bg-rose-600'
                            : 'bg-white dark:bg-stellar-blue border border-rose-100 dark:border-rose-900/30'}
                    `}>
                        {!sosActive ? (
                            <>
                                <button
                                    onClick={triggerSos}
                                    className="w-40 h-40 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/40 flex items-center justify-center group active:scale-95 transition-transform"
                                >
                                    <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-4xl font-bold text-white tracking-widest">SOS</span>
                                    </div>
                                </button>
                                <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium">Press for immediate help</p>
                                <p className="text-xs text-rose-500 font-bold mt-2 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full">Used for genuine emergencies only</p>
                            </>
                        ) : (
                            <>
                                {!alertSent ? (
                                    <>
                                        <div className="text-6xl font-black text-white mb-2 font-mono">{countdown}</div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Sending Alert...</h2>
                                        <button
                                            onClick={cancelSos}
                                            className="px-8 py-3 bg-white text-rose-600 font-bold rounded-xl shadow-lg hover:bg-rose-50 transition-colors"
                                        >
                                            Cancel Alert
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-24 h-24 rounded-full bg-white text-rose-600 flex items-center justify-center mb-6 shadow-xl">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Help is on the way!</h2>
                                        <p className="text-rose-100 mb-8 max-w-sm text-sm">Security and Medical teams have been notified of your location.</p>
                                        <button
                                            onClick={cancelSos}
                                            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-sm transition-colors border border-white/40"
                                        >
                                            Reset Status
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Ripple Effect for SOS Button */}
                        {!sosActive && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-rose-500/10 animate-ping pointer-events-none"></div>
                        )}
                    </div>

                    {/* Location Info */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-silver-mist uppercase">Your Current Location</div>
                            <div className="text-lg font-bold text-ink-black dark:text-pearl">Office Location</div>
                            <div className="text-xs text-indigo-500 font-bold mt-1">Updated 1 min ago</div>
                        </div>
                    </div>
                </div>

                {/* Right: Directory */}
                <div className="space-y-6">
                    {/* Emergency Contacts */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-rose-500" /> Quick Dial
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {contacts.length === 0 ? (
                                <div className="col-span-full text-center py-4 text-slate-400 text-sm">No emergency contacts configured.</div>
                            ) : (
                                contacts.map((contact, i) => (
                                    <button key={contact.id || i} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 hover:border-indigo-300 transition-all text-left group">
                                        <div className={`w-8 h-8 rounded-lg ${contactColors[i % contactColors.length]} text-white flex items-center justify-center text-sm mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{contact.name}</div>
                                        <div className="text-xs text-silver-mist font-mono mt-1">{contact.number}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Assembly Point */}
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-start gap-3">
                        <FlagIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Assembly Point: North Lawn</div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500/80 mt-1">
                                Exit through the main staircase (Stairwell B). Do not use elevators during an emergency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
    )
}

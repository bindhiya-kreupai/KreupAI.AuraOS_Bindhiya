"use client";

import React, { useState, useEffect } from 'react';
import {
    Repeat,
    Calendar,
    ArrowRightLeft,
    Clock,
    User,
    CheckCircle2,
    Search,
    Filter,
    ArrowRight,
    MapPin
} from 'lucide-react';
import { ShiftSwapService } from '../services';

interface Shift {
    id: string;
    date: string;
    time: string;
    type: 'Morning' | 'Evening' | 'Night';
    location: string;
    status: 'Scheduled' | 'Swap Requested' | 'Swapped';
}

interface MarketShift {
    id: string;
    offeredBy: {
        name: string;
        role: string;
        avatar: string; // Color class
    };
    date: string;
    time: string;
    type: 'Morning' | 'Evening' | 'Night';
    reason: string;
}

export default function ShiftSwappingPage() {
    const [activeTab, setActiveTab] = useState<'My Shifts' | 'Marketplace'>('My Shifts');
    const [myShifts, setMyShifts] = useState<Shift[]>([]);
    const [marketplace, setMarketplace] = useState<MarketShift[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShiftData();
    }, []);

    const fetchShiftData = async () => {
        try {
            setLoading(true);
            const shiftsResult = await ShiftSwapService.getMyShifts('current-user-id');
            setMyShifts((shiftsResult || []) as any);
            const marketplaceResult = await ShiftSwapService.getMarketplace();
            setMarketplace((marketplaceResult || []) as any);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSwap = async (shiftId: string) => {
        setLoading(true);
        try {
            await ShiftSwapService.requestSwap({
                fromEmployeeId: 'current-user-id',
                shiftId,
                date: new Date().toISOString(),
                reason: 'Shift swap request'
            });
            await fetchShiftData();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleAcceptSwap = async (marketplaceId: string) => {
        setLoading(true);
        try {
            await ShiftSwapService.acceptSwap(marketplaceId, 'current-user-id');
            await fetchShiftData();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-celestial-indigo" />
                        Shift Swapping
                    </h1>
                    <p className="text-silver-mist text-sm">Trade shifts with colleagues to manage your schedule flexibility.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['My Shifts', 'Marketplace'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === tab
                                    ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                                    : 'text-slate-500 hover:text-ink-black dark:hover:text-pearl'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'My Shifts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    {loading ? (
                        <div className="col-span-full p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-slate-500">Loading shifts...</p>
                        </div>
                    ) : myShifts.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-slate-400">No shifts assigned</div>
                    ) : myShifts.map(shift => (
                        <div key={shift.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative group">
                            {shift.status === 'Swap Requested' && (
                                <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/20 text-amber-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-xl ${shift.type === 'Morning' ? 'bg-orange-100 text-orange-600' :
                                        shift.type === 'Evening' ? 'bg-indigo-100 text-indigo-600' :
                                            'bg-slate-800 text-slate-300'
                                    }`}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-ink-black dark:text-pearl">{shift.type} Shift</div>
                                    <div className="text-xs text-silver-mist">{shift.date}</div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <Clock className="w-4 h-4 text-silver-mist" />
                                    {shift.time}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-silver-mist" />
                                    {shift.location}
                                </div>
                            </div>

                            <button
                                onClick={() => handleRequestSwap(shift.id)}
                                disabled={shift.status !== 'Scheduled' || loading}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${shift.status === 'Scheduled'
                                        ? 'border border-celestial-indigo text-celestial-indigo hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                                {shift.status === 'Scheduled' ? 'Request Swap' : 'Swap Pending'}
                            </button>
                        </div>
                    ))}

                    {/* Add Shift Placeholder */}
                    {!loading && (
                    <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 hover:border-celestial-indigo/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-all cursor-pointer">
                        <Calendar className="w-8 h-8 mb-2 opacity-50" />
                        <div className="font-bold text-sm">View Full Roster</div>
                    </div>
                    )}
                </div>
            )}

            {activeTab === 'Marketplace' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Filters */}
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        <button className="px-3 py-1.5 bg-celestial-indigo text-white rounded-full text-xs font-bold whitespace-nowrap">All Shifts</button>
                        <button className="px-3 py-1.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold whitespace-nowrap hover:bg-slate-50">Morning Only</button>
                        <button className="px-3 py-1.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold whitespace-nowrap hover:bg-slate-50">Evening Only</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                                <p className="mt-2 text-slate-500">Loading marketplace...</p>
                            </div>
                        ) : marketplace.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">No shifts available in the marketplace</div>
                        ) : marketplace.map(item => (
                            <div key={item.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-celestial-indigo/30 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-full ${item.offeredBy.avatar} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                        {item.offeredBy.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-ink-black dark:text-pearl">{item.offeredBy.name}</h3>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{item.offeredBy.role}</span>
                                        </div>
                                        <div className="text-sm text-silver-mist mt-1">is offering a <span className="font-bold text-celestial-indigo">{item.type} Shift</span></div>
                                    </div>
                                </div>

                                <div className="flex-1 border-l border-r border-cloud dark:border-nebula-purple/20 px-0 md:px-6 w-full md:w-auto flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-sm text-ink-black dark:text-pearl font-medium">
                                        <Calendar className="w-4 h-4 text-celestial-indigo" />
                                        {item.date}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-ink-black dark:text-pearl font-medium">
                                        <Clock className="w-4 h-4 text-celestial-indigo" />
                                        {item.time}
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex flex-col items-end gap-2">
                                    <div className="text-xs text-rose-500 font-medium italic mb-1">"{item.reason}"</div>
                                    <button
                                        onClick={() => handleAcceptSwap(item.id)}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-bold shadow-lg shadow-celestial-indigo/20 hover:scale-105 transition-transform w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                                        Accept Swap
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Book, Search, Globe, DollarSign, Shield, Loader2 } from 'lucide-react';
import { TravelSettingsService } from '../services';

export default function TravelPolicyPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const settings = await TravelSettingsService.getSettings();
            setData(settings);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-500">Loading travel policy...</span>
            </div>
        );
    }

    const sections = [
        { title: 'Global Travel Policy', icon: Globe, desc: 'General guidelines for international and domestic travel.' },
        { title: 'Expense Reimbursement', icon: DollarSign, desc: 'What can be claimed, limits, and receipt requirements.' },
        { title: 'Safety & Insurance', icon: Shield, desc: 'Emergency contacts and medical coverage details.' },
    ];

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Book className="w-8 h-8 text-indigo-500" />
                        Travel Policy
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Guidelines, per diems, and safety protocols.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search policy..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.map((sec) => (
                    <div key={sec.title} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <sec.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{sec.title}</h3>
                        <p className="text-slate-500 text-sm">{sec.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <article className="prose dark:prose-invert max-w-none">
                    <h3>1. Air Travel Guidelines</h3>
                    <p>
                        Employees are expected to book the lowest logical airfare (LLA) for all business travel.
                        Business class is permitted only for international flights exceeding {data?.policies?.businessClassThreshold || 6} hours in duration.
                        All bookings should be made at least {data?.policies?.advanceBookingDays || 14} days in advance whenever possible.
                    </p>
                    <h3>2. Hotel Accommodation</h3>
                    <p>
                        Standard room rates apply. Max nightly rate caps by city tier:
                    </p>
                    <ul>
                        <li>Tier 1 Cities (NY, London, Tokyo): ${data?.policies?.maxHotelRate?.tier1 || 350} / night</li>
                        <li>Tier 2 Cities (Austin, Berlin, Dubai): ${data?.policies?.maxHotelRate?.tier2 || 250} / night</li>
                        <li>Standard: ${data?.policies?.maxHotelRate?.standard || 180} / night</li>
                    </ul>
                    <h3>3. Per Diem</h3>
                    <p>
                        Daily allowances cover meals and incidentals. Receipts are not required for per diem claims,
                        but dates must align with approved travel itinerary.
                    </p>
                </article>
            </div>
        </div>
    );
}

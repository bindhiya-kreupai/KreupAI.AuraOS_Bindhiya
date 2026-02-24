"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, PhoneCall, AlertTriangle, FileText, Download, Loader2 } from 'lucide-react';
import { TravelSettingsService } from '../services';

export default function TravelInsurancePage() {
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
                <span className="ml-2 text-sm text-slate-500">Loading insurance details...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                        Travel Insurance
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Active coverage details and emergency support.</p>
                </div>
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-pulse">
                    <PhoneCall className="w-5 h-5" /> SOS Emergency
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-indigo-200 text-sm font-bold uppercase mb-2">Corporate Policy #{data?.tenantId?.substring(0, 4) || '0000'}-XJ-2024</div>
                        <h2 className="text-3xl font-bold mb-6">Global Business Travel Protection</h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-indigo-200 text-xs uppercase mb-1">Medical Coverage</div>
                                <div className="text-2xl font-bold">$5,000,000</div>
                            </div>
                            <div>
                                <div className="text-indigo-200 text-xs uppercase mb-1">Evacuation</div>
                                <div className="text-2xl font-bold">Included</div>
                            </div>
                            <div>
                                <div className="text-indigo-200 text-xs uppercase mb-1">Trip Cancellation</div>
                                <div className="text-2xl font-bold">100% Refund</div>
                            </div>
                            <div>
                                <div className="text-indigo-200 text-xs uppercase mb-1">Provider</div>
                                <div className="text-2xl font-bold">Allianz Global</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">Policy Documents</h3>
                    <div className="space-y-3">
                        {['Policy Certificate.pdf', 'Claim Form.pdf', 'Key Contacts List.pdf'].map((doc) => (
                            <div key={doc} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{doc}</span>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-6 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                    <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-2">Before you travel</h3>
                    <p className="text-amber-600/80 dark:text-amber-300/80 max-w-3xl">
                        Please save the emergency hotline <strong>+1-800-555-0199</strong> to your phone contacts.
                        Ensure you have the Policy Certificate downloaded offline in case of internet outage.
                    </p>
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState, useEffect } from 'react';
import { JobOfferService } from '../services';
import {
    FileSignature,
    Send,
    CheckCircle,
    Clock,
    User,
    Download
} from 'lucide-react';

export default function OfferManagementPage() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, accepted: 0, awaitingSignature: 0 });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const data = await JobOfferService.getOffers();
            setOffers(data);

            const awaitingSignature = data.filter((o: any) => o.status === 'sent').length;
            const accepted = data.filter((o: any) => o.status === 'accepted').length;
            const pending = data.filter((o: any) => o.status === 'pending').length;
            setStats({ pending, accepted, awaitingSignature });
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOffer = async (offerData: any) => {
        try {
            await JobOfferService.createOffer(offerData);
            await fetchOffers();
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    };

    const handleSendOffer = async (offerId: string) => {
        try {
            await JobOfferService.sendOffer(offerId);
            await fetchOffers();
        } catch (error) {
            console.error('Error sending offer:', error);
        }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileSignature className="w-6 h-6 text-indigo-500" />
                        Offer Management
                    </h1>
                    <p className="text-slate-500 text-sm">Create, approve, and track candidate offers.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Send className="w-4 h-4" /> Create New Offer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-3xl font-black text-indigo-600">8</div>
                    <div className="text-sm font-bold text-slate-500">Offers Out for Signature</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-3xl font-black text-emerald-600">12</div>
                    <div className="text-sm font-bold text-slate-500">Accepted this Month</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-3xl font-black text-amber-600">3</div>
                    <div className="text-sm font-bold text-slate-500">Pending Approval</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold text-slate-500 text-sm flex">
                    <div className="w-1/3">Candidate & Role</div>
                    <div className="w-1/3">Stage</div>
                    <div className="w-1/3 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { name: 'Michael Chen', role: 'Senior Frontend Engineer', stage: 'Sent to Candidate', date: '2 days ago', status: 'pending' },
                        { name: 'Sarah Miller', role: 'Product Manager', stage: 'Internal Approval', date: '4 hours ago', status: 'approval' },
                        { name: 'James Wilson', role: 'DevOps Engineer', stage: 'Accepted', date: 'Yesterday', status: 'accepted' },
                    ].map((offer, i) => (
                        <div key={i} className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="w-1/3">
                                <div className="font-bold flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {offer.name}
                                </div>
                                <div className="text-xs text-slate-500 ml-6">{offer.role}</div>
                            </div>
                            <div className="w-1/3">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                                        offer.status === 'approval' ? 'bg-amber-100 text-amber-600' :
                                            'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {offer.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                                    {offer.status === 'approval' && <Clock className="w-3 h-3" />}
                                    {offer.stage}
                                </div>
                            </div>
                            <div className="w-1/3 flex justify-end gap-2">
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

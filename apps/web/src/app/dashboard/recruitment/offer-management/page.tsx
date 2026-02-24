"use client";

import React, { useState, useEffect } from 'react';
import { JobOfferService } from '../services';
import {
    FileSignature,
    Send,
    CheckCircle,
    Clock,
    User,
    Download,
    Loader2
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
            setLoading(true);
            const data = await JobOfferService.getOffers();
            setOffers(data);

            const awaitingSignature = data.filter((o: any) => o.status === 'sent').length;
            const accepted = data.filter((o: any) => o.status === 'accepted').length;
            const pending = data.filter((o: any) => o.status === 'pending' || o.status === 'draft').length;
            setStats({ pending, accepted, awaitingSignature });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOffer = async (offerData: any) => {
        try {
            await JobOfferService.createOffer(offerData);
            await fetchOffers();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSendOffer = async (offerId: string) => {
        try {
            await JobOfferService.sendOffer(offerId);
            await fetchOffers();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getOfferStageLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Draft';
            case 'pending': return 'Pending Approval';
            case 'approved': return 'Approved';
            case 'sent': return 'Sent to Candidate';
            case 'accepted': return 'Accepted';
            case 'declined': return 'Declined';
            default: return status;
        }
    };

    const getOfferStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-100 text-emerald-600';
            case 'pending': case 'draft': case 'approved': return 'bg-amber-100 text-amber-600';
            case 'declined': return 'bg-rose-100 text-rose-600';
            default: return 'bg-indigo-100 text-indigo-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading offers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-3xl font-black text-indigo-600">{stats.awaitingSignature}</div>
                    <div className="text-sm font-bold text-slate-500">Offers Out for Signature</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-3xl font-black text-emerald-600">{stats.accepted}</div>
                    <div className="text-sm font-bold text-slate-500">Accepted</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-3xl font-black text-amber-600">{stats.pending}</div>
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
                    {offers.length === 0 && (
                        <div className="p-12 text-center">
                            <FileSignature className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No offers yet</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Create your first offer to get started.</p>
                        </div>
                    )}
                    {offers.map((offer: any) => (
                        <div key={offer.id} className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="w-1/3">
                                <div className="font-bold flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {offer.jobTitle || 'Untitled Position'}
                                </div>
                                <div className="text-xs text-slate-500 ml-6">{offer.department || 'No department'}</div>
                            </div>
                            <div className="w-1/3">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getOfferStatusStyle(offer.status)}`}>
                                    {offer.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                                    {(offer.status === 'pending' || offer.status === 'draft') && <Clock className="w-3 h-3" />}
                                    {getOfferStageLabel(offer.status)}
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


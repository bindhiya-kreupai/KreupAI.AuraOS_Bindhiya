"use client";

import React, { useState, useEffect } from 'react';
import { FileBadge, Plus, Download, Loader2 } from 'lucide-react';
import { TravelRequestService } from '../services';

export default function VisaSupportPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await TravelRequestService.getRequests();
            setRequests(Array.isArray(data) ? data : []);
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
                <span className="ml-2 text-sm text-slate-500">Loading visa support...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <FileBadge className="w-8 h-8 text-indigo-500" />
                        Visa Support
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Request invitation letters and track visa applications.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">Available Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ServiceCard
                            title="Invitation Letters"
                            desc="Official company letters for business visa applications."
                            icon={FileTextIcon}
                        />
                        <ServiceCard
                            title="Embassy Appointments"
                            desc="Assistance with scheduling consulate interviews."
                            icon={CalendarIcon}
                        />
                        <ServiceCard
                            title="Document Review"
                            desc="Expert review of application forms before submission."
                            icon={CheckIcon}
                        />
                        <ServiceCard
                            title="Passport Services"
                            desc="Renewal assistance and additional page requests."
                            icon={BookIcon}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-slate-100">My Requests</h3>
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <FileBadge className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No visa requests found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req: any) => (
                                <div key={req.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{req.destination || 'Visa Request'}</div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {req.status}
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500 mb-3">{req.purpose || 'Business Visa'}</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                                        {req.status === 'approved' && (
                                            <button className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
                                                <Download className="w-3 h-3" /> Download
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ServiceCard({ title, desc, icon: Icon }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm">{desc}</p>
        </div>
    );
}

const FileTextIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const BookIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);

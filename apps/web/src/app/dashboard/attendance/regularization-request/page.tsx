// Using RegularizationService.getPendingRequests() for regularization request data
"use client";

import React, { useState, useEffect } from 'react';
import {
    FileCheck,
    Plus,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal
} from 'lucide-react';
import { RegularizationService } from '../services';

interface RegularizationRequest {
    id: number;
    date: string;
    type: string;
    reason: string;
    status: 'Approved' | 'Rejected' | 'Pending';
    approver: string;
}

interface RequestForm {
    date: string;
    type: string;
    checkIn: string;
    checkOut: string;
    reason: string;
}

export default function RegularizationRequestPage() {
    const [requests, setRequests] = useState<RegularizationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<RequestForm>({
        date: '',
        type: 'Missed Punch',
        checkIn: '',
        checkOut: '',
        reason: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Using RegularizationService.getPendingRequests() for regularization requests
            const result = await RegularizationService.getPendingRequests();
            if (result && result.length > 0) {
                setRequests(result as any);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Submit regularization using RegularizationService
            await RegularizationService.submitRegularization({
                date: form.date,
                reason: form.reason,
                requestedInTime: form.checkIn,
                requestedOutTime: form.checkOut,
            } as any);
            await fetchRequests();
            setForm({ date: '', type: 'Missed Punch', checkIn: '', checkOut: '', reason: '' });
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof RequestForm, value: string) => {
        setForm({ ...form, [field]: value });
    };
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-indigo-500" />
                        Regularization Requests
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Correct attendance anomalies and missed punches.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Request Form Sidebar */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-4">Submit Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option>Missed Punch</option>
                                <option>Late In</option>
                                <option>Early Out</option>
                                <option>On Duty (OD)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Check In</label>
                                <input
                                    type="time"
                                    value={form.checkIn}
                                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Check Out</label>
                                <input
                                    type="time"
                                    value={form.checkOut}
                                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                            <textarea
                                rows={3}
                                value={form.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                placeholder="Enter justification..." />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            Submit Request
                        </button>
                    </form>
                </div>

                {/* History List */}
                <div className="col-span-1 lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl px-1">Recent Requests</h3>
                    {requests.map((req) => (
                        <div key={req.id} className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                        req.status === 'Rejected' ? 'bg-rose-100 text-rose-600' :
                                            'bg-amber-100 text-amber-600'
                                    }`}>
                                    {req.status === 'Approved' ? <CheckCircle className="w-6 h-6" /> :
                                        req.status === 'Rejected' ? <XCircle className="w-6 h-6" /> :
                                            <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-ink-black dark:text-pearl">{req.type}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{req.date}</span>
                                    </div>
                                    <p className="text-sm text-silver-mist mt-0.5">{req.reason}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${req.status === 'Approved' ? 'text-emerald-500' :
                                            req.status === 'Rejected' ? 'text-rose-500' :
                                                'text-amber-500'
                                        }`}>{req.status}</div>
                                    <div className="text-xs text-silver-mist">by {req.approver}</div>
                                </div>
                                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

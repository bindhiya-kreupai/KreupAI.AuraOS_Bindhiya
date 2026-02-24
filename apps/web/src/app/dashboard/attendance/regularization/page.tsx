"use client";

import React, { useState, useEffect } from 'react';
import {
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
    Calendar
} from 'lucide-react';
import { RegularizationService } from '../services';

interface RegularizationRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    type: string;
    reason: string;
    status: string;
    requestedTime?: string;
}

export default function RegularizationPage() {
    const [requests, setRequests] = useState<RegularizationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: 'MISSED_PUNCH',
        date: '',
        timeIn: '',
        timeOut: '',
        reason: '',
    });

    useEffect(() => {
        fetchRegularizations();
    }, []);

    const fetchRegularizations = async () => {
        try {
            const result = await RegularizationService.getRegularizations({ status: 'PENDING' });
            setRequests(result as any);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setLoading(true);
        try {
            if (status === 'APPROVED') {
                await RegularizationService.approveRegularization(id, 'current-user', 'Approved from UI');
            } else {
                await RegularizationService.rejectRegularization(id, 'current-user', 'Rejected from UI');
            }
            await fetchRegularizations();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await RegularizationService.submitRegularization({
                employeeId: 'current-user',
                date: formData.date,
                type: formData.type as any,
                reason: formData.reason,
                requestedCheckIn: formData.timeIn,
                requestedCheckOut: formData.timeOut,
            } as any);
            await fetchRegularizations();
            setFormData({ type: 'MISSED_PUNCH', date: '', timeIn: '', timeOut: '', reason: '' });
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-amber-500" />
                        Regularization & Exceptions
                    </h1>
                    <p className="text-slate-500 text-sm">Handle missed punches, system errors, and attendance disputes.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100 dark:border-amber-800/30">
                    <AlertCircle className="w-4 h-4" /> {requests.length} Pending Requests
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0">
                {/* Request List */}
                <div className="space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Incoming Requests</h3>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-slate-500">Loading...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        requests.map((r, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                        {r.employeeName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{r.employeeName}</h4>
                                        <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(r.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded">
                                    {r.type}
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 italic">
                                "{r.reason}"
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(r.id, 'APPROVED')}
                                    disabled={loading}
                                    className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleApprove(r.id, 'REJECTED')}
                                    disabled={loading}
                                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold disabled:opacity-50">
                                    Deny
                                </button>
                            </div>
                        </div>
                    )))}
                </div>

                {/* My Requests (Simulation) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> Raise New Request
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Request Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold">
                                <option value="MISSED_PUNCH">Missed Punch Adjustment</option>
                                <option value="LATE_ENTRY">Late Entry Waiver</option>
                                <option value="EARLY_EXIT">Early Exit Permission</option>
                                <option value="ON_DUTY">On Duty (Field Work)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Time (In / Out)</label>
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    value={formData.timeIn}
                                    onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                                <input
                                    type="time"
                                    value={formData.timeOut}
                                    onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Reason</label>
                            <textarea
                                rows={3}
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold"
                                placeholder="Reason for regularization..."></textarea>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.date || !formData.reason}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50">
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import React, { useState, useEffect } from 'react';
import { Plane, Calendar, MapPin, Briefcase, ChevronRight, CheckCircle } from 'lucide-react';
import { TravelRequestService } from '../services';

export default function TravelRequestPage() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const requests = await TravelRequestService.getRequests();
            setData(requests);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Plane className="w-8 h-8 text-indigo-500" />
                        New Travel Request
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Submit details for your upcoming business trip.</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 max-w-2xl">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {s}
                        </div>
                        <span className={`text-sm font-bold hidden md:block ${step >= s ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                            {s === 1 ? 'Trip Details' : s === 2 ? 'Logistics' : 'Review'}
                        </span>
                        {s < 3 && <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2" />}
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-4xl">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Trip Basics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Trip Purpose</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                    <option>Client Meeting</option>
                                    <option>Conference</option>
                                    <option>Internal Training</option>
                                    <option>Project Work</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Project / Cost Center</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="e.g. PROJ-2024-X" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description / Justification</label>
                                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm h-32" placeholder="Explain the business need for this trip..." />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" /> Destination & Logistics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Origin City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="New York (JFK)" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Destination City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="London (LHR)" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Departure Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="date" className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Return Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="date" className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="hotel" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                            <label htmlFor="hotel" className="text-sm font-bold text-slate-700 dark:text-slate-300">Hotel Booking Required</label>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-center">
                            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Ready to Submit?</h3>
                            <p className="text-emerald-600/80 dark:text-emerald-300/80">
                                Your request to <strong>London (LHR)</strong> for <strong>Client Meeting</strong> looks good.
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Estimated Cost:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">$2,400.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Approver:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">Sarah Connor (Manager)</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {step > 1 ? (
                        <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                            Back
                        </button>
                    ) : <div />}

                    {step < 3 ? (
                        <button onClick={() => setStep(s => s + 1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                            Next Step <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                            Submit Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

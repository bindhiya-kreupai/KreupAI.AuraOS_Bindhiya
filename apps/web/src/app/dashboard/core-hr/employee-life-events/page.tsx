"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    Cake,
    Baby,
    Home,
    Calendar,
    Check,
    X as XIcon
} from 'lucide-react';
import { LifeEventService } from '../services';

export default function LifeEventsPage() {
    const [employeeLifeEvents, setEmployeeLifeEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployeeLifeEvents();
    }, []);

    const fetchEmployeeLifeEvents = async () => {
        try {
            const data = await LifeEventService.getAllLifeEvents();
            setEmployeeLifeEvents(data);
        } catch (error) {
            console.error('Error fetching employee life events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock Data
    const [requests, setRequests] = useState([
        { id: 1, name: 'Michael Chen', type: 'Marriage', date: 'Nov 20, 2023', icon: Ring, color: 'text-rose-500 bg-rose-50', status: 'Pending' },
        { id: 2, name: 'Sarah Williams', type: 'Child Birth', date: 'Dec 01, 2023', icon: Baby, color: 'text-blue-500 bg-blue-50', status: 'Pending' },
        { id: 3, name: 'David Miller', type: 'Address Change', date: 'Dec 03, 2023', icon: Home, color: 'text-emerald-500 bg-emerald-50', status: 'Pending' },
    ]);

    const handleAction = (id: number, action: 'Approve' | 'Reject') => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: action === 'Approve' ? 'Approved' : 'Rejected' } : req
        ));
    };

    const handleWish = (name: string) => {
        alert(`Birthday wish sent to ${name}!`);
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        Employee Life Events
                    </h1>
                    <p className="text-slate-500 text-sm">Celebrate milestones and manage personal updates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Birthdays */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Cake className="w-5 h-5 text-indigo-500" /> Birthdays (This Month)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Alice Cooper', date: 'Dec 12', turn: '32' },
                            { name: 'John Doe', date: 'Dec 15', turn: '29' },
                            { name: 'Emily White', date: 'Dec 24', turn: '41' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-100 group-hover:border-indigo-400 transition-colors">
                                    <img src={`https://i.pravatar.cc/150?u=${item.name}`} alt={item.name} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.date}</div>
                                </div>
                                <button
                                    onClick={() => handleWish(item.name)}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full hover:bg-indigo-100 active:scale-95 transition-all"
                                >
                                    Send Wish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Approvals */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Pending Event Declarations</h3>
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${req.color}`}>
                                        <req.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{req.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            {req.type} • <Calendar className="w-3 h-3" /> {req.date}
                                        </div>
                                    </div>
                                </div>

                                {req.status === 'Pending' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(req.id, 'Approve')}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1"
                                        >
                                            <Check className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'Reject')}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1"
                                        >
                                            <XIcon className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2 rounded-lg text-sm font-bold
                                        ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
                                    `}>
                                        {req.status}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Ring(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10.5c0 4.14-3.36 7.5-7.5 7.5s-7.5-3.36-7.5-7.5S10.36 3 14.5 3c2.75 0 5.16 1.48 6.44 3.7" /><path d="M14.5 3a7.5 7.5 0 0 1 7.5 7.5" /><path d="M8 11.5A3.5 3.5 0 0 1 11.5 8" /><path d="M7.78 6.41L11.5 8" /><circle cx="5" cy="18" r="3" /></svg> }

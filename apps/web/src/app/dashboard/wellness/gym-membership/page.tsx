'use client';

import React, { useState, useEffect } from 'react';
import { Dumbbell, MapPin, CheckCircle, Smartphone, Loader2 } from 'lucide-react';
import { GymMembershipService } from '../services';

const GYMS = [
    { id: 1, name: 'Gold\'s Gym - Downtown', distance: '0.8 miles', rating: 4.8, status: 'Partner', image: 'bg-yellow-500' },
    { id: 2, name: 'Anytime Fitness', distance: '1.2 miles', rating: 4.6, status: 'Partner', image: 'bg-purple-600' },
    { id: 3, name: 'CrossFit Central', distance: '2.5 miles', rating: 4.9, status: 'Partner', image: 'bg-slate-800' },
];

export default function GymMembershipPage() {
    const [memberships, setMemberships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await GymMembershipService.getMemberships();
                setMemberships(Array.isArray(data) ? data : []);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-cyan-500" />
                        Gym Membership
                    </h1>
                    <p className="text-slate-500 text-sm">Access premium fitness centers with your corporate plan.</p>
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Active Membership
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Digital Card */}
                <div className="lg:col-span-1">
                    <div className="rotate-1 hover:rotate-0 transition-transform duration-300">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-2xl border border-slate-700 relative overflow-hidden h-[220px] flex flex-col justify-between">
                            {/* Decorative Circles */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

                            <div className="flex justify-between items-start">
                                <div className="font-bold text-lg tracking-widest">AURA<span className="text-cyan-400">FIT</span></div>
                                <Smartphone className="w-6 h-6 text-slate-400" />
                            </div>

                            <div className="space-y-4">
                                <div className="font-mono text-xl tracking-widest opacity-80">
                                    **** **** **** 8842
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Card Holder</div>
                                        <div className="font-medium">ALEX JOHNSON</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Expires</div>
                                        <div className="font-medium">12/26</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <button className="text-sm font-bold text-cyan-600 hover:underline">Download to Apple Wallet</button>
                    </div>
                </div>

                {/* Gym Finder */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg">Partner Gyms Nearby</h3>
                    <div className="space-y-3">
                        {GYMS.map(gym => (
                            <div key={gym.id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs ${gym.image}`}>
                                    LOGO
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold">{gym.name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {gym.distance}</span>
                                        <span className="flex items-center gap-1 text-amber-500 font-bold">★ {gym.rating}</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">
                                    Check In
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full text-center py-3 text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        View Map
                    </button>
                </div>
            </div>
        </div>
    );
}


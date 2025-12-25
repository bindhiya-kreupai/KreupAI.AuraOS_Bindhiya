"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Link,
    CheckCircle2,
    DollarSign,
    Copy,
    Share2
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function ReferralProgramPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const posts = await SocialFeedService.getPosts();
            setData(posts.filter(p => p.type === 'referral'));
        } catch (error) {
            console.error('Error fetching referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Referral Program
                    </h1>
                    <p className="text-slate-500 text-sm">Refer talent to Aura and earn bonuses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                        <div className="text-indigo-200 text-sm font-bold uppercase mb-2">Total Referrals</div>
                        <div className="text-4xl font-bold">12</div>
                    </div>
                    <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                        <div className="text-emerald-200 text-sm font-bold uppercase mb-2">Offers Accepted</div>
                        <div className="text-4xl font-bold">4</div>
                    </div>
                    <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
                        <div className="text-amber-100 text-sm font-bold uppercase mb-2">Bonus Earned</div>
                        <div className="text-4xl font-bold">$4,500</div>
                    </div>
                </div>

                {/* Share Link */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4">Share Your Link</h3>
                    <p className="text-sm text-slate-500 mb-4">Anyone who applies using this link will be tracked as your referral.</p>

                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center gap-2 mb-4 border border-slate-100 dark:border-slate-700">
                        <Link className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-mono truncate flex-1 text-slate-600 dark:text-slate-400">aura.os/careers?ref=alex_m</span>
                        <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-indigo-600"><Copy className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-2 bg-[#0077b5] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                            LinkedIn
                        </button>
                        <button className="py-2 bg-[#1da1f2] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                            Twitter
                        </button>
                    </div>
                </div>

                {/* Status Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Referral Status</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Michael Scott', role: 'Regional Manager', status: 'Hired', bonus: '$1,500', date: 'Nov 12' },
                            { name: 'Pam Beesly', role: 'Office Administrator', status: 'Interviewing', bonus: 'Pending', date: 'Dec 01' },
                            { name: 'Jim Halpert', role: 'Sales Executive', status: 'Screening', bonus: 'Pending', date: 'Dec 05' },
                        ].map((ref, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold">{ref.name}</h4>
                                    <div className="text-xs text-slate-500">{ref.role} • Referred on {ref.date}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block mb-1 ${ref.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {ref.status}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {ref.bonus === 'Pending' ? 'Bonus Pending' : <span className="text-emerald-600 flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" /> {ref.bonus}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

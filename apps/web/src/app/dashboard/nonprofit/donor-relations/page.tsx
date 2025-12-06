"use client";

import React, { useState } from 'react';
import {
    Heart,
    DollarSign,
    Gift,
    MessageCircle
} from 'lucide-react';

export default function DonorRelationsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        Donor Relations
                    </h1>
                    <p className="text-slate-500 text-sm">Manage fundraising campaigns and donor engagement.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Raised (YTD)', val: '$4.2M', color: 'text-emerald-500' },
                    { label: 'New Donors', val: '1,540', color: 'text-indigo-500' },
                    { label: 'Recurring Gifts', val: '$180k/mo', color: 'text-rose-500' },
                    { label: 'Avg Donation', val: '$85.00', color: 'text-cyan-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Major Donations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Donor</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Thank You Sent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { donor: 'Acme Corp Foundation', amount: '$50,000', camp: 'Water Initiative', date: 'Oct 24', sent: true },
                                    { donor: 'John Doe Trust', amount: '$25,000', camp: 'Education Fund', date: 'Oct 22', sent: true },
                                    { donor: 'Global Tech Inc.', amount: '$100,000', camp: 'Disaster Relief', date: 'Oct 20', sent: false },
                                ].map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold">{d.donor}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">{d.amount}</td>
                                        <td className="px-6 py-4 text-slate-500">{d.camp}</td>
                                        <td className="px-6 py-4">{d.date}</td>
                                        <td className="px-6 py-4 text-center">
                                            {d.sent ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold">✓</span>
                                            ) : (
                                                <button className="text-xs font-bold text-indigo-600 hover:underline">Send Now</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Campaign Progress</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Annual Gala 2024', raised: '$850k', target: '$1M', percent: '85%' },
                            { name: 'Winter Coat Drive', raised: '$42k', target: '$100k', percent: '42%' },
                            { name: 'Scholarship Fund', raised: '$210k', target: '$200k', percent: '105%' },
                        ].map((camp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-end mb-1">
                                    <div className="font-bold text-sm">{camp.name}</div>
                                    <div className="text-xs font-bold text-slate-500">{camp.raised} / {camp.target}</div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full ${parseInt(camp.percent) >= 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        style={{ width: parseInt(camp.percent) > 100 ? '100%' : camp.percent }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800">View All Campaigns</button>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import {
    ArrowRightLeft,
    ArrowRight,
    Building2,
    Users
} from 'lucide-react';

export default function PositionTransferPage() {
    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
                        Position Transfer
                    </h1>
                    <p className="text-slate-500 text-sm">Move positions and budget between cost centers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Transfer Request</h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Source</label>
                            <select className="w-full p-2 bg-transparent border-b border-slate-200 dark:border-slate-800 outline-none font-bold">
                                <option>Engineering (Cost Center 001)</option>
                            </select>
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Position to Move</label>
                                <select className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
                                    <option>Senior DevOps Engineer (POS-042)</option>
                                    <option>QA Lead (POS-019)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                                <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                            <label className="block text-xs font-bold text-indigo-500 mb-2 uppercase">Destination</label>
                            <select className="w-full p-2 bg-transparent border-b border-indigo-200 dark:border-indigo-800 outline-none font-bold text-indigo-900 dark:text-indigo-100">
                                <option>Cloud Infrastructure (Cost Center 005)</option>
                                <option>IT Ops (Cost Center 009)</option>
                            </select>
                        </div>

                        <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                            Initiate Transfer
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 uppercase text-xs">Recent Transfers</h3>
                    {[
                        { title: 'Product Manager', from: 'Marketing', to: 'Product', date: 'Yesterday' },
                        { title: 'HR Associate', from: 'Admin', to: 'People Ops', date: '2 days ago' },
                        { title: 'Data Analyst', from: 'IT', to: 'Finance', date: 'Last Week' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h4 className="font-bold mb-2">{item.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {item.from}</span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {item.to}</span>
                            </div>
                            <div className="mt-3 text-xs text-slate-400 font-bold text-right">{item.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


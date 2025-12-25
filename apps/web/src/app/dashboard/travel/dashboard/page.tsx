"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plane, Receipt, ShieldCheck } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { TravelAnalyticsService } from '../services';

export default function GenericDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const metrics = await TravelAnalyticsService.getMetrics();
            setData(metrics);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const shortcuts = [
        'Travel Request',
        'Expense Claims',
        'Travel Policy',
        'Booking Integration'
    ];

    return (
        <div className="space-y-8">
            <div className="p-6">
                <div className="flex items-center justify-center p-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl mb-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <LayoutDashboard className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Travel Overview</h1>
                        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                            Welcome to the Travel Management Hub. Access your trips, policies, and booking tools from here.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm">
                        <Plane className="w-8 h-8 text-indigo-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Book a Trip</h3>
                        <p className="text-slate-500">Launch booking wizard</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm">
                        <Receipt className="w-8 h-8 text-emerald-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Expenses</h3>
                        <p className="text-slate-500">View pending claims</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm">
                        <ShieldCheck className="w-8 h-8 text-rose-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Safety Center</h3>
                        <p className="text-slate-500">Emergency support</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Heart,
    Briefcase,
    GraduationCap,
    DollarSign,
    Umbrella
} from 'lucide-react';
import { TotalRewardsService } from '../services';

export default function TotalRewardsPage() {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await TotalRewardsService.getStatements();
            setStatements(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Total Rewards Statement
                    </h1>
                    <p className="text-slate-500 text-sm">A holistic view of the investment in you.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Annual Value</div>
                    <div className="text-2xl font-bold text-emerald-600">$142,500</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Cash Compensation', val: '$110,000', icon: DollarSign, color: 'text-indigo-500', items: ['Basic Salary', 'Bonuses', 'Allowances'] },
                    { title: 'Health & Wellness', val: '$12,500', icon: Heart, color: 'text-rose-500', items: ['Health Insurance', 'Gym Allowance', 'Mental Health Support'] },
                    { title: 'Retirement Benefits', val: '$8,000', icon: Umbrella, color: 'text-emerald-500', items: ['401(k) Match', 'Pension Plan'] },
                    { title: 'Equity / Stock', val: '$10,000', icon: TrendingIcon, color: 'text-purple-500', items: ['ESOP Grants', 'Performance Shares'] },
                    { title: 'Learning & Dev', val: '$2,000', icon: GraduationCap, color: 'text-amber-500', items: ['Course Reimbursements', 'Conference Tickets'] },
                    { title: 'Perks', val: 'Priceless', icon: PerkIcon, color: 'text-cyan-500', items: ['Remote Work', 'Free Lunch', 'Team Retreats'] },
                ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{card.val}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                        <ul className="space-y-2 mt-auto">
                            {card.items.map((item, j) => (
                                <li key={j} className="text-sm text-slate-500 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrendingIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> }
function PerkIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> }

"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Heart,
    Briefcase,
    GraduationCap,
    DollarSign,
    Umbrella,
    Loader2
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const statement = statements.length > 0 ? statements[0] : null;
    const directComp = statement?.directCompensation || {};
    const benefits = statement?.benefits || {};
    const stockComp = statement?.stockCompensation || {};
    const otherComp = statement?.otherCompensation || {};
    const totalRewards = statement?.totalRewards || statement?.grandTotal || 0;

    const cards = [
        {
            title: 'Cash Compensation',
            val: directComp.totalDirectCompensation || directComp.total
                ? `$${Number(directComp.totalDirectCompensation || directComp.total).toLocaleString()}`
                : '--',
            icon: DollarSign,
            color: 'text-indigo-500',
            items: ['Basic Salary', 'Bonuses', 'Allowances']
        },
        {
            title: 'Health & Wellness',
            val: benefits.totalBenefits || benefits.total
                ? `$${Number(benefits.totalBenefits || benefits.total).toLocaleString()}`
                : '--',
            icon: Heart,
            color: 'text-rose-500',
            items: ['Health Insurance', 'Life Insurance', 'Retirement']
        },
        {
            title: 'Retirement Benefits',
            val: benefits.retirementContributions
                ? `$${Number(benefits.retirementContributions).toLocaleString()}`
                : '--',
            icon: Umbrella,
            color: 'text-emerald-500',
            items: ['PF Contributions', 'Pension Plan']
        },
        {
            title: 'Equity / Stock',
            val: stockComp.grantedValue || stockComp.total || stockComp.stockGrantsValue
                ? `$${Number(stockComp.grantedValue || stockComp.total || stockComp.stockGrantsValue).toLocaleString()}`
                : '--',
            icon: TrendingIcon,
            color: 'text-purple-500',
            items: ['ESOP Grants', 'Performance Shares']
        },
        {
            title: 'Other Compensation',
            val: otherComp.totalOther || otherComp.total
                ? `$${Number(otherComp.totalOther || otherComp.total).toLocaleString()}`
                : '--',
            icon: GraduationCap,
            color: 'text-amber-500',
            items: ['Reimbursements', 'Perks']
        },
        {
            title: 'Total Rewards',
            val: totalRewards ? `$${Number(totalRewards).toLocaleString()}` : '--',
            icon: PerkIcon,
            color: 'text-cyan-500',
            items: statement ? [
                `Employee: ${statement.employeeName || '--'}`,
                `FY: ${statement.fiscalYear || '--'}`,
            ] : ['Generate a statement to view']
        },
    ];

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Total Rewards Statement
                    </h1>
                    <p className="text-slate-500 text-sm">A holistic view of the investment in you.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Annual Value</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        {totalRewards ? `$${Number(totalRewards).toLocaleString()}` : '--'}
                    </div>
                </div>
            </div>

            {statements.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No total rewards statements available.</p>
                    <p className="text-xs text-slate-300 mt-1">Statements will be generated based on your compensation data.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cards.map((card, i) => (
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
            )}
        </div>
    );
}

function TrendingIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> }
function PerkIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> }


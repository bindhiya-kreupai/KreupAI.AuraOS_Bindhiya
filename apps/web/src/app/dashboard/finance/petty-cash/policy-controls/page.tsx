"use client";

import React, { useState, useEffect } from 'react';
import {
    Shield,
    DollarSign,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Settings,
    Lock,
    Unlock,
    Edit,
    Plus,
    Download,
    Clock,
    BarChart3,
    TrendingUp,
    Package,
    Briefcase,
    UserCheck,
    Loader2
} from 'lucide-react';
import { PettyCashService } from '../../services';

type PolicyCategory = 'all' | 'spending-limits' | 'approval-workflow' | 'category-rules' | 'receipt-policy';

interface SpendingLimit {
    id: string;
    name: string;
    type: 'role' | 'department' | 'category';
    target: string;
    singleTransactionLimit: number;
    dailyLimit: number;
    monthlyLimit: number;
    requiresApproval: boolean;
    approvalThreshold: number;
    status: 'active' | 'inactive';
}

interface ApprovalRule {
    id: string;
    name: string;
    amountThreshold: number;
    approvers: string[];
    requiredApprovals: number;
    autoApproveBelow: number;
    escalationTimeout: number;
    status: 'active' | 'inactive';
}

interface CategoryRule {
    id: string;
    category: string;
    allowed: boolean;
    maxAmount: number;
    requiresReceipt: boolean;
    requiresJustification: boolean;
    restrictedTo: string[];
    icon: any;
    color: string;
}

export default function PolicyControlsPage() {
    const [activeTab, setActiveTab] = useState<'limits' | 'approvals' | 'categories' | 'compliance'>('limits');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await PettyCashService.getFunds();
                setPolicies(data as any[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const [spendingLimits, setSpendingLimits] = useState<any[]>([]);

    const approvalRules: ApprovalRule[] = [
        {
            id: 'AR-001',
            name: 'Small Purchases (Under $50)',
            amountThreshold: 50,
            approvers: ['Any Manager'],
            requiredApprovals: 1,
            autoApproveBelow: 25,
            escalationTimeout: 24,
            status: 'active'
        },
        {
            id: 'AR-002',
            name: 'Medium Purchases ($50-$200)',
            amountThreshold: 200,
            approvers: ['Department Manager'],
            requiredApprovals: 1,
            autoApproveBelow: 50,
            escalationTimeout: 12,
            status: 'active'
        },
        {
            id: 'AR-003',
            name: 'Large Purchases ($200-$500)',
            amountThreshold: 500,
            approvers: ['Department Manager', 'Finance Manager'],
            requiredApprovals: 2,
            autoApproveBelow: 200,
            escalationTimeout: 8,
            status: 'active'
        },
        {
            id: 'AR-004',
            name: 'Very Large Purchases (Over $500)',
            amountThreshold: 999999,
            approvers: ['Department Head', 'Finance Director', 'CFO'],
            requiredApprovals: 2,
            autoApproveBelow: 500,
            escalationTimeout: 4,
            status: 'active'
        }
    ];

    const categoryRules: CategoryRule[] = [
        {
            id: 'CR-001',
            category: 'Office Supplies',
            allowed: true,
            maxAmount: 100,
            requiresReceipt: true,
            requiresJustification: false,
            restrictedTo: ['All Employees'],
            icon: Package,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        },
        {
            id: 'CR-002',
            category: 'Client Meals',
            allowed: true,
            maxAmount: 150,
            requiresReceipt: true,
            requiresJustification: true,
            restrictedTo: ['Sales', 'Management'],
            icon: Users,
            color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        },
        {
            id: 'CR-003',
            category: 'Travel & Transport',
            allowed: true,
            maxAmount: 75,
            requiresReceipt: true,
            requiresJustification: true,
            restrictedTo: ['All Employees'],
            icon: Briefcase,
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
        },
        {
            id: 'CR-004',
            category: 'Utilities',
            allowed: true,
            maxAmount: 200,
            requiresReceipt: true,
            requiresJustification: false,
            restrictedTo: ['Operations', 'Facilities'],
            icon: Settings,
            color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
        },
        {
            id: 'CR-005',
            category: 'Maintenance & Repairs',
            allowed: true,
            maxAmount: 300,
            requiresReceipt: true,
            requiresJustification: true,
            restrictedTo: ['Facilities', 'IT'],
            icon: Settings,
            color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        },
        {
            id: 'CR-006',
            category: 'Personal Expenses',
            allowed: false,
            maxAmount: 0,
            requiresReceipt: false,
            requiresJustification: false,
            restrictedTo: [],
            icon: XCircle,
            color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        }
    ];

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'role':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'department':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'category':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    };

    const activeLimits = spendingLimits.filter(sl => sl.status === 'active').length;
    const activeApprovals = approvalRules.filter(ar => ar.status === 'active').length;
    const allowedCategories = categoryRules.filter(cr => cr.allowed).length;
    const avgApprovalThreshold = spendingLimits.reduce((sum, sl) => sum + sl.approvalThreshold, 0) / spendingLimits.length;

    const stats = [
        {
            label: 'Active Spending Limits',
            value: activeLimits,
            icon: DollarSign,
            color: 'text-blue-600',
            subtext: `${spendingLimits.length} total rules`
        },
        {
            label: 'Approval Rules',
            value: activeApprovals,
            icon: UserCheck,
            color: 'text-emerald-600',
            subtext: `${approvalRules.length} workflows`
        },
        {
            label: 'Allowed Categories',
            value: allowedCategories,
            icon: Package,
            color: 'text-purple-600',
            subtext: `${categoryRules.length} total categories`
        },
        {
            label: 'Avg Approval Threshold',
            value: `$${avgApprovalThreshold.toFixed(0)}`,
            icon: TrendingUp,
            color: 'text-indigo-600',
            subtext: 'Across all policies'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        Policy Controls
                    </h1>
                    <p className="text-slate-500 text-sm">Configure spending limits, approval workflows, and compliance rules</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export Policies
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Plus className="w-4 h-4" /> New Policy
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 shrink-0 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                <button
                    className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                        activeTab === 'limits'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    onClick={() => setActiveTab('limits')}
                >
                    Spending Limits
                </button>
                <button
                    className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                        activeTab === 'approvals'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    onClick={() => setActiveTab('approvals')}
                >
                    Approval Workflows
                </button>
                <button
                    className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                        activeTab === 'categories'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    onClick={() => setActiveTab('categories')}
                >
                    Category Rules
                </button>
                <button
                    className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                        activeTab === 'compliance'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    onClick={() => setActiveTab('compliance')}
                >
                    Compliance
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Spending Limits Tab */}
                {activeTab === 'limits' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Policy Name</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Target</th>
                                        <th className="p-4">Single Transaction</th>
                                        <th className="p-4">Daily Limit</th>
                                        <th className="p-4">Monthly Limit</th>
                                        <th className="p-4">Approval Threshold</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {spendingLimits.map((limit) => (
                                        <tr key={limit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold">{limit.name}</div>
                                                <div className="text-xs text-slate-500">{limit.id}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getTypeColor(limit.type)}`}>
                                                    {limit.type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium">{limit.target}</td>
                                            <td className="p-4 font-mono font-bold">${limit.singleTransactionLimit}</td>
                                            <td className="p-4 font-mono">${limit.dailyLimit}</td>
                                            <td className="p-4 font-mono">${limit.monthlyLimit}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {limit.requiresApproval ? (
                                                        <Lock className="w-4 h-4 text-amber-500" />
                                                    ) : (
                                                        <Unlock className="w-4 h-4 text-emerald-500" />
                                                    )}
                                                    <span className="font-mono">${limit.approvalThreshold}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(limit.status)}`}>
                                                    {limit.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Approval Workflows Tab */}
                {activeTab === 'approvals' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Rule Name</th>
                                        <th className="p-4">Amount Threshold</th>
                                        <th className="p-4">Auto-Approve Below</th>
                                        <th className="p-4">Required Approvers</th>
                                        <th className="p-4">Approver Roles</th>
                                        <th className="p-4">Escalation Timeout</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {approvalRules.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold">{rule.name}</div>
                                                <div className="text-xs text-slate-500">{rule.id}</div>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-lg">
                                                ${rule.amountThreshold >= 999999 ? '∞' : rule.amountThreshold}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    <span className="font-mono">${rule.autoApproveBelow}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-lg">{rule.requiredApprovals}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {rule.approvers.map((approver, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-bold">
                                                            {approver}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-amber-500" />
                                                    <span>{rule.escalationTimeout}h</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(rule.status)}`}>
                                                    {rule.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Category Rules Tab */}
                {activeTab === 'categories' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Allowed</th>
                                        <th className="p-4">Max Amount</th>
                                        <th className="p-4">Receipt Required</th>
                                        <th className="p-4">Justification Required</th>
                                        <th className="p-4">Restricted To</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {categoryRules.map((rule) => {
                                        const Icon = rule.icon;
                                        return (
                                            <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${rule.color}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{rule.category}</div>
                                                            <div className="text-xs text-slate-500">{rule.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {rule.allowed ? (
                                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle className="w-5 h-5" />
                                                            <span className="font-bold">Yes</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                            <XCircle className="w-5 h-5" />
                                                            <span className="font-bold">No</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono font-bold text-lg">
                                                    ${rule.maxAmount}
                                                </td>
                                                <td className="p-4">
                                                    {rule.requiresReceipt ? (
                                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                            <FileText className="w-4 h-4" />
                                                            <span className="text-xs font-bold">Required</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Optional</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {rule.requiresJustification ? (
                                                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            <span className="text-xs font-bold">Required</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Optional</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {rule.restrictedTo.length > 0 ? (
                                                            rule.restrictedTo.map((dept, i) => (
                                                                <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-bold">
                                                                    {dept}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Not Allowed</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4 text-slate-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Compliance Tab */}
                {activeTab === 'compliance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Receipt Policy */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-500" />
                                    Receipt Policy
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">All purchases over $25 require receipt</p>
                                            <p className="text-slate-500">Original or digital receipt acceptable</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Receipt must be submitted within 7 days</p>
                                            <p className="text-slate-500">Late submissions require manager approval</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Receipt must show itemized details</p>
                                            <p className="text-slate-500">Credit card slips not acceptable</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Requirements */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                    Audit Requirements
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Monthly reconciliation mandatory</p>
                                            <p className="text-slate-500">Must be completed by 5th of each month</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Quarterly audit by Finance team</p>
                                            <p className="text-slate-500">Random sampling of 20% transactions</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Annual external audit compliance</p>
                                            <p className="text-slate-500">All records retained for 7 years</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Violation Policy */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Violation Policy
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">First violation: Written warning</p>
                                            <p className="text-slate-500">Documentation sent to manager and HR</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Second violation: Petty cash suspension</p>
                                            <p className="text-slate-500">30-day suspension of petty cash access</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Third violation: Permanent revocation</p>
                                            <p className="text-slate-500">Escalation to disciplinary action</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* General Guidelines */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    General Guidelines
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Business purposes only</p>
                                            <p className="text-slate-500">Personal expenses strictly prohibited</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Advance approval for large purchases</p>
                                            <p className="text-slate-500">Over $200 requires pre-approval</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Prompt reimbursement expected</p>
                                            <p className="text-slate-500">Submit within 14 days of purchase</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

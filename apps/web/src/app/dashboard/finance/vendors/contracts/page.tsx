"use client";

import React, { useState } from 'react';
import {
    FileText,
    Building2,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    Download,
    Eye,
    Edit,
    Plus,
    Search,
    TrendingUp,
    Bell,
    FileCheck,
    Lock,
    Unlock
} from 'lucide-react';

type ContractStatus = 'all' | 'active' | 'expiring-soon' | 'expired' | 'pending-renewal' | 'terminated';

interface VendorContract {
    id: string;
    contractNumber: string;
    vendorName: string;
    contractType: 'service-agreement' | 'purchase-order' | 'nda' | 'msa' | 'sla' | 'lease';
    description: string;
    startDate: string;
    endDate: string;
    contractValue: number;
    paymentTerms: string;
    paymentFrequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
    status: 'active' | 'expiring-soon' | 'expired' | 'pending-renewal' | 'terminated';
    autoRenewal: boolean;
    renewalNoticeDays: number;
    category: string;
    owner: string;
    lastReviewed?: string;
    notificationSent: boolean;
    documents: number;
    notes?: string;
}

export default function ContractsPage() {
    const [filter, setFilter] = useState<ContractStatus>('all');

    const contracts: VendorContract[] = [
        {
            id: 'CT-001',
            contractNumber: 'SVC-2024-001',
            vendorName: 'Tech Solutions Inc',
            contractType: 'service-agreement',
            description: 'IT Support & Managed Services',
            startDate: '2024-01-01',
            endDate: '2025-12-31',
            contractValue: 120000,
            paymentTerms: 'Net 30',
            paymentFrequency: 'monthly',
            status: 'active',
            autoRenewal: true,
            renewalNoticeDays: 90,
            category: 'IT Services',
            owner: 'IT Department',
            lastReviewed: '2024-11-15',
            notificationSent: false,
            documents: 3,
            notes: 'Annual price increase capped at 3%'
        },
        {
            id: 'CT-002',
            contractNumber: 'SLA-2024-002',
            vendorName: 'Cloud Services Pro',
            contractType: 'sla',
            description: 'Cloud Infrastructure & Hosting',
            startDate: '2024-03-01',
            endDate: '2025-02-28',
            contractValue: 85000,
            paymentTerms: 'Net 15',
            paymentFrequency: 'monthly',
            status: 'expiring-soon',
            autoRenewal: false,
            renewalNoticeDays: 60,
            category: 'Cloud Services',
            owner: 'Engineering',
            lastReviewed: '2024-12-01',
            notificationSent: true,
            documents: 5,
            notes: 'Expiring in 2 months - negotiate renewal'
        },
        {
            id: 'CT-003',
            contractNumber: 'MSA-2024-003',
            vendorName: 'Marketing Solutions LLC',
            contractType: 'msa',
            description: 'Digital Marketing Services',
            startDate: '2023-06-01',
            endDate: '2024-05-31',
            contractValue: 60000,
            paymentTerms: 'Net 30',
            paymentFrequency: 'quarterly',
            status: 'expired',
            autoRenewal: false,
            renewalNoticeDays: 30,
            category: 'Marketing',
            owner: 'Marketing Department',
            lastReviewed: '2024-04-15',
            notificationSent: true,
            documents: 2,
            notes: 'Contract expired - awaiting decision on renewal'
        },
        {
            id: 'CT-004',
            contractNumber: 'LSE-2024-004',
            vendorName: 'Office Space Realty',
            contractType: 'lease',
            description: 'Office Lease - 5th Floor',
            startDate: '2022-01-01',
            endDate: '2026-12-31',
            contractValue: 480000,
            paymentTerms: 'Net 15',
            paymentFrequency: 'monthly',
            status: 'active',
            autoRenewal: false,
            renewalNoticeDays: 180,
            category: 'Facilities',
            owner: 'Operations',
            lastReviewed: '2024-10-01',
            notificationSent: false,
            documents: 8,
            notes: '5-year lease with option to extend'
        },
        {
            id: 'CT-005',
            contractNumber: 'PO-2024-005',
            vendorName: 'Global Office Supplies',
            contractType: 'purchase-order',
            description: 'Office Supplies & Equipment',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            contractValue: 25000,
            paymentTerms: 'Net 30',
            paymentFrequency: 'monthly',
            status: 'expiring-soon',
            autoRenewal: true,
            renewalNoticeDays: 30,
            category: 'Office Supplies',
            owner: 'Operations',
            lastReviewed: '2024-11-20',
            notificationSent: true,
            documents: 2,
            notes: 'Volume discount negotiated for 2025'
        },
        {
            id: 'CT-006',
            contractNumber: 'NDA-2024-006',
            vendorName: 'Legal Advisory Partners',
            contractType: 'nda',
            description: 'Non-Disclosure Agreement',
            startDate: '2024-07-01',
            endDate: '2027-06-30',
            contractValue: 0,
            paymentTerms: 'N/A',
            paymentFrequency: 'one-time',
            status: 'active',
            autoRenewal: false,
            renewalNoticeDays: 90,
            category: 'Legal',
            owner: 'Legal Team',
            lastReviewed: '2024-07-01',
            notificationSent: false,
            documents: 1
        },
        {
            id: 'CT-007',
            contractNumber: 'SVC-2024-007',
            vendorName: 'Facilities Maintenance Corp',
            contractType: 'service-agreement',
            description: 'Building Maintenance Services',
            startDate: '2024-02-01',
            endDate: '2025-01-31',
            contractValue: 45000,
            paymentTerms: 'Net 30',
            paymentFrequency: 'monthly',
            status: 'pending-renewal',
            autoRenewal: false,
            renewalNoticeDays: 60,
            category: 'Facilities',
            owner: 'Facilities Manager',
            lastReviewed: '2024-12-01',
            notificationSent: true,
            documents: 3,
            notes: 'Renewal proposal received - under review'
        },
        {
            id: 'CT-008',
            contractNumber: 'SVC-2023-008',
            vendorName: 'Old Tech Vendor',
            contractType: 'service-agreement',
            description: 'Legacy System Support',
            startDate: '2023-01-01',
            endDate: '2024-06-30',
            contractValue: 35000,
            paymentTerms: 'Net 30',
            paymentFrequency: 'monthly',
            status: 'terminated',
            autoRenewal: false,
            renewalNoticeDays: 30,
            category: 'IT Services',
            owner: 'IT Department',
            lastReviewed: '2024-05-15',
            notificationSent: false,
            documents: 4,
            notes: 'Terminated early - migrated to new vendor'
        }
    ];

    const filteredContracts = filter === 'all'
        ? contracts
        : contracts.filter(c => c.status === filter);

    const getContractTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'service-agreement': 'Service Agreement',
            'purchase-order': 'Purchase Order',
            nda: 'NDA',
            msa: 'MSA',
            sla: 'SLA',
            lease: 'Lease'
        };
        return labels[type] || type;
    };

    const getContractTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'service-agreement': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            'purchase-order': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            nda: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
            msa: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            sla: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
            lease: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
        };
        return colors[type] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'expiring-soon':
                return <AlertTriangle className="w-4 h-4" />;
            case 'expired':
                return <XCircle className="w-4 h-4" />;
            case 'pending-renewal':
                return <RefreshCw className="w-4 h-4" />;
            case 'terminated':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'expiring-soon':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'expired':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'pending-renewal':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'terminated':
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getDaysUntilExpiry = (endDate: string) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const expiringSoon = contracts.filter(c => c.status === 'expiring-soon').length;
    const totalValue = contracts.filter(c => c.status === 'active' || c.status === 'expiring-soon').reduce((sum, c) => sum + c.contractValue, 0);
    const autoRenewalCount = contracts.filter(c => c.autoRenewal && (c.status === 'active' || c.status === 'expiring-soon')).length;

    const stats = [
        {
            label: 'Active Contracts',
            value: activeContracts,
            icon: CheckCircle,
            color: 'text-emerald-600',
            subtext: `${totalContracts} total contracts`
        },
        {
            label: 'Expiring Soon',
            value: expiringSoon,
            icon: AlertTriangle,
            color: 'text-amber-600',
            subtext: 'Action required'
        },
        {
            label: 'Total Contract Value',
            value: `$${(totalValue / 1000).toFixed(0)}k`,
            icon: DollarSign,
            color: 'text-blue-600',
            subtext: 'Annual committed'
        },
        {
            label: 'Auto-Renewal',
            value: autoRenewalCount,
            icon: RefreshCw,
            color: 'text-indigo-600',
            subtext: 'Enabled contracts'
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Vendor Contracts
                    </h1>
                    <p className="text-slate-500 text-sm">Manage vendor contracts, renewals, and compliance</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Plus className="w-4 h-4" /> New Contract
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

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search contracts by vendor, contract number, or description..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'all'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'active'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'expiring-soon'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('expiring-soon')}
                    >
                        Expiring Soon
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'pending-renewal'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('pending-renewal')}
                    >
                        Pending Renewal
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'expired'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('expired')}
                    >
                        Expired
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'terminated'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('terminated')}
                    >
                        Terminated
                    </button>
                </div>
            </div>

            {/* Contracts Table */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredContracts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No contracts found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Contract Details</th>
                                        <th className="p-4">Vendor</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Period</th>
                                        <th className="p-4">Days Until Expiry</th>
                                        <th className="p-4">Value</th>
                                        <th className="p-4">Payment</th>
                                        <th className="p-4">Auto-Renewal</th>
                                        <th className="p-4">Owner</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Documents</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredContracts.map((contract) => {
                                        const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);

                                        return (
                                            <tr
                                                key={contract.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                    contract.status === 'expiring-soon' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''
                                                }`}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{contract.description}</div>
                                                            <div className="text-xs text-slate-500">{contract.contractNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-slate-400" />
                                                        <span className="font-medium">{contract.vendorName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getContractTypeColor(contract.contractType)}`}>
                                                        {getContractTypeLabel(contract.contractType)}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(contract.startDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(contract.endDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {contract.status === 'expired' || contract.status === 'terminated' ? (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            {daysUntilExpiry < 0 ? (
                                                                <span className="text-red-600 dark:text-red-400 font-bold">Expired</span>
                                                            ) : daysUntilExpiry <= 90 ? (
                                                                <>
                                                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                                    <span className="font-bold text-amber-600 dark:text-amber-400">{daysUntilExpiry}d</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-mono text-slate-600 dark:text-slate-400">{daysUntilExpiry}d</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {contract.contractValue > 0 ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                                ${contract.contractValue.toLocaleString()}
                                                            </span>
                                                            <span className="text-xs text-slate-500 capitalize">
                                                                {contract.paymentFrequency.replace('-', ' ')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">{contract.paymentTerms}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        {contract.autoRenewal ? (
                                                            <>
                                                                <RefreshCw className="w-4 h-4 text-emerald-500" />
                                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                                    {contract.renewalNoticeDays}d notice
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Manual</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{contract.owner}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(contract.status)} w-fit`}>
                                                            {getStatusIcon(contract.status)}
                                                            <span>{contract.status.replace('-', ' ')}</span>
                                                        </div>
                                                        {contract.notificationSent && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                                                <Bell className="w-3 h-3" />
                                                                <span>Notified</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <FileCheck className="w-4 h-4 text-slate-400" />
                                                        <span className="font-bold">{contract.documents}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                        </button>
                                                        {contract.status !== 'terminated' && (
                                                            <button
                                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4 text-blue-500" />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4 text-emerald-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Expiring Soon Alert */}
            {expiringSoon > 0 && filter !== 'expiring-soon' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shrink-0">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-300 mb-1">
                                {expiringSoon} Contract{expiringSoon > 1 ? 's' : ''} Expiring Soon
                            </h3>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Review and renew contracts before they expire to ensure continuity of services.
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold transition-colors"
                            onClick={() => setFilter('expiring-soon')}
                        >
                            View All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

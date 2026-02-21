"use client";

import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Building2,
    FileCheck,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Shield,
    DollarSign,
    MapPin,
    Mail,
    Phone,
    Globe,
    FileText,
    Download,
    Plus,
    Search,
    Eye,
    Edit,
    TrendingUp,
    Users,
    Loader2
} from 'lucide-react';
import { VendorService } from '../../services';

type OnboardingStatus = 'all' | 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete';

interface VendorOnboarding {
    id: string;
    vendorName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    website?: string;
    category: string;
    submittedDate: string;
    status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete';
    completionPercent: number;
    requiredDocuments: {
        taxId: boolean;
        businessLicense: boolean;
        insurance: boolean;
        w9Form: boolean;
        bankDetails: boolean;
    };
    complianceChecks: {
        backgroundCheck: boolean;
        creditCheck: boolean;
        referenceCheck: boolean;
    };
    reviewedBy?: string;
    reviewDate?: string;
    estimatedValue: number;
    notes?: string;
}

export default function VendorOnboardingPage() {
    const [filter, setFilter] = useState<OnboardingStatus>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await VendorService.getVendors();
                setVendors(data as any[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const [vendors, setVendors] = useState<any[]>([]);

    const filteredVendors = filter === 'all'
        ? vendors
        : vendors.filter(v => v.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'in-review':
                return <Clock className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'incomplete':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'in-review':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pending':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'rejected':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'incomplete':
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const totalVendors = vendors.length;
    const pendingReview = vendors.filter(v => v.status === 'in-review' || v.status === 'pending').length;
    const approved = vendors.filter(v => v.status === 'approved').length;
    const totalValue = vendors.filter(v => v.status === 'approved').reduce((sum, v) => sum + v.estimatedValue, 0);
    const avgCompletion = vendors.reduce((sum, v) => sum + v.completionPercent, 0) / vendors.length;

    const stats = [
        {
            label: 'Total Applications',
            value: totalVendors,
            icon: Users,
            color: 'text-blue-600',
            subtext: `${approved} approved`
        },
        {
            label: 'Pending Review',
            value: pendingReview,
            icon: Clock,
            color: 'text-amber-600',
            subtext: 'Awaiting action'
        },
        {
            label: 'Approved Value',
            value: `$${(totalValue / 1000).toFixed(0)}k`,
            icon: DollarSign,
            color: 'text-emerald-600',
            subtext: 'Annual estimated'
        },
        {
            label: 'Avg Completion',
            value: `${avgCompletion.toFixed(0)}%`,
            icon: TrendingUp,
            color: 'text-indigo-600',
            subtext: 'Documentation'
        }
    ];

    const countDocuments = (docs: VendorOnboarding['requiredDocuments']) => {
        return Object.values(docs).filter(Boolean).length;
    };

    const countCompliance = (checks: VendorOnboarding['complianceChecks']) => {
        return Object.values(checks).filter(Boolean).length;
    };

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
                        <UserPlus className="w-6 h-6 text-indigo-500" />
                        Vendor Onboarding
                    </h1>
                    <p className="text-slate-500 text-sm">Manage vendor applications and onboarding process</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Plus className="w-4 h-4" /> Add Vendor
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
                        placeholder="Search vendors by name, email, or category..."
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
                            filter === 'pending'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'in-review'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('in-review')}
                    >
                        In Review
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'approved'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'rejected'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'incomplete'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('incomplete')}
                    >
                        Incomplete
                    </button>
                </div>
            </div>

            {/* Vendors Table */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredVendors.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No vendors found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Vendor Details</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Submitted</th>
                                        <th className="p-4">Completion</th>
                                        <th className="p-4">Documents</th>
                                        <th className="p-4">Compliance</th>
                                        <th className="p-4">Est. Value</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Reviewed By</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredVendors.map((vendor) => {
                                        const docsComplete = countDocuments(vendor.requiredDocuments);
                                        const complianceComplete = countCompliance(vendor.complianceChecks);

                                        return (
                                            <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{vendor.vendorName}</div>
                                                            <div className="text-xs text-slate-500">{vendor.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            <span>{vendor.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            <span>{vendor.phone}</span>
                                                        </div>
                                                        {vendor.website && (
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Globe className="w-3 h-3 text-slate-400" />
                                                                <span>{vendor.website}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-bold">
                                                        {vendor.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {new Date(vendor.submittedDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    vendor.completionPercent === 100
                                                                        ? 'bg-emerald-500'
                                                                        : vendor.completionPercent >= 75
                                                                        ? 'bg-blue-500'
                                                                        : vendor.completionPercent >= 50
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${vendor.completionPercent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{vendor.completionPercent}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <FileCheck className="w-4 h-4 text-slate-400" />
                                                        <span className={`font-bold ${docsComplete === 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {docsComplete}/5
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Shield className="w-4 h-4 text-slate-400" />
                                                        <span className={`font-bold ${complianceComplete === 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {complianceComplete}/3
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${vendor.estimatedValue.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(vendor.status)} w-fit`}>
                                                        {getStatusIcon(vendor.status)}
                                                        <span>{vendor.status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {vendor.reviewedBy ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{vendor.reviewedBy}</span>
                                                            {vendor.reviewDate && (
                                                                <span className="text-xs text-slate-500">
                                                                    {new Date(vendor.reviewDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                        </button>
                                                        {vendor.status !== 'approved' && vendor.status !== 'rejected' && (
                                                            <button
                                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4 text-blue-500" />
                                                            </button>
                                                        )}
                                                        {vendor.status === 'in-review' && (
                                                            <>
                                                                <button
                                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                </button>
                                                                <button
                                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                                </button>
                                                            </>
                                                        )}
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
        </div>
    );
}

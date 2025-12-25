"use client";

import React, { useState } from 'react';
import {
    Shield,
    Building2,
    FileCheck,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Award,
    FileText,
    Lock,
    Eye,
    Download,
    Plus,
    Search,
    Calendar,
    BarChart3,
    UserCheck,
    BookOpen,
    RefreshCw
} from 'lucide-react';

type ComplianceStatus = 'all' | 'compliant' | 'expiring-soon' | 'non-compliant' | 'pending-review';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface VendorCompliance {
    id: string;
    vendorName: string;
    category: string;
    overallStatus: 'compliant' | 'expiring-soon' | 'non-compliant' | 'pending-review';
    riskLevel: RiskLevel;
    complianceScore: number;
    certifications: {
        iso9001: { status: boolean; expiryDate?: string };
        iso27001: { status: boolean; expiryDate?: string };
        soc2: { status: boolean; expiryDate?: string };
        gdpr: { status: boolean; expiryDate?: string };
    };
    insurance: {
        generalLiability: { status: boolean; expiryDate?: string; coverage?: number };
        professionalLiability: { status: boolean; expiryDate?: string; coverage?: number };
        cybersecurity: { status: boolean; expiryDate?: string; coverage?: number };
    };
    audits: {
        lastAuditDate?: string;
        nextAuditDate?: string;
        auditScore?: number;
        findings?: number;
    };
    documents: {
        taxCertificate: boolean;
        businessLicense: boolean;
        esgReport: boolean;
        codeOfConduct: boolean;
    };
    backgroundCheck: {
        completed: boolean;
        date?: string;
        result?: 'pass' | 'fail' | 'conditional';
    };
    financialHealth: {
        creditRating?: string;
        lastReviewDate?: string;
    };
    lastReviewedBy?: string;
    lastReviewDate?: string;
    nextReviewDate?: string;
    notes?: string;
}

export default function VendorCompliancePage() {
    const [filter, setFilter] = useState<ComplianceStatus>('all');

    const vendors: VendorCompliance[] = [
        {
            id: 'VC-001',
            vendorName: 'Tech Solutions Inc',
            category: 'IT Services',
            overallStatus: 'compliant',
            riskLevel: 'low',
            complianceScore: 95,
            certifications: {
                iso9001: { status: true, expiryDate: '2025-06-30' },
                iso27001: { status: true, expiryDate: '2025-08-15' },
                soc2: { status: true, expiryDate: '2025-12-31' },
                gdpr: { status: true, expiryDate: '2026-01-01' }
            },
            insurance: {
                generalLiability: { status: true, expiryDate: '2025-03-15', coverage: 2000000 },
                professionalLiability: { status: true, expiryDate: '2025-03-15', coverage: 1000000 },
                cybersecurity: { status: true, expiryDate: '2025-03-15', coverage: 5000000 }
            },
            audits: {
                lastAuditDate: '2024-09-01',
                nextAuditDate: '2025-09-01',
                auditScore: 92,
                findings: 2
            },
            documents: {
                taxCertificate: true,
                businessLicense: true,
                esgReport: true,
                codeOfConduct: true
            },
            backgroundCheck: {
                completed: true,
                date: '2024-01-15',
                result: 'pass'
            },
            financialHealth: {
                creditRating: 'A+',
                lastReviewDate: '2024-11-01'
            },
            lastReviewedBy: 'Compliance Team',
            lastReviewDate: '2024-12-01',
            nextReviewDate: '2025-03-01'
        },
        {
            id: 'VC-002',
            vendorName: 'Cloud Services Pro',
            category: 'Cloud Services',
            overallStatus: 'expiring-soon',
            riskLevel: 'medium',
            complianceScore: 78,
            certifications: {
                iso9001: { status: true, expiryDate: '2025-01-15' },
                iso27001: { status: true, expiryDate: '2025-01-20' },
                soc2: { status: true, expiryDate: '2025-02-28' },
                gdpr: { status: false }
            },
            insurance: {
                generalLiability: { status: true, expiryDate: '2025-01-10', coverage: 1500000 },
                professionalLiability: { status: true, expiryDate: '2025-01-10', coverage: 750000 },
                cybersecurity: { status: false }
            },
            audits: {
                lastAuditDate: '2024-06-15',
                nextAuditDate: '2025-06-15',
                auditScore: 85,
                findings: 5
            },
            documents: {
                taxCertificate: true,
                businessLicense: true,
                esgReport: false,
                codeOfConduct: true
            },
            backgroundCheck: {
                completed: true,
                date: '2024-03-01',
                result: 'pass'
            },
            financialHealth: {
                creditRating: 'B+',
                lastReviewDate: '2024-10-15'
            },
            lastReviewedBy: 'Risk Team',
            lastReviewDate: '2024-11-15',
            nextReviewDate: '2025-01-15',
            notes: 'Multiple certifications expiring soon - renewal in progress'
        },
        {
            id: 'VC-003',
            vendorName: 'Marketing Solutions LLC',
            category: 'Marketing Services',
            overallStatus: 'non-compliant',
            riskLevel: 'high',
            complianceScore: 45,
            certifications: {
                iso9001: { status: false },
                iso27001: { status: false },
                soc2: { status: false },
                gdpr: { status: true, expiryDate: '2025-05-01' }
            },
            insurance: {
                generalLiability: { status: true, expiryDate: '2023-12-31', coverage: 500000 },
                professionalLiability: { status: false },
                cybersecurity: { status: false }
            },
            audits: {
                lastAuditDate: '2023-08-01',
                auditScore: 65,
                findings: 12
            },
            documents: {
                taxCertificate: true,
                businessLicense: true,
                esgReport: false,
                codeOfConduct: false
            },
            backgroundCheck: {
                completed: true,
                date: '2023-05-01',
                result: 'conditional'
            },
            financialHealth: {
                creditRating: 'C',
                lastReviewDate: '2024-08-01'
            },
            lastReviewedBy: 'Compliance Team',
            lastReviewDate: '2024-11-20',
            nextReviewDate: '2024-12-20',
            notes: 'CRITICAL: Insurance expired, missing key certifications. Remediation plan required.'
        },
        {
            id: 'VC-004',
            vendorName: 'Legal Advisory Partners',
            category: 'Legal Services',
            overallStatus: 'compliant',
            riskLevel: 'low',
            complianceScore: 98,
            certifications: {
                iso9001: { status: true, expiryDate: '2025-09-30' },
                iso27001: { status: true, expiryDate: '2025-09-30' },
                soc2: { status: true, expiryDate: '2025-11-30' },
                gdpr: { status: true, expiryDate: '2026-06-30' }
            },
            insurance: {
                generalLiability: { status: true, expiryDate: '2025-06-30', coverage: 5000000 },
                professionalLiability: { status: true, expiryDate: '2025-06-30', coverage: 10000000 },
                cybersecurity: { status: true, expiryDate: '2025-06-30', coverage: 3000000 }
            },
            audits: {
                lastAuditDate: '2024-10-01',
                nextAuditDate: '2025-10-01',
                auditScore: 98,
                findings: 0
            },
            documents: {
                taxCertificate: true,
                businessLicense: true,
                esgReport: true,
                codeOfConduct: true
            },
            backgroundCheck: {
                completed: true,
                date: '2024-02-01',
                result: 'pass'
            },
            financialHealth: {
                creditRating: 'AA',
                lastReviewDate: '2024-12-01'
            },
            lastReviewedBy: 'Legal Team',
            lastReviewDate: '2024-12-05',
            nextReviewDate: '2025-06-01'
        },
        {
            id: 'VC-005',
            vendorName: 'Global Office Supplies',
            category: 'Office Supplies',
            overallStatus: 'pending-review',
            riskLevel: 'low',
            complianceScore: 70,
            certifications: {
                iso9001: { status: true, expiryDate: '2025-04-30' },
                iso27001: { status: false },
                soc2: { status: false },
                gdpr: { status: false }
            },
            insurance: {
                generalLiability: { status: true, expiryDate: '2025-05-15', coverage: 1000000 },
                professionalLiability: { status: false },
                cybersecurity: { status: false }
            },
            audits: {
                lastAuditDate: '2024-11-01',
                auditScore: 78,
                findings: 3
            },
            documents: {
                taxCertificate: true,
                businessLicense: true,
                esgReport: false,
                codeOfConduct: true
            },
            backgroundCheck: {
                completed: true,
                date: '2024-05-01',
                result: 'pass'
            },
            financialHealth: {
                creditRating: 'B',
                lastReviewDate: '2024-11-01'
            },
            lastReviewedBy: 'Operations',
            lastReviewDate: '2024-11-25',
            nextReviewDate: '2025-02-01',
            notes: 'Annual review scheduled for January 2025'
        },
        {
            id: 'VC-006',
            vendorName: 'Facilities Maintenance Corp',
            category: 'Facilities',
            overallStatus: 'expiring-soon',
            riskLevel: 'medium',
            complianceScore: 82,
            certifications: {
                iso9001: { status: true, expiryDate: '2025-02-15' },
                iso27001: { status: false },
                soc2: { status: false },
                gdpr: { status: false }
            },
            insurance: {
                generalLiability: { status: true, expiryDate: '2025-01-31', coverage: 2000000 },
                professionalLiability: { status: true, expiryDate: '2025-01-31', coverage: 500000 },
                cybersecurity: { status: false }
            },
            audits: {
                lastAuditDate: '2024-07-01',
                nextAuditDate: '2025-07-01',
                auditScore: 88,
                findings: 4
            },
            documents: {
                taxCertificate: true,
                businessLicense: true,
                esgReport: true,
                codeOfConduct: true
            },
            backgroundCheck: {
                completed: true,
                date: '2024-04-01',
                result: 'pass'
            },
            financialHealth: {
                creditRating: 'B+',
                lastReviewDate: '2024-10-01'
            },
            lastReviewedBy: 'Facilities Manager',
            lastReviewDate: '2024-11-30',
            nextReviewDate: '2025-01-30',
            notes: 'Insurance renewal reminder sent'
        }
    ];

    const filteredVendors = filter === 'all'
        ? vendors
        : vendors.filter(v => v.overallStatus === filter);

    const getRiskColor = (risk: RiskLevel) => {
        switch (risk) {
            case 'low':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'medium':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'high':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'critical':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'compliant':
                return <CheckCircle className="w-4 h-4" />;
            case 'expiring-soon':
                return <AlertTriangle className="w-4 h-4" />;
            case 'non-compliant':
                return <XCircle className="w-4 h-4" />;
            case 'pending-review':
                return <Clock className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'expiring-soon':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'non-compliant':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'pending-review':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const countCertifications = (certs: VendorCompliance['certifications']) => {
        return Object.values(certs).filter(c => c.status).length;
    };

    const countInsurance = (insurance: VendorCompliance['insurance']) => {
        return Object.values(insurance).filter(i => i.status).length;
    };

    const countDocuments = (docs: VendorCompliance['documents']) => {
        return Object.values(docs).filter(Boolean).length;
    };

    const totalVendors = vendors.length;
    const compliantVendors = vendors.filter(v => v.overallStatus === 'compliant').length;
    const nonCompliant = vendors.filter(v => v.overallStatus === 'non-compliant').length;
    const avgComplianceScore = vendors.reduce((sum, v) => sum + v.complianceScore, 0) / vendors.length;
    const highRisk = vendors.filter(v => v.riskLevel === 'high' || v.riskLevel === 'critical').length;

    const stats = [
        {
            label: 'Compliant Vendors',
            value: `${compliantVendors}/${totalVendors}`,
            icon: CheckCircle,
            color: 'text-emerald-600',
            subtext: `${((compliantVendors / totalVendors) * 100).toFixed(0)}% compliance rate`
        },
        {
            label: 'Non-Compliant',
            value: nonCompliant,
            icon: XCircle,
            color: 'text-red-600',
            subtext: 'Require immediate action'
        },
        {
            label: 'Avg Compliance Score',
            value: `${avgComplianceScore.toFixed(0)}%`,
            icon: BarChart3,
            color: 'text-blue-600',
            subtext: 'Across all vendors'
        },
        {
            label: 'High Risk Vendors',
            value: highRisk,
            icon: AlertTriangle,
            color: 'text-amber-600',
            subtext: 'Enhanced monitoring'
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        Vendor Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor vendor compliance, certifications, and risk management</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Plus className="w-4 h-4" /> Review Vendor
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
                        placeholder="Search vendors by name or category..."
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
                            filter === 'compliant'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('compliant')}
                    >
                        Compliant
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
                            filter === 'non-compliant'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('non-compliant')}
                    >
                        Non-Compliant
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'pending-review'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('pending-review')}
                    >
                        Pending Review
                    </button>
                </div>
            </div>

            {/* Vendors Table */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredVendors.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No vendors found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Vendor</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Compliance Score</th>
                                        <th className="p-4">Risk Level</th>
                                        <th className="p-4">Certifications</th>
                                        <th className="p-4">Insurance</th>
                                        <th className="p-4">Last Audit</th>
                                        <th className="p-4">Documents</th>
                                        <th className="p-4">Credit Rating</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Next Review</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredVendors.map((vendor) => {
                                        const certsCount = countCertifications(vendor.certifications);
                                        const insuranceCount = countInsurance(vendor.insurance);
                                        const docsCount = countDocuments(vendor.documents);

                                        return (
                                            <tr
                                                key={vendor.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                    vendor.overallStatus === 'non-compliant' ? 'bg-red-50/30 dark:bg-red-900/5' : ''
                                                }`}
                                            >
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
                                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-bold">
                                                        {vendor.category}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    vendor.complianceScore >= 90
                                                                        ? 'bg-emerald-500'
                                                                        : vendor.complianceScore >= 70
                                                                        ? 'bg-blue-500'
                                                                        : vendor.complianceScore >= 50
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${vendor.complianceScore}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold">{vendor.complianceScore}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getRiskColor(vendor.riskLevel)}`}>
                                                        {vendor.riskLevel}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Award className="w-4 h-4 text-slate-400" />
                                                        <span className={`font-bold ${certsCount === 4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {certsCount}/4
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Shield className="w-4 h-4 text-slate-400" />
                                                        <span className={`font-bold ${insuranceCount === 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {insuranceCount}/3
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {vendor.audits.lastAuditDate ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1">
                                                                <FileCheck className="w-3 h-3 text-slate-400" />
                                                                <span className="text-xs">
                                                                    {new Date(vendor.audits.lastAuditDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {vendor.audits.auditScore && (
                                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                                    Score: {vendor.audits.auditScore}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                        <span className={`font-bold ${docsCount === 4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {docsCount}/4
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {vendor.financialHealth.creditRating ? (
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="w-4 h-4 text-slate-400" />
                                                            <span className="font-bold">{vendor.financialHealth.creditRating}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(vendor.overallStatus)} w-fit`}>
                                                        {getStatusIcon(vendor.overallStatus)}
                                                        <span>{vendor.overallStatus.replace(&apos;-', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {vendor.nextReviewDate ? (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4 text-slate-400" />
                                                            <span className="text-xs">
                                                                {new Date(vendor.nextReviewDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
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
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Request Update"
                                                        >
                                                            <RefreshCw className="w-4 h-4 text-blue-500" />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Download Report"
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

            {/* Non-Compliant Alert */}
            {nonCompliant > 0 && filter !== 'non-compliant' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shrink-0">
                    <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-red-900 dark:text-red-300 mb-1">
                                {nonCompliant} Non-Compliant Vendor{nonCompliant > 1 ? 's' : ''}
                            </h3>
                            <p className="text-sm text-red-800 dark:text-red-300">
                                Critical compliance issues detected. Immediate action required to mitigate risks.
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                            onClick={() => setFilter('non-compliant')}
                        >
                            View All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

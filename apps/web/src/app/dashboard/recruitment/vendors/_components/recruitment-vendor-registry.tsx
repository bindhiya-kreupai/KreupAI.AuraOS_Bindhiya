"use client";

import React, { useEffect, useState } from 'react';
import { Building2, Loader2, Mail, MapPin, Phone, ShieldCheck, Users } from 'lucide-react';
import { RecruitmentVendorService } from '../../services';
import type { RecruitmentVendor } from '../../types';

type RecruitmentVendorRegistryProps = {
    title: string;
    description: string;
};

function formatCategory(category: RecruitmentVendor['category']) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function formatStatus(status: RecruitmentVendor['status']) {
    if (status === 'under_review') return 'Under Review';
    if (status === 'inactive') return 'Inactive';
    return 'Active';
}

function formatCompliance(status: RecruitmentVendor['complianceStatus']) {
    if (status === 'not_reviewed') return 'Not Reviewed';
    if (status === 'non_compliant') return 'Non-Compliant';
    return status.replace(/\b\w/g, character => character.toUpperCase());
}

function getStatusStyle(status: RecruitmentVendor['status']) {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
    if (status === 'inactive') return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
}

function getComplianceStyle(status: RecruitmentVendor['complianceStatus']) {
    if (status === 'compliant') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
    if (status === 'expiring') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
    if (status === 'non_compliant') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
    return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

export function RecruitmentVendorRegistry({ title, description }: RecruitmentVendorRegistryProps) {
    const [vendors, setVendors] = useState<RecruitmentVendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadVendors = async () => {
            try {
                setLoading(true);
                const data = await RecruitmentVendorService.getVendors();
                setVendors(data);
            } catch (error) {
                console.error('Failed to load recruitment vendors:', error);
                setVendors([]);
            } finally {
                setLoading(false);
            }
        };

        void loadVendors();
    }, []);

    const totalSpend = vendors.reduce((sum, vendor) => sum + vendor.monthlySpend, 0);
    const totalPlacements = vendors.reduce((sum, vendor) => sum + vendor.activePlacements, 0);
    const activeVendors = vendors.filter(vendor => vendor.status === 'active').length;
    const ratedVendors = vendors.filter(vendor => typeof vendor.rating === 'number');
    const averageRating = ratedVendors.length === 0
        ? 0
        : ratedVendors.reduce((sum, vendor) => sum + Number(vendor.rating || 0), 0) / ratedVendors.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500">Loading recruitment vendors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        {title}
                    </h1>
                    <p className="text-slate-500 text-sm">{description}</p>
                </div>
                <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 bg-slate-200 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed"
                >
                    Add Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Active Vendors</div>
                    <div className="text-2xl font-bold">{activeVendors}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Active Placements</div>
                    <div className="text-2xl font-bold">{totalPlacements}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Monthly Spend</div>
                    <div className="text-2xl font-bold">${totalSpend.toLocaleString()}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Average Rating</div>
                    <div className="text-2xl font-bold">{averageRating === 0 ? 'N/A' : averageRating.toFixed(1)}</div>
                </div>
            </div>

            {vendors.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <h2 className="text-xl font-bold mb-2">No recruitment vendors</h2>
                    <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                        The recruitment vendor registry is now live, but there are no tenant-scoped vendor records yet. Once vendors are created through the recruitment vendor contract, this page will show live partner data instead of placeholders.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pb-8">
                    {vendors.map(vendor => (
                        <div key={vendor.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h2 className="text-lg font-bold">{vendor.name}</h2>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyle(vendor.status)}`}>
                                            {formatStatus(vendor.status)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500">{vendor.vendorCode} · {formatCategory(vendor.category)}</div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getComplianceStyle(vendor.complianceStatus)}`}>
                                    {formatCompliance(vendor.complianceStatus)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                                    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Placements</div>
                                    <div className="font-bold">{vendor.activePlacements}</div>
                                </div>
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                                    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Total Hires</div>
                                    <div className="font-bold">{vendor.totalHires}</div>
                                </div>
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                                    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Monthly Spend</div>
                                    <div className="font-bold">{vendor.currency} {vendor.monthlySpend.toLocaleString()}</div>
                                </div>
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                                    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Rating</div>
                                    <div className="font-bold">{vendor.rating ? vendor.rating.toFixed(1) : 'N/A'}</div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-500 mb-5">
                                {vendor.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {vendor.location}
                                    </div>
                                )}
                                {vendor.contactPersonName && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        {vendor.contactPersonName}
                                    </div>
                                )}
                                {vendor.contactEmail && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {vendor.contactEmail}
                                    </div>
                                )}
                                {vendor.contactPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {vendor.contactPhone}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold mb-2">
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                        Specialties
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {vendor.specialties.length === 0 ? (
                                            <span className="text-sm text-slate-500">No specialties configured</span>
                                        ) : vendor.specialties.map(specialty => (
                                            <span key={specialty} className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 text-xs font-bold">
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {vendor.averageTimeToFillDays ? (
                                    <div className="text-right">
                                        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Avg Time to Fill</div>
                                        <div className="font-bold">{vendor.averageTimeToFillDays} days</div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
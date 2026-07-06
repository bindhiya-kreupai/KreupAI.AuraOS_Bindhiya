'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, Mail, MapPin, Phone, Plus, ShieldCheck, Users, X } from 'lucide-react';
import { RecruitmentVendorService } from '../../services';
import type { RecruitmentVendor, RecruitmentVendorCategory } from '../../types';

type RecruitmentVendorRegistryProps = {
  title: string;
  description: string;
};

const VENDOR_CATEGORIES: { value: RecruitmentVendorCategory; label: string }[] = [
  { value: 'staffing', label: 'Staffing' },
  { value: 'recruitment_agency', label: 'Recruitment Agency' },
  { value: 'background_check', label: 'Background Check' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'contractor_management', label: 'Contractor Management' },
  { value: 'other', label: 'Other' },
];

function formatCategory(category: RecruitmentVendor['category']) {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatStatus(status: RecruitmentVendor['status']) {
  if (status === 'under_review') return 'Under Review';
  if (status === 'inactive') return 'Inactive';
  return 'Active';
}

function formatCompliance(status: RecruitmentVendor['complianceStatus']) {
  if (status === 'not_reviewed') return 'Not Reviewed';
  if (status === 'non_compliant') return 'Non-Compliant';
  return status.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusStyle(status: RecruitmentVendor['status']) {
  if (status === 'active')
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
  if (status === 'inactive')
    return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
}

function getComplianceStyle(status: RecruitmentVendor['complianceStatus']) {
  if (status === 'compliant')
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
  if (status === 'expiring')
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
  if (status === 'non_compliant')
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
  return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

const EMPTY_FORM = {
  name: '',
  category: 'staffing' as RecruitmentVendorCategory,
  contactPersonName: '',
  contactEmail: '',
  contactPhone: '',
  location: '',
};

export function RecruitmentVendorRegistry({ title, description }: RecruitmentVendorRegistryProps) {
  const [vendors, setVendors] = useState<RecruitmentVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RecruitmentVendorService.getVendors();
      setVendors(data);
    } catch (error: any) {
      console.error('Failed to load recruitment vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  const openModal = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setNotice(null);
    setShowModal(true);
  }, []);

  const handleCreate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!form.name.trim()) {
        setFormError('Vendor name is required.');
        return;
      }
      setSubmitting(true);
      setFormError(null);
      try {
        await RecruitmentVendorService.createVendor({
          name: form.name.trim(),
          category: form.category,
          status: 'under_review',
          contactPersonName: form.contactPersonName.trim() || undefined,
          contactEmail: form.contactEmail.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
          location: form.location.trim() || undefined,
        });
        setShowModal(false);
        setNotice('Vendor created successfully.');
        await loadVendors();
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to create vendor.');
      } finally {
        setSubmitting(false);
      }
    },
    [form, loadVendors]
  );

  const totalSpend = vendors.reduce((sum, vendor) => sum + vendor.monthlySpend, 0);
  const totalPlacements = vendors.reduce((sum, vendor) => sum + vendor.activePlacements, 0);
  const activeVendors = vendors.filter((vendor) => vendor.status === 'active').length;
  const ratedVendors = vendors.filter((vendor) => typeof vendor.rating === 'number');
  const averageRating =
    ratedVendors.length === 0
      ? 0
      : ratedVendors.reduce((sum, vendor) => sum + Number(vendor.rating || 0), 0) /
        ratedVendors.length;

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
          onClick={openModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {notice ? (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 shrink-0">
          {notice}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Active Vendors</div>
          <div className="text-2xl font-bold">{activeVendors}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Active Placements
          </div>
          <div className="text-2xl font-bold">{totalPlacements}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Monthly Spend</div>
          <div className="text-2xl font-bold">${totalSpend.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Average Rating</div>
          <div className="text-2xl font-bold">
            {averageRating === 0 ? 'N/A' : averageRating.toFixed(1)}
          </div>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-xl font-bold mb-2">No recruitment vendors</h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            The recruitment vendor registry is now live, but there are no tenant-scoped vendor
            records yet. Once vendors are created through the recruitment vendor contract, this page
            will show live partner data instead of placeholders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pb-8">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-lg font-bold">{vendor.name}</h2>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyle(vendor.status)}`}
                    >
                      {formatStatus(vendor.status)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {vendor.vendorCode} · {formatCategory(vendor.category)}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${getComplianceStyle(vendor.complianceStatus)}`}
                >
                  {formatCompliance(vendor.complianceStatus)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                    Placements
                  </div>
                  <div className="font-bold">{vendor.activePlacements}</div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                    Total Hires
                  </div>
                  <div className="font-bold">{vendor.totalHires}</div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                    Monthly Spend
                  </div>
                  <div className="font-bold">
                    {vendor.currency} {vendor.monthlySpend.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                    Rating
                  </div>
                  <div className="font-bold">
                    {vendor.rating ? vendor.rating.toFixed(1) : 'N/A'}
                  </div>
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
                    ) : (
                      vendor.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 text-xs font-bold"
                        >
                          {specialty}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {vendor.averageTimeToFillDays ? (
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Avg Time to Fill
                    </div>
                    <div className="font-bold">{vendor.averageTimeToFillDays} days</div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">Add Vendor</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1" htmlFor="vendor-name">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="vendor-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" htmlFor="vendor-category">
                  Category
                </label>
                <select
                  id="vendor-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as RecruitmentVendorCategory,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                >
                  {VENDOR_CATEGORIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1" htmlFor="vendor-contact">
                    Contact Person
                  </label>
                  <input
                    id="vendor-contact"
                    value={form.contactPersonName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, contactPersonName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" htmlFor="vendor-email">
                    Contact Email
                  </label>
                  <input
                    id="vendor-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" htmlFor="vendor-phone">
                    Contact Phone
                  </label>
                  <input
                    id="vendor-phone"
                    value={form.contactPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" htmlFor="vendor-location">
                    Location
                  </label>
                  <input
                    id="vendor-location"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {formError ? (
                <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

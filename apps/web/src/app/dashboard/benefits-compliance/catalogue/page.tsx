'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Play,
  Pause,
  Sparkles,
  Eye,
  Copy,
  Upload,
  Info,
  Calendar,
  DollarSign,
  Shield,
  Briefcase,
} from 'lucide-react';
import {
  EntityTable,
  FilterToolbar,
  FormModal,
  ConfirmDialog,
  DetailsModal,
  ExportButton,
  type Column,
  type FilterField,
} from '../components';
import { toast } from 'sonner';

interface Cat {
  id: string;
  benefitCode: string;
  benefitType: string;
  label: string;
  countryCode: string | null;
  isMandatory: boolean;
  valuationBasis: string;
  annualValue: string;
  currency: string;
  frequencyMonths: number;
  vendorRequired: boolean;
  dependantsAllowed: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  policyJson?: any;
  activeEnrollments?: number;
}

const BENEFIT_TYPES = [
  'MEDICAL_INSURANCE',
  'LIFE_INSURANCE',
  'AIR_TICKET',
  'HOUSING',
  'TRANSPORT',
  'MOBILE',
  'MEAL',
  'EDUCATION',
  'LOAN',
  'RELOCATION',
  'UNIFORM_PPE',
  'WELLNESS',
  'ACCOMMODATION',
];

const COUNTRIES = ['UAE', 'KSA', 'QATAR', 'BAHRAIN', 'OMAN', 'KUWAIT'];
const CURRENCIES = ['AED', 'SAR', 'QAR', 'BHD', 'OMR', 'KWD'];

function formatBenefitType(type: string): string {
  if (!type) return '—';
  return type
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getUniqueCopyCode(originalCode: string, existingCodes: string[]): string {
  // Strip any trailing _COPYxx or _COPY_xx suffixes to find the base code
  const baseCode = originalCode.replace(/_COPY\d*(_\d+)?$/, '');

  const copyPattern = new RegExp(`^${baseCode}_COPY(\\d+)$`);
  let maxNum = 0;

  existingCodes.forEach((code) => {
    const match = code.match(copyPattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  const suffix = String(nextNum).padStart(2, '0');
  return `${baseCode}_COPY${suffix}`;
}

export default function CataloguePage() {
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Lookups data
  const [legalEntities, setLegalEntities] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);

  // Pagination, Search, Filter States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Forms
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cat | null>(null);
  const [detailsItem, setDetailsItem] = useState<Cat | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<Cat | null>(null);
  const [statusTarget, setStatusTarget] = useState<Cat | null>(null);
  const [form, setForm] = useState({
    benefitCode: '',
    benefitType: 'MEDICAL_INSURANCE',
    label: '',
    countryCode: 'UAE',
    isMandatory: false,
    valuationBasis: 'FIXED',
    annualValue: '5000',
    currency: 'AED',
    frequencyMonths: 12,
    vendorRequired: false,
    dependantsAllowed: false,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    // Advanced policyJson fields
    legalEntity: '',
    employmentCategory: 'Full-time',
    eligibilityExpression: '',
    glMapping: '',
    costCenter: '',
    coverageAmount: '',
    taxable: false,
  });

  const loadLookups = useCallback(async () => {
    try {
      const [rLE, rCC] = await Promise.all([
        fetch('/api/v1/gcc-landscape/legal-entities'),
        fetch('/api/core-hr/cost-centers'),
      ]);
      const pLE = await rLE.json();
      const pCC = await rCC.json();

      if (pLE.success && pLE.data) setLegalEntities(pLE.data);
      else if (pLE.legalEntities) setLegalEntities(pLE.legalEntities);
      else if (Array.isArray(pLE)) setLegalEntities(pLE);

      if (pCC.success && pCC.data) setCostCenters(pCC.data);
      else if (pCC.costCenters) setCostCenters(pCC.costCenters);
      else if (Array.isArray(pCC)) setCostCenters(pCC);
    } catch (e) {
      console.error('Error loading lookups', e);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/benefits-compliance/catalogue');
      const p = await r.json();
      if (p.success) {
        let items: Cat[] = p.data ?? [];

        // Client-side search and filters
        if (search) {
          const s = search.toLowerCase();
          items = items.filter(
            (x) =>
              x.benefitCode.toLowerCase().includes(s) ||
              x.label.toLowerCase().includes(s) ||
              (x.benefitType && x.benefitType.toLowerCase().includes(s))
          );
        }

        if (filters.benefitType) {
          items = items.filter((x) => x.benefitType === filters.benefitType);
        }
        if (filters.countryCode) {
          items = items.filter((x) => x.countryCode === filters.countryCode);
        }
        if (filters.status) {
          items = items.filter((x) => x.status === filters.status);
        }

        setTotal(items.length);
        const start = (page - 1) * pageSize;
        setRows(items.slice(start, start + pageSize));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize, filters]);

  useEffect(() => {
    setMounted(true);
    load();
    loadLookups();
  }, [load, loadLookups]);

  const handleSave = async () => {
    const policyJson = {
      legalEntity: form.legalEntity,
      employmentCategory: form.employmentCategory,
      eligibilityExpression: form.eligibilityExpression,
      glMapping: form.glMapping,
      costCenter: form.costCenter,
      coverageAmount: form.coverageAmount,
      taxable: form.taxable,
    };

    const payload = {
      action: 'upsert',
      benefitCode: form.benefitCode,
      benefitType: form.benefitType,
      label: form.label,
      countryCode: form.countryCode || null,
      isMandatory: form.isMandatory,
      valuationBasis: form.valuationBasis,
      annualValue: Number(form.annualValue),
      currency: form.currency,
      frequencyMonths: Number(form.frequencyMonths),
      vendorRequired: form.vendorRequired,
      dependantsAllowed: form.dependantsAllowed,
      effectiveFrom: form.effectiveFrom,
      status: editingItem?.status ?? 'ACTIVE',
      policyJson,
    };

    try {
      const res = await fetch('/api/v1/benefits-compliance/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Catalogue item updated' : 'Catalogue item registered');
        setFormOpen(false);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to save catalogue item');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error saving catalogue item');
    }
  };

  const handleEdit = (item: Cat) => {
    setEditingItem(item);
    const policy = item.policyJson ?? {};
    setForm({
      benefitCode: item.benefitCode,
      benefitType: item.benefitType,
      label: item.label,
      countryCode: item.countryCode ?? '',
      isMandatory: item.isMandatory,
      valuationBasis: item.valuationBasis,
      annualValue: String(item.annualValue),
      currency: item.currency,
      frequencyMonths: item.frequencyMonths,
      vendorRequired: item.vendorRequired,
      dependantsAllowed: item.dependantsAllowed,
      effectiveFrom: item.effectiveFrom
        ? item.effectiveFrom.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      legalEntity: policy.legalEntity ?? '',
      employmentCategory: policy.employmentCategory ?? 'Full-time',
      eligibilityExpression: policy.eligibilityExpression ?? '',
      glMapping: policy.glMapping ?? '',
      costCenter: policy.costCenter ?? '',
      coverageAmount: policy.coverageAmount ?? '',
      taxable: policy.taxable ?? false,
    });
    setFormOpen(true);
  };

  const handleDuplicate = async () => {
    if (!duplicateTarget) return;
    const existingCodes = rows.map((r) => r.benefitCode);
    const uniqueCode = getUniqueCopyCode(duplicateTarget.benefitCode, existingCodes);
    const policy = duplicateTarget.policyJson ?? {};
    const payload = {
      action: 'upsert',
      benefitCode: uniqueCode,
      benefitType: duplicateTarget.benefitType,
      label: `${duplicateTarget.label} (Copy)`,
      countryCode: duplicateTarget.countryCode || null,
      isMandatory: duplicateTarget.isMandatory,
      valuationBasis: duplicateTarget.valuationBasis,
      annualValue: Number(duplicateTarget.annualValue),
      currency: duplicateTarget.currency,
      frequencyMonths: Number(duplicateTarget.frequencyMonths),
      vendorRequired: duplicateTarget.vendorRequired,
      dependantsAllowed: duplicateTarget.dependantsAllowed,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
      policyJson: policy,
    };
    try {
      const res = await fetch('/api/v1/benefits-compliance/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          <div>
            <p className="font-bold">Benefit duplicated successfully.</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">New Code: {uniqueCode}</p>
          </div>
        );
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to duplicate benefit');
      }
    } catch {
      toast.error('Network error duplicating benefit');
    } finally {
      setDuplicateTarget(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    const policy = statusTarget.policyJson ?? {};
    const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const payload = {
      action: 'upsert',
      benefitCode: statusTarget.benefitCode,
      benefitType: statusTarget.benefitType,
      label: statusTarget.label,
      countryCode: statusTarget.countryCode || null,
      isMandatory: statusTarget.isMandatory,
      valuationBasis: statusTarget.valuationBasis,
      annualValue: Number(statusTarget.annualValue),
      currency: statusTarget.currency,
      frequencyMonths: Number(statusTarget.frequencyMonths),
      vendorRequired: statusTarget.vendorRequired,
      dependantsAllowed: statusTarget.dependantsAllowed,
      effectiveFrom: statusTarget.effectiveFrom
        ? statusTarget.effectiveFrom.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      status: newStatus,
      policyJson: policy,
    };
    try {
      const res = await fetch('/api/v1/benefits-compliance/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Benefit status updated to ${newStatus}`);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to toggle status');
      }
    } catch {
      toast.error('Network error toggling status');
    } finally {
      setStatusTarget(null);
    }
  };

  const columns: Array<Column<Cat>> = [
    { key: 'benefitCode', label: 'Benefit Code', sortable: true },
    {
      key: 'benefitType',
      label: 'Benefit Type',
      sortable: true,
      render: (row) => formatBenefitType(row.benefitType),
    },
    { key: 'label', label: 'Benefit Name', sortable: true },
    { key: 'countryCode', label: 'Country', render: (row) => row.countryCode ?? 'GCC Wide' },
    {
      key: 'isMandatory',
      label: 'Obligation',
      render: (row) =>
        row.isMandatory ? (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-xs text-rose-700 font-semibold">
            MANDATORY
          </span>
        ) : (
          <span className="rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-xs text-slate-600">
            OPTIONAL
          </span>
        ),
    },
    { key: 'valuationBasis', label: 'Basis' },
    {
      key: 'annualValue',
      label: 'Annual Value',
      render: (row) =>
        `${row.currency} ${Number(row.annualValue).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs text-emerald-700 font-semibold">
            ACTIVE
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs text-slate-500 font-semibold">
            INACTIVE
          </span>
        ),
    },
    {
      key: 'effectiveTo',
      label: 'Effective To',
      render: (row) => (row.effectiveTo ? row.effectiveTo.slice(0, 10) : '—'),
    },
    {
      key: 'updatedAt',
      label: 'Last Modified',
      render: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (row) => row.createdBy ?? 'System',
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'benefitType',
      label: 'Benefit Type',
      type: 'select',
      options: BENEFIT_TYPES.map((t) => ({ value: t, label: formatBenefitType(t) })),
    },
    {
      name: 'countryCode',
      label: 'Country Eligibility',
      type: 'select',
      options: COUNTRIES.map((c) => ({ value: c, label: c })),
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
    },
  ];

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-22 · S01 / S02
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Benefit Catalogue Management
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <ExportButton
              data={rows}
              headers={columns.map((c) => ({ key: c.key, label: c.label }))}
              filename="benefits_catalogue"
              className="h-10 min-w-[100px] justify-center"
            />
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setForm({
                  benefitCode: '',
                  benefitType: 'MEDICAL_INSURANCE',
                  label: '',
                  countryCode: 'UAE',
                  isMandatory: false,
                  valuationBasis: 'FIXED',
                  annualValue: '5000',
                  currency: 'AED',
                  frequencyMonths: 12,
                  vendorRequired: false,
                  dependantsAllowed: false,
                  effectiveFrom: new Date().toISOString().slice(0, 10),
                  legalEntity: '',
                  employmentCategory: 'Full-time',
                  eligibilityExpression: '',
                  glMapping: '',
                  costCenter: '',
                  coverageAmount: '',
                  taxable: false,
                });
                setFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white h-10 min-w-[140px] shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Define Benefit
            </button>
          </div>
        </header>

        {/* Filters */}
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={(n, v) => setFilters((f) => ({ ...f, [n]: v }))}
          fields={filterFields}
          onReset={() => {
            setSearch('');
            setFilters({});
          }}
          showDeleted={showDeleted}
          onToggleDeleted={setShowDeleted}
          placeholder="Search benefit code or name..."
        />

        {/* Data Table */}
        <EntityTable
          columns={columns}
          data={rows}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          emptyMessage="No catalogue items found. Use Seed Defaults or Define Benefit to populate."
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDetailsItem(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDuplicateTarget(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setStatusTarget(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              >
                {row.status === 'ACTIVE' ? (
                  <Pause className="h-4 w-4 text-amber-600" />
                ) : (
                  <Play className="h-4 w-4 text-emerald-600" />
                )}
              </button>
            </div>
          )}
        />

        {/* Details View Modal */}
        {detailsItem && (
          <DetailsModal
            open={!!detailsItem}
            onOpenChange={(o) => {
              if (!o) setDetailsItem(null);
            }}
            title="Benefit Catalogue Details"
            data={detailsItem}
            fields={[
              { key: 'benefitCode', label: 'Benefit Code' },
              { key: 'benefitType', label: 'Benefit Type', render: (v) => formatBenefitType(v) },
              { key: 'label', label: 'Program Name' },
              { key: 'countryCode', label: 'Country Eligibility', render: (v) => v ?? 'GCC Wide' },
              {
                key: 'isMandatory',
                label: 'Mandatory Obligation',
                render: (v) => (v ? 'Yes' : 'No'),
              },
              { key: 'valuationBasis', label: 'Valuation Basis' },
              {
                key: 'annualValue',
                label: 'Annual Value',
                render: (v) =>
                  `${detailsItem.currency} ${Number(v).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
              },
              { key: 'frequencyMonths', label: 'Renewal Cycle (Months)' },
              {
                key: 'vendorRequired',
                label: 'Vendor Mandatory',
                render: (v) => (v ? 'Yes' : 'No'),
              },
              {
                key: 'dependantsAllowed',
                label: 'Dependents Eligible',
                render: (v) => (v ? 'Yes' : 'No'),
              },
              { key: 'status', label: 'Current Status' },
              { key: 'effectiveFrom', label: 'Effective From', render: (v) => v?.slice(0, 10) },
              { key: 'effectiveTo', label: 'Effective To', render: (v) => v?.slice(0, 10) ?? '—' },
              { key: 'createdBy', label: 'Created By', render: (v) => v || 'System' },
              {
                key: 'createdAt',
                label: 'Created At',
                render: (v) => (v ? new Date(v).toLocaleString() : '—'),
              },
              { key: 'updatedBy', label: 'Last Updated By', render: (v) => v || '—' },
              {
                key: 'updatedAt',
                label: 'Last Updated At',
                render: (v) => (v ? new Date(v).toLocaleString() : '—'),
              },
            ]}
            renderExtra={() => {
              const policy = detailsItem.policyJson ?? {};
              return (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    GCC Compliance Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Legal Entity Scope
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {policy.legalEntity || 'All Entities'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Employment Category
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {policy.employmentCategory || 'All Categories'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        GL Mapping Account
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {policy.glMapping || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Cost Center
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {policy.costCenter || '—'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        DSL Eligibility Expression
                      </span>
                      <pre className="mt-1 rounded bg-slate-50 p-2 text-xs font-mono text-slate-800 border border-slate-100 leading-normal">
                        {policy.eligibilityExpression || 'true'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Withholding Taxable
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {policy.taxable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}

        <FormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editingItem ? 'Modify Benefit Catalogue Item' : 'Define New Catalogue Benefit'}
          onSubmit={handleSave}
        >
          <div className="flex flex-col gap-6 px-1">
            {/* Card 1: General Information */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Briefcase className="h-4.5 w-4.5 text-slate-500" />
                General Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Benefit Code *
                  </label>
                  <input
                    value={form.benefitCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, benefitCode: e.target.value.toUpperCase() }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="MEDICAL_INSURANCE_UAE"
                    required
                    disabled={!!editingItem}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Benefit Type *
                  </label>
                  <select
                    value={form.benefitType}
                    onChange={(e) => setForm((f) => ({ ...f, benefitType: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    {BENEFIT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {formatBenefitType(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Benefit Name (Label) *
                  </label>
                  <input
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="UAE CCHI Mandatory Medical Insurance"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Coverage Configuration */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5 text-slate-500" />
                Coverage Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Country Eligibility Scope
                  </label>
                  <select
                    value={form.countryCode}
                    onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">GCC Wide / Global</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isMandatory}
                      onChange={(e) => setForm((f) => ({ ...f, isMandatory: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Mandatory</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.vendorRequired}
                      onChange={(e) => setForm((f) => ({ ...f, vendorRequired: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Vendor Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.dependantsAllowed}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dependantsAllowed: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Dependents Allowed</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Card 3: Financial Configuration */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <DollarSign className="h-4.5 w-4.5 text-slate-500" />
                Financial Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Valuation Basis *
                  </label>
                  <select
                    value={form.valuationBasis}
                    onChange={(e) => setForm((f) => ({ ...f, valuationBasis: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="FIXED">FIXED (Set Value)</option>
                    <option value="ACCRUED">ACCRUED (Entitled Pro-Rata)</option>
                    <option value="ACTUAL">ACTUAL (Reimbursed/Invoice)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Currency *
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Annual Value (Standard) *
                  </label>
                  <input
                    type="number"
                    value={form.annualValue}
                    onChange={(e) => setForm((f) => ({ ...f, annualValue: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="5000.00"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Renewal Frequency (Months)
                  </label>
                  <input
                    type="number"
                    value={form.frequencyMonths}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, frequencyMonths: Number(e.target.value) }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Eligibility Rules */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Info className="h-4.5 w-4.5 text-slate-500" />
                Eligibility Rules
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Employment Category
                  </label>
                  <select
                    value={form.employmentCategory}
                    onChange={(e) => setForm((f) => ({ ...f, employmentCategory: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="Full-time">Full-time Only</option>
                    <option value="Part-time">Part-time Only</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Legal Entity scope
                  </label>
                  <select
                    value={form.legalEntity}
                    onChange={(e) => setForm((f) => ({ ...f, legalEntity: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">All Legal Entities</option>
                    {(Array.isArray(legalEntities) ? legalEntities : []).map((le) => (
                      <option key={le.id} value={le.id}>
                        {le.legalName || le.name} ({le.countryCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    GL Mapping Account
                  </label>
                  <input
                    value={form.glMapping}
                    onChange={(e) => setForm((f) => ({ ...f, glMapping: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="610200 - Benefits Expense"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cost Center
                  </label>
                  <select
                    value={form.costCenter}
                    onChange={(e) => setForm((f) => ({ ...f, costCenter: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">All Cost Centers</option>
                    {(Array.isArray(costCenters) ? costCenters : []).map((cc) => (
                      <option key={cc.id} value={cc.code}>
                        {cc.name} ({cc.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Eligibility Rule DSL Expression
                  </label>
                  <textarea
                    value={form.eligibilityExpression}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, eligibilityExpression: e.target.value }))
                    }
                    rows={2}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none font-mono"
                    placeholder='employee.grade.level >= 5 && employee.country == "UAE"'
                  />
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">
                    Help: Write expressions using employee metrics. E.g.: `employee.grade &gt;= 5
                    &amp;&amp; employee.country == "UAE"`
                  </span>
                </div>
              </div>
            </div>

            {/* Card 5: Compliance */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-slate-500" />
                Compliance &amp; Effective Dates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Effective From *
                  </label>
                  <input
                    type="date"
                    value={form.effectiveFrom}
                    onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 justify-center mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.taxable}
                      onChange={(e) => setForm((f) => ({ ...f, taxable: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Subject to Withholding Tax
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </FormModal>

        {/* Duplicate Confirmation Dialog */}
        <ConfirmDialog
          open={!!duplicateTarget}
          onOpenChange={(o) => {
            if (!o) setDuplicateTarget(null);
          }}
          title="Create a copy of this benefit configuration?"
          description="A new benefit catalogue entry will be created using the current configuration. A unique benefit code will be generated automatically. You can edit the new record afterwards if required."
          confirmText="Yes, Create Copy"
          type="info"
          onConfirm={handleDuplicate}
        />

        {/* Status Change Confirmation Dialog */}
        {statusTarget && (
          <ConfirmDialog
            open={!!statusTarget}
            onOpenChange={(o) => {
              if (!o) setStatusTarget(null);
            }}
            title={
              statusTarget.status === 'ACTIVE'
                ? `Deactivate "${statusTarget.label}"?`
                : 'Make this benefit available for new enrollments?'
            }
            description={
              statusTarget.status === 'ACTIVE'
                ? `This benefit currently has: \n\n • ${statusTarget.activeEnrollments ?? 0} active enrollments\n • 0 renewal schedules\n • 0 pending approvals\n\n Employees will not lose existing coverage, but no new enrollments can be created while this benefit is inactive.`
                : 'This will make the program active and ready to accept new employee coverages.'
            }
            confirmText={statusTarget.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            type={statusTarget.status === 'ACTIVE' ? 'warning' : 'success'}
            onConfirm={handleToggleStatus}
          />
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Activity,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  EntityTable,
  FilterToolbar,
  FormModal,
  ConfirmDialog,
  DetailsModal,
  type Column,
  type FilterField,
} from '../components';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  vendorType: string;
  country: string | null;
  contactEmail: string | null;
  contractRef: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  dpaSigned: boolean;
  dpaSignedAt: string | null;
  status: string;
  employeesCovered?: number;
  createdAt: string;
  updatedAt: string;
}

const VENDOR_TYPES = [
  'MEDICAL_INSURER',
  'LIFE_INSURER',
  'TRAVEL_AGENCY',
  'HOUSING_PROVIDER',
  'EDUCATION_PROVIDER',
  'PPE_SUPPLIER',
  'WELLNESS_PROVIDER',
  'OTHER',
];

const COUNTRIES = [
  { value: 'UAE', label: 'UAE' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Kuwait', label: 'Kuwait' },
];

function formatVendorType(type: string): string {
  if (!type) return '—';
  return type
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const nextYearStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export default function VendorsPage() {
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters & State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Forms & Details
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vendor | null>(null);
  const [detailsItem, setDetailsItem] = useState<Vendor | null>(null);
  const [form, setForm] = useState({
    name: '',
    vendorType: 'MEDICAL_INSURER',
    country: 'UAE',
    contactEmail: '',
    contractRef: '',
    contractStart: todayStr(),
    contractEnd: nextYearStr(),
  });

  const [dpaConfirmId, setDpaConfirmId] = useState<string | null>(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<Vendor | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/benefits-compliance/vendors');
      const p = await r.json();
      if (p.success) {
        let items: Vendor[] = p.data ?? [];

        // Search & Filter
        if (search) {
          const s = search.toLowerCase();
          items = items.filter(
            (x) =>
              x.name.toLowerCase().includes(s) ||
              (x.contractRef && x.contractRef.toLowerCase().includes(s)) ||
              (x.contactEmail && x.contactEmail.toLowerCase().includes(s))
          );
        }

        if (filters.vendorType) {
          items = items.filter((x) => x.vendorType === filters.vendorType);
        }
        if (filters.dpaSigned) {
          items = items.filter((x) => String(x.dpaSigned) === filters.dpaSigned);
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
  }, [load]);

  const handleSave = async () => {
    const payload = {
      action: 'upsert',
      id: editingItem?.id,
      ...form,
      contractStart: form.contractStart || undefined,
      contractEnd: form.contractEnd || undefined,
      status: editingItem?.status ?? 'ACTIVE',
    };

    try {
      const res = await fetch('/api/v1/benefits-compliance/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Vendor updated' : 'Vendor registered');
        setFormOpen(false);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to save vendor');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error saving vendor');
    }
  };

  const handleEdit = (item: Vendor) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      vendorType: item.vendorType,
      country: item.country ?? 'UAE',
      contactEmail: item.contactEmail ?? '',
      contractRef: item.contractRef ?? '',
      contractStart: item.contractStart ? item.contractStart.slice(0, 10) : '',
      contractEnd: item.contractEnd ? item.contractEnd.slice(0, 10) : '',
    });
    setFormOpen(true);
  };

  const handleSignDpa = async () => {
    if (!dpaConfirmId) return;
    try {
      const res = await fetch('/api/v1/benefits-compliance/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign-dpa', id: dpaConfirmId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('DPA Agreement logged successfully');
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to sign DPA');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error registering DPA');
    } finally {
      setDpaConfirmId(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirmTarget) return;
    const newStatus = statusConfirmTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const payload = {
      action: 'upsert',
      id: statusConfirmTarget.id,
      name: statusConfirmTarget.name,
      vendorType: statusConfirmTarget.vendorType,
      country: statusConfirmTarget.country,
      contactEmail: statusConfirmTarget.contactEmail,
      contractRef: statusConfirmTarget.contractRef,
      contractStart: statusConfirmTarget.contractStart
        ? statusConfirmTarget.contractStart.slice(0, 10)
        : undefined,
      contractEnd: statusConfirmTarget.contractEnd
        ? statusConfirmTarget.contractEnd.slice(0, 10)
        : undefined,
      status: newStatus,
    };
    try {
      const res = await fetch('/api/v1/benefits-compliance/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Vendor status updated to ${newStatus}`);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to toggle status');
      }
    } catch {
      toast.error('Network error toggling status');
    } finally {
      setStatusConfirmTarget(null);
    }
  };

  const renderContractExpiry = (expiryDateStr: string | null): React.ReactNode => {
    if (!expiryDateStr) return <span className="text-slate-400">—</span>;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dateText = expiryDateStr.slice(0, 10);

    if (diffDays < 0) {
      return (
        <span className="inline-flex flex-col text-rose-600 font-semibold text-xs">
          <span>{dateText}</span>
          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wide">
            ⚠ Expired
          </span>
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="inline-flex flex-col text-amber-600 font-semibold text-xs">
          <span>{dateText}</span>
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wide">
            ⚠ {diffDays} days left
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex flex-col text-slate-700 text-xs">
        <span>{dateText}</span>
        <span className="text-[10px] text-slate-400">{diffDays} days left</span>
      </span>
    );
  };

  const columns: Array<Column<Vendor>> = [
    { key: 'name', label: 'Vendor Name', sortable: true },
    {
      key: 'vendorType',
      label: 'Type',
      sortable: true,
      render: (row) => formatVendorType(row.vendorType),
    },
    { key: 'country', label: 'Country', render: (row) => row.country ?? '—' },
    { key: 'contactEmail', label: 'Email', render: (row) => row.contactEmail ?? '—' },
    {
      key: 'employeesCovered',
      label: 'Employees Covered',
      render: (row) => (
        <span className="font-semibold text-slate-700">
          {row.employeesCovered ? `${row.employeesCovered.toLocaleString()} covered` : '0 covered'}
        </span>
      ),
    },
    { key: 'contractRef', label: 'Contract Ref', render: (row) => row.contractRef ?? '—' },
    {
      key: 'contractEnd',
      label: 'Contract Expiry',
      render: (row) => renderContractExpiry(row.contractEnd),
    },
    {
      key: 'dpaSigned',
      label: 'DPA Status',
      render: (row) =>
        row.dpaSigned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="h-3 w-3" />
            SIGNED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-xs text-rose-700 font-semibold">
            <ShieldAlert className="h-3 w-3" />
            UNSIGNED
          </span>
        ),
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
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs text-slate-400 font-semibold">
            INACTIVE
          </span>
        ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'vendorType',
      label: 'Vendor Type',
      type: 'select',
      options: VENDOR_TYPES.map((t) => ({ value: t, label: formatVendorType(t) })),
    },
    {
      name: 'dpaSigned',
      label: 'DPA Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Signed Only' },
        { value: 'false', label: 'Unsigned Only' },
      ],
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

  // Calculations for compliance strip
  const totalCount = rows.length;
  const dpaSignedCount = rows.filter((r) => r.dpaSigned).length;
  const missingDpaCount = totalCount - dpaSignedCount;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  let expiringSoonCount = 0;
  let expiredContractsCount = 0;

  rows.forEach((r) => {
    if (r.contractEnd) {
      const end = new Date(r.contractEnd);
      end.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((end.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiredContractsCount++;
      } else if (diffDays <= 30) {
        expiringSoonCount++;
      }
    }
  });

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
              EPIC-22 · S14 / S15
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Vendor Management &amp; Data Privacy (DPA)
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setForm({
                name: '',
                vendorType: 'MEDICAL_INSURER',
                country: 'UAE',
                contactEmail: '',
                contractRef: '',
                contractStart: todayStr(),
                contractEnd: nextYearStr(),
              });
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Vendor
          </button>
        </header>

        {/* Compliance summary strip */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Total Vendors
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {totalCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 text-emerald-600 p-2 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                DPA Signed
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {dpaSignedCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-rose-50 text-rose-600 p-2 border border-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Missing DPA
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {missingDpaCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 text-amber-600 p-2 border border-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Expiring Contracts
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {expiringSoonCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="rounded-lg bg-rose-100 text-rose-700 p-2">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Expired Contracts
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {expiredContractsCount}
              </span>
            </div>
          </div>
        </section>

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
          placeholder="Search vendor by name, email, or contract ref..."
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
          emptyMessage="No vendors registered yet. Register vendor above."
          actions={(row) => (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDetailsItem(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="View Vendor Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Edit Vendor"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {!row.dpaSigned && (
                <button
                  type="button"
                  onClick={() => setDpaConfirmId(row.id)}
                  className="rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-2 py-1 text-xs text-emerald-800 font-bold transition-all"
                  title="Sign Data Privacy Agreement"
                >
                  Sign DPA
                </button>
              )}
              <button
                type="button"
                onClick={() => setStatusConfirmTarget(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title={row.status === 'ACTIVE' ? 'Deactivate Vendor' : 'Activate Vendor'}
              >
                {row.status === 'ACTIVE' ? (
                  <ToggleRight className="h-5 w-5 text-emerald-600 cursor-pointer" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-slate-400 cursor-pointer" />
                )}
              </button>
            </div>
          )}
        />

        {/* DPA Confirmation Modal */}
        <ConfirmDialog
          open={!!dpaConfirmId}
          onOpenChange={(o) => {
            if (!o) setDpaConfirmId(null);
          }}
          title="Record Signed Data Privacy Agreement (DPA)?"
          description="Confirming this will mark the vendor as DPA-compliant, allowing enrollment of GCC employee data without raising compliance warnings or gating certificates."
          confirmText="Yes, Log Signed DPA"
          type="success"
          onConfirm={handleSignDpa}
        />

        {/* Vendor Status Change Confirmation Dialog */}
        {statusConfirmTarget && (
          <ConfirmDialog
            open={!!statusConfirmTarget}
            onOpenChange={(o) => {
              if (!o) setStatusConfirmTarget(null);
            }}
            title={
              statusConfirmTarget.status === 'ACTIVE'
                ? `Deactivate "${statusConfirmTarget.name}"?`
                : 'Make this vendor active?'
            }
            description={
              statusConfirmTarget.status === 'ACTIVE'
                ? `This vendor currently covers:\n\n • ${statusConfirmTarget.employeesCovered ?? 0} active employees\n\nExisting enrollments remain active. New enrollments under this vendor will be blocked.`
                : 'This will allow new employee enrollments to select this vendor as their coverage provider.'
            }
            confirmText={statusConfirmTarget.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            type={statusConfirmTarget.status === 'ACTIVE' ? 'warning' : 'success'}
            onConfirm={handleToggleStatus}
          />
        )}

        {/* Details View Modal */}
        {detailsItem && (
          <DetailsModal
            open={!!detailsItem}
            onOpenChange={(o) => {
              if (!o) setDetailsItem(null);
            }}
            title="Vendor Configuration Details"
            data={detailsItem}
            fields={[
              { key: 'name', label: 'Vendor Name' },
              { key: 'vendorType', label: 'Vendor Type', render: (v) => formatVendorType(v) },
              { key: 'country', label: 'Operating Country' },
              { key: 'contactEmail', label: 'Contact Email', render: (v) => v || '—' },
              {
                key: 'employeesCovered',
                label: 'Employees Enrolled',
                render: (v) => (
                  <span className="font-semibold text-emerald-700">
                    {v ? `${v.toLocaleString()} active enrollments` : '0 active enrollments'}
                  </span>
                ),
              },
              { key: 'contractRef', label: 'Contract Reference', render: (v) => v || '—' },
              {
                key: 'contractStart',
                label: 'Contract Starts',
                render: (v) => v?.slice(0, 10) ?? '—',
              },
              {
                key: 'contractEnd',
                label: 'Contract Expires',
                render: (v) => v?.slice(0, 10) ?? '—',
              },
              {
                key: 'dpaSigned',
                label: 'DPA Compliance status',
                render: (v) => (v ? 'Signed & Logged' : 'MISSING (Unsigned)'),
              },
              {
                key: 'dpaSignedAt',
                label: 'DPA Signature Date',
                render: (v) => (v ? v.slice(0, 10) : '—'),
              },
              { key: 'status', label: 'Vendor Status' },
            ]}
            renderExtra={() => (
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <h4>System Metadata Log</h4>
                <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-700 lowercase normal-case mt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Created Timestamp
                    </span>
                    <span>{new Date(detailsItem.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Last Modified
                    </span>
                    <span>{new Date(detailsItem.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {/* Form Modal */}
        <FormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editingItem ? 'Edit Vendor Details' : 'Register New Benefits Vendor'}
          onSubmit={handleSave}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vendor Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="AXA Gulf / Sukoon Insurance"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vendor Type *
              </label>
              <select
                value={form.vendorType}
                onChange={(e) => setForm((f) => ({ ...f, vendorType: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                {VENDOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatVendorType(t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Operating Country *
              </label>
              <select
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contact Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="benefits@vendor.com"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contract Reference
              </label>
              <input
                value={form.contractRef}
                onChange={(e) => setForm((f) => ({ ...f, contractRef: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="CON-2026-0091"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contract Start Date
              </label>
              <input
                type="date"
                value={form.contractStart}
                onChange={(e) => setForm((f) => ({ ...f, contractStart: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contract End Date
              </label>
              <input
                type="date"
                value={form.contractEnd}
                onChange={(e) => setForm((f) => ({ ...f, contractEnd: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </FormModal>
      </div>
    </main>
  );
}

'use client';

import * as React from 'react';
import {
  EntityTable,
  FilterToolbar,
  BulkToolbar,
  DetailsModal,
  FormModal,
  ConfirmDialog,
  type Column,
  type FilterField,
} from '../components';
import { toast } from 'sonner';
import { Plus, Eye, Edit2, Archive, RotateCcw, Trash2, ShieldAlert } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  siteType: string;
  country: string;
  address: string | null;
  totalCapacity: number;
  currentOccupancy: number;
  femaleOnly: boolean;
  familyAllowed: boolean;
  lastInspectionAt: string | null;
  nextInspectionAt: string | null;
  status: string;
  isDeleted: boolean;
}

export default function SitesPage() {
  const [data, setData] = React.useState<Site[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Pagination & Sorting & Search states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'name', dir: 'asc' },
  ]);
  const [filters, setFilters] = React.useState<Record<string, string>>({
    country: '',
    siteType: '',
    status: 'ACTIVE',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals / Dialogs states
  const [viewItem, setViewItem] = React.useState<Site | null>(null);
  const [editItem, setEditItem] = React.useState<Site | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  // Confirm Actions states
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'archive' | 'restore' | 'delete' | 'hard-delete';
    id: string;
    title: string;
    desc: string;
  } | null>(null);

  // Form inputs state
  const [form, setForm] = React.useState({
    name: '',
    siteType: 'DORMITORY',
    country: 'UAE',
    address: '',
    totalCapacity: '50',
    femaleOnly: false,
    familyAllowed: false,
    status: 'ACTIVE',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (search) params.set('search', search);
      if (sort.length > 0) params.set('sort', JSON.stringify(sort));

      params.set('isDeleted', String(showDeleted));
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.set(k, v);
      }

      const res = await fetch(`/api/v1/accommodation-compliance/sites?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load sites');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading sites');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sort, filters, showDeleted]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ country: '', siteType: '', status: 'ACTIVE' });
    setShowDeleted(false);
    setSort([{ field: 'name', dir: 'asc' }]);
    setPage(1);
  };

  const handleCreateSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      throw new Error();
    }
    const cap = Number(form.totalCapacity);
    if (isNaN(cap) || cap < 1) {
      toast.error('Capacity must be at least 1');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          ...form,
          totalCapacity: cap,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Site created successfully');
        setShowCreate(false);
        setForm({
          name: '',
          siteType: 'DORMITORY',
          country: 'UAE',
          address: '',
          totalCapacity: '50',
          femaleOnly: false,
          familyAllowed: false,
          status: 'ACTIVE',
        });
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to create site');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const handleEditSubmit = async () => {
    if (!editItem) return;
    if (!form.name.trim()) {
      toast.error('Name is required');
      throw new Error();
    }
    const cap = Number(form.totalCapacity);
    if (isNaN(cap) || cap < 1) {
      toast.error('Capacity must be at least 1');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          id: editItem.id,
          ...form,
          totalCapacity: cap,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Site updated successfully');
        setEditItem(null);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to update site');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const openEdit = (site: Site) => {
    setEditItem(site);
    setForm({
      name: site.name,
      siteType: site.siteType,
      country: site.country,
      address: site.address ?? '',
      totalCapacity: String(site.totalCapacity),
      femaleOnly: site.femaleOnly,
      familyAllowed: site.familyAllowed,
      status: site.status,
    });
  };

  const triggerConfirmAction = (
    type: 'archive' | 'restore' | 'delete' | 'hard-delete',
    site: Site
  ) => {
    const title = {
      archive: 'Archive Accommodation Site',
      restore: 'Restore Accommodation Site',
      delete: 'Move Site to Trash',
      'hard-delete': 'Permanently Delete Site',
    }[type];

    const desc = {
      archive: `Are you sure you want to archive "${site.name}"? This updates its status to ARCHIVED.`,
      restore: `Are you sure you want to restore "${site.name}" back to ACTIVE status?`,
      delete: `Are you sure you want to move "${site.name}" to trash? This can be recovered from the Archived view.`,
      'hard-delete': `WARNING: Are you sure you want to permanently delete "${site.name}"? This action CANNOT be undone and will purge all database records.`,
    }[type];

    setConfirmAction({ type, id: site.id, title, desc });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    try {
      const res = await fetch('/api/v1/accommodation-compliance/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type, id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Site action successfully processed`);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to execute site action');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error executing site action');
    }
  };

  // Table Columns
  const columns: Array<Column<Site>> = [
    { key: 'name', label: 'Site Name', sortable: true },
    { key: 'siteType', label: 'Type', sortable: true },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'totalCapacity', label: 'Capacity', sortable: true },
    {
      key: 'currentOccupancy',
      label: 'Occupancy',
      sortable: true,
      render: (site) => {
        const over = site.currentOccupancy > site.totalCapacity;
        return (
          <span className={over ? 'font-extrabold text-rose-600' : 'text-slate-800'}>
            {site.currentOccupancy} {over && '⚠'}
          </span>
        );
      },
    },
    {
      key: 'femaleOnly',
      label: 'Female Only',
      render: (site) => (site.femaleOnly ? 'Yes' : 'No'),
    },
    {
      key: 'familyAllowed',
      label: 'Family Allowed',
      render: (site) => (site.familyAllowed ? 'Yes' : 'No'),
    },
    {
      key: 'lastInspectionAt',
      label: 'Last Inspection',
      render: (site) => (site.lastInspectionAt ? site.lastInspectionAt.slice(0, 10) : '—'),
    },
    {
      key: 'nextInspectionAt',
      label: 'Next Inspection',
      render: (site) => {
        const now = new Date();
        const overdue = site.nextInspectionAt && new Date(site.nextInspectionAt) < now;
        return (
          <span className={overdue ? 'font-semibold text-amber-600' : ''}>
            {site.nextInspectionAt ? site.nextInspectionAt.slice(0, 10) : '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (site) => {
        const statusColors: any = {
          ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-100',
          ARCHIVED: 'bg-slate-100 text-slate-800 border-slate-200',
          INACTIVE: 'bg-rose-50 text-rose-800 border-rose-100',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[site.status] ?? ''}`}
          >
            {site.status}
          </span>
        );
      },
    },
  ];

  // Filters inputs definition
  const filterFields: FilterField[] = [
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      options: [
        { value: 'UAE', label: 'United Arab Emirates' },
        { value: 'KSA', label: 'Saudi Arabia' },
        { value: 'BAHRAIN', label: 'Bahrain' },
        { value: 'QATAR', label: 'Qatar' },
        { value: 'OMAN', label: 'Oman' },
        { value: 'KUWAIT', label: 'Kuwait' },
      ],
    },
    {
      name: 'siteType',
      label: 'Site Type',
      type: 'select',
      options: [
        { value: 'DORMITORY', label: 'Dormitory' },
        { value: 'HOTEL', label: 'Hotel' },
        { value: 'APARTMENT', label: 'Apartment' },
        { value: 'LABOUR_CAMP', label: 'Labour Camp' },
        { value: 'VILLA', label: 'Villa' },
        { value: 'STAFF_HOUSING', label: 'Staff Housing' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
  ];

  // Details Modal Fields
  const detailFields = [
    { key: 'name', label: 'Site Name' },
    { key: 'siteType', label: 'Site Type' },
    { key: 'country', label: 'Country' },
    { key: 'address', label: 'Address' },
    { key: 'totalCapacity', label: 'Total Capacity' },
    { key: 'currentOccupancy', label: 'Current Occupancy' },
    { key: 'femaleOnly', label: 'Female Only Only', render: (v: any) => (v ? 'Yes' : 'No') },
    { key: 'familyAllowed', label: 'Family Allowed', render: (v: any) => (v ? 'Yes' : 'No') },
    {
      key: 'lastInspectionAt',
      label: 'Last Inspection Date',
      render: (v: any) => (v ? String(v).slice(0, 10) : '—'),
    },
    {
      key: 'nextInspectionAt',
      label: 'Next Scheduled Inspection',
      render: (v: any) => (v ? String(v).slice(0, 10) : '—'),
    },
    { key: 'status', label: 'Status' },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-23 · S02 / S14
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Accommodation Site Master
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({
                name: '',
                siteType: 'DORMITORY',
                country: 'UAE',
                address: '',
                totalCapacity: '50',
                femaleOnly: false,
                familyAllowed: false,
                status: 'ACTIVE',
              });
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Site
          </button>
        </header>

        {/* Filters Toolbar */}
        <FilterToolbar
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          filters={filters}
          onFilterChange={(name, val) => {
            setFilters((prev) => ({ ...prev, [name]: val }));
            setPage(1);
          }}
          fields={filterFields}
          onReset={handleResetFilters}
          showDeleted={showDeleted}
          onToggleDeleted={(val) => {
            setShowDeleted(val);
            setPage(1);
          }}
          placeholder="Search by name, country, address, manager or contractor..."
        />

        {/* Master Table */}
        <EntityTable
          columns={columns}
          data={data}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sort={sort}
          onSortChange={setSort}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          actions={(site) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewItem(site)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={site.isDeleted}
                onClick={() => openEdit(site)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors disabled:opacity-40"
                title="Edit Site"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {site.status !== 'ARCHIVED' && !site.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('archive', site)}
                  className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Archive Site"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              {site.status === 'ARCHIVED' && !site.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('restore', site)}
                  className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Restore Site"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {!site.isDeleted ? (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('delete', site)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
                  title="Trash Site"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('hard-delete', site)}
                  className="p-1.5 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition-colors"
                  title="Permanently Delete Site"
                >
                  <ShieldAlert className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />

        {/* Floating Bulk Action Bar */}
        <BulkToolbar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          entity="sites"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={load}
        />

        {/* Create Site Modal */}
        <FormModal
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Add New Accommodation Site"
          onSubmit={handleCreateSubmit}
          submitText="Save Site"
        >
          <SiteFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
          />
        </FormModal>

        {/* Edit Site Modal */}
        <FormModal
          open={editItem !== null}
          onOpenChange={(open) => !open && setEditItem(null)}
          title={`Edit Site: ${editItem?.name}`}
          onSubmit={handleEditSubmit}
          submitText="Save Changes"
        >
          <SiteFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
          />
        </FormModal>

        {/* Read-Only Details View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Accommodation Site Details"
          data={viewItem}
          fields={detailFields}
        />

        {/* Action Confirmations Dialog */}
        <ConfirmDialog
          open={confirmAction !== null}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmAction?.title ?? ''}
          description={confirmAction?.desc ?? ''}
          type={
            confirmAction?.type === 'hard-delete'
              ? 'danger'
              : confirmAction?.type === 'delete'
                ? 'warning'
                : 'info'
          }
          onConfirm={handleConfirmAction}
        />
      </div>
    </main>
  );
}

// Subcomponent: Form Fields for site creations/editions
function SiteFormFields({
  form,
  onChange,
}: {
  form: any;
  onChange: (fields: Partial<typeof form>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Site Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
          placeholder="e.g. Greenwood Labor Camp D"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Site Type
        </label>
        <select
          value={form.siteType}
          onChange={(e) => onChange({ siteType: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
        >
          {['DORMITORY', 'HOTEL', 'APARTMENT', 'LABOUR_CAMP', 'VILLA', 'STAFF_HOUSING'].map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
        <select
          value={form.country}
          onChange={(e) => onChange({ country: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
        >
          {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Full Address
        </label>
        <textarea
          value={form.address}
          onChange={(e) => onChange({ address: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400 min-h-[60px]"
          placeholder="Detailed street and locality details..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Total Capacity (Beds) *
        </label>
        <input
          type="number"
          value={form.totalCapacity}
          onChange={(e) => onChange({ totalCapacity: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
        <select
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-2 mt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={form.femaleOnly}
            onChange={(e) => onChange({ femaleOnly: e.target.checked })}
            className="h-4.5 w-4.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
          Restricted to Female occupants only
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={form.familyAllowed}
            onChange={(e) => onChange({ familyAllowed: e.target.checked })}
            className="h-4.5 w-4.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
          Family occupants allowed
        </label>
      </div>
    </div>
  );
}

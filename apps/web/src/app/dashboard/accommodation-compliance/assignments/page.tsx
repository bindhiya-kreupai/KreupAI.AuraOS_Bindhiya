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
import { Plus, Eye, Edit2, LogOut, Archive, RotateCcw, Trash2, ShieldAlert } from 'lucide-react';

interface Assignment {
  id: string;
  siteId: string;
  employeeId: string;
  siteName?: string;
  employeeName?: string;
  roomNumber: string | null;
  bedNumber: string | null;
  checkInAt: string;
  checkOutAt: string | null;
  status: string;
  monthlyAllowance: number | null;
  currency: string;
  isDeleted: boolean;
}

export default function AssignmentsPage() {
  const [data, setData] = React.useState<Assignment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Pagination & Sorting & Filter states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'checkInAt', dir: 'desc' },
  ]);
  const [filters, setFilters] = React.useState<Record<string, string>>({
    siteId: '',
    status: 'ACTIVE',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Action states
  const [viewItem, setViewItem] = React.useState<Assignment | null>(null);
  const [editItem, setEditItem] = React.useState<Assignment | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  // Confirmation dialogs
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'checkout' | 'archive' | 'restore' | 'delete' | 'hard-delete';
    id: string;
    title: string;
    desc: string;
  } | null>(null);

  // Form inputs state
  const [form, setForm] = React.useState({
    siteId: '',
    employeeId: '',
    roomNumber: '',
    bedNumber: '',
    checkInAt: new Date().toISOString().slice(0, 10),
    monthlyAllowance: '',
    currency: 'AED',
    status: 'ACTIVE',
  });

  const [sites, setSites] = React.useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = React.useState<
    Array<{ id: string; firstName: string; lastName: string; employeeCode: string }>
  >([]);
  const [employeeLoading, setEmployeeLoading] = React.useState(false);
  const [suggestedRooms, setSuggestedRooms] = React.useState<string[]>([]);
  const [suggestedBeds, setSuggestedBeds] = React.useState<string[]>([]);

  // Load sites & initial employees
  React.useEffect(() => {
    fetch('/api/v1/accommodation-compliance/sites?pageSize=1000')
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setSites(payload.data?.items ?? []);
      })
      .catch(console.error);

    fetch('/api/employees/search?size=100')
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setEmployees(payload.data?.employees ?? []);
        }
      })
      .catch(console.error);
  }, []);

  // Update room & bed suggestions when siteId changes
  React.useEffect(() => {
    if (!form.siteId) {
      setSuggestedRooms([]);
      setSuggestedBeds([]);
      return;
    }

    fetch(`/api/v1/accommodation-compliance/assignments?siteId=${form.siteId}&pageSize=1000`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          const items: Assignment[] = payload.data?.items ?? [];
          const rooms = Array.from(
            new Set(items.map((i) => i.roomNumber).filter(Boolean))
          ) as string[];
          const beds = Array.from(
            new Set(items.map((i) => i.bedNumber).filter(Boolean))
          ) as string[];
          setSuggestedRooms(rooms.sort());
          setSuggestedBeds(beds.sort());
        }
      })
      .catch(console.error);
  }, [form.siteId]);

  const handleSearchEmployees = React.useCallback(async (query: string) => {
    setEmployeeLoading(true);
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}&size=100`);
      const payload = await res.json();
      if (payload.success) {
        setEmployees(payload.data?.employees ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

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

      const res = await fetch(`/api/v1/accommodation-compliance/assignments?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load assignments');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading assignments');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sort, filters, showDeleted]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ siteId: '', status: 'ACTIVE' });
    setShowDeleted(false);
    setSort([{ field: 'checkInAt', dir: 'desc' }]);
    setPage(1);
  };

  const handleCreateSubmit = async () => {
    if (!form.siteId.trim() || !form.employeeId.trim()) {
      toast.error('Site ID and Employee ID are required');
      throw new Error();
    }
    const allowanceVal = form.monthlyAllowance ? Number(form.monthlyAllowance) : undefined;
    if (allowanceVal !== undefined && (isNaN(allowanceVal) || allowanceVal < 0)) {
      toast.error('Allowance must be a positive number');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          ...form,
          monthlyAllowance: allowanceVal,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Employee checked in successfully');
        setShowCreate(false);
        setForm({
          siteId: '',
          employeeId: '',
          roomNumber: '',
          bedNumber: '',
          checkInAt: new Date().toISOString().slice(0, 10),
          monthlyAllowance: '',
          currency: 'AED',
          status: 'ACTIVE',
        });
        load();
      } else {
        toast.error(payload.error?.details?.error ?? payload.error?.message ?? 'Failed check-in');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const handleEditSubmit = async () => {
    if (!editItem) return;
    const allowanceVal = form.monthlyAllowance ? Number(form.monthlyAllowance) : undefined;
    if (allowanceVal !== undefined && (isNaN(allowanceVal) || allowanceVal < 0)) {
      toast.error('Allowance must be a positive number');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editItem.id,
          ...form,
          monthlyAllowance: allowanceVal,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Assignment updated successfully');
        setEditItem(null);
        load();
      } else {
        toast.error(payload.error?.message ?? 'Failed to update assignment');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const openEdit = (asn: Assignment) => {
    setEditItem(asn);
    setForm({
      siteId: asn.siteId,
      employeeId: asn.employeeId,
      roomNumber: asn.roomNumber ?? '',
      bedNumber: asn.bedNumber ?? '',
      checkInAt: asn.checkInAt.slice(0, 10),
      monthlyAllowance: asn.monthlyAllowance != null ? String(asn.monthlyAllowance) : '',
      currency: asn.currency,
      status: asn.status,
    });
  };

  const triggerConfirmAction = (
    type: 'checkout' | 'archive' | 'restore' | 'delete' | 'hard-delete',
    asn: Assignment
  ) => {
    const title = {
      checkout: 'Check Out Employee',
      archive: 'Archive Allocation Record',
      restore: 'Restore Allocation Record',
      delete: 'Move Record to Trash',
      'hard-delete': 'Permanently Delete Record',
    }[type];

    const desc = {
      checkout: `Are you sure you want to check out Employee "${asn.employeeName ?? asn.employeeId}" from Site "${asn.siteName ?? asn.siteId}"? This releases capacity immediately.`,
      archive: `Are you sure you want to archive this allocation record? This changes its status to ARCHIVED.`,
      restore: `Are you sure you want to restore this record back to ACTIVE status?`,
      delete: `Are you sure you want to move this record to trash? This can be recovered from the Archived view.`,
      'hard-delete': `WARNING: Are you sure you want to permanently delete this allocation record? This action CANNOT be undone and will purge all database records.`,
    }[type];

    setConfirmAction({ type, id: asn.id, title, desc });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    try {
      const payload: any = { id };
      if (type === 'checkout') {
        payload.action = 'check-out';
        payload.checkOutAt = new Date().toISOString();
      } else {
        payload.action = type;
      }

      const res = await fetch('/api/v1/accommodation-compliance/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Action processed successfully`);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to execute action');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error executing action');
    }
  };

  const columns: Array<Column<Assignment>> = [
    { key: 'siteName' as any, label: 'Site Name', sortable: true },
    { key: 'employeeName' as any, label: 'Employee Name', sortable: true },
    { key: 'roomNumber', label: 'Room', sortable: true },
    { key: 'bedNumber', label: 'Bed', sortable: true },
    {
      key: 'checkInAt',
      label: 'Check-In',
      sortable: true,
      render: (asn) => asn.checkInAt.slice(0, 10),
    },
    {
      key: 'checkOutAt',
      label: 'Check-Out',
      sortable: true,
      render: (asn) => (asn.checkOutAt ? asn.checkOutAt.slice(0, 10) : '—'),
    },
    {
      key: 'monthlyAllowance',
      label: 'Allowance',
      render: (asn) =>
        asn.monthlyAllowance != null ? `${asn.monthlyAllowance} ${asn.currency}` : '—',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (asn) => {
        const colors: any = {
          ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-100',
          CHECKED_OUT: 'bg-slate-100 text-slate-800 border-slate-200',
          ARCHIVED: 'bg-slate-100 text-slate-800 border-slate-200',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${colors[asn.status] ?? ''}`}
          >
            {asn.status}
          </span>
        );
      },
    },
  ];

  const filterFields: FilterField[] = [
    { name: 'siteId', label: 'Site ID', type: 'select', options: [] }, // We will load dynamically or search
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active (Occupying)' },
        { value: 'CHECKED_OUT', label: 'Checked Out' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
  ];

  const detailFields = [
    { key: 'siteName', label: 'Site Name' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'roomNumber', label: 'Room Number' },
    { key: 'bedNumber', label: 'Bed Number' },
    { key: 'checkInAt', label: 'Check-In Date', render: (v: any) => v.slice(0, 10) },
    { key: 'checkOutAt', label: 'Check-Out Date', render: (v: any) => (v ? v.slice(0, 10) : '—') },
    {
      key: 'monthlyAllowance',
      label: 'Housing Allowance',
      render: (v: any, row?: any) =>
        v != null ? `${v} ${data.find((d) => d.id === row?.id)?.currency ?? 'AED'}` : '—',
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
              EPIC-23 · S03 / S04 / S10
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Assignment Register
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({
                siteId: '',
                employeeId: '',
                roomNumber: '',
                bedNumber: '',
                checkInAt: new Date().toISOString().slice(0, 10),
                monthlyAllowance: '',
                currency: 'AED',
                status: 'ACTIVE',
              });
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
            Check In Employee
          </button>
        </header>

        {/* Filter Toolbar */}
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
          placeholder="Search by Employee ID, room, or bed number..."
        />

        {/* Table */}
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
          actions={(asn) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewItem(asn)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={asn.isDeleted}
                onClick={() => openEdit(asn)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors disabled:opacity-40"
                title="Edit Assignment"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {asn.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('checkout', asn)}
                  className="p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                  title="Check Out Employee"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
              {asn.status !== 'ARCHIVED' && !asn.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('archive', asn)}
                  className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Archive Assignment"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              {asn.status === 'ARCHIVED' && !asn.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('restore', asn)}
                  className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Restore Assignment"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {!asn.isDeleted ? (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('delete', asn)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
                  title="Trash Record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('hard-delete', asn)}
                  className="p-1.5 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition-colors"
                  title="Permanently Delete Record"
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
          entity="assignments"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={load}
        />

        {/* Create Assignment Modal */}
        <FormModal
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Employee Check-In Allocation"
          onSubmit={handleCreateSubmit}
          submitText="Assign Bed"
        >
          <AssignmentFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
            sites={sites}
            employees={employees}
            employeeLoading={employeeLoading}
            onSearchEmployees={handleSearchEmployees}
            suggestedRooms={suggestedRooms}
            suggestedBeds={suggestedBeds}
            data={data}
          />
        </FormModal>

        {/* Edit Assignment Modal */}
        <FormModal
          open={editItem !== null}
          onOpenChange={(open) => !open && setEditItem(null)}
          title={`Edit Assignment: Employee ${editItem?.employeeName ?? editItem?.employeeId}`}
          onSubmit={handleEditSubmit}
          submitText="Save Changes"
        >
          <AssignmentFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
            sites={sites}
            employees={employees}
            employeeLoading={employeeLoading}
            onSearchEmployees={handleSearchEmployees}
            suggestedRooms={suggestedRooms}
            suggestedBeds={suggestedBeds}
            data={data}
          />
        </FormModal>

        {/* Read-Only Details View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Accommodation Assignment Details"
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
              : confirmAction?.type === 'delete' || confirmAction?.type === 'checkout'
                ? 'warning'
                : 'info'
          }
          onConfirm={handleConfirmAction}
        />
      </div>
    </main>
  );
}

// Subcomponent: Form Fields for assignments
function AssignmentFormFields({
  form,
  onChange,
  sites,
  employees,
  employeeLoading,
  onSearchEmployees,
  suggestedRooms,
  suggestedBeds,
  data,
}: {
  form: any;
  onChange: (fields: Partial<typeof form>) => void;
  sites: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; firstName: string; lastName: string; employeeCode: string }>;
  employeeLoading: boolean;
  onSearchEmployees: (query: string) => void;
  suggestedRooms: string[];
  suggestedBeds: string[];
  data: Assignment[];
}) {
  // Build site options. Prepend current site if missing.
  const siteOptions = sites.map((s) => ({ value: s.id, label: s.name }));
  if (form.siteId && !siteOptions.some((o) => o.value === form.siteId)) {
    const matched = data.find((item) => item.siteId === form.siteId);
    siteOptions.push({
      value: form.siteId,
      label: matched?.siteName ?? 'Current Site',
    });
  }

  // Build employee options. Prepend current employee if missing.
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
  }));
  if (form.employeeId && !employeeOptions.some((o) => o.value === form.employeeId)) {
    const matched = data.find((item) => item.employeeId === form.employeeId);
    employeeOptions.push({
      value: form.employeeId,
      label: matched?.employeeName ?? form.employeeId,
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SearchableSelect
        label="Site *"
        value={form.siteId}
        placeholder="Search site by name..."
        onChange={(val) => onChange({ siteId: val })}
        options={siteOptions}
      />

      <SearchableSelect
        label="Employee *"
        value={form.employeeId}
        placeholder="Type name or code to search..."
        onChange={(val) => onChange({ employeeId: val })}
        onSearch={onSearchEmployees}
        options={employeeOptions}
        loading={employeeLoading}
      />

      <SuggestionInput
        label="Room Number"
        value={form.roomNumber}
        placeholder="e.g. 302-A"
        onChange={(val) => onChange({ roomNumber: val })}
        suggestions={suggestedRooms}
      />

      <SuggestionInput
        label="Bed Number"
        value={form.bedNumber}
        placeholder="e.g. B-1"
        onChange={(val) => onChange({ bedNumber: val })}
        suggestions={suggestedBeds}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Check-In Date *
        </label>
        <input
          type="date"
          value={form.checkInAt}
          onChange={(e) => onChange({ checkInAt: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Housing Allowance
        </label>
        <input
          type="number"
          value={form.monthlyAllowance}
          onChange={(e) => onChange({ monthlyAllowance: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
          placeholder="Housing budget value..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Currency
        </label>
        <input
          type="text"
          value={form.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
        <select
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-455"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="CHECKED_OUT">CHECKED OUT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
    </div>
  );
}

// Subcomponent: Reusable Searchable Dropdown Select
function SearchableSelect({
  label,
  value,
  placeholder,
  onChange,
  onSearch,
  options,
  loading = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  onSearch?: (query: string) => void;
  options: Array<{ value: string; label: string }>;
  loading?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Sync initial query with current value label if matched
  React.useEffect(() => {
    const selected = options.find((o) => o.value === value);
    if (selected) {
      setSearchQuery(selected.label);
    } else if (!value) {
      setSearchQuery('');
    }
  }, [value, options]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selected = options.find((o) => o.value === value);
        setSearchQuery(selected ? selected.label : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const filteredOptions = onSearch
    ? options
    : options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onSearch) {
              onSearch(e.target.value);
            }
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-455 transition-all focus:ring-1 focus:ring-slate-400"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          </div>
        )}
      </div>

      {isOpen && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {filteredOptions.length === 0 ? (
            <li className="px-3.5 py-2 text-xs text-slate-400">No results found</li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setSearchQuery(option.label);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-3.5 py-2 text-sm hover:bg-slate-50 ${
                  option.value === value
                    ? 'bg-slate-50 font-semibold text-slate-900'
                    : 'text-slate-700'
                }`}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// Subcomponent: Reusable input field with suggestion list dropdown
function SuggestionInput({
  label,
  value,
  placeholder,
  onChange,
  suggestions,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  suggestions: string[];
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-855 shadow-sm outline-none focus:border-slate-455 transition-all focus:ring-1 focus:ring-slate-400"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((s) => (
            <li
              key={s}
              onClick={() => {
                onChange(s);
                setIsOpen(false);
              }}
              className="cursor-pointer px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

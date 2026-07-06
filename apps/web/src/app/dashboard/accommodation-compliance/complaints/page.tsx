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
import {
  Plus,
  Eye,
  Edit2,
  UserCheck,
  CheckCircle2,
  Archive,
  RotateCcw,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { isComplaintSlaBreached } from '@/lib/services/accommodation-compliance/utils';

interface Complaint {
  id: string;
  siteId: string;
  employeeId: string | null;
  siteName?: string;
  employeeName?: string | null;
  category: string;
  severity: string;
  subject: string;
  description: string | null;
  raisedAt: string;
  assigneeId: string | null;
  slaHours: number;
  status: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  isDeleted: boolean;
}

export default function ComplaintsPage() {
  const [data, setData] = React.useState<Complaint[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Pagination & Sorting & Filter states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'raisedAt', dir: 'desc' },
  ]);
  const [filters, setFilters] = React.useState<Record<string, string>>({
    siteId: '',
    status: 'OPEN',
    severity: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Action states
  const [viewItem, setViewItem] = React.useState<Complaint | null>(null);
  const [editItem, setEditItem] = React.useState<Complaint | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  // Custom panel inputs (Assign & Resolve)
  const [assigneeInput, setAssigneeInput] = React.useState('');
  const [notesInput, setNotesInput] = React.useState('');
  const [assignTarget, setAssignTarget] = React.useState<Complaint | null>(null);
  const [resolveTarget, setResolveTarget] = React.useState<Complaint | null>(null);

  // Confirm dialogs
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'archive' | 'restore' | 'delete' | 'hard-delete';
    id: string;
    title: string;
    desc: string;
  } | null>(null);

  // Form inputs state
  const [form, setForm] = React.useState({
    siteId: '',
    employeeId: '',
    category: 'HYGIENE',
    severity: 'MEDIUM',
    subject: '',
    description: '',
    slaHours: '48',
    status: 'OPEN',
  });

  const [sites, setSites] = React.useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = React.useState<
    Array<{ id: string; firstName: string; lastName: string; employeeCode: string }>
  >([]);
  const [employeeLoading, setEmployeeLoading] = React.useState(false);

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

      const res = await fetch(`/api/v1/accommodation-compliance/complaints?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load complaints');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading complaints');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sort, filters, showDeleted]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ siteId: '', status: 'OPEN', severity: '' });
    setShowDeleted(false);
    setSort([{ field: 'raisedAt', dir: 'desc' }]);
    setPage(1);
  };

  const handleCreateSubmit = async () => {
    if (!form.siteId.trim() || !form.subject.trim()) {
      toast.error('Site ID and Subject are required');
      throw new Error();
    }
    const sla = Number(form.slaHours);
    if (isNaN(sla) || sla < 1) {
      toast.error('SLA Hours must be at least 1 hour');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise',
          ...form,
          slaHours: sla,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Complaint raised successfully');
        setShowCreate(false);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to raise complaint');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const handleEditSubmit = async () => {
    if (!editItem) return;
    if (!form.siteId.trim() || !form.subject.trim()) {
      toast.error('Site ID and Subject are required');
      throw new Error();
    }
    const sla = Number(form.slaHours);
    if (isNaN(sla) || sla < 1) {
      toast.error('SLA Hours must be at least 1 hour');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editItem.id,
          ...form,
          slaHours: sla,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Complaint updated successfully');
        setEditItem(null);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to update complaint');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const openEdit = (c: Complaint) => {
    setEditItem(c);
    setForm({
      siteId: c.siteId,
      employeeId: c.employeeId ?? '',
      category: c.category,
      severity: c.severity,
      subject: c.subject,
      description: c.description ?? '',
      slaHours: String(c.slaHours),
      status: c.status,
    });
  };

  const handleAssignSubmit = async () => {
    if (!assignTarget) return;
    const assignee = assigneeInput.trim();
    if (!assignee) {
      toast.error('Assignee ID is required');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', id: assignTarget.id, assigneeId: assignee }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Complaint assigned successfully');
        setAssignTarget(null);
        setAssigneeInput('');
        load();
      } else {
        toast.error(payload.error?.message ?? 'Failed to assign complaint');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolveTarget) return;
    const notes = notesInput.trim();

    try {
      const res = await fetch('/api/v1/accommodation-compliance/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', id: resolveTarget.id, notes }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Complaint resolved successfully');
        setResolveTarget(null);
        setNotesInput('');
        load();
      } else {
        toast.error(payload.error?.message ?? 'Failed to resolve complaint');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const triggerConfirmAction = (
    type: 'archive' | 'restore' | 'delete' | 'hard-delete',
    c: Complaint
  ) => {
    const title = {
      archive: 'Archive Complaint Record',
      restore: 'Restore Complaint Record',
      delete: 'Trash Complaint Record',
      'hard-delete': 'Permanently Delete Complaint',
    }[type];

    const desc = {
      archive: `Are you sure you want to archive this complaint? This changes its status to ARCHIVED.`,
      restore: `Are you sure you want to restore this complaint?`,
      delete: `Are you sure you want to trash this complaint? It can be recovered from the Archived view.`,
      'hard-delete': `WARNING: Are you sure you want to permanently delete this complaint? This action CANNOT be undone and will purge all database records.`,
    }[type];

    setConfirmAction({ type, id: c.id, title, desc });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    try {
      const res = await fetch('/api/v1/accommodation-compliance/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type, id }),
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

  const columns: Array<Column<Complaint>> = [
    { key: 'siteName' as any, label: 'Site Name', sortable: true },
    { key: 'employeeName' as any, label: 'Employee Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (c) => {
        const colors: any = {
          LOW: 'bg-slate-100 text-slate-700',
          MEDIUM: 'bg-amber-100 text-amber-800',
          HIGH: 'bg-rose-100 text-rose-800',
          CRITICAL: 'bg-rose-200 text-rose-900 border border-rose-300 font-extrabold',
        };
        return (
          <span
            className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold ${colors[c.severity] ?? ''}`}
          >
            {c.severity}
          </span>
        );
      },
    },
    { key: 'subject', label: 'Subject', sortable: true },
    {
      key: 'raisedAt',
      label: 'Raised Date',
      sortable: true,
      render: (c) => {
        const breached = isComplaintSlaBreached({
          raisedAt: new Date(c.raisedAt),
          slaHours: c.slaHours,
          status: c.status,
        });
        return (
          <span className={breached ? 'font-bold text-rose-600' : ''}>
            {c.raisedAt.slice(0, 10)} {breached && ' [SLA BREACH ⚠]'}
          </span>
        );
      },
    },
    { key: 'assigneeId', label: 'Assignee', render: (c) => c.assigneeId ?? '—' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (c) => {
        const colors: any = {
          OPEN: 'bg-rose-50 text-rose-800 border border-rose-100',
          IN_PROGRESS: 'bg-amber-50 text-amber-800 border border-amber-100',
          RESOLVED: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
          ARCHIVED: 'bg-slate-100 text-slate-80 border border-slate-200',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[c.status] ?? ''}`}
          >
            {c.status}
          </span>
        );
      },
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'HYGIENE', label: 'Hygiene' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'OVERCROWDING', label: 'Overcrowding' },
        { value: 'KITCHEN', label: 'Kitchen' },
        { value: 'TRANSPORT', label: 'Transport' },
        { value: 'SECURITY', label: 'Security' },
        { value: 'NOISE', label: 'Noise' },
        { value: 'BEHAVIOUR', label: 'Behaviour' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'CRITICAL', label: 'Critical' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'OPEN', label: 'Open' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'RESOLVED', label: 'Resolved' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
  ];

  const detailFields = [
    { key: 'siteName', label: 'Site Name' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'category', label: 'Category' },
    { key: 'severity', label: 'Severity' },
    { key: 'subject', label: 'Subject' },
    { key: 'description', label: 'Description' },
    { key: 'raisedAt', label: 'Raised Date', render: (v: any) => v.slice(0, 10) },
    { key: 'slaHours', label: 'SLA Limit (Hours)', render: (v: any) => `${v} hours` },
    { key: 'assigneeId', label: 'Assignee ID' },
    { key: 'status', label: 'Status' },
    {
      key: 'resolvedAt',
      label: 'Resolved Date',
      render: (v: any) => (v ? String(v).slice(0, 10) : '—'),
    },
    { key: 'resolvedBy', label: 'Resolved By' },
    { key: 'resolutionNotes', label: 'Resolution Notes' },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-23 · S15
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Complaint Register
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({
                siteId: '',
                employeeId: '',
                category: 'HYGIENE',
                severity: 'MEDIUM',
                subject: '',
                description: '',
                slaHours: '48',
                status: 'OPEN',
              });
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
            Raise Complaint
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
          placeholder="Search by subject, employee ID or description..."
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
          actions={(c) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewItem(c)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={c.isDeleted}
                onClick={() => openEdit(c)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors disabled:opacity-40"
                title="Edit Details"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {c.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={() => {
                    setAssignTarget(c);
                    setAssigneeInput(c.assigneeId ?? '');
                  }}
                  className="p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                  title="Assign Complaint"
                >
                  <UserCheck className="h-4 w-4" />
                </button>
              )}
              {c.status !== 'RESOLVED' && c.status !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => {
                    setResolveTarget(c);
                    setNotesInput(c.resolutionNotes ?? '');
                  }}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                  title="Resolve Complaint"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              {c.status !== 'ARCHIVED' && !c.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('archive', c)}
                  className="p-1.5 text-slate-555 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Archive Record"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              {c.status === 'ARCHIVED' && !c.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('restore', c)}
                  className="p-1.5 text-slate-555 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Restore Record"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {!c.isDeleted ? (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('delete', c)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-705 rounded-lg transition-colors"
                  title="Trash Record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('hard-delete', c)}
                  className="p-1.5 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition-colors"
                  title="Permanently Delete Complaint"
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
          entity="complaints"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={load}
        />

        {/* Create Complaint Modal */}
        <FormModal
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Raise Accommodation Complaint"
          onSubmit={handleCreateSubmit}
          submitText="Submit Complaint"
        >
          <ComplaintFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
            sites={sites}
            employees={employees}
            employeeLoading={employeeLoading}
            onSearchEmployees={handleSearchEmployees}
            data={data}
          />
        </FormModal>

        {/* Edit Details Modal */}
        <FormModal
          open={editItem !== null}
          onOpenChange={(open) => !open && setEditItem(null)}
          title={`Edit Complaint: ${editItem?.subject}`}
          onSubmit={handleEditSubmit}
          submitText="Save Changes"
        >
          <ComplaintFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
            sites={sites}
            employees={employees}
            employeeLoading={employeeLoading}
            onSearchEmployees={handleSearchEmployees}
            data={data}
          />
        </FormModal>

        {/* Assign Complaint Modal */}
        <FormModal
          open={assignTarget !== null}
          onOpenChange={(open) => !open && setAssignTarget(null)}
          title={`Assign Complaint: ${assignTarget?.subject}`}
          onSubmit={handleAssignSubmit}
          submitText="Assign Investigator"
        >
          {(() => {
            const assigneeOptions = employees.map((e) => ({
              value: e.id,
              label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
            }));
            if (assigneeInput && !assigneeOptions.some((o) => o.value === assigneeInput)) {
              assigneeOptions.push({
                value: assigneeInput,
                label: assigneeInput,
              });
            }
            return (
              <SearchableSelect
                label="Assignee ID (User GUID / Name) *"
                value={assigneeInput}
                placeholder="Type name or code to search assignee..."
                onChange={(val) => setAssigneeInput(val)}
                onSearch={handleSearchEmployees}
                options={assigneeOptions}
                loading={employeeLoading}
              />
            );
          })()}
        </FormModal>

        {/* Resolve Complaint Modal */}
        <FormModal
          open={resolveTarget !== null}
          onOpenChange={(open) => !open && setResolveTarget(null)}
          title={`Resolve Complaint: ${resolveTarget?.subject}`}
          onSubmit={handleResolveSubmit}
          submitText="Close & Resolve"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resolution Notes
            </label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400 min-h-[80px]"
              placeholder="Detail actions taken, repairs made, or closure notes..."
            />
          </div>
        </FormModal>

        {/* Read-Only Details View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Complaint Details"
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

// Subcomponent: Form fields for complaints
function ComplaintFormFields({
  form,
  onChange,
  sites,
  employees,
  employeeLoading,
  onSearchEmployees,
  data,
}: {
  form: any;
  onChange: (fields: Partial<typeof form>) => void;
  sites: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; firstName: string; lastName: string; employeeCode: string }>;
  employeeLoading: boolean;
  onSearchEmployees: (query: string) => void;
  data: any[];
}) {
  // Build site options
  const siteOptions = sites.map((s) => ({ value: s.id, label: s.name }));
  if (form.siteId && !siteOptions.some((o) => o.value === form.siteId)) {
    const matched = data.find((item) => item.siteId === form.siteId);
    siteOptions.push({
      value: form.siteId,
      label: matched?.siteName ?? 'Current Site',
    });
  }

  // Build employee options for reporter
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
        label="Employee ID (Reporter)"
        value={form.employeeId}
        placeholder="Type name or code to search reporter..."
        onChange={(val) => onChange({ employeeId: val })}
        onSearch={onSearchEmployees}
        options={employeeOptions}
        loading={employeeLoading}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
        >
          {[
            'HYGIENE',
            'MAINTENANCE',
            'OVERCROWDING',
            'KITCHEN',
            'TRANSPORT',
            'SECURITY',
            'NOISE',
            'BEHAVIOUR',
            'OTHER',
          ].map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Severity
        </label>
        <select
          value={form.severity}
          onChange={(e) => onChange({ severity: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
        >
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Subject Title *
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400"
          placeholder="e.g. AC unit is leaking water"
        />
      </div>

      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-slate-400 min-h-[60px]"
          placeholder="Full details of the complaint report..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          SLA Limit (Hours) *
        </label>
        <input
          type="number"
          value={form.slaHours}
          onChange={(e) => onChange({ slaHours: e.target.value })}
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
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
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

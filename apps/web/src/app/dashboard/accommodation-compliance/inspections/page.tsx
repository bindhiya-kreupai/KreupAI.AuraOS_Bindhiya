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
  CheckSquare,
  Archive,
  RotateCcw,
  Trash2,
  ShieldAlert,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

interface Inspection {
  id: string;
  siteId: string;
  siteName?: string;
  inspectionDate: string;
  inspectorId: string | null;
  category: string;
  score: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  findingsJson: Array<{ finding: string; severity: 'CRITICAL' | 'MAJOR' | 'MINOR' }>;
  status: string;
  closedAt: string | null;
  isDeleted: boolean;
}

export default function InspectionsPage() {
  const [data, setData] = React.useState<Inspection[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Pagination & Sorting & Filter states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'inspectionDate', dir: 'desc' },
  ]);
  const [filters, setFilters] = React.useState<Record<string, string>>({
    siteId: '',
    status: '',
    category: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Action states
  const [viewItem, setViewItem] = React.useState<Inspection | null>(null);
  const [editItem, setEditItem] = React.useState<Inspection | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  // Confirm Actions states
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'close' | 'archive' | 'restore' | 'delete' | 'hard-delete';
    id: string;
    title: string;
    desc: string;
  } | null>(null);

  // Form inputs state
  const [form, setForm] = React.useState({
    siteId: '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    inspectorId: '',
    category: 'HYGIENE',
    score: '100',
    criticalFindings: '0',
    majorFindings: '0',
    minorFindings: '0',
    status: 'OPEN',
  });
  const [formFindings, setFormFindings] = React.useState<
    Array<{ finding: string; severity: 'CRITICAL' | 'MAJOR' | 'MINOR' }>
  >([]);

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

      const res = await fetch(`/api/v1/accommodation-compliance/inspections?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load inspections');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading inspections');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sort, filters, showDeleted]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ siteId: '', status: '', category: '' });
    setShowDeleted(false);
    setSort([{ field: 'inspectionDate', dir: 'desc' }]);
    setPage(1);
  };

  const handleCreateSubmit = async () => {
    if (!form.siteId.trim()) {
      toast.error('Site ID is required');
      throw new Error();
    }
    const scoreVal = Number(form.score);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      toast.error('Score must be between 0 and 100');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record',
          ...form,
          score: scoreVal,
          criticalFindings: Number(form.criticalFindings),
          majorFindings: Number(form.majorFindings),
          minorFindings: Number(form.minorFindings),
          findings: formFindings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Inspection recorded successfully');
        setShowCreate(false);
        setFormFindings([]);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to record inspection');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const handleEditSubmit = async () => {
    if (!editItem) return;
    const scoreVal = Number(form.score);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      toast.error('Score must be between 0 and 100');
      throw new Error();
    }

    try {
      const res = await fetch('/api/v1/accommodation-compliance/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editItem.id,
          ...form,
          score: scoreVal,
          criticalFindings: Number(form.criticalFindings),
          majorFindings: Number(form.majorFindings),
          minorFindings: Number(form.minorFindings),
          findings: formFindings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Inspection updated successfully');
        setEditItem(null);
        setFormFindings([]);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to update inspection');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const openEdit = (insp: Inspection) => {
    setEditItem(insp);
    setForm({
      siteId: insp.siteId,
      inspectionDate: insp.inspectionDate.slice(0, 10),
      inspectorId: insp.inspectorId ?? '',
      category: insp.category,
      score: String(insp.score),
      criticalFindings: String(insp.criticalFindings),
      majorFindings: String(insp.majorFindings),
      minorFindings: String(insp.minorFindings),
      status: insp.status,
    });
    setFormFindings(insp.findingsJson ?? []);
  };

  const triggerConfirmAction = (
    type: 'close' | 'archive' | 'restore' | 'delete' | 'hard-delete',
    insp: Inspection
  ) => {
    const title = {
      close: 'Close Inspection Findings',
      archive: 'Archive Audit Record',
      restore: 'Restore Audit Record',
      delete: 'Trash Audit Record',
      'hard-delete': 'Permanently Delete Audit',
    }[type];

    const desc = {
      close: `Are you sure you want to mark this inspection findings as resolved and CLOSE this audit?`,
      archive: `Are you sure you want to archive this audit? This changes its status to ARCHIVED.`,
      restore: `Are you sure you want to restore this audit back to OPEN status?`,
      delete: `Are you sure you want to trash this audit? It can be recovered from the Archived view.`,
      'hard-delete': `WARNING: Are you sure you want to permanently delete this audit record? This action CANNOT be undone and will purge all database records.`,
    }[type];

    setConfirmAction({ type, id: insp.id, title, desc });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    try {
      const res = await fetch('/api/v1/accommodation-compliance/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type, id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Inspection action processed successfully`);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to execute inspection action');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error executing inspection action');
    }
  };

  const columns: Array<Column<Inspection>> = [
    { key: 'siteName' as any, label: 'Site Name', sortable: true },
    {
      key: 'inspectionDate',
      label: 'Date',
      sortable: true,
      render: (insp) => insp.inspectionDate.slice(0, 10),
    },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'score', label: 'Score', sortable: true, render: (insp) => `${insp.score}/100` },
    {
      key: 'criticalFindings',
      label: 'Findings (C / Ma / Mi)',
      render: (insp) => (
        <span className={insp.criticalFindings > 0 ? 'text-rose-600 font-bold' : ''}>
          {insp.criticalFindings} / {insp.majorFindings} / {insp.minorFindings}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (insp) => {
        const colors: any = {
          OPEN: 'bg-amber-50 text-amber-800 border-amber-100',
          CLOSED: 'bg-emerald-50 text-emerald-800 border-emerald-100',
          ARCHIVED: 'bg-slate-100 text-slate-800 border-slate-200',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${colors[insp.status] ?? ''}`}
          >
            {insp.status}
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
        { value: 'FIRE_SAFETY', label: 'Fire Safety' },
        { value: 'ELECTRICAL', label: 'Electrical' },
        { value: 'KITCHEN', label: 'Kitchen' },
        { value: 'MEDICAL', label: 'Medical' },
        { value: 'WELFARE', label: 'Welfare' },
        { value: 'SECURITY', label: 'Security' },
        { value: 'GENERAL', label: 'General' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'OPEN', label: 'Open Findings' },
        { value: 'CLOSED', label: 'Closed' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
  ];

  const detailFields = [
    { key: 'siteName', label: 'Site Name' },
    { key: 'inspectionDate', label: 'Inspection Date', render: (v: any) => v.slice(0, 10) },
    { key: 'inspectorId', label: 'Inspector ID' },
    { key: 'category', label: 'Category' },
    { key: 'score', label: 'Score', render: (v: any) => `${v}/100` },
    { key: 'criticalFindings', label: 'Critical Findings' },
    { key: 'majorFindings', label: 'Major Findings' },
    { key: 'minorFindings', label: 'Minor Findings' },
    { key: 'status', label: 'Status' },
    { key: 'closedAt', label: 'Closed At', render: (v: any) => (v ? String(v).slice(0, 10) : '—') },
  ];

  const handleAddFinding = () => {
    setFormFindings([...formFindings, { finding: '', severity: 'MINOR' }]);
  };

  const handleRemoveFinding = (idx: number) => {
    setFormFindings(formFindings.filter((_, i) => i !== idx));
  };

  const handleFindingChange = (idx: number, field: string, val: string) => {
    setFormFindings(
      formFindings.map((f, i) => {
        if (i === idx) {
          return { ...f, [field]: val };
        }
        return f;
      })
    );
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-23 · S05–S09 / S12
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Inspection Register
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({
                siteId: '',
                inspectionDate: new Date().toISOString().slice(0, 10),
                inspectorId: '',
                category: 'HYGIENE',
                score: '100',
                criticalFindings: '0',
                majorFindings: '0',
                minorFindings: '0',
                status: 'OPEN',
              });
              setFormFindings([]);
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
            Record Inspection
          </button>
        </header>

        {/* Filters */}
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
          placeholder="Search by category or inspector ID..."
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
          actions={(insp) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewItem(insp)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={insp.isDeleted}
                onClick={() => openEdit(insp)}
                className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors disabled:opacity-40"
                title="Edit Inspection"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {insp.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('close', insp)}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                  title="Close Audit (Resolve Findings)"
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
              )}
              {insp.status !== 'ARCHIVED' && !insp.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('archive', insp)}
                  className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Archive Audit"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              {insp.status === 'ARCHIVED' && !insp.isDeleted && (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('restore', insp)}
                  className="p-1.5 text-slate-550 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Restore Audit"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {!insp.isDeleted ? (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('delete', insp)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
                  title="Trash Record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerConfirmAction('hard-delete', insp)}
                  className="p-1.5 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition-colors"
                  title="Permanently Delete Audit"
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
          entity="inspections"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={load}
        />

        {/* Create Form Modal */}
        <FormModal
          open={showCreate}
          onOpenChange={setShowCreate}
          title="Record Inspection Audit"
          onSubmit={handleCreateSubmit}
          submitText="Record Findings"
        >
          <InspectionFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
            findings={formFindings}
            onAddFinding={handleAddFinding}
            onRemoveFinding={handleRemoveFinding}
            onFindingChange={handleFindingChange}
            sites={sites}
            employees={employees}
            employeeLoading={employeeLoading}
            onSearchEmployees={handleSearchEmployees}
            data={data}
          />
        </FormModal>

        {/* Edit Form Modal */}
        <FormModal
          open={editItem !== null}
          onOpenChange={(open) => !open && setEditItem(null)}
          title={`Edit Inspection: Audit for ${editItem?.siteName ?? editItem?.siteId}`}
          onSubmit={handleEditSubmit}
          submitText="Save Changes"
        >
          <InspectionFormFields
            form={form}
            onChange={(fields) => setForm((f) => ({ ...f, ...fields }))}
            findings={formFindings}
            onAddFinding={handleAddFinding}
            onRemoveFinding={handleRemoveFinding}
            onFindingChange={handleFindingChange}
            sites={sites}
            employees={employees}
            employeeLoading={employeeLoading}
            onSearchEmployees={handleSearchEmployees}
            data={data}
          />
        </FormModal>

        {/* Read-Only Details View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Audit & Findings Details"
          data={viewItem}
          fields={detailFields}
          renderExtra={(data) => {
            const list = data.findingsJson ?? [];
            return (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Detailed Findings List
                </h4>
                {list.length === 0 ? (
                  <p className="text-sm text-slate-400">No individual findings recorded.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                    {list.map((item: any, idx: number) => {
                      const colorMap: any = {
                        CRITICAL: 'text-rose-700 bg-rose-50 border-rose-100',
                        MAJOR: 'text-amber-700 bg-amber-50 border-amber-100',
                        MINOR: 'text-slate-700 bg-slate-100 border-slate-200',
                      };
                      return (
                        <div key={idx} className="flex items-center justify-between p-3.5 gap-4">
                          <span className="text-sm font-medium text-slate-700">
                            {item.finding || '—'}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${colorMap[item.severity] ?? ''}`}
                          >
                            {item.severity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Confirm Dialog */}
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
                : confirmAction?.type === 'close'
                  ? 'success'
                  : 'info'
          }
          onConfirm={handleConfirmAction}
        />
      </div>
    </main>
  );
}

// Subcomponent: Form fields for inspections
function InspectionFormFields({
  form,
  onChange,
  findings,
  onAddFinding,
  onRemoveFinding,
  onFindingChange,
  sites,
  employees,
  employeeLoading,
  onSearchEmployees,
  data,
}: {
  form: any;
  onChange: (fields: Partial<typeof form>) => void;
  findings: Array<{ finding: string; severity: 'CRITICAL' | 'MAJOR' | 'MINOR' }>;
  onAddFinding: () => void;
  onRemoveFinding: (idx: number) => void;
  onFindingChange: (idx: number, field: string, val: string) => void;
  sites: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; firstName: string; lastName: string; employeeCode: string }>;
  employeeLoading: boolean;
  onSearchEmployees: (query: string) => void;
  data: Inspection[];
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

  // Build employee options for inspector
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
  }));
  if (form.inspectorId && !employeeOptions.some((o) => o.value === form.inspectorId)) {
    employeeOptions.push({
      value: form.inspectorId,
      label: form.inspectorId,
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
        label="Inspector"
        value={form.inspectorId}
        placeholder="Type name or code to search..."
        onChange={(val) => onChange({ inspectorId: val })}
        onSearch={onSearchEmployees}
        options={employeeOptions}
        loading={employeeLoading}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Inspection Date *
        </label>
        <input
          type="date"
          value={form.inspectionDate}
          onChange={(e) => onChange({ inspectionDate: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-855 shadow-sm outline-none focus:border-slate-450"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
        >
          {[
            'HYGIENE',
            'FIRE_SAFETY',
            'ELECTRICAL',
            'KITCHEN',
            'MEDICAL',
            'WELFARE',
            'SECURITY',
            'GENERAL',
          ].map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Audit Score (/100) *
        </label>
        <input
          type="number"
          value={form.score}
          onChange={(e) => onChange({ score: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
        <select
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
        >
          <option value="OPEN">OPEN (Requires Resolution)</option>
          <option value="CLOSED">CLOSED (Resolved)</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:col-span-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Critical Findings
          </label>
          <input
            type="number"
            value={form.criticalFindings}
            onChange={(e) => onChange({ criticalFindings: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Major Findings
          </label>
          <input
            type="number"
            value={form.majorFindings}
            onChange={(e) => onChange({ majorFindings: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Minor Findings
          </label>
          <input
            type="number"
            value={form.minorFindings}
            onChange={(e) => onChange({ minorFindings: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-850 shadow-sm outline-none focus:border-slate-450"
          />
        </div>
      </div>

      {/* Dynamic Findings List Input Builder */}
      <div className="sm:col-span-2 border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Individual Findings Checklist
          </h4>
          <button
            type="button"
            onClick={onAddFinding}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Add Finding Row
          </button>
        </div>

        {findings.length === 0 ? (
          <p className="text-xs text-slate-450">
            No findings listed. Click above to add some checklist rows.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {findings.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  value={f.finding}
                  onChange={(e) => onFindingChange(idx, 'finding', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-4-percent"
                  placeholder="e.g. Evacuation plan is blocked by storage bins..."
                />
                <select
                  value={f.severity}
                  onChange={(e) => onFindingChange(idx, 'severity', e.target.value)}
                  className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-850 outline-none focus:border-slate-400"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="MAJOR">MAJOR</option>
                  <option value="MINOR">MINOR</option>
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveFinding(idx)}
                  className="text-rose-600 hover:text-rose-700 p-1 rounded transition-colors"
                >
                  <MinusCircle className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        )}
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

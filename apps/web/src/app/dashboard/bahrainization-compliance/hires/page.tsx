'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Eye,
  Trash2,
  Archive,
  RotateCcw,
  AlertOctagon,
  Link2,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';

interface HireRecord {
  id: string;
  employeeId: string;
  legalEntityId: string | null;
  hireDate: string;
  jobLevel: string | null;
  isBahraini: boolean;
  cprNumber: string | null;
  sioRegistered: boolean;
  wageEvidenceLinked: boolean;
  tamkeenSupported: boolean;
  artificialRiskScore: number;
  artificialRiskFlags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
}

/** Extended result returned by /api/employees/search */
interface EmployeeSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email?: string;
  joiningDate?: string;
  department?: { id: string; name: string; code: string } | null;
  location?: { id: string; name: string } | null;
  status?: { id: string; code: string; name: string } | null;
}

const filterFields: FilterField[] = [
  {
    name: 'isBahraini',
    label: 'Nationality',
    type: 'select',
    options: [
      { value: 'true', label: 'Bahraini' },
      { value: 'false', label: 'Non-Bahraini' },
    ],
  },
  {
    name: 'artificialRiskOnly',
    label: 'Risk Level',
    type: 'select',
    options: [{ value: 'true', label: 'Artificial Risk (Score ≥50)' }],
  },
  {
    name: 'sioRegistered',
    label: 'SIO Status',
    type: 'select',
    options: [
      { value: 'true', label: 'SIO Registered' },
      { value: 'false', label: 'Not SIO Registered' },
    ],
  },
  {
    name: 'wageEvidenceLinked',
    label: 'Wage Evidence',
    type: 'select',
    options: [
      { value: 'true', label: 'Evidence Linked' },
      { value: 'false', label: 'No Evidence' },
    ],
  },
];

const emptyForm = {
  // HR Master data — read-only, auto-populated when employee is selected
  employeeId: '',
  employeeName: '',
  employeeCode: '',
  department: '',
  designation: '', // jobProfile.name from HR
  jobLevel: '', // grade.name from HR
  company: '', // company.name from HR
  legalEntityId: '', // company.id from HR (read-only)
  joiningDate: '', // from HR
  employmentStatus: '', // status.name from HR
  // Compliance-specific fields (editable by compliance officer)
  registrationDate: new Date().toISOString().slice(0, 10),
  cprNumber: '',
  isBahraini: null as boolean | null, // derived from CPR — never user-editable
};

/** Derive isBahraini from CPR: CPR is Bahrain's national ID — only Bahraini citizens hold one */
function deriveIsBahrainiFromCpr(cprNumber: string): boolean {
  return cprNumber.trim().length > 0;
}

function getRiskLevel(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: 'Critical', cls: 'text-rose-800 bg-rose-100' };
  if (score >= 50) return { label: 'High Risk', cls: 'text-amber-800 bg-amber-100' };
  if (score > 0) return { label: 'Low Risk', cls: 'text-yellow-800 bg-yellow-100' };
  return { label: 'Clear', cls: 'text-emerald-800 bg-emerald-50' };
}

export default function HiresPage() {
  const [data, setData] = React.useState<HireRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    isBahraini: '',
    artificialRiskOnly: '',
    sioRegistered: '',
    wageEvidenceLinked: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'hireDate', dir: 'desc' },
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [viewItem, setViewItem] = React.useState<HireRecord | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const [evidenceTarget, setEvidenceTarget] = React.useState<HireRecord | null>(null);
  const [evidenceValues, setEvidenceValues] = React.useState({
    sioRegistered: false,
    wageEvidenceLinked: false,
    tamkeenSupported: false,
  });
  const [submittingEvidence, setSubmittingEvidence] = React.useState(false);

  const [detectTarget, setDetectTarget] = React.useState<HireRecord | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<HireRecord | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<HireRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<HireRecord | null>(null);

  const [empOptions, setEmpOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const empResultsRef = React.useRef<Map<string, EmployeeSearchResult>>(new Map());
  const [empLoading, setEmpLoading] = React.useState(false);
  const [hrLoading, setHrLoading] = React.useState(false);
  const [duplicateStatus, setDuplicateStatus] = React.useState<
    'idle' | 'checking' | 'clear' | 'duplicate'
  >('idle');
  const [duplicateId, setDuplicateId] = React.useState<string | null>(null);
  const [cprValidation, setCprValidation] = React.useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('isDeleted', String(showDeleted));
      if (search) params.set('search', search);
      if (filters.isBahraini) params.set('isBahraini', filters.isBahraini);
      if (filters.artificialRiskOnly === 'true') params.set('artificialRiskOnly', 'true');
      if (filters.sioRegistered) params.set('sioRegistered', filters.sioRegistered);
      if (filters.wageEvidenceLinked) params.set('wageEvidenceLinked', filters.wageEvidenceLinked);
      if (sort[0]) {
        params.set('sortField', sort[0].field);
        params.set('sortDir', sort[0].dir);
      }

      const res = await fetch(`/api/v1/bahrainization-compliance/hires?${params}`);
      const payload = (await res.json()) as {
        success: boolean;
        data: { items: HireRecord[]; total: number };
      };
      if (payload.success) {
        setData(payload.data.items ?? []);
        setTotal(payload.data.total ?? 0);
      } else {
        toast.error('Failed to load hires');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading hires');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, showDeleted, sort]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  /** Async employee search — called by SearchableSelect when the user types */
  const handleSearchEmployees = React.useCallback(async (query: string) => {
    setEmpLoading(true);
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}&size=20`);
      const payload = (await res.json()) as {
        success?: boolean;
        data?: { employees?: EmployeeSearchResult[] };
        employees?: EmployeeSearchResult[];
      };
      const results: EmployeeSearchResult[] = payload.data?.employees ?? payload.employees ?? [];
      // Store full objects in a ref so onChange can look them up by id
      results.forEach((r) => empResultsRef.current.set(r.id, r));
      setEmpOptions(
        results.map((r) => ({
          value: r.id,
          label: `${r.firstName} ${r.lastName} (${r.employeeCode})`,
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setEmpLoading(false);
    }
  }, []);

  /** Called when compliance officer selects an employee from the SearchableSelect */
  const handleSelectEmployee = React.useCallback(async (emp: EmployeeSearchResult) => {
    const autoDate = emp.joiningDate
      ? new Date(emp.joiningDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    // Set basic data from search result immediately
    setFormValues((f) => ({
      ...f,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      department: emp.department?.name ?? '',
      joiningDate: autoDate,
      employmentStatus: emp.status?.name ?? '',
      isBahraini: null,
    }));

    // Check for duplicate registration
    setDuplicateStatus('checking');
    setDuplicateId(null);
    try {
      const dupRes = await fetch(
        `/api/v1/bahrainization-compliance/hires?employeeId=${emp.id}&pageSize=1&isDeleted=false`
      );
      const dupPayload = (await dupRes.json()) as {
        success: boolean;
        data: { total: number; items: Array<{ id: string }> };
      };
      if (dupPayload.success && dupPayload.data.total > 0) {
        setDuplicateStatus('duplicate');
        setDuplicateId(dupPayload.data.items[0]?.id ?? null);
      } else {
        setDuplicateStatus('clear');
      }
    } catch {
      setDuplicateStatus('clear');
    }

    // Fetch full HR master details
    setHrLoading(true);
    try {
      const detailRes = await fetch(`/api/v1/employees/${emp.id}`);
      const detailPayload = (await detailRes.json()) as {
        success: boolean;
        data?: {
          jobProfile?: { name: string } | null;
          grade?: { name: string } | null;
          company?: { id: string; name: string } | null;
          status?: { name: string } | null;
          joiningDate?: string | null;
        };
      };
      if (detailPayload.success && detailPayload.data) {
        const d = detailPayload.data;
        setFormValues((f) => ({
          ...f,
          designation: d.jobProfile?.name ?? '',
          jobLevel: d.grade?.name ?? '',
          company: d.company?.name ?? '',
          legalEntityId: d.company?.id ?? '',
          employmentStatus: d.status?.name ?? f.employmentStatus,
          joiningDate: d.joiningDate
            ? new Date(d.joiningDate).toISOString().slice(0, 10)
            : f.joiningDate,
        }));
      }
    } catch {
      // HR detail fetch failed — continue with search data
    } finally {
      setHrLoading(false);
    }
  }, []);

  /** Called by SearchableSelect onChange — receives the selected employee id */
  const handleEmployeeSelectById = React.useCallback(
    (id: string) => {
      const emp = empResultsRef.current.get(id);
      if (emp) handleSelectEmployee(emp);
      else {
        setFormValues((f) => ({ ...f, employeeId: id }));
        // Still attempt HR detail fetch even if not in ref cache
        handleSelectEmployee({ id, firstName: '', lastName: '', employeeCode: '' });
      }
    },
    [handleSelectEmployee]
  );

  /** Re-derive isBahraini and validate CPR whenever it changes */
  const handleCprChange = (cpr: string) => {
    const digits = cpr.replace(/\D/g, '');
    let validation: { valid: boolean; message: string } | null = null;
    if (digits.length > 0) {
      if (digits.length === 9) {
        validation = { valid: true, message: 'Valid CPR format ✓' };
      } else {
        validation = { valid: false, message: `Must be exactly 9 digits (${digits.length}/9)` };
      }
    }
    setCprValidation(validation);
    setFormValues((f) => ({
      ...f,
      cprNumber: digits,
      isBahraini: digits.trim().length > 0 ? deriveIsBahrainiFromCpr(digits) : null,
    }));
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };
  const handleReset = () => {
    setSearch('');
    setFilters({
      isBahraini: '',
      artificialRiskOnly: '',
      sioRegistered: '',
      wageEvidenceLinked: '',
    });
    setShowDeleted(false);
    setPage(1);
  };

  const handleSubmitHire = async () => {
    if (!formValues.employeeId || !formValues.registrationDate) {
      toast.error('Employee and registration date are required');
      return;
    }
    if (duplicateStatus === 'duplicate') {
      toast.error('This employee is already in the compliance register');
      return;
    }
    setSubmitting(true);
    try {
      const isBahraini = formValues.cprNumber.trim().length > 0;
      const res = await fetch('/api/v1/bahrainization-compliance/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record',
          employeeId: formValues.employeeId,
          hireDate: formValues.registrationDate, // API field name stays hireDate
          jobLevel: formValues.jobLevel || undefined,
          isBahraini,
          cprNumber: formValues.cprNumber || undefined,
          legalEntityId: formValues.legalEntityId || undefined,
        }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success('Employee registered in Bahrainization compliance register');
        setFormOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to record hire');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error recording hire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkEvidence = async () => {
    if (!evidenceTarget) return;
    setSubmittingEvidence(true);
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link-evidence',
          employeeId: evidenceTarget.employeeId,
          ...evidenceValues,
        }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success('Evidence linked successfully');
        setEvidenceTarget(null);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to link evidence');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleDetectRisk = async (row: HireRecord) => {
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'detect-artificial-risk', employeeId: row.employeeId }),
      });
      const payload = (await res.json()) as {
        success: boolean;
        data: { artificialRiskScore: number };
        error?: { message?: string };
      };
      if (payload.success) {
        const score = payload.data.artificialRiskScore;
        toast.success(`Risk score computed: ${score}/100 (${getRiskLevel(score).label})`);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to evaluate risk');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success(`Record ${action}d`);
        loadData();
      } else {
        toast.error(payload.error?.message ?? `Failed to ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const employeeName = (row: HireRecord) =>
    row.employee
      ? `${row.employee.firstName} ${row.employee.lastName} (${row.employee.employeeCode})`
      : row.employeeId;

  const columns: Column<HireRecord>[] = [
    {
      key: 'employeeId',
      label: 'Employee',
      render: (r) => <span className="font-medium text-slate-900">{employeeName(r)}</span>,
    },
    {
      key: 'hireDate',
      label: 'Hire Date',
      sortable: true,
      render: (r) => <span className="font-mono text-sm">{r.hireDate?.slice(0, 10)}</span>,
    },
    {
      key: 'isBahraini',
      label: 'Bahraini',
      render: (r) =>
        r.isBahraini ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" /> Bahraini
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
            <XCircle className="h-3.5 w-3.5" /> Non-Bahraini
          </span>
        ),
    },
    {
      key: 'jobLevel',
      label: 'Job Level',
      render: (r) => <span className="text-xs text-slate-600">{r.jobLevel ?? '—'}</span>,
    },
    {
      key: 'cprNumber',
      label: 'CPR Number',
      render: (r) => <span className="font-mono text-xs">{r.cprNumber ?? '—'}</span>,
    },
    {
      key: 'sioRegistered',
      label: 'SIO',
      render: (r) =>
        r.sioRegistered ? (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-500" />
        ),
    },
    {
      key: 'wageEvidenceLinked',
      label: 'Wage',
      render: (r) =>
        r.wageEvidenceLinked ? (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-500" />
        ),
    },
    {
      key: 'artificialRiskScore',
      label: 'Risk',
      sortable: true,
      render: (r) => {
        const risk = getRiskLevel(r.artificialRiskScore);
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${risk.cls}`}
          >
            {r.artificialRiskScore}/100 {risk.label}
          </span>
        );
      },
    },
  ];

  const activeFilter = Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) as Record<
    string,
    string | boolean | undefined
  >;

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-18 · S05–S11 · Compliance Register
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              <Users className="h-7 w-7 text-slate-700" />
              Bahrainization Compliance Register
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton entity="hires" filter={activeFilter} selectedIds={selectedIds} />
            <button
              type="button"
              onClick={() => {
                setFormValues(emptyForm);
                setEmpOptions([]);
                empResultsRef.current.clear();
                setDuplicateStatus('idle');
                setDuplicateId(null);
                setCprValidation(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register Employee
            </button>
          </div>
        </header>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 leading-relaxed">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
          <span>
            <strong className="font-bold">Compliance Register — Read-Only from HR Master.</strong>{' '}
            Employee identity is sourced from the HR module and cannot be changed here.
            Bahrainization status is automatically derived from the CPR number: CPR present =
            Bahraini national, no CPR = non-Bahraini expat. This register captures compliance
            evidence only: SIO registration, wage verification, Tamkeen support, and artificial-risk
            scores.
          </span>
        </div>

        {/* Filters */}
        <FilterToolbar
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          filters={filters}
          onFilterChange={handleFilterChange}
          fields={filterFields}
          onReset={handleReset}
          showDeleted={showDeleted}
          onToggleDeleted={(v) => {
            setShowDeleted(v);
            setPage(1);
          }}
          placeholder="Search by CPR number or job level..."
        />

        {/* Table */}
        <EntityTable<HireRecord>
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
          emptyMessage="No employees registered yet. Click 'Register Employee' to add an employee from the HR master to the Bahrainization compliance register."
          actions={(row) => (
            <>
              <button
                type="button"
                title="View"
                onClick={() => setViewItem(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Link Evidence"
                onClick={() => {
                  setEvidenceTarget(row);
                  setEvidenceValues({
                    sioRegistered: row.sioRegistered,
                    wageEvidenceLinked: row.wageEvidenceLinked,
                    tamkeenSupported: row.tamkeenSupported,
                  });
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Detect Artificial Risk"
                onClick={() => setDetectTarget(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                <AlertOctagon className="h-4 w-4" />
              </button>
              {!row.isDeleted ? (
                <button
                  type="button"
                  title="Archive"
                  onClick={() => setArchiveTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <Archive className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  title="Restore"
                  onClick={() => setRestoreTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                title="Delete"
                onClick={() => setDeleteTarget(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />

        <BulkToolbar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          entity="hires"
          filter={activeFilter}
          onActionComplete={loadData}
          showArchive={!showDeleted}
          showRestore={showDeleted}
          showDelete
        />

        {/* View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(o) => {
            if (!o) setViewItem(null);
          }}
          title="Hire Record Details"
          data={viewItem as Record<string, unknown> | null}
          fields={[
            { key: 'employeeId', label: 'Employee ID' },
            {
              key: 'hireDate',
              label: 'Hire Date',
              render: (v) => (v ? String(v).slice(0, 10) : '—'),
            },
            {
              key: 'isBahraini',
              label: 'Nationality Status',
              render: (v) =>
                v
                  ? '🇧🇭 Bahraini (derived from CPR — HR master)'
                  : '🌍 Non-Bahraini (derived from CPR — HR master)',
            },
            { key: 'jobLevel', label: 'Job Level' },
            { key: 'cprNumber', label: 'CPR Number' },
            {
              key: 'sioRegistered',
              label: 'SIO Registered',
              render: (v) => (v ? '✓ Yes' : '✗ No'),
            },
            {
              key: 'wageEvidenceLinked',
              label: 'Wage Evidence',
              render: (v) => (v ? '✓ Linked' : '✗ Missing'),
            },
            {
              key: 'tamkeenSupported',
              label: 'Tamkeen Supported',
              render: (v) => (v ? '✓ Yes' : '✗ No'),
            },
            {
              key: 'artificialRiskScore',
              label: 'Risk Score',
              render: (v) => `${v}/100 — ${getRiskLevel(Number(v)).label}`,
            },
            {
              key: 'artificialRiskFlags',
              label: 'Risk Flags',
              render: (v) => (Array.isArray(v) && v.length ? (v as string[]).join(', ') : 'None'),
            },
          ]}
        />

        {/* Register Employee Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register Employee</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add an employee from the HR master to the Bahrainization compliance register
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* ── Step 1: Employee from HR Master ── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                      1
                    </span>
                    Select Employee from HR Master
                  </p>
                  <SearchableSelect
                    label="Employee *"
                    value={formValues.employeeId}
                    placeholder="Type name or employee code to search..."
                    onChange={handleEmployeeSelectById}
                    onSearch={handleSearchEmployees}
                    options={empOptions}
                    loading={empLoading}
                  />

                  {/* Duplicate check status */}
                  {duplicateStatus === 'checking' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span className="block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                      Checking compliance register...
                    </div>
                  )}
                  {duplicateStatus === 'duplicate' && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                        <AlertOctagon className="h-3.5 w-3.5" />
                        Already registered in compliance register
                      </div>
                      {duplicateId && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormOpen(false);
                            setViewItem(data.find((d) => d.id === duplicateId) ?? null);
                          }}
                          className="text-xs font-bold text-rose-700 underline hover:no-underline"
                        >
                          View Record
                        </button>
                      )}
                    </div>
                  )}
                  {duplicateStatus === 'clear' && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Employee not yet registered — eligible for compliance registration
                    </div>
                  )}

                  {/* HR Master data card */}
                  {formValues.employeeId && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          HR Master — Read Only
                        </p>
                        {hrLoading ? (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span className="block h-2.5 w-2.5 animate-spin rounded-full border border-slate-300 border-t-slate-500" />
                            Loading from HR...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle className="h-2.5 w-2.5" /> Loaded
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                        {(
                          [
                            ['Employee', formValues.employeeName],
                            ['Employee Code', formValues.employeeCode],
                            ['Department', formValues.department],
                            ['Designation', formValues.designation || (hrLoading ? '…' : '—')],
                            ['Job Level', formValues.jobLevel || (hrLoading ? '…' : '—')],
                            ['Company', formValues.company || (hrLoading ? '…' : '—')],
                            ['Joining Date', formValues.joiningDate || '—'],
                            [
                              'Employment Status',
                              formValues.employmentStatus || (hrLoading ? '…' : '—'),
                            ],
                          ] as [string, string][]
                        ).map(([label, val]) => (
                          <div key={label}>
                            <span className="text-slate-400 font-medium">{label}</span>
                            <p className="font-semibold text-slate-800 mt-0.5">{val || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Step 2: Compliance Registration ── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                      2
                    </span>
                    Compliance Registration
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Registration Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formValues.registrationDate}
                        onChange={(e) =>
                          setFormValues((f) => ({ ...f, registrationDate: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Date employee entered the compliance register
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        CPR Number
                        <span className="font-normal text-slate-400 normal-case ml-1">
                          (determines nationality)
                        </span>
                      </label>
                      <input
                        value={formValues.cprNumber}
                        onChange={(e) => handleCprChange(e.target.value)}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono focus:outline-none transition-colors ${
                          cprValidation === null
                            ? 'border-slate-200 bg-white focus:border-slate-400'
                            : cprValidation.valid
                              ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400'
                              : 'border-rose-300 bg-rose-50 focus:border-rose-400'
                        }`}
                        placeholder="9-digit Bahraini CPR"
                        maxLength={9}
                        inputMode="numeric"
                      />
                      {cprValidation && (
                        <p
                          className={`text-[10px] mt-1 font-semibold ${
                            cprValidation.valid ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {cprValidation.message}
                        </p>
                      )}
                      {!cprValidation && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          CPR present → Bahraini · No CPR → Non-Bahraini (expat)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nationality status — derived, never editable */}
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Nationality Status
                    </label>
                    {formValues.isBahraini === null ? (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        Nationality will be determined after CPR verification
                      </div>
                    ) : formValues.isBahraini ? (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="h-3.5 w-3.5" />
                        🇧🇭 Bahraini Citizen — CPR verified
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        <XCircle className="h-3.5 w-3.5" />
                        🌍 Non-Bahraini (Expat) — No CPR provided
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps workflow */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Next Steps After Registration
                  </p>
                  <ol className="space-y-1 text-xs text-slate-600">
                    {[
                      ['1', 'Register Employee', 'text-slate-900 font-bold'],
                      ['2', 'Link SIO Registration'],
                      ['3', 'Link Wage / Payroll Evidence'],
                      ['4', 'Link Tamkeen Enrollment (optional)'],
                      ['5', 'Run Artificial-Risk Assessment'],
                      ['6', 'Employee counted in Bahrainization Ratio'],
                    ].map(([n, label, cls]) => (
                      <li key={n} className={`flex items-center gap-2 ${cls ?? 'text-slate-500'}`}>
                        <span
                          className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                            n === '1' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {n}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
                <div className="text-xs text-slate-400">
                  {duplicateStatus === 'duplicate' && (
                    <span className="font-semibold text-rose-600">
                      Cannot register — employee already exists in register
                    </span>
                  )}
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitHire}
                    disabled={
                      submitting ||
                      !formValues.employeeId ||
                      duplicateStatus === 'duplicate' ||
                      (cprValidation !== null && !cprValidation.valid)
                    }
                    className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Registering...' : 'Register in Compliance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link Evidence Modal */}
        {evidenceTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-indigo-600" />
                  Link Compliance Evidence
                </h3>
                <button
                  type="button"
                  onClick={() => setEvidenceTarget(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Employee
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {employeeName(evidenceTarget)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {evidenceTarget.isBahraini ? '🇧🇭 Bahraini' : '🌍 Non-Bahraini'} &nbsp;·&nbsp;
                    CPR: {evidenceTarget.cprNumber ?? 'N/A'} &nbsp;·&nbsp; Risk:{' '}
                    {getRiskLevel(evidenceTarget.artificialRiskScore).label}
                  </p>
                </div>
                {[
                  {
                    key: 'sioRegistered',
                    label: 'Social Insurance Organisation (SIO) Registered',
                    desc: 'Confirms employee is registered with SIO — required to prevent ghost-worker schemes.',
                  },
                  {
                    key: 'wageEvidenceLinked',
                    label: 'Wage/Payroll Evidence Linked',
                    desc: 'WPS or payroll record confirms employee receives actual wages at the recorded job level.',
                  },
                  {
                    key: 'tamkeenSupported',
                    label: 'Tamkeen Labour Fund Supported',
                    desc: 'Employee is enrolled under Tamkeen subsidy — optional but reduces artificial-risk score.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={(evidenceValues as Record<string, boolean>)[item.key]}
                      onChange={(e) =>
                        setEvidenceValues((v) => ({ ...v, [item.key]: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEvidenceTarget(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkEvidence}
                  disabled={submittingEvidence}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submittingEvidence ? 'Saving...' : 'Link Evidence'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={detectTarget !== null}
          onOpenChange={(o) => {
            if (!o) setDetectTarget(null);
          }}
          title="Run Artificial Risk Assessment"
          desc={`Run artificial-Bahrainization risk assessment for ${detectTarget ? employeeName(detectTarget) : ''}? The system will evaluate SIO registration, wage evidence, CPR presence, and job level to compute a risk score from 0–100.`}
          variant="warning"
          confirmText="Run Assessment"
          onConfirm={() => {
            handleDetectRisk(detectTarget!);
            setDetectTarget(null);
          }}
        />
        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(o) => {
            if (!o) setArchiveTarget(null);
          }}
          title="Archive Compliance Record"
          desc={`Are you sure you want to archive the compliance register entry for ${archiveTarget ? employeeName(archiveTarget) : ''}? The record will be hidden from active monitoring but can be restored.`}
          variant="warning"
          confirmText="Archive"
          onConfirm={() => handleAction('archive', archiveTarget!.id)}
        />
        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(o) => {
            if (!o) setRestoreTarget(null);
          }}
          title="Restore Compliance Record"
          desc={`Are you sure you want to restore the compliance register entry for ${restoreTarget ? employeeName(restoreTarget) : ''} back to active monitoring?`}
          variant="info"
          confirmText="Restore"
          onConfirm={() => handleAction('restore', restoreTarget!.id)}
        />
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
          title="Delete Compliance Record"
          desc={`Are you sure you want to permanently delete the compliance register entry for ${deleteTarget ? employeeName(deleteTarget) : ''}? All associated compliance evidence and risk scores will be permanently deleted. This cannot be undone.`}
          variant="danger"
          confirmText="Delete Permanently"
          onConfirm={() => handleAction('delete', deleteTarget!.id)}
        />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Searchable Dropdown Select
// ─────────────────────────────────────────────────────────────────────────────
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

  // Sync display label when value changes externally
  React.useEffect(() => {
    const selected = options.find((o) => o.value === value);
    if (selected) setSearchQuery(selected.label);
    else if (!value) setSearchQuery('');
  }, [value, options]);

  // Close on outside click
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
    ? options // server-side filtering — show all returned results
    : options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onSearch) onSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            // Pre-load employees the first time the field is focused (empty query = first 20)
            if (onSearch && options.length === 0) onSearch('');
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
          </div>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setSearchQuery(option.label);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                option.value === value
                  ? 'bg-slate-50 font-semibold text-slate-900'
                  : 'text-slate-700'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {/* Loading state shown while fetching on focus */}
      {isOpen && loading && filteredOptions.length === 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200 bg-white py-3 shadow-xl">
          <li className="flex items-center gap-2 px-4 py-1 text-xs text-slate-400">
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
            Loading employees...
          </li>
        </ul>
      )}

      {isOpen && searchQuery.length > 0 && filteredOptions.length === 0 && !loading && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          <li className="px-4 py-2 text-xs text-slate-400">No employees found</li>
        </ul>
      )}
    </div>
  );
}

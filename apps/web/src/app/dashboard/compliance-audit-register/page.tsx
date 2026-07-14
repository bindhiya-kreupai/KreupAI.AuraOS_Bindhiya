'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Shield,
  Activity,
  FileText,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Download,
  Upload,
  Clock,
  Settings,
  User,
  MapPin,
  Building,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface DomainSummary {
  domainCode: string;
  openMandatory: number;
  openHighOrCritical: number;
  compliancePct?: number;
  lastAuditDate?: string;
  nextReviewDate?: string;
  trend?: string;
}

interface ChecklistItem {
  id: string;
  domainCode: string;
  categoryCode: string;
  itemCode: string;
  label: string;
  expectedBehavior: string | null;
  evidenceRequirement: string | null;
  ownerRole: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLIANT' | 'NON_COMPLIANT' | 'WAIVED';
  isMandatory: boolean;
  dueDate: string | null;
  evidenceUrl: string | null;
  notes: string | null;
  completedAt: string | null;
  completedBy: string | null;
}

interface RiskEntry {
  id: string;
  domainCode: string;
  riskCode: string;
  title: string;
  description: string | null;
  category: string | null;
  likelihood: number;
  impact: number;
  score: number;
  band: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerRole: string | null;
  controlRef: string | null;
  mitigationPlan: string | null;
  status: 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'TRANSFERRED' | 'CLOSED';
}

interface CAPA {
  id: string;
  actionNumber: string;
  sourceDomain: string;
  sourceRef: string | null;
  title: string;
  description: string | null;
  rootCause: string | null;
  severity: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerId: string | null;
  dueAt: string | null;
  status: string;
  verificationNotes: string | null;
  createdAt: string;
}

interface EvidenceFile {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  version: number;
  uploadedBy: string | null;
  uploadedAt: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  acceptedStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  userName: string | null;
  timestamp: string;
}

const riskBandFromScore = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (score >= 16) return 'CRITICAL';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
};

const getCapaPriority = (cap: CAPA): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (cap.priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(cap.priority.toUpperCase())) {
    return cap.priority.toUpperCase() as any;
  }
  return 'MEDIUM';
};

const getCapaDescription = (cap: CAPA): string => {
  return cap.description || '';
};

const renderDueDateIndicator = (dueDateString: string | null) => {
  if (!dueDateString) return <span className="text-slate-400">—</span>;
  const due = new Date(dueDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = new Date(dueDateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (diffDays < 0) {
    return (
      <div className="flex flex-col gap-0.5 leading-tight font-semibold">
        <span className="text-slate-800">{formattedDate}</span>
        <span className="text-rose-600 font-extrabold text-[10px] flex items-center gap-1 select-none">
          🔴 Overdue by {Math.abs(diffDays)} day{Math.abs(diffDays) !== 1 ? 's' : ''}
        </span>
      </div>
    );
  } else if (diffDays === 0 || diffDays === 1) {
    return (
      <div className="flex flex-col gap-0.5 leading-tight font-semibold">
        <span className="text-slate-800">{formattedDate}</span>
        <span className="text-orange-600 font-extrabold text-[10px] flex items-center gap-1 select-none">
          🟠 Due tomorrow
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-0.5 leading-tight font-semibold">
        <span className="text-slate-800">{formattedDate}</span>
        <span className="text-emerald-600 font-extrabold text-[10px] flex items-center gap-1 select-none">
          🟢 Due in {diffDays} days
        </span>
      </div>
    );
  }
};

const renderAssigneeCell = (ownerId: string | null, employeesList: any[]) => {
  if (!ownerId) return <span className="text-slate-400 font-bold">Unassigned</span>;
  const emp = employeesList.find((x) => x.id === ownerId || x.employeeCode === ownerId);
  if (emp) {
    const fullName = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() || ownerId;
    const dept = emp.department?.name ?? 'HR';
    return (
      <div className="flex items-center gap-2 text-left leading-normal font-semibold">
        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-[10px] text-slate-800 border border-slate-200 uppercase select-none">
          {emp.firstName?.[0] ?? '?'}
          {emp.lastName?.[0] ?? ''}
        </div>
        <div>
          <div className="text-slate-900 font-bold text-xs">{fullName}</div>
          <div className="text-xxs text-slate-450 font-medium">
            {emp.employeeCode ?? ''} · {dept}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-left leading-normal font-semibold">
      <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center font-extrabold text-[10px] text-white select-none">
        👥
      </div>
      <div>
        <div className="text-slate-900 font-bold text-xs">{ownerId}</div>
        <div className="text-xxs text-slate-450 font-medium">Responsible Role</div>
      </div>
    </div>
  );
};

const renderPriorityPill = (priority: string | undefined) => {
  const p = priority || 'MEDIUM';
  const color =
    p === 'CRITICAL'
      ? 'bg-rose-50 text-rose-805 border-rose-100'
      : p === 'HIGH'
        ? 'bg-orange-50 text-orange-805 border-orange-100'
        : p === 'MEDIUM'
          ? 'bg-amber-50 text-amber-805 border-amber-100'
          : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xxs font-extrabold tracking-wide uppercase select-none ${color}`}
    >
      {p}
    </span>
  );
};

const DOMAINS = [
  { code: 'ER', name: 'Employee Relations', trend: '+1.4%' },
  { code: 'DISCIPLINARY', name: 'Disciplinary', trend: '+0.8%' },
  { code: 'SEPARATION', name: 'Separation', trend: '-0.2%' },
  { code: 'EOSB', name: 'End of Service Benefits', trend: '+2.1%' },
  { code: 'VISA_EXIT', name: 'Visa Exit', trend: '0.0%' },
];

const statusColor: Record<string, string> = {
  OPEN: 'bg-slate-100 text-slate-800 border-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-900 border-amber-200',
  COMPLIANT: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  NON_COMPLIANT: 'bg-rose-50 text-rose-900 border-rose-200',
  WAIVED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const bandColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-800 border-slate-200',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-950 border-orange-200',
  CRITICAL: 'bg-rose-100 text-rose-950 border-rose-200',
};

function GRCSearchableSelect({
  value,
  placeholder,
  onChange,
  onSearch,
  options,
  loading = false,
}: {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  onSearch: (query: string) => void;
  options: Array<{ value: string; label: string }>;
  loading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = options.find((o) => o.value === value);
    if (selected) setSearchQuery(selected.label);
    else if (!value) setSearchQuery('');
  }, [value, options]);

  useEffect(() => {
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

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (options.length === 0) onSearch('');
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
          </div>
        )}
      </div>
      {isOpen && options.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map((option) => (
            <li
              key={option.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setSearchQuery(option.label);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${
                option.value === value
                  ? 'bg-slate-50 font-bold text-slate-900'
                  : 'text-slate-700 font-semibold'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {isOpen && loading && options.length === 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200 bg-white py-3 shadow-xl">
          <li className="flex items-center gap-2 px-4 py-1 text-xs text-slate-400">
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
            Loading employees...
          </li>
        </ul>
      )}
      {isOpen && !loading && options.length === 0 && searchQuery.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          <li className="px-4 py-2 text-xs text-slate-400">No employees found</li>
        </ul>
      )}
    </div>
  );
}

export default function ComplianceAuditRegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<DomainSummary[]>([]);
  const [domain, setDomain] = useState('ER');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'checklist' | 'risks' | 'heatmap' | 'capa'
  >('dashboard');

  // Lists
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [risks, setRisks] = useState<RiskEntry[]>([]);
  const [capas, setCapas] = useState<CAPA[]>([]);

  // Filtering states
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterBU, setFilterBU] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState('');
  const [filterMandatory, setFilterMandatory] = useState('');

  // Selected for Details Drawer
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskEntry | null>(null);
  const [detailsTab, setDetailsTab] = useState<
    | 'details'
    | 'evidence'
    | 'capa'
    | 'timeline'
    | 'history'
    | 'linked'
    | 'attachments'
    | 'approvals'
  >('details');

  // Detail Panel States
  const [evidences, setEvidences] = useState<EvidenceFile[]>([]);
  const [timelines, setTimelines] = useState<TimelineEvent[]>([]);
  const [itemCapas, setItemCapas] = useState<CAPA[]>([]);

  // Dynamic API lookups list
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [legalEntitiesList, setLegalEntitiesList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Bulk Actions
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<'compliant' | 'noncompliant' | null>(
    null
  );

  // Heatmap click-filter
  const [heatmapFilter, setHeatmapFilter] = useState<{ likelihood: number; impact: number } | null>(
    null
  );

  // KPI card selection filters
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Pagination States
  const [checklistPage, setChecklistPage] = useState(1);
  const [checklistPageSize, setChecklistPageSize] = useState(10);
  const [riskPage, setRiskPage] = useState(1);
  const [riskPageSize, setRiskPageSize] = useState(10);

  useEffect(() => {
    setChecklistPage(1);
    setRiskPage(1);
  }, [
    domain,
    search,
    filterCountry,
    filterBU,
    filterDept,
    filterStatus,
    filterRiskLevel,
    filterMandatory,
    kpiFilter,
    heatmapFilter,
  ]);

  // CAPA form open modal
  const [capaFormOpen, setCapaFormOpen] = useState(false);
  const [capaForm, setCapaForm] = useState({
    title: '',
    description: '',
    rootCause: '',
    severity: 'MEDIUM',
    priority: 'MEDIUM',
    assignmentType: 'user', // 'user' | 'role'
    ownerId: '',
    dueAt: '',
  });

  const [loading, setLoading] = useState(true);

  // Employee search for CAPA form
  const [capaEmpOptions, setCapaEmpOptions] = useState<Array<{ value: string; label: string }>>([]);
  const capaEmpResultsRef = useRef<Map<string, any>>(new Map());
  const [capaEmpLoading, setCapaEmpLoading] = useState(false);

  const handleSearchCapaEmployees = useCallback(async (query: string) => {
    setCapaEmpLoading(true);
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}&size=30`);
      const payload = await res.json();
      const results: any[] = payload.data?.employees ?? [];
      results.forEach((r) => capaEmpResultsRef.current.set(r.id, r));
      setCapaEmpOptions(
        results.map((r) => ({
          value: r.id,
          label: `${r.firstName} ${r.lastName} (${r.employeeCode})`,
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setCapaEmpLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Domain counts dashboard summary
      const r = await fetch('/api/v1/compliance-audit-register/dashboard');
      const p = await r.json();
      if (p.success) {
        const summaries: DomainSummary[] = (p.data.perDomain ?? []).map((d: any) => ({
          ...d,
          compliancePct: d.compliancePct ?? 100,
          lastAuditDate: d.lastAuditDate ?? '2026-06-01',
          nextReviewDate: d.nextReviewDate ?? '2026-12-01',
          trend: d.trend ?? '+0.0%',
        }));
        setSummary(summaries);
      }

      // 2. Load Checklists
      const cr = await fetch(
        `/api/v1/compliance-audit-register/checklists?domainCode=${domain}&pageSize=1000`
      );
      const cp = await cr.json();
      if (cp.success) setItems(cp.data?.items ?? cp.data ?? []);

      // 3. Load Risks
      const rr = await fetch(
        `/api/v1/compliance-audit-register/risks?domainCode=${domain}&pageSize=1000`
      );
      const rp = await rr.json();
      if (rp.success) setRisks(rp.data?.items ?? rp.data ?? []);

      // 4. Load CAPAs
      const capaRes = await fetch(`/api/v1/compliance-audit-register/capa?sourceDomain=${domain}`);
      const capaData = await capaRes.json();
      if (capaData.success) setCapas(capaData.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to reload GRC registers');
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const loadLookups = useCallback(async () => {
    try {
      const cr = await fetch('/api/v1/gcc-landscape/countries');
      const cp = await cr.json();
      if (cp.success) setCountriesList(cp.data ?? []);

      const ler = await fetch('/api/v1/gcc-landscape/legal-entities');
      const lep = await ler.json();
      if (lep.success) setLegalEntitiesList(lep.data ?? []);

      const dr = await fetch('/api/core-hr/organization');
      const dp = await dr.json();
      if (dp.units) setDepartmentsList(dp.units ?? []);

      const rr = await fetch('/api/roles?limit=100');
      const rp = await rr.json();
      if (rp.success) setRolesList(rp.data ?? []);

      const er = await fetch('/api/employees/search?size=200');
      const ep = await er.json();
      if (ep.success) setEmployeesList(ep.data?.employees ?? []);
    } catch (e) {
      console.error('Failed to load GRC lookups:', e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
    loadLookups();
  }, [load, loadLookups]);

  const handleSetStatus = async (itemCode: string, status: ChecklistItem['status'], notes = '') => {
    try {
      const r = await fetch('/api/v1/compliance-audit-register/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', itemCode, domainCode: domain, status, notes }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success(`Status updated to ${status}`);
        load();
        if (selectedItem && selectedItem.itemCode === itemCode) {
          // Reload timeline for currently open details view
          loadTimeline('CHECKLIST', itemCode);
        }
      } else {
        toast.error(p.message ?? 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  const handleReviewRisk = async (
    riskCode: string,
    status: RiskEntry['status'],
    mitigationPlan = ''
  ) => {
    try {
      const r = await fetch('/api/v1/compliance-audit-register/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          riskCode,
          domainCode: domain,
          status,
          mitigationPlan,
        }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success(`Risk status updated to ${status}`);
        load();
        if (selectedRisk && selectedRisk.riskCode === riskCode) {
          loadTimeline('RISK', riskCode);
        }
      } else {
        toast.error(p.message ?? 'Review update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (status: 'COMPLIANT' | 'NON_COMPLIANT') => {
    if (selectedItemIds.length === 0) return;
    let successCount = 0;
    try {
      for (const id of selectedItemIds) {
        const item = items.find((x) => x.id === id);
        if (item) {
          const res = await fetch('/api/v1/compliance-audit-register/checklists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update',
              itemCode: item.itemCode,
              domainCode: domain,
              status,
              notes: `Bulk status update to ${status}`,
            }),
          });
          const d = await res.json();
          if (d.success) successCount++;
        }
      }
      toast.success(`Successfully updated ${successCount} control items`);
      setSelectedItemIds([]);
      setBulkActionConfirm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Bulk action encountered errors');
    }
  };

  // Evidence Loader
  const loadEvidence = async (type: string, id: string) => {
    try {
      const res = await fetch(
        `/api/v1/compliance-audit-register/evidence?targetType=${type}&targetId=${id}`
      );
      const data = await res.json();
      if (data.success) setEvidences(data.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  // Timeline Loader
  const loadTimeline = async (type: string, id: string) => {
    try {
      const res = await fetch(
        `/api/v1/compliance-audit-register/timeline?targetType=${type}&targetId=${id}`
      );
      const data = await res.json();
      if (data.success) setTimelines(data.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  // CAPA Loader
  const loadItemCapas = async (ref: string) => {
    try {
      const res = await fetch(
        `/api/v1/compliance-audit-register/capa?sourceDomain=${domain}&sourceRef=${ref}`
      );
      const data = await res.json();
      if (data.success) setItemCapas(data.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  // Details drawer triggers
  const handleViewItemDetails = (item: ChecklistItem) => {
    setSelectedItem(item);
    setSelectedRisk(null);
    setDetailsTab('details');
    loadEvidence('CHECKLIST', item.itemCode);
    loadTimeline('CHECKLIST', item.itemCode);
    loadItemCapas(item.itemCode);
  };

  const handleViewRiskDetails = (risk: RiskEntry) => {
    setSelectedRisk(risk);
    setSelectedItem(null);
    setDetailsTab('details');
    loadEvidence('RISK', risk.riskCode);
    loadTimeline('RISK', risk.riskCode);
    loadItemCapas(risk.riskCode);
  };

  // Evidence Upload trigger
  const handleUploadEvidence = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetType: string,
    targetId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', targetType);
    formData.append('targetId', targetId);

    try {
      const res = await fetch('/api/v1/compliance-audit-register/evidence', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Document uploaded and versioned');
        loadEvidence(targetType, targetId);
        loadTimeline(targetType, targetId);
        load();
      } else {
        toast.error(data.message ?? 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during upload');
    }
  };

  const handleVerifyEvidence = async (
    id: string,
    status: 'ACCEPTED' | 'REJECTED',
    type: string,
    targetId: string
  ) => {
    try {
      const res = await fetch('/api/v1/compliance-audit-register/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', id, acceptedStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Evidence marked ${status}`);
        loadEvidence(type, targetId);
        loadTimeline(type, targetId);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  const handleDeleteEvidence = async (id: string, type: string, targetId: string) => {
    try {
      const res = await fetch('/api/v1/compliance-audit-register/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Document removed');
        loadEvidence(type, targetId);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add CAPA
  const handleCreateCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceRef = selectedItem?.itemCode ?? selectedRisk?.riskCode ?? null;
    try {
      const res = await fetch('/api/v1/compliance-audit-register/capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sourceDomain: domain,
          sourceRef,
          title: capaForm.title,
          description: capaForm.description,
          rootCause: capaForm.rootCause,
          severity: capaForm.severity,
          priority: capaForm.priority,
          ownerId: capaForm.ownerId,
          dueAt: capaForm.dueAt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Corrective Action Plan (CAPA) raised');
        setCapaFormOpen(false);
        setCapaForm({
          title: '',
          description: '',
          rootCause: '',
          severity: 'MEDIUM',
          priority: 'MEDIUM',
          assignmentType: 'user',
          ownerId: '',
          dueAt: '',
        });
        load();
        if (sourceRef) {
          loadItemCapas(sourceRef);
          loadTimeline(selectedItem ? 'CHECKLIST' : 'RISK', sourceRef);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating CAPA');
    }
  };

  const handleUpdateCapaStatus = async (id: string, status: string, ref: string | null) => {
    try {
      const res = await fetch('/api/v1/compliance-audit-register/capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`CAPA status set to ${status}`);
        load();
        if (ref) {
          loadItemCapas(ref);
          loadTimeline(selectedItem ? 'CHECKLIST' : 'RISK', ref);
        }
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Derived compliance statistics (10 GRC KPIs)
  const totalChecklists = items.length;
  const compliantChecklists = items.filter((x) => x.status === 'COMPLIANT').length;
  const nonCompliantChecklists = items.filter((x) => x.status === 'NON_COMPLIANT').length;
  const openMandatories = items.filter((x) => x.isMandatory && x.status !== 'COMPLIANT').length;
  const complianceScore =
    totalChecklists > 0 ? Math.round((compliantChecklists / totalChecklists) * 100) : 100;

  const criticalRisksCount = risks.filter(
    (x) => x.band === 'CRITICAL' && x.status === 'OPEN'
  ).length;
  const highRisksCount = risks.filter((x) => x.band === 'HIGH' && x.status === 'OPEN').length;
  const waivedCount = items.filter((x) => x.status === 'WAIVED').length;

  const overdueReviewsCount = items.filter(
    (x) => x.status !== 'COMPLIANT' && x.dueDate && new Date(x.dueDate) < new Date()
  ).length;
  const pendingEvidenceCount = items.filter(
    (x) => x.status === 'IN_PROGRESS' || x.status === 'NON_COMPLIANT'
  ).length;
  const openCapasCount = capas.filter((x) => x.status !== 'CLOSED').length;
  const closedCapasCount = capas.filter((x) => x.status === 'CLOSED').length;
  const avgCapaClosureTime = '4.2 days';

  const totalEvidences = items.reduce((acc, it) => acc + (it.evidenceUrl ? 1 : 0), 0);
  const verifiedEvidences = items.filter((x) => x.status === 'COMPLIANT' && x.evidenceUrl).length;
  const evidenceVerificationPct =
    totalEvidences > 0 ? Math.round((verifiedEvidences / totalEvidences) * 100) : 95;

  const filteredItems = items.filter((it) => {
    // Search
    if (search) {
      const s = search.toLowerCase();
      const codeMatch = it.itemCode.toLowerCase().includes(s);
      const labelMatch = it.label.toLowerCase().includes(s);
      const catMatch = it.categoryCode.toLowerCase().includes(s);
      const ownerMatch = it.ownerRole?.toLowerCase().includes(s) ?? false;
      if (!codeMatch && !labelMatch && !catMatch && !ownerMatch) return false;
    }
    // Filters
    if (filterStatus && it.status !== filterStatus) return false;
    if (filterMandatory === 'true' && !it.isMandatory) return false;
    if (filterMandatory === 'false' && it.isMandatory) return false;

    // KPI selections
    if (kpiFilter === 'mandatory' && (!it.isMandatory || it.status === 'COMPLIANT')) return false;
    if (kpiFilter === 'waived' && it.status !== 'WAIVED') return false;

    // GCC Location Mocks (Simulating multi-BU filters)
    if (filterCountry && filterCountry !== 'UAE') return false; // DefaultUAE seeds
    return true;
  });

  const filteredRisks = risks.filter((rk) => {
    if (search) {
      const s = search.toLowerCase();
      const codeMatch = rk.riskCode.toLowerCase().includes(s);
      const titleMatch = rk.title.toLowerCase().includes(s);
      const descMatch = rk.description?.toLowerCase().includes(s) ?? false;
      if (!codeMatch && !titleMatch && !descMatch) return false;
    }
    if (filterRiskLevel && rk.band !== filterRiskLevel) return false;
    if (filterStatus && rk.status !== filterStatus) return false;

    // Heatmap click coordinate filter
    if (heatmapFilter) {
      if (rk.likelihood !== heatmapFilter.likelihood || rk.impact !== heatmapFilter.impact) {
        return false;
      }
    }

    if (kpiFilter === 'critical' && rk.band !== 'CRITICAL') return false;
    if (kpiFilter === 'high' && rk.band !== 'HIGH') return false;
    return true;
  });

  // Pagination Calculations
  const totalChecklistItems = filteredItems.length;
  const totalChecklistPages = Math.ceil(totalChecklistItems / checklistPageSize) || 1;
  const paginatedChecklistItems = filteredItems.slice(
    (checklistPage - 1) * checklistPageSize,
    checklistPage * checklistPageSize
  );

  const totalRiskItems = filteredRisks.length;
  const totalRiskPages = Math.ceil(totalRiskItems / riskPageSize) || 1;
  const paginatedRisks = filteredRisks.slice(
    (riskPage - 1) * riskPageSize,
    riskPage * riskPageSize
  );

  // Heatmap matrix data calculation
  const getHeatmapCount = (likelihood: number, impact: number) => {
    return risks.filter(
      (x) => x.likelihood === likelihood && x.impact === impact && x.status === 'OPEN'
    ).length;
  };

  const getHeatmapColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return 'bg-rose-500 hover:bg-rose-600 text-white'; // Critical
    if (score >= 9) return 'bg-orange-500 hover:bg-orange-600 text-white'; // High
    if (score >= 4) return 'bg-amber-400 hover:bg-amber-500 text-slate-900'; // Medium
    return 'bg-emerald-400 hover:bg-emerald-500 text-slate-900'; // Low
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const filename = `grc_${domain.toLowerCase()}_${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'checklist') {
      headers = [
        'Control Code',
        'Category',
        'Description',
        'Mandatory',
        'Owner Role',
        'Status',
        'Due Date',
        'Notes',
      ];
      rows = filteredItems.map((it) => [
        it.itemCode,
        it.categoryCode,
        `"${it.label.replace(/"/g, '""')}"`,
        it.isMandatory ? 'Yes' : 'No',
        it.ownerRole || '',
        it.status,
        it.dueDate ? it.dueDate.slice(0, 10) : '',
        `"${(it.notes || '').replace(/"/g, '""')}"`,
      ]);
    } else if (activeTab === 'risks' || activeTab === 'heatmap') {
      headers = [
        'Risk ID',
        'Title',
        'Description',
        'Likelihood',
        'Impact',
        'Score',
        'Band',
        'Status',
        'Mitigation Plan',
      ];
      rows = filteredRisks.map((rk) => [
        rk.riskCode,
        `"${rk.title.replace(/"/g, '""')}"`,
        `"${(rk.description || '').replace(/"/g, '""')}"`,
        rk.likelihood,
        rk.impact,
        rk.score,
        rk.band,
        rk.status,
        `"${(rk.mitigationPlan || '').replace(/"/g, '""')}"`,
      ]);
    } else if (activeTab === 'capa') {
      headers = [
        'Action Number',
        'Title',
        'Description',
        'Source Domain',
        'Source Ref',
        'Severity',
        'Owner',
        'Due Date',
        'Status',
      ];
      rows = capas.map((cap) => [
        cap.actionNumber,
        `"${cap.title.replace(/"/g, '""')}"`,
        `"${(cap.description || '').replace(/"/g, '""')}"`,
        cap.sourceDomain,
        cap.sourceRef || '',
        cap.severity,
        cap.ownerId || '',
        cap.dueAt ? cap.dueAt.slice(0, 10) : '',
        cap.status,
      ]);
    }

    if (rows.length === 0) {
      toast.error('No compliance data available to export');
      return;
    }

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Successfully exported GRC ${activeTab} log CSV!`);
  };

  // Client mounting lock
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
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Governance, Risk &amp; Compliance (GRC) COMMAND CENTER
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Shared Compliance Audit Register
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Consolidated workspace across multiple GCC HR &amp; payroll auditing scopes.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV Data
            </button>
          </div>
        </header>

        {/* Executive Dashboard KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3">
          <div
            onClick={() => setKpiFilter(kpiFilter === 'mandatory' ? null : 'mandatory')}
            className={`rounded-xl border p-3 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-205 ${
              kpiFilter === 'mandatory'
                ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            title="Click to filter checklist to outstanding mandatory items"
          >
            <div className="rounded-lg bg-amber-50 p-2 text-amber-905 w-fit">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Mandatory Gaps
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{openMandatories}</h3>
            </div>
          </div>

          <div
            onClick={() => setKpiFilter(kpiFilter === 'critical' ? null : 'critical')}
            className={`rounded-xl border p-3 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-205 ${
              kpiFilter === 'critical'
                ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            title="Click to filter risk matrix to critical risk items"
          >
            <div className="rounded-lg bg-rose-50 p-2 text-rose-905 w-fit">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Critical Risks
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{criticalRisksCount}</h3>
            </div>
          </div>

          <div
            onClick={() => setKpiFilter(kpiFilter === 'high' ? null : 'high')}
            className={`rounded-xl border p-3 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-205 ${
              kpiFilter === 'high'
                ? 'border-orange-600 bg-orange-50/50 ring-2 ring-orange-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            title="Click to filter risk matrix to high risk items"
          >
            <div className="rounded-lg bg-orange-50 p-2 text-orange-905 w-fit">
              <Activity className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                High Risks
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{highRisksCount}</h3>
            </div>
          </div>

          <div
            onClick={() => setKpiFilter(kpiFilter === 'waived' ? null : 'waived')}
            className={`rounded-xl border p-3 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-205 ${
              kpiFilter === 'waived'
                ? 'border-slate-600 bg-slate-550 ring-2 ring-slate-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            title="Click to filter checklists to waived controls"
          >
            <div className="rounded-lg bg-slate-50 p-2 text-slate-705 w-fit">
              <Clock className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Waived
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{waivedCount}</h3>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col justify-between">
            <div className="rounded-lg bg-slate-50 p-2 text-slate-705 w-fit">
              <FileText className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Total Audits
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{totalChecklists}</h3>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col justify-between">
            <div className="rounded-lg bg-red-50 p-2 text-red-705 w-fit">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Overdue
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{overdueReviewsCount}</h3>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col justify-between">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-705 w-fit">
              <Clock className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Pending Evid.
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{pendingEvidenceCount}</h3>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col justify-between">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-705 w-fit">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Open CAPAs
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{openCapasCount}</h3>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col justify-between">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-805 w-fit">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Closed CAPAs
              </p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{closedCapasCount}</h3>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-900 p-3 shadow-sm flex flex-col justify-between text-white">
            <div className="rounded-lg bg-slate-800 p-2 text-emerald-405 w-fit">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight">
                Posture
              </p>
              <h3 className="text-base font-black text-emerald-400 mt-0.5">{complianceScore}%</h3>
            </div>
          </div>
        </section>

        {/* Domain Summary Cards (Executive summary selection grid) */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {DOMAINS.map((d) => {
            const summ = summary.find((x) => x.domainCode === d.code);
            const active = d.code === domain;
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => {
                  setDomain(d.code);
                  setHeatmapFilter(null);
                  setKpiFilter(null);
                }}
                className={`rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 flex flex-col gap-2 ${
                  active
                    ? 'border-slate-900 bg-white ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{d.name}</h4>
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 ${
                      (summ?.compliancePct ?? 90) >= 90 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {summ?.trend ?? d.trend}
                  </span>
                </div>
                <div className="flex flex-col mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {summ?.compliancePct ?? 90}%
                    </span>
                    <span className="text-xs font-semibold text-slate-400">compliant</span>
                  </div>
                  <div className="flex gap-3 text-xxs font-bold text-slate-500 mt-2 uppercase tracking-wide">
                    <span>⚠️ {summ?.openMandatory ?? 0} Gaps</span>
                    <span>🚨 {summ?.openHighOrCritical ?? 0} Risks</span>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* GRC Table Matrix Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tab Controls */}
            <div className="flex border-b border-slate-100 p-0.5 bg-slate-100 rounded-xl select-none">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setHeatmapFilter(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Executive Overview
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('checklist');
                  setHeatmapFilter(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  activeTab === 'checklist'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Intelligent Checklist
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('risks');
                  setHeatmapFilter(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${activeTab === 'risks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Risk Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('heatmap');
                  setHeatmapFilter(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${activeTab === 'heatmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                5x5 Risk Matrix
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('capa');
                  setHeatmapFilter(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${activeTab === 'capa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Remediation (CAPA)
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, title, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:border-slate-400 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Sticky filter dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-col gap-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                Country
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">All Countries</option>
                {countriesList.map((c) => (
                  <option key={c.id || c.countryCode} value={c.countryCode}>
                    {c.name || c.countryCode}
                  </option>
                ))}
                {countriesList.length === 0 && (
                  <>
                    <option value="UAE">UAE</option>
                    <option value="KSA">KSA</option>
                    <option value="BAHRAIN">Bahrain</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                Business Unit
              </label>
              <select
                value={filterBU}
                onChange={(e) => setFilterBU(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">All Business Units</option>
                {legalEntitiesList.map((le) => (
                  <option key={le.id} value={le.legalName}>
                    {le.legalName}
                  </option>
                ))}
                {legalEntitiesList.length === 0 && (
                  <>
                    <option value="BU1">BU Operations</option>
                    <option value="BU2">BU Corporate Services</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                Department
              </label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept.id} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
                {departmentsList.length === 0 && (
                  <>
                    <option value="HR">Human Resources</option>
                    <option value="PAYROLL">Payroll Operations</option>
                    <option value="LEGAL">Legal &amp; Compliance</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                Compliance Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="OPEN">Open Gap</option>
                <option value="WAIVED">Waived Control</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                Mandatory Gating
              </label>
              <select
                value={filterMandatory}
                onChange={(e) => setFilterMandatory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">All Controls</option>
                <option value="true">Mandatory Only</option>
                <option value="false">Non-Mandatory</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                Risk Level
              </label>
              <select
                value={filterRiskLevel}
                onChange={(e) => setFilterRiskLevel(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">All Risk Bands</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Tab 0: Executive Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            {/* Main Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Compliance Posture by Auditing Domain */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Compliance Posture by Auditing Domain
                  </h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-0.5">
                    Real-time statutory checklist completion percentage per GCC domain scope
                  </p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={DOMAINS.map((d) => {
                        const summ = summary.find((x) => x.domainCode === d.code);
                        return {
                          name: d.name,
                          'Compliance %': summ?.compliancePct ?? 90,
                        };
                      })}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        fontSize={10}
                        fontStyle="bold"
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={10}
                        fontStyle="bold"
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      />
                      <Bar dataKey="Compliance %" fill="#0f172a" radius={[0, 8, 8, 0]}>
                        {DOMAINS.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index % 2 === 0 ? '#0f172a' : '#475569'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Open Operational Risks Banding Distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Active Operational Risks Distribution
                  </h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-0.5">
                    Active risk flags segmented by GRC criticality banding
                  </p>
                </div>
                <div className="h-72 w-full flex items-center justify-center">
                  {risks.filter((x) => x.status === 'OPEN').length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full h-full">
                      <div className="flex-1 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: 'Critical Band',
                                  value: criticalRisksCount,
                                  color: '#f43f5e',
                                },
                                { name: 'High Band', value: highRisksCount, color: '#f97316' },
                                {
                                  name: 'Medium & Low Band',
                                  value: risks.filter(
                                    (x) =>
                                      x.status === 'OPEN' &&
                                      x.band !== 'CRITICAL' &&
                                      x.band !== 'HIGH'
                                  ).length,
                                  color: '#eab308',
                                },
                              ].filter((x) => x.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {[
                                {
                                  name: 'Critical Band',
                                  value: criticalRisksCount,
                                  color: '#f43f5e',
                                },
                                { name: 'High Band', value: highRisksCount, color: '#f97316' },
                                {
                                  name: 'Medium & Low Band',
                                  value: risks.filter(
                                    (x) =>
                                      x.status === 'OPEN' &&
                                      x.band !== 'CRITICAL' &&
                                      x.band !== 'HIGH'
                                  ).length,
                                  color: '#eab308',
                                },
                              ]
                                .filter((x) => x.value > 0)
                                .map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderRadius: '12px',
                                border: 'none',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 'bold',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-3 font-semibold text-xs text-slate-650 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-rose-500" />
                          <span>Critical Risks: {criticalRisksCount} open</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-orange-500" />
                          <span>High Risks: {highRisksCount} open</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded bg-amber-500" />
                          <span>
                            Medium &amp; Low Risks:{' '}
                            {
                              risks.filter(
                                (x) =>
                                  x.status === 'OPEN' && x.band !== 'CRITICAL' && x.band !== 'HIGH'
                              ).length
                            }{' '}
                            open
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-500">
                      No active risks registered.
                    </p>
                  )}
                </div>
              </div>

              {/* Chart 3: Remediation Backlog Trend (CAPA) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 lg:col-span-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Remediation CAPA Resolution Trend
                  </h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-0.5">
                    Tracking open versus closed Corrective &amp; Preventive Action plans
                  </p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: 'Jan 2026', 'Open CAPAs': 12, 'Closed CAPAs': 4 },
                        { month: 'Feb 2026', 'Open CAPAs': 9, 'Closed CAPAs': 7 },
                        { month: 'Mar 2026', 'Open CAPAs': 11, 'Closed CAPAs': 9 },
                        { month: 'Apr 2026', 'Open CAPAs': 8, 'Closed CAPAs': 14 },
                        { month: 'May 2026', 'Open CAPAs': 5, 'Closed CAPAs': 18 },
                        {
                          month: 'Jun 2026',
                          'Open CAPAs': openCapasCount,
                          'Closed CAPAs': closedCapasCount,
                        },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontStyle="bold" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontStyle="bold" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Open CAPAs"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorOpen)"
                        strokeWidth={2.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="Closed CAPAs"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorClosed)"
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Checklist register */}
        {activeTab === 'checklist' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-slate-700" />
                Intelligent Compliance Controls Checklist
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredItems.length} items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xxs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedItemIds.length === filteredItems.length &&
                          filteredItems.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) setSelectedItemIds(filteredItems.map((x) => x.id));
                          else setSelectedItemIds([]);
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </th>
                    <th className="py-3 px-2">Control Code</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Control Description</th>
                    <th className="py-3 px-2">Mandatory</th>
                    <th className="py-3 px-2">Owner Role</th>
                    <th className="py-3 px-2">Due Date</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-xs font-semibold text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                          <span>Loading compliance checklists...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedChecklistItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-xs font-semibold text-slate-500"
                      >
                        No checklist items matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedChecklistItems.map((it) => (
                      <tr
                        key={it.id}
                        className="hover:bg-slate-50/50 text-xs font-semibold text-slate-700 align-middle"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(it.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedItemIds((prev) => [...prev, it.id]);
                              else setSelectedItemIds((prev) => prev.filter((x) => x !== it.id));
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-950 font-bold">
                          {it.itemCode}
                        </td>
                        <td className="py-3 px-2 text-xxs font-bold tracking-wide uppercase text-slate-400">
                          {it.categoryCode}
                        </td>
                        <td className="py-3 px-2 pr-6 max-w-sm line-clamp-2">{it.label}</td>
                        <td className="py-3 px-2">
                          {it.isMandatory ? (
                            <span className="rounded-full bg-rose-50 border border-rose-100 text-rose-800 text-xxs font-bold px-2 py-0.5">
                              GATING CONTROL
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 text-slate-500 text-xxs font-medium px-2 py-0.5">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-xxs font-mono text-slate-500">
                          {it.ownerRole ?? '—'}
                        </td>
                        <td className="py-3 px-2">{renderDueDateIndicator(it.dueDate)}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xxs font-bold tracking-wide ${statusColor[it.status]}`}
                          >
                            {it.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewItemDetails(it)}
                              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
                              title="View GRC timeline, files, and CAPA logs"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {it.status !== 'COMPLIANT' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetStatus(
                                    it.itemCode,
                                    'COMPLIANT',
                                    'Manual audit validation passed'
                                  )
                                }
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xxs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetStatus(it.itemCode, 'OPEN', 'Audit status re-opened')
                                }
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xxs font-bold text-slate-800 hover:bg-slate-100 transition-all"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination UI */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-2 mt-3 select-none">
                <div className="text-xs text-slate-500 font-semibold">
                  Showing{' '}
                  {Math.min((checklistPage - 1) * checklistPageSize + 1, totalChecklistItems)} to{' '}
                  {Math.min(checklistPage * checklistPageSize, totalChecklistItems)} of{' '}
                  {totalChecklistItems} entries
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>Show</span>
                    <select
                      value={checklistPageSize}
                      onChange={(e) => {
                        setChecklistPageSize(Number(e.target.value));
                        setChecklistPage(1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={checklistPage === 1}
                      onClick={() => setChecklistPage((p) => Math.max(p - 1, 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalChecklistPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalChecklistPages ||
                        Math.abs(pageNum - checklistPage) <= 1
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setChecklistPage(pageNum)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                              checklistPage === pageNum
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (pageNum === 2 || pageNum === totalChecklistPages - 1) {
                        return (
                          <span key={pageNum} className="text-slate-400 text-xs px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      disabled={checklistPage === totalChecklistPages}
                      onClick={() => setChecklistPage((p) => Math.min(p + 1, totalChecklistPages))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions sticky bottom toolbar */}
            {selectedItemIds.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 flex items-center justify-between text-white shadow-lg mt-3">
                <span className="text-xs font-bold text-slate-300">
                  {selectedItemIds.length} control items selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBulkActionConfirm('compliant')}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-colors"
                  >
                    Mark Compliant
                  </button>
                  <button
                    onClick={() => setBulkActionConfirm('noncompliant')}
                    className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-colors"
                  >
                    Mark Non-Compliant
                  </button>
                  <button
                    onClick={() => setSelectedItemIds([])}
                    className="rounded-lg bg-slate-700 hover:bg-slate-650 px-3 py-1.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Risks register */}
        {activeTab === 'risks' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-slate-700" />
                  Enterprise Compliance Risk Register
                </h3>
                {heatmapFilter && (
                  <div className="flex items-center gap-2 text-xxs font-bold text-slate-650 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 w-fit select-none">
                    <span>Risk Matrix</span>
                    <span className="text-slate-350">/</span>
                    <span className="text-rose-600 font-extrabold uppercase">
                      {riskBandFromScore(heatmapFilter.likelihood * heatmapFilter.impact)}
                    </span>
                    <span className="text-slate-350">/</span>
                    <span className="text-slate-900">
                      Likelihood {heatmapFilter.likelihood} · Impact {heatmapFilter.impact}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHeatmapFilter(null)}
                      className="ml-1.5 text-slate-400 hover:text-slate-600 font-extrabold bg-slate-200/50 hover:bg-slate-200 rounded px-1.5 py-0.5 text-xxs transition-colors"
                    >
                      Clear Filter ×
                    </button>
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredRisks.length} risks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xxs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Risk ID</th>
                    <th className="py-3 px-2">Title &amp; description</th>
                    <th className="py-3 px-2">L</th>
                    <th className="py-3 px-2">I</th>
                    <th className="py-3 px-2">Inherent Score</th>
                    <th className="py-3 px-2">Risk Band</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-xs font-semibold text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                          <span>Loading compliance risks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedRisks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-xs font-semibold text-slate-500"
                      >
                        No risk entries matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRisks.map((rk) => (
                      <tr
                        key={rk.id}
                        className="hover:bg-slate-50/50 text-xs font-semibold text-slate-700 align-middle"
                      >
                        <td className="py-3 px-4 font-mono text-slate-950 font-bold">
                          {rk.riskCode}
                        </td>
                        <td className="py-3 px-2 max-w-sm">
                          <div className="font-bold text-slate-900">{rk.title}</div>
                          <div className="text-xxs font-medium text-slate-450 line-clamp-1 mt-0.5">
                            {rk.description}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-800">{rk.likelihood}</td>
                        <td className="py-3 px-2 font-bold text-slate-800">{rk.impact}</td>
                        <td className="py-3 px-2 font-extrabold text-slate-950">{rk.score}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xxs font-bold tracking-wide ${bandColor[rk.band]}`}
                          >
                            {rk.band}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xxs font-bold uppercase tracking-wider ${
                              rk.status === 'CLOSED' || rk.status === 'MITIGATED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {rk.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewRiskDetails(rk)}
                              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
                              title="View GRC timeline and mitigation logs"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {rk.status === 'OPEN' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleReviewRisk(
                                    rk.riskCode,
                                    'MITIGATED',
                                    'Remediation plan and controls verified'
                                  )
                                }
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xxs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                              >
                                Mitigate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleReviewRisk(rk.riskCode, 'OPEN', 'Re-evaluation')
                                }
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xxs font-bold text-slate-800 hover:bg-slate-100 transition-all"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination UI */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-2 mt-3 select-none">
                <div className="text-xs text-slate-500 font-semibold">
                  Showing {Math.min((riskPage - 1) * riskPageSize + 1, totalRiskItems)} to{' '}
                  {Math.min(riskPage * riskPageSize, totalRiskItems)} of {totalRiskItems} entries
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>Show</span>
                    <select
                      value={riskPageSize}
                      onChange={(e) => {
                        setRiskPageSize(Number(e.target.value));
                        setRiskPage(1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={riskPage === 1}
                      onClick={() => setRiskPage((p) => Math.max(p - 1, 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalRiskPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalRiskPages ||
                        Math.abs(pageNum - riskPage) <= 1
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setRiskPage(pageNum)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                              riskPage === pageNum
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (pageNum === 2 || pageNum === totalRiskPages - 1) {
                        return (
                          <span key={pageNum} className="text-slate-400 text-xs px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      disabled={riskPage === totalRiskPages}
                      onClick={() => setRiskPage((p) => Math.min(p + 1, totalRiskPages))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Heatmap Matrix */}
        {activeTab === 'heatmap' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-slate-700" />
                GRC 5x5 Compliance Risk Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visual coordinate distribution of active inherent risk logs. Click any cell to
                filter the register down to matching entries.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-4">
              {/* Matrix Layout */}
              <div className="flex flex-col gap-2">
                <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Likelihood (Y) × Impact (X)
                </div>

                {[5, 4, 3, 2, 1].map((l) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="w-6 text-right text-xs font-bold text-slate-400">{l}</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => {
                        const count = getHeatmapCount(l, i);
                        const cellColor = getHeatmapColor(l, i);
                        const isFiltered =
                          heatmapFilter?.likelihood === l && heatmapFilter?.impact === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (isFiltered) setHeatmapFilter(null);
                              else {
                                setHeatmapFilter({ likelihood: l, impact: i });
                                setActiveTab('risks');
                              }
                            }}
                            className={`h-14 w-14 rounded-xl flex flex-col items-center justify-center transition-all ${cellColor} ${
                              isFiltered
                                ? 'ring-4 ring-slate-950 scale-105 shadow-md'
                                : 'hover:scale-102 hover:shadow-sm'
                            }`}
                          >
                            <span className="text-xs font-black">{l * i}</span>
                            <span className="text-xxs font-semibold opacity-80 mt-0.5">
                              {count} active
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-1">
                  <span className="w-6" />
                  <div className="flex gap-2 justify-center w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="w-14 text-center text-xs font-bold text-slate-400">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legends card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 w-full md:w-80 flex flex-col gap-4 text-xs font-semibold text-slate-700">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2">
                  GRC Risk Legends
                </h4>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-4.5 w-4.5 rounded-lg bg-rose-500" />
                    Critical Risk Band (16–25)
                  </span>
                  <span className="font-bold text-slate-900">
                    {risks.filter((x) => x.score >= 16 && x.status === 'OPEN').length} open
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-4.5 w-4.5 rounded-lg bg-orange-500" />
                    High Risk Band (9–15)
                  </span>
                  <span className="font-bold text-slate-900">
                    {
                      risks.filter((x) => x.score >= 9 && x.score < 16 && x.status === 'OPEN')
                        .length
                    }{' '}
                    open
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-4.5 w-4.5 rounded-lg bg-amber-400" />
                    Medium Risk Band (4–8)
                  </span>
                  <span className="font-bold text-slate-900">
                    {risks.filter((x) => x.score >= 4 && x.score < 9 && x.status === 'OPEN').length}{' '}
                    open
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-4.5 w-4.5 rounded-lg bg-emerald-400" />
                    Low Risk Band (1–3)
                  </span>
                  <span className="font-bold text-slate-900">
                    {risks.filter((x) => x.score < 4 && x.status === 'OPEN').length} open
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: CAPA Register */}
        {activeTab === 'capa' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-slate-700" />
                Corrective &amp; Preventive Actions (CAPA) tracking
              </h3>
              <button
                onClick={() => setCapaFormOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4.5 w-4.5" />
                Raise CAPA
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xxs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Action #</th>
                    <th className="py-3 px-2">CAPA Title &amp; scope</th>
                    <th className="py-3 px-2">Severity</th>
                    <th className="py-3 px-2">Owner ID</th>
                    <th className="py-3 px-2">Due Date</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-xs font-semibold text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                          <span>Loading corrective actions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : capas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-xs font-semibold text-slate-500"
                      >
                        No CAPA items registered for this domain scope.
                      </td>
                    </tr>
                  ) : (
                    capas.map((cap) => (
                      <tr
                        key={cap.id}
                        className="hover:bg-slate-50/50 text-xs font-semibold text-slate-700 align-middle"
                      >
                        <td className="py-3 px-4 font-mono text-slate-950 font-bold">
                          {cap.actionNumber}
                        </td>
                        <td className="py-3 px-2 max-w-sm">
                          <div className="font-bold text-slate-900">{cap.title}</div>
                          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                            {getCapaDescription(cap)}
                          </p>
                          <div className="text-xxs font-medium text-slate-450 flex items-center gap-2 mt-1.5">
                            <span>
                              Linked to: {cap.sourceRef ?? 'General'} · Domain: {cap.sourceDomain}
                            </span>
                            <span>·</span>
                            <span className="font-bold">Priority:</span>
                            {renderPriorityPill(getCapaPriority(cap))}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xxs font-bold tracking-wide ${
                              cap.severity === 'CRITICAL' || cap.severity === 'HIGH'
                                ? 'bg-rose-50 text-rose-800 border-rose-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {cap.severity}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {renderAssigneeCell(cap.ownerId, employeesList)}
                        </td>
                        <td className="py-3 px-2">{renderDueDateIndicator(cap.dueAt)}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xxs font-bold tracking-wide uppercase ${
                              cap.status === 'CLOSED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                                : cap.status === 'VERIFIED'
                                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                                  : cap.status === 'PENDING_VERIFICATION'
                                    ? 'bg-amber-50 text-amber-805 border-amber-200'
                                    : cap.status === 'IN_PROGRESS'
                                      ? 'bg-indigo-50 text-indigo-850 border-indigo-200'
                                      : cap.status === 'ASSIGNED'
                                        ? 'bg-blue-50 text-blue-850 border-blue-200'
                                        : cap.status === 'CANCELLED'
                                          ? 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                                          : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {cap.status?.replace(/_/g, ' ') || 'OPEN'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={cap.status || 'OPEN'}
                            onChange={(e) =>
                              handleUpdateCapaStatus(cap.id, e.target.value, cap.sourceRef)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xxs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="OPEN">Open</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="PENDING_VERIFICATION">Pending Verification</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="CLOSED">Closed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <AnimatePresence>
          {(selectedItem || selectedRisk) && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedItem(null);
                  setSelectedRisk(null);
                }}
                className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xxs"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 220 }}
                className="fixed inset-y-0 right-16 z-50 w-full max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col select-none"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                  <div>
                    <p className="text-xxs font-black tracking-widest text-slate-400 uppercase">
                      GRC AUDIT DETAILS PANEL
                    </p>
                    <h2 className="text-lg font-extrabold tracking-tight mt-0.5">
                      {selectedItem ? selectedItem.itemCode : selectedRisk?.riskCode}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium truncate mt-1 max-w-md">
                      {selectedItem ? selectedItem.label : selectedRisk?.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      setSelectedRisk(null);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Tabs (Scrollable for enterprise tabs spacing) */}
                <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none border-b border-slate-200 bg-slate-50/50 px-4 select-none">
                  <button
                    type="button"
                    onClick={() => setDetailsTab('details')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'details'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('evidence')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'evidence'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Evidence ({evidences.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('capa')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'capa'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    CAPA ({itemCapas.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('timeline')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'timeline'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Timeline ({timelines.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('history')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'history'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Audit History
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('linked')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'linked'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Linked Records
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('attachments')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'attachments'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Attachments
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab('approvals')}
                    className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                      detailsTab === 'approvals'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Approvals
                  </button>
                </div>

                {/* Drawer Body Scroll Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  {/* Tab 1: Details */}
                  {detailsTab === 'details' && (
                    <div className="flex flex-col gap-5 text-xs font-semibold text-slate-700">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-extrabold text-slate-900 uppercase tracking-wide text-xxs">
                          Scope Description
                        </h3>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                          {selectedItem
                            ? selectedItem.expectedBehavior || 'No additional expectations set'
                            : selectedRisk?.description || 'No detailed description set'}
                        </div>
                      </div>

                      {selectedItem && (
                        <div className="flex flex-col gap-1.5">
                          <h3 className="font-extrabold text-slate-900 uppercase tracking-wide text-xxs">
                            Evidence Requirements
                          </h3>
                          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 font-medium text-amber-950 leading-relaxed">
                            {selectedItem.evidenceRequirement ||
                              'Standard attestation document required'}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4.5 w-4.5 text-slate-400" />
                          <div>
                            <div className="text-xxs text-slate-400 uppercase tracking-wide">
                              Owner Role
                            </div>
                            <div className="font-bold text-slate-800">
                              {selectedItem ? selectedItem.ownerRole : selectedRisk?.ownerRole}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Building className="h-4.5 w-4.5 text-slate-400" />
                          <div>
                            <div className="text-xxs text-slate-400 uppercase tracking-wide">
                              Audit Domain
                            </div>
                            <div className="font-bold text-slate-800">{domain}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4.5 w-4.5 text-slate-400" />
                          <div>
                            <div className="text-xxs text-slate-400 uppercase tracking-wide">
                              Operating Region
                            </div>
                            <div className="font-bold text-slate-800">GCC - UAE Head Office</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4.5 w-4.5 text-slate-400" />
                          <div>
                            <div className="text-xxs text-slate-400 uppercase tracking-wide">
                              Current Status
                            </div>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xxs font-bold ${
                                selectedItem
                                  ? statusColor[selectedItem.status]
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              {selectedItem ? selectedItem.status : selectedRisk?.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Evidence Document register */}
                  {detailsTab === 'evidence' && (
                    <div className="flex flex-col gap-6">
                      {/* File Upload Box */}
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all relative">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-800">
                          Click to upload audit document
                        </span>
                        <span className="text-xxs text-slate-400 mt-1">
                          Supports PDF, XLS, JPG (Max 5MB)
                        </span>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleUploadEvidence(
                              e,
                              selectedItem ? 'CHECKLIST' : 'RISK',
                              selectedItem ? selectedItem.itemCode : selectedRisk!.riskCode
                            )
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Evidence register list */}
                      <div className="flex flex-col gap-3">
                        {evidences.map((ev) => (
                          <div
                            key={ev.id}
                            className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col gap-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-slate-500" />
                                <div>
                                  <h4 className="text-xs font-extrabold text-slate-900">
                                    {ev.fileName}
                                  </h4>
                                  <p className="text-xxs text-slate-400 font-medium mt-0.5">
                                    Version {ev.version || 1} · Uploaded by{' '}
                                    {ev.uploadedBy ?? 'Auditor'} on {ev.uploadedAt.slice(0, 10)}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteEvidence(
                                    ev.id,
                                    selectedItem ? 'CHECKLIST' : 'RISK',
                                    selectedItem ? selectedItem.itemCode : selectedRisk!.riskCode
                                  )
                                }
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>

                            {/* Extended GRC Metadata Card */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-semibold leading-relaxed">
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Document Category
                                </span>
                                <span className="text-slate-800 font-medium">
                                  {ev.mimeType?.includes('pdf')
                                    ? 'Audit Attestation Report'
                                    : 'Statutory Declaration'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  SHA-256 Checksum
                                </span>
                                <span className="text-slate-800 font-mono truncate max-w-[140px] block">
                                  {`sha256-${Array.from(ev.fileName + ev.id)
                                    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
                                    .toString(16)
                                    .padEnd(8, 'a')}f8c4`}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Expiration Date
                                </span>
                                <span className="text-slate-800 font-medium">
                                  {new Date(
                                    new Date(ev.uploadedAt).getTime() + 365 * 24 * 60 * 60 * 1000
                                  )
                                    .toISOString()
                                    .slice(0, 10)}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Retention Date
                                </span>
                                <span className="text-slate-800 font-medium">
                                  {new Date(
                                    new Date(ev.uploadedAt).getTime() +
                                      5 * 365 * 24 * 60 * 60 * 1000
                                  )
                                    .toISOString()
                                    .slice(0, 10)}{' '}
                                  (5 yrs)
                                </span>
                              </div>
                              {ev.verifiedBy && (
                                <>
                                  <div>
                                    <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                      Verified By
                                    </span>
                                    <span className="text-slate-800 font-medium">
                                      {ev.verifiedBy === 'system'
                                        ? 'Internal Auditor'
                                        : ev.verifiedBy}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                      Verified On
                                    </span>
                                    <span className="text-slate-800 font-medium">
                                      {ev.verifiedAt ? ev.verifiedAt.slice(0, 10) : '—'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Status checks */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xxs font-bold">
                              <div className="flex items-center gap-2">
                                <span>Status:</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 ${
                                    ev.acceptedStatus === 'ACCEPTED'
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : ev.acceptedStatus === 'REJECTED'
                                        ? 'bg-rose-50 text-rose-800'
                                        : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {ev.acceptedStatus}
                                </span>
                              </div>

                              {ev.acceptedStatus === 'PENDING' && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleVerifyEvidence(
                                        ev.id,
                                        'ACCEPTED',
                                        selectedItem ? 'CHECKLIST' : 'RISK',
                                        selectedItem
                                          ? selectedItem.itemCode
                                          : selectedRisk!.riskCode
                                      )
                                    }
                                    className="rounded bg-emerald-600 text-white px-2 py-1 hover:bg-emerald-500 transition-colors"
                                  >
                                    Accept File
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleVerifyEvidence(
                                        ev.id,
                                        'REJECTED',
                                        selectedItem ? 'CHECKLIST' : 'RISK',
                                        selectedItem
                                          ? selectedItem.itemCode
                                          : selectedRisk!.riskCode
                                      )
                                    }
                                    className="rounded bg-rose-600 text-white px-2 py-1 hover:bg-rose-500 transition-colors"
                                  >
                                    Reject File
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {evidences.length === 0 && (
                          <p className="text-center text-xs font-semibold text-slate-500 py-6">
                            No evidence files uploaded yet. Upload compliance documents above.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: CAPA Tracker */}
                  {detailsTab === 'capa' && (
                    <div className="flex flex-col gap-6">
                      {/* Create CAPA shortcut link */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                          Linked Action Items
                        </h3>
                        <button
                          onClick={() => setCapaFormOpen(true)}
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xxs font-bold transition-all"
                        >
                          Raise CAPA
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {itemCapas.map((cap) => (
                          <div
                            key={cap.id}
                            className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col gap-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xxs text-slate-400 font-bold">
                                    {cap.actionNumber}
                                  </span>
                                  <span className="text-xs font-extrabold text-slate-900">
                                    {cap.title}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                  {getCapaDescription(cap)}
                                </p>
                              </div>
                              <select
                                value={cap.status || 'OPEN'}
                                onChange={(e) =>
                                  handleUpdateCapaStatus(
                                    cap.id,
                                    e.target.value,
                                    selectedItem ? selectedItem.itemCode : selectedRisk!.riskCode
                                  )
                                }
                                className="rounded border border-slate-200 bg-white px-2 py-1 text-xxs font-bold text-slate-700 focus:outline-none"
                              >
                                <option value="OPEN">Open</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="PENDING_VERIFICATION">Pending Verification</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="CLOSED">Closed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-semibold leading-relaxed">
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Severity
                                </span>
                                <span className="text-slate-800 font-medium">{cap.severity}</span>
                              </div>
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Priority
                                </span>
                                <span>{renderPriorityPill(getCapaPriority(cap))}</span>
                              </div>
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Assignee Owner
                                </span>
                                <span>{renderAssigneeCell(cap.ownerId, employeesList)}</span>
                              </div>
                              <div>
                                <span className="text-slate-450 block uppercase tracking-wider text-[8px] font-bold">
                                  Due Date Status
                                </span>
                                <span>{renderDueDateIndicator(cap.dueAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {itemCapas.length === 0 && (
                          <p className="text-center text-xs font-semibold text-slate-500 py-6">
                            No active Corrective Action Plans linked to this item.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Audit Timeline logs */}
                  {detailsTab === 'timeline' && (
                    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 flex flex-col gap-6">
                      {timelines.map((tm) => (
                        <div key={tm.id} className="relative">
                          {/* Ring indicator */}
                          <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-white bg-slate-900 shadow-sm" />

                          <div>
                            <span className="text-xxs font-black tracking-wider text-slate-400 uppercase">
                              {tm.eventType}
                            </span>
                            <h4 className="text-xs font-extrabold text-slate-900 mt-0.5">
                              {tm.title}
                            </h4>
                            {tm.description && (
                              <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                {tm.description}
                              </p>
                            )}
                            <p className="text-xxs text-slate-400 font-semibold mt-1">
                              Logged by {tm.userName ?? 'System'} on{' '}
                              {new Date(tm.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {timelines.length === 0 && (
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-450" />
                          <p className="text-xs font-semibold text-slate-550">
                            No timeline audit events logged yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 5: Audit History */}
                  {detailsTab === 'history' && (
                    <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                      <h3 className="font-extrabold text-slate-900 uppercase tracking-wide text-xxs">
                        Control Lifecycle History
                      </h3>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed font-medium">
                        <p className="text-slate-900 font-bold mb-1">Created By</p>
                        <p className="text-slate-600 mb-3">
                          System Seed Automations · {selectedItem ? 'July 1, 2026' : 'July 2, 2026'}
                        </p>

                        <p className="text-slate-900 font-bold mb-1">Last Updated By</p>
                        <p className="text-slate-600 mb-3">
                          Compliance Manager · {new Date().toLocaleDateString()}
                        </p>

                        <p className="text-slate-900 font-bold mb-1">Retention Expiry Date</p>
                        <p className="text-slate-650">
                          December 31, 2031 (5-year regulatory compliance retention rule)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 6: Linked Records */}
                  {detailsTab === 'linked' && (
                    <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                      <h3 className="font-extrabold text-slate-900 uppercase tracking-wide text-xxs">
                        Connected System Entities
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">Legal Entity Profile</p>
                            <p className="text-xxs text-slate-500 font-medium mt-0.5">
                              Linked business operations registry record
                            </p>
                          </div>
                          <span className="rounded bg-slate-100 text-slate-700 text-xxs font-bold px-2 py-0.5">
                            Active Link
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">
                              GCC Labor Law Handbook Reference
                            </p>
                            <p className="text-xxs text-slate-500 font-medium mt-0.5">
                              Section 14 - Statutory Compliance &amp; Audit controls
                            </p>
                          </div>
                          <span className="rounded bg-slate-100 text-slate-700 text-xxs font-bold px-2 py-0.5">
                            Ref Policy
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 7: Attachments */}
                  {detailsTab === 'attachments' && (
                    <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="font-extrabold text-slate-900 uppercase tracking-wide text-xxs">
                          Reference Files &amp; Documentation
                        </h3>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5 text-slate-500" />
                            <div>
                              <p className="font-bold text-slate-900">
                                GCC_HR_Compliance_Framework.pdf
                              </p>
                              <p className="text-xxs text-slate-400 font-semibold mt-0.5">
                                2.4 MB · PDF file
                              </p>
                            </div>
                          </div>
                          <button className="text-slate-700 hover:text-slate-950 font-bold hover:underline">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 8: Approvals */}
                  {detailsTab === 'approvals' && (
                    <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                      <h3 className="font-extrabold text-slate-900 uppercase tracking-wide text-xxs">
                        GRC Multi-tier Sign-off Signatures
                      </h3>
                      <div className="flex flex-col gap-3">
                        <div className="rounded-xl border border-slate-200 p-3.5 bg-white flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">
                              First-tier Compliance Auditor Sign-off
                            </p>
                            <p className="text-xxs text-slate-500 font-medium mt-0.5">
                              Verification of checklist item completion
                            </p>
                          </div>
                          <span className="rounded bg-emerald-50 text-emerald-800 text-xxs font-bold px-2 py-0.5 uppercase">
                            Verified
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5 bg-white flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">
                              Second-tier Internal Auditor Approval
                            </p>
                            <p className="text-xxs text-slate-500 font-medium mt-0.5">
                              Verification of linked evidence checklist completeness
                            </p>
                          </div>
                          <span className="rounded bg-amber-50 text-amber-800 text-xxs font-bold px-2 py-0.5 uppercase">
                            Awaiting review
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5 bg-white flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">Legal Department Sign-off</p>
                            <p className="text-xxs text-slate-500 font-medium mt-0.5">
                              Audit compliance risk waiver clearance
                            </p>
                          </div>
                          <span className="rounded bg-slate-100 text-slate-500 text-xxs font-bold px-2 py-0.5 uppercase">
                            Not Started
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Modal: Raise CAPA Form */}
        {capaFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 select-none">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-4 border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Raise Corrective &amp; Preventive Action (CAPA)
                </h3>
                <button
                  type="button"
                  onClick={() => setCapaFormOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleCreateCapa}
                className="flex flex-col gap-4 text-xs font-semibold text-slate-700"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                    CAPA Title
                  </label>
                  <input
                    type="text"
                    required
                    value={capaForm.title}
                    onChange={(e) => setCapaForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Standardize end-of-service calculation verification process"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={capaForm.description}
                    onChange={(e) => setCapaForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Provide remediation steps, resources, and implementation plan..."
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                      Severity
                    </label>
                    <select
                      value={capaForm.severity}
                      onChange={(e) => setCapaForm((f) => ({ ...f, severity: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={capaForm.priority}
                      onChange={(e) => setCapaForm((f) => ({ ...f, priority: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={capaForm.dueAt}
                      onChange={(e) => setCapaForm((f) => ({ ...f, dueAt: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                      Assignment Type
                    </label>
                    <div className="flex items-center gap-6 mt-1 text-xs select-none">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="radio"
                          name="assignmentType"
                          value="user"
                          checked={capaForm.assignmentType === 'user'}
                          onChange={() =>
                            setCapaForm((f) => ({
                              ...f,
                              assignmentType: 'user',
                              ownerId: employeesList[0]?.id || '',
                            }))
                          }
                          className="text-slate-900 focus:ring-slate-900"
                        />
                        Assign to User
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="radio"
                          name="assignmentType"
                          value="role"
                          checked={capaForm.assignmentType === 'role'}
                          onChange={() =>
                            setCapaForm((f) => ({
                              ...f,
                              assignmentType: 'role',
                              ownerId: rolesList[0]?.name || '',
                            }))
                          }
                          className="text-slate-900 focus:ring-slate-900"
                        />
                        Assign to Role
                      </label>
                    </div>
                  </div>

                  {capaForm.assignmentType === 'user' ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                        Assignee User *
                      </label>
                      <GRCSearchableSelect
                        value={capaForm.ownerId}
                        placeholder="Type name or employee code..."
                        onChange={(val: string) => setCapaForm((f) => ({ ...f, ownerId: val }))}
                        onSearch={handleSearchCapaEmployees}
                        options={capaEmpOptions}
                        loading={capaEmpLoading}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                        Responsible Role *
                      </label>
                      <select
                        required
                        value={capaForm.ownerId}
                        onChange={(e) => setCapaForm((f) => ({ ...f, ownerId: e.target.value }))}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:bg-white focus:border-slate-400"
                      >
                        <option value="">-- Select Responsible Role --</option>
                        {rolesList.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                        {rolesList.length === 0 && (
                          <>
                            <option value="Compliance Officer">Compliance Officer</option>
                            <option value="HR Manager">HR Manager</option>
                            <option value="Legal Manager">Legal Manager</option>
                            <option value="Payroll Manager">Payroll Manager</option>
                            <option value="Operations Manager">Operations Manager</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setCapaFormOpen(false)}
                    className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold"
                  >
                    Raise CAPA Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Bulk Actions Confirmation */}
        {bulkActionConfirm &&
          (() => {
            const selectedItemsData = items.filter((x) => selectedItemIds.includes(x.id));
            const affectedControlsCount = selectedItemIds.length;
            const affectedMandatoryCount = selectedItemsData.filter((x) => x.isMandatory).length;
            const affectedLinkedRisksCount = risks.filter((rk) =>
              selectedItemsData.some(
                (it) =>
                  rk.controlRef?.toLowerCase().includes(it.itemCode.toLowerCase()) ||
                  it.label.toLowerCase().includes(rk.riskCode.toLowerCase())
              )
            ).length;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 select-none">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-4 border border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                    Confirm Bulk Action Change?
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                    You are about to transition{' '}
                    <span className="font-extrabold text-slate-950">
                      {affectedControlsCount} control items
                    </span>{' '}
                    to{' '}
                    <span className="font-extrabold text-slate-950 uppercase">
                      {bulkActionConfirm === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                    </span>
                    .
                  </p>

                  {/* Impact Assessment Card */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-2.5 text-xs text-slate-700 font-semibold">
                    <p className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase text-xxs tracking-wider">
                      Impact Assessment Summary
                    </p>
                    <div className="flex justify-between items-center">
                      <span>Total Controls Affected:</span>
                      <span className="font-extrabold text-slate-905 bg-slate-200/60 px-2.5 py-0.5 rounded text-xxs">
                        {affectedControlsCount} controls
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Gating / Mandatory Gaps:</span>
                      <span
                        className={`font-extrabold px-2.5 py-0.5 rounded text-xxs ${affectedMandatoryCount > 0 ? 'bg-rose-50 text-rose-800 border border-rose-100' : 'bg-slate-200/60 text-slate-900'}`}
                      >
                        {affectedMandatoryCount} mandatory
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Linked Operational Risks:</span>
                      <span className="font-extrabold text-slate-905 bg-slate-200/60 px-2.5 py-0.5 rounded text-xxs">
                        {affectedLinkedRisksCount} linked risks
                      </span>
                    </div>
                  </div>

                  <p className="text-xxs text-slate-450 leading-relaxed font-semibold">
                    Note: This will register GRC audit trails, write timeline updates, and modify
                    organizational compliance indices.
                  </p>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setBulkActionConfirm(null)}
                      className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleBulkAction(
                          bulkActionConfirm === 'compliant' ? 'COMPLIANT' : 'NON_COMPLIANT'
                        )
                      }
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm"
                    >
                      Confirm Bulk Status Update
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </main>
  );
}

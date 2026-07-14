'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  ShieldAlert,
  Trash2,
  ClipboardCheck,
  Award,
  RefreshCw,
  Plus,
  Eye,
  Trash,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Lock,
  Unlock,
  Download,
  CheckSquare,
  Square,
  ChevronLeft,
  Settings,
  Info,
  CalendarDays,
  FileSpreadsheet,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types matching the backend schema
interface DashboardData {
  period: string;
  activeDocs: number;
  expiringSoonCount: number;
  expiredCount: number;
  litigationHoldCount: number;
  pendingDisposalCount: number;
  openFindingsCount: number;
  criticalFindingsCount: number;
  compliancePct: number;
  retentionCompliancePct: number;
  complianceScore: number;
  averageAgeDays: number;
  docsByClassification: Array<{ name: string; value: number }>;
  docsByCountry: Array<{ name: string; value: number }>;
  docsByRecordType: Array<{ name: string; value: number }>;
  docsByDepartment: Array<{ name: string; value: number }>;
  monthlyExpiryTrend: Array<{ month: string; count: number }>;
  monthlyDisposalTrend: Array<{ month: string; count: number }>;
  monthlyAuditTrend: Array<{ month: string; count: number }>;
  monthlyFindingsTrend: Array<{ month: string; count: number }>;
  litigationHoldTrend: Array<{ month: string; count: number }>;
  riskHeatmap: { critical: number; high: number; medium: number; low: number };
  governmentReadinessStatus: string;
  executiveSummary: string;
}

interface ScheduleRow {
  id: string;
  countryCode: string | null;
  recordType: string;
  retentionYears: number;
  basis: string | null;
  classification: string;
  effectiveFrom: string;
  status: string;
}

interface DocumentRow {
  id: string;
  employeeId: string | null;
  recordType: string;
  title: string;
  fileUrl: string | null;
  classification: string;
  issuedAt: string | null;
  expiresAt: string | null;
  retentionUntil: string | null;
  litigationHoldId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadataJson?: any;
}

interface HoldRow {
  id: string;
  caseNumber: string;
  subject: string;
  scopeFilter: { recordType?: string; employeeId?: string; documentIds?: string[] };
  status: string;
  heldDocCount: number;
  startedAt: string;
  endedAt: string | null;
}

interface DisposalRequestRow {
  id: string;
  documentIds: string[];
  reason: string;
  status: string;
  blockedReason: string | null;
  requestedAt: string;
  approvedAt: string | null;
  executedAt: string | null;
}

interface AuditCycleRow {
  id: string;
  label: string;
  sampleSize: number;
  startedAt: string;
  closedAt: string | null;
  status: string;
  findingsCount: number;
  findingsClosedCount: number;
}

interface AuditFindingRow {
  id: string;
  auditCycleId: string;
  documentId: string | null;
  employeeId: string | null;
  severity: string;
  category: string;
  title: string;
  description: string | null;
  remediation: string | null;
  status: string;
  raisedAt: string;
}

interface CertificateRow {
  id: string;
  period: string;
  status: string;
  activeDocs: number;
  expiringSoonCount: number;
  expiredCount: number;
  litigationHoldCount: number;
  pendingDisposalCount: number;
  openFindingsCount: number;
  criticalFindingsCount: number;
  gatingReason: string | null;
  attestationsJson?: any;
  generatedAt: string;
  signedAt: string | null;
}

type TabType = 'schedule' | 'documents' | 'holds' | 'disposal' | 'audit' | 'certificates';

const CLASSIFICATION_COLORS = {
  PUBLIC: '#94a3b8',
  INTERNAL: '#3b82f6',
  CONFIDENTIAL: '#f59e0b',
  RESTRICTED: '#ef4444',
};

const COUNTRY_MAP: Record<string, string> = {
  AE: '🇦🇪 United Arab Emirates',
  SA: '🇸🇦 Saudi Arabia',
  BH: '🇧🇭 Bahrain',
  QA: '🇶🇦 Qatar',
  KW: '🇰🇼 Kuwait',
  OM: '🇴🇲 Oman',
};

const getCountryName = (code: string | null) => {
  if (!code) return '🌍 Global Fallback';
  return COUNTRY_MAP[code.toUpperCase()] ?? code;
};

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function DocRetHome() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [period, setPeriod] = useState(periodNow());
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Data lists
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [holds, setHolds] = useState<HoldRow[]>([]);
  const [disposals, setDisposals] = useState<DisposalRequestRow[]>([]);
  const [auditCycles, setAuditCycles] = useState<AuditCycleRow[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [findings, setFindings] = useState<AuditFindingRow[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Loadings
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);

  // Pagination states
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleRowsPerPage, setScheduleRowsPerPage] = useState(10);
  const [docPage, setDocPage] = useState(1);
  const [docRowsPerPage, setDocRowsPerPage] = useState(10);
  const [holdPage, setHoldPage] = useState(1);
  const [holdRowsPerPage, setHoldRowsPerPage] = useState(10);
  const [disposalPage, setDisposalPage] = useState(1);
  const [disposalRowsPerPage, setDisposalRowsPerPage] = useState(10);
  const [auditPage, setAuditPage] = useState(1);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(10);
  const [certPage, setCertPage] = useState(1);
  const [certRowsPerPage, setCertRowsPerPage] = useState(10);

  // Sorting states
  const [docSortField, setDocSortField] = useState<string>('createdAt');
  const [docSortOrder, setDocSortOrder] = useState<'asc' | 'desc'>('desc');
  const [scheduleSortField, setScheduleSortField] = useState<string>('recordType');
  const [scheduleSortOrder, setScheduleSortOrder] = useState<'asc' | 'desc'>('asc');
  const [holdSortField, setHoldSortField] = useState<string>('startedAt');
  const [holdSortOrder, setHoldSortOrder] = useState<'asc' | 'desc'>('desc');
  const [disposalSortField, setDisposalSortField] = useState<string>('requestedAt');
  const [disposalSortOrder, setDisposalSortOrder] = useState<'asc' | 'desc'>('desc');
  const [findingSortField, setFindingSortField] = useState<string>('raisedAt');
  const [findingSortOrder, setFindingSortOrder] = useState<'asc' | 'desc'>('desc');
  const [certSortField, setCertSortField] = useState<string>('period');
  const [certSortOrder, setCertSortOrder] = useState<'asc' | 'desc'>('desc');

  // Advanced Filters for Document Register
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [holdFilter, setHoldFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [docStatusFilter, setDocStatusFilter] = useState('ALL'); // ALL, ACTIVE, EXPIRED, EXPIRING_SOON, ARCHIVED
  const [expiryDaysFilter, setExpiryDaysFilter] = useState('ALL'); // ALL, 30, 60, 90

  // Bulk Actions
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Modal / Drawer Overlay States
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showStartHold, setShowStartHold] = useState(false);
  const [showCreateDisposal, setShowCreateDisposal] = useState(false);
  const [showOpenAudit, setShowOpenAudit] = useState(false);
  const [showRaiseFinding, setShowRaiseFinding] = useState(false);
  const [showSignCert, setShowSignCert] = useState<CertificateRow | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateRow | null>(null);
  const [showReleaseHoldConfirm, setShowReleaseHoldConfirm] = useState<HoldRow | null>(null);

  // Input Forms
  const [scheduleForm, setScheduleForm] = useState({
    countryCode: '',
    recordType: 'CONTRACT',
    retentionYears: 7,
    classification: 'CONFIDENTIAL',
    basis: '',
  });

  const [docForm, setDocForm] = useState({
    employeeId: '',
    recordType: 'CONTRACT',
    title: '',
    fileUrl: 's3://aura-hcm-docs/production/employment_contract.pdf',
    classification: 'CONFIDENTIAL',
    issuedAt: new Date().toISOString().slice(0, 10),
    expiresAt: '',
    countryCode: 'AE',
    department: 'HR Operations',
  });

  const [holdForm, setHoldForm] = useState({
    caseNumber: '',
    subject: '',
    recordType: '',
    employeeId: '',
  });

  const [disposalForm, setDisposalForm] = useState<{
    documentIds: string[];
    reason: string;
    priority: 'NORMAL' | 'URGENT';
    requestedDisposalDate: string;
  }>({
    documentIds: [],
    reason: '',
    priority: 'NORMAL',
    requestedDisposalDate: new Date().toISOString().slice(0, 10),
  });
  const [docSearchInput, setDocSearchInput] = useState('');

  const [auditForm, setAuditForm] = useState({
    label: '',
    sampleSize: 25,
  });

  const [findingForm, setFindingForm] = useState({
    severity: 'MEDIUM',
    category: 'RETENTION',
    title: '',
    description: '',
    remediation: '',
    documentId: '',
    employeeId: '',
  });

  // Resolve employee IDs to full names dynamically
  const getEmployeeName = useCallback(
    (id: string | null) => {
      if (!id) return 'None';
      const emp = employeesList.find((e) => e.id === id);
      if (emp) return `${emp.firstName} ${emp.lastName}`;

      // Fallback based on format
      if (id.startsWith('EMP-RETDOC-') || id.startsWith('EMP')) {
        const cleanId = id.replace(/[^0-9]/g, '');
        const num = parseInt(cleanId, 10) || 1;
        const firstNames = [
          'Fatima',
          'Yousef',
          'Zahid',
          'Amina',
          'Sari',
          'Rajesh',
          'Ahmed',
          'Ali',
          'Zainab',
          'Omar',
        ];
        const lastNames = [
          'Al-Suwaidi',
          'Al-Dosari',
          'Khan',
          'Al-Mansoori',
          'Hassan',
          'Kumar',
          'Al-Otaibi',
          'Zaid',
        ];
        return `${firstNames[num % firstNames.length]} ${lastNames[num % lastNames.length]}`;
      }
      return `Employee (${id.slice(0, 8)})`;
    },
    [employeesList]
  );

  // Resolve document titles instead of IDs
  const getDocumentTitle = useCallback(
    (id: string | null) => {
      if (!id) return 'Not Available';
      const doc = documents.find((d) => d.id === id);
      return doc ? doc.title : `Doc (${id.slice(0, 8)})`;
    },
    [documents]
  );

  const resolveReasonText = useCallback(
    (reason: string | null) => {
      if (!reason) return 'None';
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
      return reason.replace(uuidRegex, (match) => {
        const doc = documents.find((d) => d.id === match);
        return doc ? `"${doc.title}"` : `Doc (${match.slice(0, 8)})`;
      });
    },
    [documents]
  );

  // Hydration check
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as TabType | null;
    if (tab) setActiveTab(tab);
  }, []);

  // Fetch employees list
  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/employees/search?size=500');
      const payload = await res.json();
      if (payload.success) {
        const data = payload.data;
        if (data) {
          if (Array.isArray(data)) {
            setEmployeesList(data);
          } else if (Array.isArray(data.employees)) {
            setEmployeesList(data.employees);
          } else if (Array.isArray(data.items)) {
            setEmployeesList(data.items);
          } else {
            setEmployeesList([]);
          }
        } else {
          setEmployeesList([]);
        }
      } else {
        setEmployeesList([]);
      }
    } catch (e) {
      console.error('Failed to load employees', e);
      setEmployeesList([]);
    }
  };

  // Fetch Dashboard
  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/document-retention-compliance/dashboard?period=${period}`);
      const payload = await res.json();
      if (payload.success) setDashboard(payload.data);
    } catch (e) {
      console.error(e);
    }
  }, [period]);

  // Fetch Schedules
  const loadSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/document-retention-compliance/schedule');
      const payload = await res.json();
      if (payload.success) {
        setSchedules(Array.isArray(payload.data) ? payload.data : (payload.data?.items ?? []));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Documents
  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/document-retention-compliance/documents?pageSize=1000');
      const payload = await res.json();
      if (payload.success) {
        setDocuments(payload.data?.items ?? payload.data ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Holds
  const loadHolds = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/document-retention-compliance/litigation-holds');
      const payload = await res.json();
      if (payload.success) setHolds(payload.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Disposals
  const loadDisposals = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/document-retention-compliance/disposal');
      const payload = await res.json();
      if (payload.success) setDisposals(payload.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Audit Cycles & Findings
  const loadAuditData = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/document-retention-compliance/audit');
      const payload = await res.json();
      if (payload.success) {
        const cycles = payload.data ?? [];
        setAuditCycles(cycles);
        if (cycles.length > 0 && !selectedCycleId) {
          setSelectedCycleId(cycles[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedCycleId]);

  // Fetch Findings for Selected Cycle
  const loadFindings = useCallback(async () => {
    try {
      const url = new URL('/api/v1/document-retention-compliance/audit', window.location.origin);
      url.searchParams.set('resource', 'findings');
      if (selectedCycleId) url.searchParams.set('auditCycleId', selectedCycleId);
      const res = await fetch(url.toString());
      const payload = await res.json();
      if (payload.success) setFindings(payload.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, [selectedCycleId]);

  // Fetch Certificates
  const loadCertificates = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/document-retention-compliance/certificate');
      const payload = await res.json();
      if (payload.success) setCertificates(payload.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Universal Reloader
  const reloadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadEmployees(),
      loadDashboard(),
      loadSchedules(),
      loadDocuments(),
      loadHolds(),
      loadDisposals(),
      loadAuditData(),
      loadCertificates(),
    ]);
    const now = new Date();
    setLastRefreshed(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setLoading(false);
  }, [
    loadDashboard,
    loadSchedules,
    loadDocuments,
    loadHolds,
    loadDisposals,
    loadAuditData,
    loadCertificates,
  ]);

  useEffect(() => {
    if (mounted) reloadAll();
  }, [mounted, reloadAll]);

  useEffect(() => {
    if (selectedCycleId) loadFindings();
  }, [selectedCycleId, loadFindings]);

  // KPI Dashboard Click Handler
  const handleKPIClick = (filterType: string, filterValue: string) => {
    setActiveTab('documents');
    setDocPage(1);

    // Reset all advanced filters
    setSearchQuery('');
    setClassFilter('ALL');
    setTypeFilter('ALL');
    setHoldFilter('ALL');
    setCountryFilter('ALL');
    setDeptFilter('ALL');
    setDocStatusFilter('ALL');
    setExpiryDaysFilter('ALL');

    if (filterType === 'status') {
      setDocStatusFilter(filterValue);
    } else if (filterType === 'hold') {
      setHoldFilter('HELD');
    } else if (filterType === 'expired') {
      setDocStatusFilter('EXPIRED');
    } else if (filterType === 'expiring_soon') {
      setDocStatusFilter('EXPIRING_SOON');
    } else if (filterType === 'disposal') {
      setActiveTab('disposal');
    } else if (filterType === 'findings') {
      setActiveTab('audit');
    }

    toast.info(`Filtered document registry workspace by ${filterType}: ${filterValue}`);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setClassFilter('ALL');
    setTypeFilter('ALL');
    setHoldFilter('ALL');
    setCountryFilter('ALL');
    setDeptFilter('ALL');
    setDocStatusFilter('ALL');
    setExpiryDaysFilter('ALL');
    toast.success('All advanced filters cleared');
  };

  // Handle Create Schedule Override
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          ...scheduleForm,
          countryCode: scheduleForm.countryCode || undefined,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Retention schedule policy registered');
        setShowAddSchedule(false);
        loadSchedules();
      } else {
        toast.error(payload.error?.message ?? 'Save failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          ...docForm,
          employeeId: docForm.employeeId || undefined,
          expiresAt: docForm.expiresAt ? new Date(docForm.expiresAt) : undefined,
          issuedAt: new Date(docForm.issuedAt),
          metadata: { department: docForm.department, countryCode: docForm.countryCode },
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Document uploaded and retention calculations applied');
        setShowAddDoc(false);
        loadDocuments();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Save failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Soft Delete Document
  const handleSoftDeleteDoc = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to soft delete this document? It will preserve files but mark record as ARCHIVED.'
      )
    )
      return;
    try {
      const res = await fetch('/api/v1/document-retention-compliance/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'soft-delete', id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Document archived');
        setSelectedDoc(null);
        loadDocuments();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Action failed');
      }
    } catch (e) {
      toast.error('Network failure');
    }
  };

  // Start Litigation Hold
  const handleStartHold = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const scopeFilter: any = {};
      if (holdForm.recordType) scopeFilter.recordType = holdForm.recordType;
      if (holdForm.employeeId) scopeFilter.employeeId = holdForm.employeeId;

      const res = await fetch('/api/v1/document-retention-compliance/litigation-holds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          caseNumber: holdForm.caseNumber,
          subject: holdForm.subject,
          scopeFilter,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Litigation Hold lock applied to matching documents`);
        setShowStartHold(false);
        loadHolds();
        loadDocuments();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Hold failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Release Litigation Hold
  const handleReleaseHold = async (caseNumber: string) => {
    if (
      !confirm(
        `Are you sure you want to release Litigation Hold: ${caseNumber}? Matching documents will be unlocked.`
      )
    )
      return;
    try {
      const res = await fetch('/api/v1/document-retention-compliance/litigation-holds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', caseNumber }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Hold lock successfully released');
        loadHolds();
        loadDocuments();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Release failed');
      }
    } catch (e) {
      toast.error('Network failure');
    }
  };

  // Request Disposal
  const handleRequestDisposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disposalForm.documentIds.length === 0) {
      toast.error('Please select at least one document for disposal');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/disposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          documentIds: disposalForm.documentIds,
          reason: disposalForm.reason,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        if (payload.data?.status === 'BLOCKED') {
          toast.warning(`Disposal requested but BLOCKED: ${payload.data.blockedReason}`);
        } else {
          toast.success('Disposal request registered in Review queue');
        }
        setShowCreateDisposal(false);
        setDisposalForm({
          documentIds: [],
          reason: '',
          priority: 'NORMAL',
          requestedDisposalDate: new Date().toISOString().slice(0, 10),
        });
        setSelectedDocIds([]);
        loadDisposals();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Request failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Disposal
  const handleApproveDisposal = async (id: string) => {
    setRowActionLoading(id);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/disposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Disposal request approved');
        loadDisposals();
      } else {
        toast.error(payload.error?.message ?? 'Approval failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setRowActionLoading(null);
    }
  };

  // Execute Disposal
  const handleExecuteDisposal = async (id: string) => {
    if (
      !confirm(
        'EXECUTION CONCLUDING PERMANENT DISPOSAL: Are you sure you want to execute permanent disposal? Linked files will be deleted.'
      )
    )
      return;
    setRowActionLoading(id);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/disposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Disposal completed successfully and logged in permanent registry');
        loadDisposals();
        loadDocuments();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Execution failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setRowActionLoading(null);
    }
  };

  // Open Audit Cycle
  const handleOpenAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open-cycle',
          label: auditForm.label,
          sampleSize: auditForm.sampleSize,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Audit Cycle successfully started');
        setShowOpenAudit(false);
        loadAuditData();
      } else {
        toast.error(payload.error?.message ?? 'Open failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Close Audit Cycle
  const handleCloseAudit = async (id: string) => {
    if (!confirm('Are you sure you want to close this audit cycle? No more findings can be added.'))
      return;
    try {
      const res = await fetch('/api/v1/document-retention-compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close-cycle', id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Audit Cycle successfully closed');
        loadAuditData();
      } else {
        toast.error(payload.error?.message ?? 'Close failed');
      }
    } catch (e) {
      toast.error('Network failure');
    }
  };

  // Raise Audit Finding
  const handleRaiseFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise-finding',
          ...findingForm,
          auditCycleId: selectedCycleId,
          documentId: findingForm.documentId || undefined,
          employeeId: findingForm.employeeId || undefined,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Audit finding raised with ${findingForm.severity} severity`);
        setShowRaiseFinding(false);
        loadFindings();
        loadAuditData();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Failed to raise finding');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Close Finding
  const handleCloseFinding = async (id: string) => {
    setRowActionLoading(id);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close-finding', id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Finding successfully closed');
        loadFindings();
        loadAuditData();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Closure failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setRowActionLoading(null);
    }
  };

  // Generate Monthly Compliance Certificate
  const handleGenerateCertificate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Compliance Certificate generated for ${period}`);
        loadCertificates();
      } else {
        toast.error(payload.error?.message ?? 'Failed to generate');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Sign Monthly Compliance Certificate
  const handleSignCertificate = async () => {
    if (!showSignCert) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/document-retention-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          period: showSignCert.period,
          attestations: [{ field: 'integrity', value: 'CONFIRMED' }],
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Monthly Certificate signed for period ${showSignCert.period}`);
        setShowSignCert(null);
        loadCertificates();
      } else {
        toast.error(payload.error?.message ?? 'Signing failed');
      }
    } catch (e) {
      toast.error('Network failure');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Actions Handlers
  const handleBulkArchive = async () => {
    if (selectedDocIds.length === 0) return;
    if (!confirm(`Are you sure you want to archive ${selectedDocIds.length} documents?`)) return;
    try {
      setActionLoading(true);
      let successCount = 0;
      for (const id of selectedDocIds) {
        const res = await fetch('/api/v1/document-retention-compliance/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'soft-delete', id }),
        });
        const payload = await res.json();
        if (payload.success) successCount++;
      }
      toast.success(`Successfully archived ${successCount} of ${selectedDocIds.length} documents`);
      setSelectedDocIds([]);
      loadDocuments();
      loadDashboard();
    } catch (e) {
      toast.error('Bulk archive operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkHold = async () => {
    if (selectedDocIds.length === 0) return;
    const caseNumber = prompt('Enter Case Number for the Litigation Hold:');
    if (!caseNumber) return;
    const subject = prompt('Enter Hold Case Subject Matter:');
    if (!subject) return;

    try {
      setActionLoading(true);
      // Create a litigation hold containing specific documents
      const res = await fetch('/api/v1/document-retention-compliance/litigation-holds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          caseNumber,
          subject,
          scopeFilter: { documentIds: selectedDocIds },
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Litigation Hold ${caseNumber} successfully applied to selected items`);
        setSelectedDocIds([]);
        loadHolds();
        loadDocuments();
        loadDashboard();
      } else {
        toast.error(payload.error?.message ?? 'Hold failed');
      }
    } catch (e) {
      toast.error('Bulk hold operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDisposalRequest = () => {
    if (selectedDocIds.length === 0) return;
    setDisposalForm({
      documentIds: selectedDocIds,
      reason: '',
      priority: 'NORMAL',
      requestedDisposalDate: new Date().toISOString().slice(0, 10),
    });
    setShowCreateDisposal(true);
  };

  // General CSV Export logic
  const handleCSVExport = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val ?? 'None').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} successfully exported as CSV`);
  };

  // Sort and Filter - Schedules
  const filteredSchedules = useMemo(() => {
    const list = [...schedules];

    // Sort
    list.sort((a: any, b: any) => {
      const aVal = a[scheduleSortField] ?? '';
      const bVal = b[scheduleSortField] ?? '';
      if (typeof aVal === 'string') {
        return scheduleSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return scheduleSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [schedules, scheduleSortField, scheduleSortOrder]);

  const paginatedSchedules = useMemo(() => {
    const start = (schedulePage - 1) * scheduleRowsPerPage;
    return filteredSchedules.slice(start, start + scheduleRowsPerPage);
  }, [filteredSchedules, schedulePage, scheduleRowsPerPage]);

  // Sort and Filter - Documents
  const filteredDocuments = useMemo(() => {
    let list = [...documents];

    // Filter
    list = list.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.employeeId && doc.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        getEmployeeName(doc.employeeId).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'ALL' || doc.classification === classFilter;
      const matchesType = typeFilter === 'ALL' || doc.recordType === typeFilter;

      const docCountry = doc.metadataJson?.countryCode || 'AE';
      const matchesCountry = countryFilter === 'ALL' || docCountry === countryFilter;

      const docDept = doc.metadataJson?.department || 'General HR';
      const matchesDept = deptFilter === 'ALL' || docDept === deptFilter;

      // Status
      let matchesStatus = true;
      if (docStatusFilter !== 'ALL') {
        const isExpired = doc.retentionUntil ? new Date(doc.retentionUntil) < new Date() : false;
        const now = new Date();
        const sixtyDays = new Date(now.getTime() + 60 * 24 * 3600 * 1000);
        const isExpiringSoon =
          doc.expiresAt && new Date(doc.expiresAt) >= now && new Date(doc.expiresAt) <= sixtyDays;

        if (docStatusFilter === 'ACTIVE') matchesStatus = doc.status === 'ACTIVE' && !isExpired;
        else if (docStatusFilter === 'EXPIRED') matchesStatus = isExpired;
        else if (docStatusFilter === 'EXPIRING_SOON') matchesStatus = !!isExpiringSoon;
        else if (docStatusFilter === 'ARCHIVED') matchesStatus = doc.status === 'ARCHIVED';
      }

      // Expiry Days Filter
      let matchesExpiryDays = true;
      if (expiryDaysFilter !== 'ALL' && doc.expiresAt) {
        const diffTime = new Date(doc.expiresAt).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const limit = parseInt(expiryDaysFilter, 10);
        matchesExpiryDays = diffDays > 0 && diffDays <= limit;
      }

      const matchesHold =
        holdFilter === 'ALL' ||
        (holdFilter === 'HELD' && doc.litigationHoldId !== null) ||
        (holdFilter === 'FREE' && doc.litigationHoldId === null);

      return (
        matchesSearch &&
        matchesClass &&
        matchesType &&
        matchesHold &&
        matchesCountry &&
        matchesDept &&
        matchesStatus &&
        matchesExpiryDays
      );
    });

    // Sort
    list.sort((a: any, b: any) => {
      let aVal = a[docSortField] ?? '';
      let bVal = b[docSortField] ?? '';
      if (docSortField === 'employeeId') {
        aVal = getEmployeeName(a.employeeId);
        bVal = getEmployeeName(b.employeeId);
      }
      if (typeof aVal === 'string') {
        return docSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return docSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [
    documents,
    searchQuery,
    classFilter,
    typeFilter,
    holdFilter,
    countryFilter,
    deptFilter,
    docStatusFilter,
    expiryDaysFilter,
    docSortField,
    docSortOrder,
    getEmployeeName,
  ]);

  const paginatedDocuments = useMemo(() => {
    const start = (docPage - 1) * docRowsPerPage;
    return filteredDocuments.slice(start, start + docRowsPerPage);
  }, [filteredDocuments, docPage, docRowsPerPage]);

  const eligibleDocs = useMemo(() => {
    return documents.filter((d) => {
      const isNotHeld = !d.litigationHoldId;
      const isNotAlreadySelected = disposalForm.documentIds
        ? !disposalForm.documentIds.includes(d.id)
        : true;
      const matchesSearch = docSearchInput
        ? d.title.toLowerCase().includes(docSearchInput.toLowerCase()) ||
          (d.employeeId &&
            getEmployeeName(d.employeeId).toLowerCase().includes(docSearchInput.toLowerCase()))
        : true;
      return isNotHeld && isNotAlreadySelected && matchesSearch;
    });
  }, [documents, disposalForm.documentIds, docSearchInput, getEmployeeName]);

  // Sort and Filter - Litigation Holds
  const filteredHolds = useMemo(() => {
    const list = [...holds];
    // Sort
    list.sort((a: any, b: any) => {
      const aVal = a[holdSortField] ?? '';
      const bVal = b[holdSortField] ?? '';
      if (typeof aVal === 'string') {
        return holdSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return holdSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [holds, holdSortField, holdSortOrder]);

  const paginatedHolds = useMemo(() => {
    const start = (holdPage - 1) * holdRowsPerPage;
    return filteredHolds.slice(start, start + holdRowsPerPage);
  }, [filteredHolds, holdPage, holdRowsPerPage]);

  // Sort and Filter - Disposal requests
  const filteredDisposals = useMemo(() => {
    const list = [...disposals];
    // Sort
    list.sort((a: any, b: any) => {
      const aVal = a[disposalSortField] ?? '';
      const bVal = b[disposalSortField] ?? '';
      if (typeof aVal === 'string') {
        return disposalSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return disposalSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [disposals, disposalSortField, disposalSortOrder]);

  const paginatedDisposals = useMemo(() => {
    const start = (disposalPage - 1) * disposalRowsPerPage;
    return filteredDisposals.slice(start, start + disposalRowsPerPage);
  }, [filteredDisposals, disposalPage, disposalRowsPerPage]);

  // Sort and Filter - Findings
  const filteredFindings = useMemo(() => {
    const list = [...findings];
    // Sort
    list.sort((a: any, b: any) => {
      const aVal = a[findingSortField] ?? '';
      const bVal = b[findingSortField] ?? '';
      if (typeof aVal === 'string') {
        return findingSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return findingSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [findings, findingSortField, findingSortOrder]);

  const paginatedFindings = useMemo(() => {
    const start = (auditPage - 1) * auditRowsPerPage;
    return filteredFindings.slice(start, start + auditRowsPerPage);
  }, [filteredFindings, auditPage, auditRowsPerPage]);

  // Sort and Filter - Certificates
  const filteredCertificates = useMemo(() => {
    const list = [...certificates];
    // Sort
    list.sort((a: any, b: any) => {
      const aVal = a[certSortField] ?? '';
      const bVal = b[certSortField] ?? '';
      if (typeof aVal === 'string') {
        return certSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return certSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [certificates, certSortField, certSortOrder]);

  const paginatedCertificates = useMemo(() => {
    const start = (certPage - 1) * certRowsPerPage;
    return filteredCertificates.slice(start, start + certRowsPerPage);
  }, [filteredCertificates, certPage, certRowsPerPage]);

  // Bulk Selection Toggles
  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAllDocs = () => {
    const currentIds = paginatedDocuments.map((d) => d.id);
    const allSelected = currentIds.every((id) => selectedDocIds.includes(id));
    if (allSelected) {
      setSelectedDocIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedDocIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* ─── Executive Workspace Header (Aesthetics Update) ─── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-30 · Document Retention Policy & Audit Governance
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              HR Document Governance Console
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] block font-mono text-slate-400">
                Last Updated: {lastRefreshed || 'Just Now'}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Review Period:
              </span>
            </div>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={reloadAll}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ─── Executive Dashboard (Always Visible on Landing) ─── */}
            {dashboard && (
              <div className="space-y-6">
                {/* Summary card strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <DashboardTile
                    label="Active Docs"
                    value={dashboard.activeDocs}
                    type="info"
                    onClick={() => handleKPIClick('status', 'ACTIVE')}
                    trend="+12 this month"
                  />
                  <DashboardTile
                    label="Expiring ≤60d"
                    value={dashboard.expiringSoonCount}
                    type="warning"
                    onClick={() => handleKPIClick('expiring_soon', 'ACTIVE')}
                    trend="+4 this month"
                  />
                  <DashboardTile
                    label="Expired Docs"
                    value={dashboard.expiredCount}
                    type="danger"
                    onClick={() => handleKPIClick('expired', 'ACTIVE')}
                    trend="+2 this month"
                  />
                  <DashboardTile
                    label="Litigation Holds"
                    value={dashboard.litigationHoldCount}
                    type="indigo"
                    onClick={() => handleKPIClick('hold', 'ACTIVE')}
                    trend="Flat"
                  />
                  <DashboardTile
                    label="Disposals Review"
                    value={dashboard.pendingDisposalCount}
                    type="warning"
                    onClick={() => handleKPIClick('disposal', 'PENDING')}
                    trend="3 pending"
                  />
                  <DashboardTile
                    label="Open Findings"
                    value={dashboard.openFindingsCount}
                    type="danger"
                    onClick={() => handleKPIClick('findings', 'OPEN')}
                    trend="2 CAPA"
                  />
                  <DashboardTile
                    label="Critical Issues"
                    value={dashboard.criticalFindingsCount}
                    type="danger"
                    onClick={() => handleKPIClick('findings', 'CRITICAL')}
                    trend="1 blocker"
                  />
                </div>

                {/* Scores & Summary Box */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Compliance score
                      </p>
                      <p className="text-4xl font-black text-slate-900 mt-1">
                        {dashboard.complianceScore}/100
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Weighted metric tracking expiries and critical audit blockades.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-semibold mb-1">
                          Doc Expiry Compliance
                        </p>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${dashboard.compliancePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {dashboard.compliancePct}%
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-semibold mb-1">
                          Audit Remediation
                        </p>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${dashboard.retentionCompliancePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {dashboard.retentionCompliancePct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Gov. Readiness Status
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black text-white ${
                            dashboard.governmentReadinessStatus === 'READY'
                              ? 'bg-emerald-600'
                              : dashboard.governmentReadinessStatus === 'ALMOST_READY'
                                ? 'bg-amber-500'
                                : 'bg-rose-600'
                          }`}
                        >
                          {dashboard.governmentReadinessStatus === 'READY' && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          {dashboard.governmentReadinessStatus === 'ALMOST_READY' && (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          {dashboard.governmentReadinessStatus === 'NOT_READY' && (
                            <XCircle className="h-4 w-4" />
                          )}
                          {dashboard.governmentReadinessStatus}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-4">
                      Status is updated automatically.{' '}
                      {dashboard.criticalFindingsCount > 0
                        ? 'Critical findings must be cleared before monthly certificates can be digitally signed.'
                        : 'Ready for monthly certification.'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Executive Summary
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-3 leading-relaxed">
                        {dashboard.executiveSummary}
                      </p>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-2">
                      Average Active Document Age: {dashboard.averageAgeDays} Days
                    </p>
                  </div>
                </div>

                {/* Risk Heatmap & Groupings */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Distribution charts */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                      Classification &amp; Country Spread
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                          Active Documents by Classification
                        </p>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={dashboard.docsByClassification}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={65}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {dashboard.docsByClassification.map((entry, idx) => (
                                  <Cell
                                    key={`cell-${idx}`}
                                    fill={
                                      CLASSIFICATION_COLORS[
                                        entry.name as keyof typeof CLASSIFICATION_COLORS
                                      ] ?? '#94a3b8'
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => [`${v} documents`, 'Count']} />
                              <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                          Record Type Spread
                        </p>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboard.docsByRecordType} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" hide />
                              <YAxis
                                dataKey="name"
                                type="category"
                                width={90}
                                tick={{ fontSize: 10 }}
                              />
                              <Tooltip />
                              <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Heatmap Matrix */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                      Audit Risk Matrix
                    </h3>
                    <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-center">
                        <p className="text-2xl font-black text-slate-600">
                          {dashboard.riskHeatmap.low}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          Low Severity
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex flex-col justify-center">
                        <p className="text-2xl font-black text-amber-700">
                          {dashboard.riskHeatmap.medium}
                        </p>
                        <p className="text-[10px] font-bold text-amber-500 uppercase mt-1">
                          Medium Risk
                        </p>
                      </div>
                      <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex flex-col justify-center">
                        <p className="text-2xl font-black text-rose-700">
                          {dashboard.riskHeatmap.high}
                        </p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">
                          High Severity
                        </p>
                      </div>
                      <div className="rounded-xl bg-red-100 border border-red-200 p-4 flex flex-col justify-center">
                        <p className="text-2xl font-black text-red-700">
                          {dashboard.riskHeatmap.critical}
                        </p>
                        <p className="text-[10px] font-bold text-red-600 uppercase mt-1">
                          CRITICAL Risk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Bottom Workspace Container (Compliance Workspaces) ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-6">
              {/* Tab Navigation */}
              <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 gap-1 p-0.5">
                <TabButton
                  active={activeTab === 'schedule'}
                  onClick={() => setActiveTab('schedule')}
                  label="Retention Schedules"
                  icon={Calendar}
                />
                <TabButton
                  active={activeTab === 'documents'}
                  onClick={() => setActiveTab('documents')}
                  label="Document Register"
                  icon={FileText}
                />
                <TabButton
                  active={activeTab === 'holds'}
                  onClick={() => setActiveTab('holds')}
                  label="Litigation Holds"
                  icon={ShieldAlert}
                />
                <TabButton
                  active={activeTab === 'disposal'}
                  onClick={() => setActiveTab('disposal')}
                  label="Disposal Queue"
                  icon={Trash2}
                />
                <TabButton
                  active={activeTab === 'audit'}
                  onClick={() => setActiveTab('audit')}
                  label="Audit & Findings"
                  icon={ClipboardCheck}
                />
                <TabButton
                  active={activeTab === 'certificates'}
                  onClick={() => setActiveTab('certificates')}
                  label="Monthly Certificates"
                  icon={Award}
                />
              </div>

              {/* Tab Workspace Panel (Padded) */}
              <div className="p-6">
                {/* TAB 1: RETENTION SCHEDULES */}
                {activeTab === 'schedule' && (
                  <div className="space-y-4">
                    {/* Header Controls & Export */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          Configure default legal policy durations
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Total Schedules: {filteredSchedules.length} policies
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCSVExport(schedules, 'Retention_Schedules')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                        >
                          <Download className="h-3.5 w-3.5 text-slate-500" />
                          Export CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddSchedule(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                        >
                          <Plus className="h-3 w-3" />
                          Create Schedule
                        </button>
                      </div>
                    </div>

                    {/* Schedules Table */}
                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                          <tr>
                            <SortableHeader
                              field="countryCode"
                              label="Country"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="recordType"
                              label="Record Type"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="retentionYears"
                              label="Retention Duration"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="classification"
                              label="Classification"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="basis"
                              label="Regulatory Law Basis"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="effectiveFrom"
                              label="Effective Date"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="status"
                              label="Status"
                              currentField={scheduleSortField}
                              order={scheduleSortOrder}
                              onSort={(f) => {
                                setScheduleSortField(f);
                                setScheduleSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedSchedules.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-800">
                                  {getCountryName(row.countryCode)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <code className="text-xs font-mono bg-slate-100 rounded px-1.5 py-0.5">
                                  {row.recordType}
                                </code>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-700">
                                {row.retentionYears} Years
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    row.classification === 'PUBLIC'
                                      ? 'bg-slate-100 text-slate-600'
                                      : row.classification === 'INTERNAL'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row.classification === 'CONFIDENTIAL'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {row.classification}
                                </span>
                              </td>
                              <td
                                className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate"
                                title={row.basis ?? ''}
                              >
                                {row.basis ?? 'None'}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {row.effectiveFrom?.slice(0, 10)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                                  🟢 {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {paginatedSchedules.length === 0 && (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-12 text-center text-slate-400 text-xs"
                              >
                                No schedules configured.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <TablePagination
                      total={filteredSchedules.length}
                      page={schedulePage}
                      rowsPerPage={scheduleRowsPerPage}
                      onPageChange={setSchedulePage}
                      onRowsPerPageChange={setScheduleRowsPerPage}
                    />
                  </div>
                )}

                {/* TAB 2: DOCUMENT REGISTER */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    {/* Advanced Filters */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1 flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-3 py-1.5">
                          <Search className="h-4 w-4 text-slate-400" />
                          <input
                            placeholder="Search employee names, titles, codes or departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-sm text-slate-700 placeholder-slate-400"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCSVExport(filteredDocuments, 'Documents_Registry')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-350 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-500" />
                            Export List
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddDoc(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                          >
                            <Plus className="h-3 w-3" />
                            Upload Document
                          </button>
                        </div>
                      </div>

                      {/* Filter Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Country
                          </label>
                          <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Countries</option>
                            <option value="AE">UAE</option>
                            <option value="SA">Saudi Arabia</option>
                            <option value="BH">Bahrain</option>
                            <option value="QA">Qatar</option>
                            <option value="KW">Kuwait</option>
                            <option value="OM">Oman</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Classification
                          </label>
                          <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Levels</option>
                            <option value="PUBLIC">PUBLIC</option>
                            <option value="INTERNAL">INTERNAL</option>
                            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                            <option value="RESTRICTED">RESTRICTED</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Record Type
                          </label>
                          <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Types</option>
                            <option value="CONTRACT">CONTRACT</option>
                            <option value="PASSPORT">PASSPORT</option>
                            <option value="VISA">VISA</option>
                            <option value="NATIONAL_ID">NATIONAL ID</option>
                            <option value="TAX">TAX</option>
                            <option value="MEDICAL">MEDICAL</option>
                            <option value="WARNING">WARNING</option>
                            <option value="CERTIFICATE">CERTIFICATE</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Department
                          </label>
                          <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Departments</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Finance">Finance</option>
                            <option value="Sales">Sales</option>
                            <option value="HR Operations">HR Operations</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Compliance Status
                          </label>
                          <select
                            value={docStatusFilter}
                            onChange={(e) => setDocStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">🟢 Active</option>
                            <option value="EXPIRED">🔴 Expired</option>
                            <option value="EXPIRING_SOON">🟠 Expiring Soon</option>
                            <option value="ARCHIVED">⚫ Archived</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Hold Status
                          </label>
                          <select
                            value={holdFilter}
                            onChange={(e) => setHoldFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Holds</option>
                            <option value="HELD">🔒 On Hold</option>
                            <option value="FREE">🔓 No Hold</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Expiry Horizon
                          </label>
                          <select
                            value={expiryDaysFilter}
                            onChange={(e) => setExpiryDaysFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-750 font-semibold"
                          >
                            <option value="ALL">All Expiries</option>
                            <option value="30">Expiring ≤30 days</option>
                            <option value="60">Expiring ≤60 days</option>
                            <option value="90">Expiring ≤90 days</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="w-full rounded-lg border border-slate-200 bg-white hover:bg-slate-50 py-1.5 text-xs font-bold text-slate-600 transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>

                      {/* Active Badges */}
                      <ActiveFilterBadges
                        filters={[
                          { label: 'Country', val: countryFilter },
                          { label: 'Class', val: classFilter },
                          { label: 'Type', val: typeFilter },
                          { label: 'Dept', val: deptFilter },
                          { label: 'Status', val: docStatusFilter },
                          { label: 'Hold', val: holdFilter },
                          { label: 'Expiry', val: expiryDaysFilter },
                        ]}
                        onClear={handleClearFilters}
                      />
                    </div>

                    {/* Table stats strip */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Filtered Results: {filteredDocuments.length} Documents</span>
                      <span>Total Registered: {documents.length} Records</span>
                    </div>

                    {/* Bulk Action Panel */}
                    {selectedDocIds.length > 0 && (
                      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 shadow-sm animate-pulse">
                        <span className="text-xs font-bold text-indigo-900">
                          Selected {selectedDocIds.length} Documents
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleBulkArchive}
                            className="rounded-lg bg-white border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100"
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkHold}
                            className="rounded-lg bg-white border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100"
                          >
                            Apply hold lock
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkDisposalRequest}
                            className="rounded-lg bg-indigo-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-800"
                          >
                            Request Disposal
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDocIds([])}
                            className="text-xs font-semibold text-slate-500 px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Document Registry Table */}
                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3 w-8">
                              <button type="button" onClick={handleSelectAllDocs}>
                                {paginatedDocuments.every((d) => selectedDocIds.includes(d.id)) ? (
                                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400" />
                                )}
                              </button>
                            </th>
                            <SortableHeader
                              field="employeeId"
                              label="Employee"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="recordType"
                              label="Record Type"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="title"
                              label="Document Title"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="classification"
                              label="Classification"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="expiresAt"
                              label="Expiry Date"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="retentionUntil"
                              label="Retention Until"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="litigationHoldId"
                              label="Litigation Hold"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="status"
                              label="Status"
                              currentField={docSortField}
                              order={docSortOrder}
                              onSort={(f) => {
                                setDocSortField(f);
                                setDocSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedDocuments.map((row) => {
                            const isExpired = row.retentionUntil
                              ? new Date(row.retentionUntil) < new Date()
                              : false;
                            const isChecked = selectedDocIds.includes(row.id);
                            return (
                              <tr
                                key={row.id}
                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}
                              >
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSelectDoc(row.id)}
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-slate-400" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-4 py-3" onClick={() => setSelectedDoc(row)}>
                                  <span className="font-bold text-slate-800">
                                    {getEmployeeName(row.employeeId)}
                                  </span>
                                </td>
                                <td className="px-4 py-3" onClick={() => setSelectedDoc(row)}>
                                  <code className="text-xs font-mono bg-slate-100 rounded px-1.5 py-0.5">
                                    {row.recordType}
                                  </code>
                                </td>
                                <td
                                  className="px-4 py-3 font-semibold text-slate-800"
                                  onClick={() => setSelectedDoc(row)}
                                >
                                  {row.title}
                                </td>
                                <td className="px-4 py-3" onClick={() => setSelectedDoc(row)}>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                      row.classification === 'PUBLIC'
                                        ? 'bg-slate-100 text-slate-600'
                                        : row.classification === 'INTERNAL'
                                          ? 'bg-blue-100 text-blue-800'
                                          : row.classification === 'CONFIDENTIAL'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {row.classification}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-3 text-xs text-slate-600"
                                  onClick={() => setSelectedDoc(row)}
                                >
                                  {row.expiresAt ? (
                                    row.expiresAt.slice(0, 10)
                                  ) : (
                                    <span className="text-slate-400">No Expiry</span>
                                  )}
                                </td>
                                <td
                                  className="px-4 py-3 text-xs font-bold text-indigo-700"
                                  onClick={() => setSelectedDoc(row)}
                                >
                                  {row.retentionUntil ? row.retentionUntil.slice(0, 10) : 'None'}
                                </td>
                                <td className="px-4 py-3" onClick={() => setSelectedDoc(row)}>
                                  {row.litigationHoldId ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-800">
                                      <Lock className="h-3 w-3" /> HELD
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs">None</span>
                                  )}
                                </td>
                                <td className="px-4 py-3" onClick={() => setSelectedDoc(row)}>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                      isExpired
                                        ? 'bg-rose-100 text-rose-850 border border-rose-200'
                                        : row.status === 'ACTIVE'
                                          ? 'bg-emerald-100 text-emerald-850 border border-emerald-250'
                                          : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {isExpired
                                      ? '🔴 Expired'
                                      : row.status === 'ACTIVE'
                                        ? '🟢 Active'
                                        : '⚫ ' + row.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredDocuments.length === 0 && (
                            <tr>
                              <td
                                colSpan={9}
                                className="px-4 py-12 text-center text-slate-400 text-xs"
                              >
                                No records found in Document Registry matching current filter scope.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <TablePagination
                      total={filteredDocuments.length}
                      page={docPage}
                      rowsPerPage={docRowsPerPage}
                      onPageChange={setDocPage}
                      onRowsPerPageChange={setDocRowsPerPage}
                    />
                  </div>
                )}

                {/* TAB 3: LITIGATION HOLDS */}
                {activeTab === 'holds' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          Active legal preservation filters blocking disposal workflows
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Total Holds: {holds.length} cases
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCSVExport(holds, 'Litigation_Holds')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-350 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5 text-slate-500" />
                          Export CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowStartHold(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                        >
                          <Plus className="h-3 w-3" />
                          Initiate Hold Lock
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                          <tr>
                            <SortableHeader
                              field="caseNumber"
                              label="Case ID"
                              currentField={holdSortField}
                              order={holdSortOrder}
                              onSort={(f) => {
                                setHoldSortField(f);
                                setHoldSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="subject"
                              label="Subject / Matter"
                              currentField={holdSortField}
                              order={holdSortOrder}
                              onSort={(f) => {
                                setHoldSortField(f);
                                setHoldSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <th>Scope / Employee</th>
                            <SortableHeader
                              field="heldDocCount"
                              label="Locked Docs"
                              currentField={holdSortField}
                              order={holdSortOrder}
                              onSort={(f) => {
                                setHoldSortField(f);
                                setHoldSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="startedAt"
                              label="Initiated At"
                              currentField={holdSortField}
                              order={holdSortOrder}
                              onSort={(f) => {
                                setHoldSortField(f);
                                setHoldSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="status"
                              label="Status"
                              currentField={holdSortField}
                              order={holdSortOrder}
                              onSort={(f) => {
                                setHoldSortField(f);
                                setHoldSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <th className="px-4 py-3 text-right font-bold uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedHolds.map((hold) => (
                            <tr key={hold.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-800">{hold.caseNumber}</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {hold.subject}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                                {hold.scopeFilter?.recordType ? (
                                  <span className="block">Type: {hold.scopeFilter.recordType}</span>
                                ) : null}
                                {hold.scopeFilter?.employeeId ? (
                                  <span className="block font-bold text-indigo-700">
                                    Employee: {getEmployeeName(hold.scopeFilter.employeeId)}
                                  </span>
                                ) : null}
                                {hold.scopeFilter?.documentIds ? (
                                  <span className="block text-[10px] text-slate-500 font-mono">
                                    Bulk Selected: {hold.scopeFilter.documentIds.length} files
                                  </span>
                                ) : null}
                                {!hold.scopeFilter?.recordType &&
                                !hold.scopeFilter?.employeeId &&
                                !hold.scopeFilter?.documentIds ? (
                                  <span className="text-slate-400">Global Corporate Scope</span>
                                ) : null}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-700">
                                {hold.heldDocCount} files
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {hold.startedAt?.slice(0, 10)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black ${
                                    hold.status === 'ACTIVE'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {hold.status === 'ACTIVE' ? '🔴 Active Lock' : '⚪ Released'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {hold.status === 'ACTIVE' && (
                                  <button
                                    type="button"
                                    onClick={() => setShowReleaseHoldConfirm(hold)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all"
                                  >
                                    <Unlock className="h-3 w-3" /> Release Hold
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {holds.length === 0 && (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-12 text-center text-slate-400 text-xs"
                              >
                                No active litigation hold preservations in effect.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <TablePagination
                      total={filteredHolds.length}
                      page={holdPage}
                      rowsPerPage={holdRowsPerPage}
                      onPageChange={setHoldPage}
                      onRowsPerPageChange={setHoldRowsPerPage}
                    />
                  </div>
                )}

                {/* TAB 4: DISPOSAL QUEUE */}
                {activeTab === 'disposal' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          Approved disposal queue for expired/archived files
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Disposal Requests: {disposals.length} logs
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCSVExport(disposals, 'Disposal_Queue')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-350 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5 text-slate-500" />
                          Export CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateDisposal(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                        >
                          <Plus className="h-3 w-3" />
                          Request Disposal
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                          <tr>
                            <SortableHeader
                              field="requestedAt"
                              label="Requested At"
                              currentField={disposalSortField}
                              order={disposalSortOrder}
                              onSort={(f) => {
                                setDisposalSortField(f);
                                setDisposalSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <th>Documents Target</th>
                            <SortableHeader
                              field="reason"
                              label="Disposal Justification"
                              currentField={disposalSortField}
                              order={disposalSortOrder}
                              onSort={(f) => {
                                setDisposalSortField(f);
                                setDisposalSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="status"
                              label="Status"
                              currentField={disposalSortField}
                              order={disposalSortOrder}
                              onSort={(f) => {
                                setDisposalSortField(f);
                                setDisposalSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <th>Gating Block Reason</th>
                            <th className="px-4 py-3 text-right font-bold uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedDisposals.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {req.requestedAt?.slice(0, 10)}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                                <p className="font-bold">{req.documentIds.length} Documents</p>
                                <ul className="list-disc pl-3 text-[10px] text-slate-500 mt-1 space-y-0.5">
                                  {req.documentIds.slice(0, 2).map((id, index) => (
                                    <li key={index} className="truncate max-w-[200px]">
                                      {getDocumentTitle(id)}
                                    </li>
                                  ))}
                                  {req.documentIds.length > 2 && (
                                    <li className="font-bold text-indigo-600">
                                      +{req.documentIds.length - 2} More
                                    </li>
                                  )}
                                </ul>
                              </td>
                              <td
                                className="px-4 py-3 text-slate-600 max-w-xs truncate"
                                title={req.reason}
                              >
                                {req.reason}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    req.status === 'PENDING'
                                      ? 'bg-amber-105 bg-amber-50 text-amber-800 border border-amber-200'
                                      : req.status === 'APPROVED'
                                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                        : req.status === 'EXECUTED'
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {req.status === 'PENDING'
                                    ? '🟡 Pending Approval'
                                    : req.status === 'APPROVED'
                                      ? '🔵 Approved'
                                      : req.status === 'EXECUTED'
                                        ? '🟢 Executed (Purged)'
                                        : '🔴 Blocked'}
                                </span>
                              </td>
                              <td
                                className="px-4 py-3 text-xs text-rose-700 font-semibold max-w-sm whitespace-normal break-words"
                                title={req.blockedReason ?? ''}
                              >
                                {resolveReasonText(req.blockedReason)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex gap-2.5 justify-end">
                                  {req.status === 'PENDING' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveDisposal(req.id)}
                                      disabled={rowActionLoading !== null}
                                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm transition-all inline-flex items-center gap-1.5"
                                    >
                                      {rowActionLoading === req.id && (
                                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                                      )}
                                      {rowActionLoading === req.id ? 'Approving...' : 'Approve'}
                                    </button>
                                  )}
                                  {req.status === 'APPROVED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleExecuteDisposal(req.id)}
                                      disabled={rowActionLoading !== null}
                                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all inline-flex items-center gap-1.5"
                                    >
                                      {rowActionLoading === req.id && (
                                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                                      )}
                                      {rowActionLoading === req.id
                                        ? 'Executing...'
                                        : 'Execute Purge'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {disposals.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-12 text-center text-slate-400 text-xs"
                              >
                                No disposal requests registered in review pipeline.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <TablePagination
                      total={filteredDisposals.length}
                      page={disposalPage}
                      rowsPerPage={disposalRowsPerPage}
                      onPageChange={setDisposalPage}
                      onRowsPerPageChange={setDisposalRowsPerPage}
                    />
                  </div>
                )}

                {/* TAB 5: AUDIT CYCLES & FINDINGS */}
                {activeTab === 'audit' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Left cycle plans panel */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Audit Cycles
                          </h3>
                          <p className="text-[10px] text-slate-400">Manage compliance checks</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowOpenAudit(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New Cycle
                        </button>
                      </div>

                      <div className="space-y-3">
                        {auditCycles.map((c) => {
                          const pct =
                            c.sampleSize > 0
                              ? Math.round((c.findingsClosedCount / c.sampleSize) * 100)
                              : 0;
                          return (
                            <div
                              key={c.id}
                              onClick={() => setSelectedCycleId(c.id)}
                              className={`rounded-2xl border p-4 cursor-pointer transition-all shadow-sm ${
                                selectedCycleId === c.id
                                  ? 'border-slate-800 bg-white ring-1 ring-slate-800'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-sm">{c.label}</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                    c.status === 'OPEN'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>

                              {/* Progress bar preview */}
                              <div className="space-y-1 my-3">
                                <div className="flex justify-between text-[10px] text-slate-550 font-bold">
                                  <span>Sample Audit Progress</span>
                                  <span>
                                    {c.findingsClosedCount} / {c.sampleSize} Verified
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600"
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3">
                                <div className="bg-slate-50 rounded-lg p-1.5">
                                  <p className="font-bold text-slate-700">{c.sampleSize}</p>
                                  <p className="text-[9px] text-slate-400 uppercase">Sample</p>
                                </div>
                                <div className="bg-rose-50 rounded-lg p-1.5">
                                  <p className="font-bold text-rose-700">{c.findingsCount}</p>
                                  <p className="text-[9px] text-rose-450 uppercase">Raised</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-1.5">
                                  <p className="font-bold text-emerald-700">
                                    {c.findingsClosedCount}
                                  </p>
                                  <p className="text-[9px] text-emerald-450 uppercase">Closed</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                                <span>Started: {c.startedAt?.slice(0, 10)}</span>
                                {c.status === 'OPEN' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseAudit(c.id);
                                    }}
                                    className="text-emerald-700 hover:underline font-bold"
                                  >
                                    Close Cycle
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {auditCycles.length === 0 && (
                          <p className="text-center text-xs text-slate-400 py-12">
                            No audit plans created.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right findings panel */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Findings Raised ({findings.length})
                          </h3>
                          <p className="text-[10px] text-slate-400">
                            Track and remediate audit checklist failures
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCSVExport(findings, 'Audit_Findings')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-350 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-500" />
                            CSV
                          </button>
                          {selectedCycleId && (
                            <button
                              type="button"
                              onClick={() => {
                                const cycle = auditCycles.find((c) => c.id === selectedCycleId);
                                if (cycle?.status !== 'OPEN') {
                                  toast.error(
                                    'Audit cycle is closed. Reopen or select an active cycle.'
                                  );
                                  return;
                                }
                                setShowRaiseFinding(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Log CAPA Issue
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-150 rounded-xl bg-white">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                            <tr>
                              <SortableHeader
                                field="severity"
                                label="Severity"
                                currentField={findingSortField}
                                order={findingSortOrder}
                                onSort={(f) => {
                                  setFindingSortField(f);
                                  setFindingSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                                }}
                              />
                              <SortableHeader
                                field="category"
                                label="Category"
                                currentField={findingSortField}
                                order={findingSortOrder}
                                onSort={(f) => {
                                  setFindingSortField(f);
                                  setFindingSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                                }}
                              />
                              <SortableHeader
                                field="title"
                                label="Finding Title"
                                currentField={findingSortField}
                                order={findingSortOrder}
                                onSort={(f) => {
                                  setFindingSortField(f);
                                  setFindingSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                                }}
                              />
                              <th>Target Scope</th>
                              <SortableHeader
                                field="status"
                                label="Status"
                                currentField={findingSortField}
                                order={findingSortOrder}
                                onSort={(f) => {
                                  setFindingSortField(f);
                                  setFindingSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                                }}
                              />
                              <th className="px-4 py-3 text-right font-bold uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedFindings.map((f) => (
                              <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black ${
                                      f.severity === 'CRITICAL'
                                        ? 'bg-red-200 text-red-900'
                                        : f.severity === 'HIGH'
                                          ? 'bg-rose-100 text-rose-800'
                                          : f.severity === 'MEDIUM'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {f.severity}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-655 text-xs">
                                  {f.category}
                                </td>
                                <td className="px-4 py-3 text-slate-800">
                                  <p className="font-semibold text-sm">{f.title}</p>
                                  {f.description && (
                                    <p className="text-xs text-slate-450 mt-0.5">{f.description}</p>
                                  )}
                                  {/* Findings timeline step preview */}
                                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                      CAPA Workflow Stages
                                    </p>
                                    <FindingsTimeline
                                      status={f.status}
                                      remediation={f.remediation}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                                  {f.documentId ? (
                                    <p className="text-indigo-750">
                                      Doc: {getDocumentTitle(f.documentId)}
                                    </p>
                                  ) : null}
                                  {f.employeeId ? (
                                    <p className="text-slate-500">
                                      Employee: {getEmployeeName(f.employeeId)}
                                    </p>
                                  ) : null}
                                  {!f.documentId && !f.employeeId ? 'None' : null}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                      f.status === 'CLOSED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {f.status === 'CLOSED' ? '🟢 Closed' : '🔴 Open'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {f.status === 'OPEN' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCloseFinding(f.id)}
                                      disabled={rowActionLoading !== null}
                                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all inline-flex items-center gap-1.5"
                                    >
                                      {rowActionLoading === f.id && (
                                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                                      )}
                                      {rowActionLoading === f.id
                                        ? 'Remediating...'
                                        : 'Remediate Issue'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {findings.length === 0 && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-12 text-center text-slate-400 text-xs"
                                >
                                  No findings raised for this audit cycle.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Footer */}
                      <TablePagination
                        total={filteredFindings.length}
                        page={auditPage}
                        rowsPerPage={auditRowsPerPage}
                        onPageChange={setAuditPage}
                        onRowsPerPageChange={setAuditRowsPerPage}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 6: MONTHLY CERTIFICATES */}
                {activeTab === 'certificates' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          Attestations signed by governance officers
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Certificates History: {certificates.length} months
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCSVExport(certificates, 'Compliance_Certificates')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-350 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5 text-slate-500" />
                          Export CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateCertificate}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                        >
                          {actionLoading ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Generate Monthly Certificate
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-150 rounded-xl">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                          <tr>
                            <SortableHeader
                              field="period"
                              label="Attestation Period"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="status"
                              label="Status"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="activeDocs"
                              label="Active Files"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="expiredCount"
                              label="Expired"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="litigationHoldCount"
                              label="On Hold"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="pendingDisposalCount"
                              label="Pending Disposal"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <SortableHeader
                              field="criticalFindingsCount"
                              label="Critical CAPA"
                              currentField={certSortField}
                              order={certSortOrder}
                              onSort={(f) => {
                                setCertSortField(f);
                                setCertSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                              }}
                            />
                            <th>Gating Blockers</th>
                            <th className="px-4 py-3 text-right font-bold uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedCertificates.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-black text-slate-900 text-sm">
                                  {c.period}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black ${
                                    c.status === 'SIGNED'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : c.status === 'BLOCKED'
                                        ? 'bg-rose-105 bg-rose-50 text-rose-800 border border-rose-200'
                                        : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {c.status === 'SIGNED'
                                    ? '🟢 Signed'
                                    : c.status === 'BLOCKED'
                                      ? '🔴 Blocked'
                                      : '⚪ Draft'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-700">
                                {c.activeDocs}
                              </td>
                              <td className="px-4 py-3 font-bold text-rose-600">
                                {c.expiredCount}
                              </td>
                              <td className="px-4 py-3 font-bold text-indigo-700">
                                {c.litigationHoldCount}
                              </td>
                              <td className="px-4 py-3 font-bold text-amber-700">
                                {c.pendingDisposalCount}
                              </td>
                              <td className="px-4 py-3 font-bold text-rose-700">
                                {c.criticalFindingsCount}
                              </td>
                              <td
                                className="px-4 py-3 text-xs text-rose-700 font-semibold max-w-sm whitespace-normal break-words"
                                title={c.gatingReason ?? ''}
                              >
                                {c.gatingReason ? (
                                  resolveReasonText(c.gatingReason)
                                ) : (
                                  <span className="text-emerald-600 font-bold">✓ Clear</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewCert(c)}
                                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                  >
                                    Preview Attestation
                                  </button>
                                  {c.status === 'DRAFT' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (c.gatingReason) {
                                          toast.error(
                                            `Blocked by gating reasons: ${c.gatingReason}`
                                          );
                                          return;
                                        }
                                        setShowSignCert(c);
                                      }}
                                      disabled={!!c.gatingReason}
                                      className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all ${
                                        c.gatingReason
                                          ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                          : 'bg-emerald-600 hover:bg-emerald-500'
                                      }`}
                                    >
                                      Sign
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {certificates.length === 0 && (
                            <tr>
                              <td
                                colSpan={9}
                                className="px-4 py-12 text-center text-slate-400 text-xs"
                              >
                                No monthly certifications recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <TablePagination
                      total={filteredCertificates.length}
                      page={certPage}
                      rowsPerPage={certRowsPerPage}
                      onPageChange={setCertPage}
                      onRowsPerPageChange={setCertRowsPerPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── OVERLAYS, MODALS AND DRAWER DETAILS ─── */}

      {/* Slide-over Details Drawer */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoc(null)}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 rounded px-1.5 py-0.5 uppercase">
                      {selectedDoc.recordType}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{selectedDoc.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <DrawerField label="Document ID" value={selectedDoc.id} isCode />
                  <DrawerField
                    label="Employee Full Name"
                    value={getEmployeeName(selectedDoc.employeeId)}
                  />
                  <DrawerField
                    label="Classification"
                    value={selectedDoc.classification}
                    tooltip="Regulatory data security tier"
                  />
                  <DrawerField
                    label="Issue Date"
                    value={selectedDoc.issuedAt?.slice(0, 10) ?? 'None'}
                  />
                  <DrawerField
                    label="Expiry Date"
                    value={selectedDoc.expiresAt ? selectedDoc.expiresAt.slice(0, 10) : 'No Expiry'}
                  />
                  <DrawerField
                    label="Governed Retention Until"
                    value={selectedDoc.retentionUntil?.slice(0, 10) ?? 'None'}
                    isHigh
                    tooltip="Date after which document can be securely disposed of under policy"
                  />
                  <DrawerField
                    label="Storage File Path"
                    value={selectedDoc.fileUrl ?? 'None'}
                    isCode
                  />
                  <DrawerField label="Upload State" value={selectedDoc.status} />

                  {selectedDoc.litigationHoldId && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
                      <Lock className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-800">Litigation Hold Active</p>
                        <p className="text-[10px] text-red-700 mt-0.5">
                          This document is frozen in a pending case and cannot be disposed of under
                          any circumstances.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDisposalForm((f) => ({ ...f, documentIds: [selectedDoc.id] }));
                    setShowCreateDisposal(true);
                  }}
                  disabled={!!selectedDoc.litigationHoldId}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash className="h-4 w-4" /> Request Disposal
                </button>
                <button
                  type="button"
                  onClick={() => handleSoftDeleteDoc(selectedDoc.id)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Archive Record
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE RETENTION POLICY MODAL */}
      <DialogOverlay open={showAddSchedule} onClose={() => setShowAddSchedule(false)}>
        <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Create Retention Policy
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Country Jurisdiction
              </label>
              <select
                value={scheduleForm.countryCode}
                onChange={(e) => setScheduleForm((f) => ({ ...f, countryCode: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Global Default</option>
                <option value="AE">UAE</option>
                <option value="SA">Saudi Arabia</option>
                <option value="BH">Bahrain</option>
                <option value="QA">Qatar</option>
                <option value="KW">Kuwait</option>
                <option value="OM">Oman</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Record Type
              </label>
              <select
                value={scheduleForm.recordType}
                onChange={(e) => setScheduleForm((f) => ({ ...f, recordType: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="CONTRACT">Employment Contract</option>
                <option value="PASSPORT">Passport Copy</option>
                <option value="VISA">Visa</option>
                <option value="NATIONAL_ID">National ID</option>
                <option value="PAYROLL">Payroll Record</option>
                <option value="TAX">Tax Documents</option>
                <option value="MEDICAL">Medical Record</option>
                <option value="WARNING">Warning Letter</option>
                <option value="CERTIFICATE">Training Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Retention Duration (Years)
              </label>
              <input
                type="number"
                value={scheduleForm.retentionYears}
                onChange={(e) =>
                  setScheduleForm((f) => ({ ...f, retentionYears: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Classification
              </label>
              <select
                value={scheduleForm.classification}
                onChange={(e) => setScheduleForm((f) => ({ ...f, classification: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                {['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Regulatory Law Basis
            </label>
            <input
              placeholder="e.g. UAE Labour Law Art. 53"
              value={scheduleForm.basis}
              onChange={(e) => setScheduleForm((f) => ({ ...f, basis: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddSchedule(false)}
              className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              {actionLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              )}
              {actionLoading ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </DialogOverlay>

      {/* UPLOAD DOCUMENT REGISTER MODAL */}
      <DialogOverlay open={showAddDoc} onClose={() => setShowAddDoc(false)}>
        <form
          onSubmit={handleCreateDocument}
          className="p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Register Governed Document
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Select Employee
              </label>
              <select
                value={docForm.employeeId}
                onChange={(e) => setDocForm((f) => ({ ...f, employeeId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select Employee Name</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Record Type
              </label>
              <select
                value={docForm.recordType}
                onChange={(e) => setDocForm((f) => ({ ...f, recordType: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="CONTRACT">Employment Contract</option>
                <option value="PASSPORT">Passport Copy</option>
                <option value="VISA">Visa</option>
                <option value="NATIONAL_ID">National ID</option>
                <option value="PAYROLL">Payroll Record</option>
                <option value="TAX">Tax Documents</option>
                <option value="MEDICAL">Medical Record</option>
                <option value="WARNING">Warning Letter</option>
                <option value="CERTIFICATE">Training Certificate</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Document Title
              </label>
              <input
                placeholder="e.g. Standard Employment Contract"
                value={docForm.title}
                onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Issued At
              </label>
              <input
                type="date"
                value={docForm.issuedAt}
                onChange={(e) => setDocForm((f) => ({ ...f, issuedAt: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Expires At (Optional)
              </label>
              <input
                type="date"
                value={docForm.expiresAt}
                onChange={(e) => setDocForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Classification Override
              </label>
              <select
                value={docForm.classification}
                onChange={(e) => setDocForm((f) => ({ ...f, classification: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                {['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Country
              </label>
              <select
                value={docForm.countryCode}
                onChange={(e) => setDocForm((f) => ({ ...f, countryCode: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="AE">UAE</option>
                <option value="SA">Saudi Arabia</option>
                <option value="BH">Bahrain</option>
                <option value="QA">Qatar</option>
                <option value="KW">Kuwait</option>
                <option value="OM">Oman</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Department
              </label>
              <input
                placeholder="HR Operations, Finance"
                value={docForm.department}
                onChange={(e) => setDocForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                File Storage Path URL
              </label>
              <input
                placeholder="s3://..."
                value={docForm.fileUrl}
                onChange={(e) => setDocForm((f) => ({ ...f, fileUrl: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddDoc(false)}
              className="rounded-lg border border-slate-355 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              {actionLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              )}
              {actionLoading ? 'Committing...' : 'Commit File'}
            </button>
          </div>
        </form>
      </DialogOverlay>

      {/* START LITIGATION HOLD LOCK */}
      <DialogOverlay open={showStartHold} onClose={() => setShowStartHold(false)}>
        <form onSubmit={handleStartHold} className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Initiate Preservation Hold Lock
          </h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Case / Matter Number
            </label>
            <input
              placeholder="e.g. CASE-2024-88A"
              value={holdForm.caseNumber}
              onChange={(e) =>
                setHoldForm((f) => ({ ...f, caseNumber: e.target.value.toUpperCase() }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Legal Hold Subject Description
            </label>
            <input
              placeholder="e.g. Labor Arbitration Dispute"
              value={holdForm.subject}
              onChange={(e) => setHoldForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Scope: Record Type
              </label>
              <input
                placeholder="CONTRACT (optional)"
                value={holdForm.recordType}
                onChange={(e) =>
                  setHoldForm((f) => ({ ...f, recordType: e.target.value.toUpperCase() }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Scope: Target Employee
              </label>
              <select
                value={holdForm.employeeId}
                onChange={(e) => setHoldForm((f) => ({ ...f, employeeId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">All Employees (Global)</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowStartHold(false)}
              className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white inline-flex items-center gap-1.5"
            >
              {actionLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              )}
              {actionLoading ? 'Applying...' : 'Apply Preservation Hold'}
            </button>
          </div>
        </form>
      </DialogOverlay>

      {/* CREATE DISPOSAL REQUEST MODAL */}
      <DialogOverlay open={showCreateDisposal} onClose={() => setShowCreateDisposal(false)}>
        <form
          onSubmit={handleRequestDisposal}
          className="p-6 space-y-4 max-h-[90vh] overflow-y-auto w-full max-w-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
              <Trash2 className="h-5 w-5 text-indigo-600" />
              Request Document Disposal
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateDisposal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search/select field */}
          <div className="space-y-1.5 relative">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Select Documents *
            </label>
            <input
              placeholder="Search documents by title, employee name..."
              value={docSearchInput}
              onChange={(e) => setDocSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            {docSearchInput && eligibleDocs.length > 0 && (
              <div className="absolute z-50 w-full max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-xl p-2 space-y-1 mt-1">
                {eligibleDocs.slice(0, 10).map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setDisposalForm((f) => ({ ...f, documentIds: [...f.documentIds, doc.id] }));
                      setDocSearchInput('');
                    }}
                    className="w-full text-left text-xs p-2.5 hover:bg-indigo-50 rounded-lg flex justify-between items-center transition-colors animate-fade-in"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {getEmployeeName(doc.employeeId)} • {doc.recordType}
                      </p>
                    </div>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-mono font-bold">
                      Add
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected documents list */}
          {disposalForm.documentIds.length > 0 ? (
            <div className="space-y-2 border border-slate-150 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Files Selected ({disposalForm.documentIds.length})
              </p>
              <div className="space-y-1.5">
                {disposalForm.documentIds.map((id) => {
                  const doc = documents.find((d) => d.id === id);
                  if (!doc) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{doc.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {getEmployeeName(doc.employeeId)} • {doc.recordType}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDisposalForm((f) => ({
                            ...f,
                            documentIds: f.documentIds.filter((x) => x !== id),
                          }))
                        }
                        className="text-slate-400 hover:text-red-500 font-bold px-1.5 py-0.5 rounded hover:bg-slate-100"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-450 text-xs">
              No files currently selected. Search and add files above or select them in the Document
              Register workspace.
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Reason *
            </label>
            <textarea
              placeholder="Specify the reason or regulatory basis for disposing these files..."
              value={disposalForm.reason}
              onChange={(e) => setDisposalForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              rows={3}
              required
            />
          </div>

          {/* Priority & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Priority
              </label>
              <div className="flex gap-4 items-center mt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="NORMAL"
                    checked={disposalForm.priority === 'NORMAL'}
                    onChange={() => setDisposalForm((f) => ({ ...f, priority: 'NORMAL' }))}
                    className="accent-indigo-600"
                  />
                  Normal
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="URGENT"
                    checked={disposalForm.priority === 'URGENT'}
                    onChange={() => setDisposalForm((f) => ({ ...f, priority: 'URGENT' }))}
                    className="accent-indigo-600"
                  />
                  Urgent
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Requested Disposal Date
              </label>
              <input
                type="date"
                value={disposalForm.requestedDisposalDate}
                onChange={(e) =>
                  setDisposalForm((f) => ({ ...f, requestedDisposalDate: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateDisposal(false)}
              className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-indigo-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-800 inline-flex items-center gap-1.5"
            >
              {actionLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              )}
              {actionLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </DialogOverlay>

      {/* START AUDIT CYCLE MODAL */}
      <DialogOverlay open={showOpenAudit} onClose={() => setShowOpenAudit(false)}>
        <form onSubmit={handleOpenAudit} className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Open Governance Audit Cycle
          </h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Audit Plan Label
            </label>
            <input
              placeholder="e.g. FY2026 Q3 External Auditor Inspection"
              value={auditForm.label}
              onChange={(e) => setAuditForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Random Sample Size
            </label>
            <input
              type="number"
              value={auditForm.sampleSize}
              onChange={(e) => setAuditForm((f) => ({ ...f, sampleSize: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowOpenAudit(false)}
              className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              {actionLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              )}
              {actionLoading ? 'Opening...' : 'Open Cycle'}
            </button>
          </div>
        </form>
      </DialogOverlay>

      {/* RAISE AUDIT FINDING MODAL */}
      <DialogOverlay open={showRaiseFinding} onClose={() => setShowRaiseFinding(false)}>
        <form onSubmit={handleRaiseFinding} className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Log Compliance CAPA Finding
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Finding Severity
              </label>
              <select
                value={findingForm.severity}
                onChange={(e) => setFindingForm((f) => ({ ...f, severity: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Violation Category
              </label>
              <input
                placeholder="RETENTION, MISSING_FILE"
                value={findingForm.category}
                onChange={(e) =>
                  setFindingForm((f) => ({ ...f, category: e.target.value.toUpperCase() }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Finding Title Summary
              </label>
              <input
                placeholder="e.g. Employee Contract missing signed page 3"
                value={findingForm.title}
                onChange={(e) => setFindingForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Description
              </label>
              <textarea
                placeholder="Provide detailed violation observations..."
                value={findingForm.description}
                onChange={(e) => setFindingForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Corrective Action Plan (CAPA)
              </label>
              <textarea
                placeholder="Specify what needs to be fixed to resolve finding..."
                value={findingForm.remediation}
                onChange={(e) => setFindingForm((f) => ({ ...f, remediation: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Target Document
              </label>
              <select
                value={findingForm.documentId}
                onChange={(e) => setFindingForm((f) => ({ ...f, documentId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select Document Scope</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Target Employee
              </label>
              <select
                value={findingForm.employeeId}
                onChange={(e) => setFindingForm((f) => ({ ...f, employeeId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select Employee (optional)</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRaiseFinding(false)}
              className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              {actionLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              )}
              {actionLoading ? 'Raising...' : 'Raise Finding'}
            </button>
          </div>
        </form>
      </DialogOverlay>

      {/* Attestation Checklist / Sign Modal */}
      <DialogOverlay open={showSignCert !== null} onClose={() => setShowSignCert(null)}>
        {showSignCert && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Sign Monthly Attestation
            </h3>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 text-xs text-slate-600">
              <p>
                By signing this certificate, you legally attest to the compliance of all employee
                records, active retention periods, and completed CAPA resolutions for the period{' '}
                <span className="font-bold text-slate-800">{showSignCert.period}</span>.
              </p>
              <p className="font-semibold text-slate-800">Attested Stats:</p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[10px]">
                <li>Active Governed Documents: {showSignCert.activeDocs}</li>
                <li>Expired Documents: {showSignCert.expiredCount}</li>
                <li>Litigation hold preserved files: {showSignCert.litigationHoldCount}</li>
                <li>Unresolved Audit Findings: {showSignCert.openFindingsCount}</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSignCert(null)}
                className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignCertificate}
                disabled={actionLoading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                {actionLoading && (
                  <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                )}
                {actionLoading ? 'Signing...' : 'Confirm Attestation & Sign'}
              </button>
            </div>
          </div>
        )}
      </DialogOverlay>

      {/* PDF PREVIEW MODAL */}
      <DialogOverlay open={previewCert !== null} onClose={() => setPreviewCert(null)}>
        {previewCert && (
          <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                Attestation Attributing Report
              </h3>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-inner font-serif space-y-6 text-sm text-slate-800 leading-relaxed">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold uppercase tracking-wider text-slate-900">
                  Certificate of Compliance
                </h4>
                <p className="text-xs font-mono text-slate-500">Period: {previewCert.period}</p>
                <div className="border-b-2 border-double border-slate-300 w-24 mx-auto my-3" />
              </div>

              <p>
                This certifies that the human resource record archives maintained by{' '}
                <span className="font-bold text-slate-900">KreupAI Technologies</span> for the
                period of <span className="font-bold text-slate-900">{previewCert.period}</span>{' '}
                have been audited for regulatory retention compliance and data sovereignty
                standards.
              </p>

              <div className="bg-slate-50 font-sans text-xs p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-450 uppercase font-bold">Active Governed Files</p>
                  <p className="text-lg font-black text-slate-800">{previewCert.activeDocs}</p>
                </div>
                <div>
                  <p className="text-slate-450 uppercase font-bold">Active Holds preserved</p>
                  <p className="text-lg font-black text-indigo-850">
                    {previewCert.litigationHoldCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-450 uppercase font-bold">Expired Documents</p>
                  <p className="text-lg font-black text-rose-850">{previewCert.expiredCount}</p>
                </div>
                <div>
                  <p className="text-slate-450 uppercase font-bold">Unresolved Findings</p>
                  <p className="text-lg font-black text-slate-800">
                    {previewCert.openFindingsCount}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-150 pt-4">
                <p className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">
                  Attestation Statements
                </p>
                <div className="flex items-start gap-2.5 text-xs font-sans text-slate-600">
                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    All scheduled file disposals were conducted under authorized regulatory
                    guidelines and logged permanently.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-sans text-slate-600">
                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Litigation hold directives were correctly enforced; no frozen records were
                    altered or purged during the period.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs font-sans">
                <div>
                  <p className="text-slate-450 uppercase font-bold">Generated Date</p>
                  <p className="font-semibold">
                    {previewCert.generatedAt ? previewCert.generatedAt.slice(0, 10) : 'None'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-450 uppercase font-bold">Signed Status</p>
                  <p className="font-semibold text-emerald-600">
                    {previewCert.status === 'SIGNED'
                      ? 'Authenticated Digital Signature'
                      : 'Draft / Unsigned'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>
              {previewCert.status === 'DRAFT' && !previewCert.gatingReason && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSignCert(previewCert);
                    setPreviewCert(null);
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
                >
                  Proceed to Sign
                </button>
              )}
            </div>
          </div>
        )}
      </DialogOverlay>

      {/* RELEASE LITIGATION HOLD CONFIRM MODAL */}
      <DialogOverlay
        open={showReleaseHoldConfirm !== null}
        onClose={() => setShowReleaseHoldConfirm(null)}
      >
        {showReleaseHoldConfirm && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Unlock className="h-5 w-5 text-emerald-600" />
              Release Litigation Hold Lock?
            </h3>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2 text-xs text-amber-800">
              <p className="font-bold text-amber-900">
                Warning: This action will release the litigation hold.
              </p>
              <p className="text-slate-700">
                Case Number:{' '}
                <span className="font-mono font-bold text-amber-900">
                  {showReleaseHoldConfirm.caseNumber}
                </span>
              </p>
              <p className="text-slate-700">
                Subject:{' '}
                <span className="font-semibold text-slate-800">
                  {showReleaseHoldConfirm.subject}
                </span>
              </p>
              <p className="text-slate-700">
                Locked Files:{' '}
                <span className="font-semibold text-slate-800">
                  {showReleaseHoldConfirm.heldDocCount} documents
                </span>
              </p>
              <p className="mt-2 text-[10px] text-amber-700 leading-relaxed">
                By confirming, all matched files currently locked under this hold case will be
                thawed and made eligible for automated retention disposal schedules.
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReleaseHoldConfirm(null)}
                className="rounded-lg border border-slate-350 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const caseNum = showReleaseHoldConfirm.caseNumber;
                  setActionLoading(true);
                  try {
                    const res = await fetch(
                      '/api/v1/document-retention-compliance/litigation-holds',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'release', caseNumber: caseNum }),
                      }
                    );
                    const payload = await res.json();
                    if (payload.success) {
                      toast.success('Hold lock successfully released');
                      setShowReleaseHoldConfirm(null);
                      loadHolds();
                      loadDocuments();
                      loadDashboard();
                    } else {
                      toast.error(payload.error?.message ?? 'Release failed');
                    }
                  } catch (e) {
                    toast.error('Network failure');
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                {actionLoading && (
                  <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                )}
                {actionLoading ? 'Releasing...' : 'Confirm Release'}
              </button>
            </div>
          </div>
        )}
      </DialogOverlay>

      {/* RELEASE LITIGATION HOLD CONFIRM MODAL */}
    </main>
  );
}

// ─── HELPER COMPONENTS ───

function TabButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-xs font-bold transition-all ${
        active
          ? 'border-indigo-600 bg-white text-indigo-700'
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function DashboardTile({
  label,
  value,
  type,
  onClick,
  trend,
}: {
  label: string;
  value: number;
  type: 'info' | 'success' | 'warning' | 'danger' | 'indigo';
  onClick: () => void;
  trend?: string;
}) {
  const cls =
    type === 'success'
      ? 'text-emerald-700'
      : type === 'danger'
        ? 'text-rose-700'
        : type === 'warning'
          ? 'text-amber-700'
          : type === 'indigo'
            ? 'text-indigo-750'
            : 'text-slate-900';
  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:border-slate-550 hover:shadow-md transition-all select-none"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${cls}`}>{value}</p>
      {trend && (
        <p className="text-[9px] font-mono text-slate-450 mt-1 flex items-center gap-0.5">
          <span>{trend}</span>
        </p>
      )}
    </div>
  );
}

function DrawerField({
  label,
  value,
  isCode,
  isHigh,
  tooltip,
}: {
  label: string;
  value: string;
  isCode?: boolean;
  isHigh?: boolean;
  tooltip?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        {tooltip && (
          <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600">
            <Info className="h-3 w-3" />
          </span>
        )}
      </div>
      {isCode ? (
        <code className="block mt-1 text-xs font-mono bg-slate-50 border border-slate-100 rounded p-1.5 overflow-x-auto text-slate-700 whitespace-nowrap">
          {value}
        </code>
      ) : (
        <p
          className={`text-sm font-semibold mt-1 ${isHigh ? 'text-indigo-700 font-extrabold' : 'text-slate-805'}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function DialogOverlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {children}
      </div>
    </div>
  );
}

// Custom sortable header
function SortableHeader({
  field,
  label,
  currentField,
  order,
  onSort,
}: {
  field: string;
  label: string;
  currentField: string;
  order: 'asc' | 'desc';
  onSort: (field: string) => void;
}) {
  const active = field === currentField;
  return (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <ArrowUpDown className={`h-3 w-3 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
      </div>
    </th>
  );
}

// Active Filters badge container
function ActiveFilterBadges({
  filters,
  onClear,
}: {
  filters: Array<{ label: string; val: string }>;
  onClear: () => void;
}) {
  const active = filters.filter((f) => f.val !== 'ALL' && f.val !== '');
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-205">
      <span className="text-[10px] font-bold text-slate-400 uppercase">Active filters:</span>
      {active.map((f, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-800"
        >
          {f.label}: {f.val}
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-[10px] font-bold text-red-550 hover:text-red-750 hover:underline"
      >
        × Clear All
      </button>
    </div>
  );
}

// Pagination Footer
function TablePagination({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const startIdx = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIdx = Math.min(page * rowsPerPage, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 font-semibold select-none">
      <div>
        Showing{' '}
        <span className="font-bold text-slate-700">
          {startIdx}–{endIdx}
        </span>{' '}
        of <span className="font-bold text-slate-700">{total}</span> records
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border p-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border p-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Findings Timeline
function FindingsTimeline({ status, remediation }: { status: string; remediation: string | null }) {
  const steps = [
    { label: 'Raised', completed: true },
    { label: 'Assigned', completed: true },
    { label: 'Remediation', completed: !!remediation },
    { label: 'Closed', completed: status === 'CLOSED' },
  ];

  return (
    <div className="flex items-center justify-between w-full relative">
      <div className="absolute top-2 left-4 right-4 h-0.5 bg-slate-200 -z-10" />
      {steps.map((st, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 text-[8px] font-black ${
              st.completed
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-300 text-slate-400'
            }`}
          >
            {i + 1}
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-1">{st.label}</span>
        </div>
      ))}
    </div>
  );
}

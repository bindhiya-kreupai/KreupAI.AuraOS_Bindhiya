'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Sliders,
  AlertTriangle,
  FolderOpen,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  X,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building,
  User,
  Calendar,
  Layers,
  Check,
  Award,
  Users,
} from 'lucide-react';

interface Plan {
  id: string;
  year: number;
  title: string;
  scope: string;
  areasJson: string[];
  ownerRole: string;
  status: string;
  approvedAt: string | null;
  approvedBy: string | null;
  samples?: Sample[];
}

interface Sample {
  id: string;
  area: string;
  method: string;
  populationSize: number;
  sampleSize: number;
  selectionsJson: Array<{ id: string; name: string }>;
  createdAt: string;
}

interface Finding {
  id: string;
  area: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  raisedAt: string;
  correctiveActions: CorrectiveAction[];
}

interface CorrectiveAction {
  id: string;
  findingId: string;
  description: string;
  ownerRole: string;
  dueDate: string;
  status: string;
  closedAt: string | null;
}

interface TestResult {
  id: string;
  area: string;
  testKey: string;
  sampleId: string | null;
  passed: boolean;
  notes: string | null;
  evidenceUrl: string | null;
  performedAt: string;
  performedBy: string | null;
}

interface Review {
  id: string;
  scheduledFor: string;
  period: string;
  status: string;
  openActionsAtTime: number;
  agendaJson: string[];
  notes: string | null;
  completedAt: string | null;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department?: { name: string };
}

const CATEGORY_MAP: Record<string, string> = {
  PAYROLL: 'Payroll Cut-off',
  WPS: 'Wage Protection System',
  SOCIAL_INSURANCE: 'Social Insurance',
  IMMIGRATION: 'Visa & Work Permits',
  NATIONALIZATION: 'Nationalization Target',
  HOLIDAY: 'Holidays & Ramadan',
  BENEFITS: 'Benefits & Insurance',
  HSE: 'HSE & Training',
  EMPLOYEE_RELATIONS: 'Employee Relations',
  DOCUMENT_AUDIT: 'Personnel-File Audit',
};

const ROLE_MAP: Record<string, string> = {
  PAYROLL_OFFICER: 'Payroll Specialist',
  HR_MANAGER: 'HR Operations Manager',
  PRO_OFFICER: 'Public Relations Officer',
  HR_ADMIN: 'HR Administrator',
  COMPLIANCE_OFFICER: 'Chief Compliance Officer',
  INTERNAL_AUDITOR: 'Internal Audit Lead',
  EXECUTIVE_LEADERSHIP: 'Executive Director',
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700' },
  HIGH: { bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-700' },
  MEDIUM: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700' },
  LOW: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700' },
};

export default function AuditPlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plans' | 'scope' | 'findings' | 'reviews'>('plans');

  // Loaded details for the selected plan
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<Plan | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Master Employee list for sampling
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Loader states
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  // Modal / Form input states
  // 1. Plan Form
  const [planYear, setPlanYear] = useState(new Date().getFullYear());
  const [planTitle, setPlanTitle] = useState('Annual HR Compliance Audit Plan');
  const [planScope, setPlanScope] = useState(
    'All active legal entities, payroll, social insurance, and document logs.'
  );
  const [planAreas, setPlanAreas] = useState(
    'PAYROLL, WPS, SOCIAL_INSURANCE, DOCUMENT_AUDIT, IMMIGRATION'
  );

  // 2. Sampling Form
  const [samplingArea, setSamplingArea] = useState('PAYROLL');
  const [samplingMethod, setSamplingMethod] = useState<'RANDOM' | 'RISK_BASED' | 'STRATIFIED'>(
    'RANDOM'
  );
  const [sampleSize, setSampleSize] = useState(5);

  // 3. Test Result Form
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedSampleItem, setSelectedSampleItem] = useState<{ id: string; name: string } | null>(
    null
  );
  const [selectedSampleObj, setSelectedSampleObj] = useState<Sample | null>(null);
  const [testPassed, setTestPassed] = useState(true);
  const [testNotes, setTestNotes] = useState('');
  const [testEvidence, setTestEvidence] = useState('');

  // 4. Finding Form
  const [showFindingDialog, setShowFindingDialog] = useState(false);
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDesc, setFindingDesc] = useState('');
  const [findingSeverity, setFindingSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    'MEDIUM'
  );
  const [findingArea, setFindingArea] = useState('PAYROLL');

  // 5. Corrective Action Form
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [actionDesc, setActionDesc] = useState('');
  const [actionOwner, setActionOwner] = useState('COMPLIANCE_OFFICER');
  const [actionDueDate, setActionDueDate] = useState('');

  // 6. Review Form
  const [reviewPeriod, setReviewPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reviewDate, setReviewDate] = useState('');

  // Fetch initial plans & employees
  async function loadInitialData() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/compliance-calendar/audit-plan');
      const p = await r.json();
      if (p.success) {
        setPlans(p.data ?? []);
        if (p.data?.length > 0 && !selectedPlanId) {
          setSelectedPlanId(p.data[0].id);
        }
      }

      // Fetch employees for sampling population
      const empRes = await fetch('/api/v1/employees?limit=100');
      const empData = await empRes.json();
      if (empData.success) {
        setEmployees(empData.data ?? []);
      }

      // Fetch management reviews list
      const revRes = await fetch('/api/v1/compliance-calendar/audit-plan?action=reviews');
      const revData = await revRes.json();
      if (revData.success) {
        setReviews(revData.data ?? []);
      }
    } catch (e) {
      console.error('Failed to load audit plan master list', e);
      setMessage({ type: 'error', text: 'Failed to connect to audit services' });
    } finally {
      setLoading(false);
    }
  }

  // Load detailed plan dependencies (samples, findings, results)
  async function loadPlanDetails() {
    if (!selectedPlanId) return;
    try {
      const r = await fetch(`/api/v1/compliance-calendar/audit-plan?planId=${selectedPlanId}`);
      const p = await r.json();
      if (p.success) {
        setSelectedPlanDetail(p.data?.plan ?? null);
        setFindings(p.data?.findings ?? []);
        setTestResults(p.data?.testResults ?? []);
      }
    } catch (e) {
      console.error('Failed to load plan details', e);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPlanDetails();
  }, [selectedPlanId]);

  // Mutations
  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          year: planYear,
          title: planTitle,
          scope: planScope,
          areas: planAreas.split(',').map((s) => s.trim()),
          ownerRole: 'INTERNAL_AUDITOR',
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({ type: 'success', text: `Success: Audit Plan for ${planYear} drafted.` });
        loadInitialData();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Draft failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error executing create action' });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprovePlan(id: string) {
    try {
      setLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', planId: id }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: 'Success: Plan has been APPROVED and published for audit execution.',
        });
        loadInitialData();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Approval failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error executing approval' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDrawSample(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanId) return;

    // Build population inputs: map employees to the structure expected by service
    const populationList = employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
      weight: Math.random() * 10, // Mock weight for risk-based sampling
    }));

    if (populationList.length === 0) {
      // Fallback fallback if no employees
      Array.from({ length: 20 }).forEach((_, idx) => {
        populationList.push({
          id: `mock-emp-${idx}`,
          name: `Employee Placeholder ${idx + 1} (EMP-0${100 + idx})`,
          weight: Math.random() * 10,
        });
      });
    }

    try {
      setLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sample',
          auditPlanId: selectedPlanId,
          area: samplingArea,
          method: samplingMethod,
          population: populationList,
          sampleSize: Number(sampleSize),
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Drawn a statistical sample size of ${p.data.sampleSize} using ${samplingMethod} method.`,
        });
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Sampling failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error drawing sample' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRecordTestResult(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanId || !selectedSampleItem || !selectedSampleObj) return;
    try {
      const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-result',
          auditPlanId: selectedPlanId,
          area: selectedSampleObj.area,
          testKey: selectedSampleItem.id,
          sampleId: selectedSampleObj.id,
          passed: testPassed,
          notes: testNotes,
          evidenceUrl: testEvidence,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Recorded audit test result for ${selectedSampleItem.name} as ${testPassed ? 'PASSED' : 'FAILED'}.`,
        });

        // If test failed, automatically prompt to raise a finding
        if (!testPassed) {
          setFindingTitle(`Failure detected in ${selectedSampleObj.area} test`);
          setFindingDesc(
            `An audit check failed for sample ${selectedSampleItem.name} in audit area ${selectedSampleObj.area}. Notes: ${testNotes}`
          );
          setFindingArea(selectedSampleObj.area);
          setShowFindingDialog(true);
        }

        setShowTestDialog(false);
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Failed to record result' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error recording test result' });
    }
  }

  async function handleRaiseFinding(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanId) return;
    try {
      const r = await fetch('/api/v1/compliance-calendar/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise',
          auditPlanId: selectedPlanId,
          area: findingArea,
          title: findingTitle,
          description: findingDesc,
          severity: findingSeverity,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Raised finding: "${findingTitle}" with severity ${findingSeverity}.`,
        });
        setShowFindingDialog(false);
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Failed to raise finding' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error raising finding' });
    }
  }

  async function handleCreateAction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFinding) return;
    try {
      const r = await fetch('/api/v1/compliance-calendar/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'corrective-action',
          findingId: selectedFinding.id,
          description: actionDesc,
          ownerRole: actionOwner,
          dueDate: new Date(actionDueDate).toISOString(),
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Logged corrective action assigned to ${ROLE_MAP[actionOwner] || actionOwner}.`,
        });
        setShowActionDialog(false);
        setActionDesc('');
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Failed to create action' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error creating corrective action' });
    }
  }

  async function handleCloseAction(actionId: string) {
    try {
      const r = await fetch('/api/v1/compliance-calendar/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close-action', actionId }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({ type: 'success', text: 'Success: Corrective action resolved and closed.' });
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Failed to close action' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error closing corrective action' });
    }
  }

  async function handleScheduleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewDate) return;
    try {
      const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          period: reviewPeriod,
          scheduledFor: new Date(reviewDate).toISOString(),
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Management review scheduled for period ${reviewPeriod}.`,
        });
        loadInitialData();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Scheduling failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error scheduling review' });
    }
  }

  const selectedPlanAreas = useMemo(() => {
    if (!selectedPlanDetail) return [];
    return Array.isArray(selectedPlanDetail.areasJson) ? selectedPlanDetail.areasJson : [];
  }, [selectedPlanDetail]);

  const testResultsLookup = useMemo(() => {
    const lookup: Record<string, TestResult> = {};
    testResults.forEach((tr) => {
      if (tr.sampleId && tr.testKey) {
        lookup[`${tr.sampleId}-${tr.testKey}`] = tr;
      }
    });
    return lookup;
  }, [testResults]);

  const activePlanList = plans.filter((p) => p.status === 'APPROVED');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <a href="/dashboard/compliance-calendar" className="hover:text-slate-700">
            Compliance Calendar
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-700">Annual Audit Plan</span>
        </nav>

        {/* Enterprise Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                S07-S08
              </span>
              <span className="text-xs text-slate-500">Annual HR Audits &amp; Inspections</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Annual Compliance Audit Plan
            </h1>
            <p className="text-sm text-slate-500">
              Inspect payroll files, generate randomized/risk-weighted audits, raise findings, and
              track corrective resolutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none"
            >
              <option value="">Select Audit Plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.year} — {p.title} ({p.status})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadInitialData}
              className="rounded-md border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Action notifications */}
        {message.text && (
          <div
            className={`flex items-center justify-between rounded-lg border p-4 text-sm shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6 -mb-px">
            {[
              { id: 'plans', label: 'Annual Plans', icon: <FileText className="h-4 w-4" /> },
              {
                id: 'scope',
                label: 'Audit Scope & Sampling',
                icon: <Sliders className="h-4 w-4" />,
              },
              {
                id: 'findings',
                label: 'Findings & Corrective Actions',
                icon: <AlertTriangle className="h-4 w-4" />,
              },
              { id: 'reviews', label: 'Management Reviews', icon: <Users className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3.5 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-950 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Contents */}
        <section className="space-y-6">
          {/* ==================== ANNUAL PLANS TAB ==================== */}
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Draft Plan Form */}
              <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-500" />
                  <span>Draft Annual Audit Plan</span>
                </h3>

                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Audit Year *</label>
                    <input
                      type="number"
                      required
                      value={planYear}
                      onChange={(e) => setPlanYear(Number(e.target.value))}
                      className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Title / Objective *</label>
                    <input
                      type="text"
                      required
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder="Annual HR Audit Compliance Check"
                      className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">
                      Audit Scope Summary *
                    </label>
                    <textarea
                      required
                      value={planScope}
                      onChange={(e) => setPlanScope(e.target.value)}
                      className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 min-h-[70px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">
                      Audit Areas (Comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={planAreas}
                      onChange={(e) => setPlanAreas(e.target.value)}
                      className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 font-mono"
                    />
                    <p className="text-[10px] text-slate-400">
                      Available: PAYROLL, WPS, SOCIAL_INSURANCE, DOCUMENT_AUDIT, IMMIGRATION
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-slate-900 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>{loading ? 'Processing...' : 'Draft Plan Proposal'}</span>
                  </button>
                </form>
              </div>

              {/* Plans Timeline Register */}
              <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Drafted &amp; Published Plans</h3>

                <div className="divide-y divide-slate-100">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{p.year} Plan</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              p.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-slate-700 mt-1">{p.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.scope}</p>
                        <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                          Areas: {Array.isArray(p.areasJson) ? p.areasJson.join(', ') : '—'}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {p.status === 'DRAFT' ? (
                          <button
                            type="button"
                            onClick={() => handleApprovePlan(p.id)}
                            disabled={loading}
                            className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {loading && <RefreshCw className="h-3 w-3 animate-spin" />}
                            <span>{loading ? 'Approving...' : 'Approve Plan'}</span>
                          </button>
                        ) : (
                          <div className="text-[10px] text-slate-400 text-right leading-relaxed select-none">
                            <div>Approved By: {p.approvedBy || 'Admin'}</div>
                            <div>On: {p.approvedAt ? p.approvedAt.slice(0, 10) : '—'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {plans.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-12">
                      No audit plans drafted yet. Setup a plan using the left dashboard panel.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== AUDIT SCOPE & SAMPLING ==================== */}
          {activeTab === 'scope' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sampling Form */}
              <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-500" />
                  <span>Configure Sampling Parameters</span>
                </h3>

                {!selectedPlanDetail || selectedPlanDetail.status !== 'APPROVED' ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2 leading-relaxed">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Please select an <strong>APPROVED</strong> audit plan in the header dropdown
                      to enable statistical sampling tools.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleDrawSample} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Audit Scope Area *</label>
                      <select
                        value={samplingArea}
                        onChange={(e) => setSamplingArea(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                      >
                        {selectedPlanAreas.map((area) => (
                          <option key={area} value={area}>
                            {CATEGORY_MAP[area] || area} ({area})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Sampling Methodology *
                      </label>
                      <select
                        value={samplingMethod}
                        onChange={(e) => setSamplingMethod(e.target.value as any)}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                      >
                        <option value="RANDOM">Random Sampling</option>
                        <option value="RISK_BASED">Risk-Weighted Sampling</option>
                        <option value="STRATIFIED">Stratified Systematic Sampling</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Sample Population Size *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        value={sampleSize}
                        onChange={(e) => setSampleSize(Number(e.target.value))}
                        className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="rounded border border-indigo-100 bg-indigo-50/50 p-2.5 text-[10px] text-indigo-900 leading-normal">
                      System dynamically retrieves the available active population (e.g. employee
                      records) and draws testing samples based on the selected mathematical
                      selection.
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded bg-slate-900 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      <span>{loading ? 'Processing...' : 'Draw Audit Sample'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Sample Inspection Board */}
              <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Drawn Test Samples &amp; Inspections
                </h3>

                {selectedPlanDetail?.samples && selectedPlanDetail.samples.length > 0 ? (
                  <div className="space-y-5">
                    {selectedPlanDetail.samples.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50/30"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              {CATEGORY_MAP[s.area] || s.area} Checkpoint
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Method: {s.method} • Size: {s.sampleSize} of {s.populationSize}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {s.createdAt.slice(0, 10)}
                          </span>
                        </div>

                        {/* Sample items list */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {s.selectionsJson.map((item) => {
                            const res = testResultsLookup[`${s.id}-${item.id}`];
                            return (
                              <div
                                key={item.id}
                                className="rounded bg-white border border-slate-200 p-2.5 flex items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-300 transition"
                              >
                                <div className="truncate">
                                  <div
                                    className="font-semibold text-slate-800 truncate"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                    {item.id}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {res ? (
                                    <span
                                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                        res.passed
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                          : 'bg-rose-50 text-rose-700 border-rose-100'
                                      }`}
                                      title={res.notes || undefined}
                                    >
                                      {res.passed ? (
                                        <CheckCircle className="h-3 w-3" />
                                      ) : (
                                        <XCircle className="h-3 w-3" />
                                      )}
                                      <span>{res.passed ? 'PASS' : 'FAIL'}</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSampleItem(item);
                                        setSelectedSampleObj(s);
                                        setTestPassed(true);
                                        setTestNotes('');
                                        setTestEvidence('');
                                        setShowTestDialog(true);
                                      }}
                                      className="rounded bg-slate-900 text-white px-2 py-1 text-[10px] font-semibold hover:bg-slate-800 transition"
                                    >
                                      Test Check
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-16">
                    No active samples drawn. Configure parameters and click Draw Audit Sample.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== FINDINGS & ACTIONS TAB ==================== */}
          {activeTab === 'findings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Findings Panel List */}
              <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">Audit Finding Register</h3>
                  {selectedPlanId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFindingTitle('');
                        setFindingDesc('');
                        setFindingSeverity('MEDIUM');
                        setShowFindingDialog(true);
                      }}
                      className="rounded bg-slate-900 text-white px-2.5 py-1 text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Log Finding</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {findings.map((f) => {
                    const style = SEVERITY_COLORS[f.severity] || {
                      bg: 'bg-slate-50 border-slate-200',
                      text: 'text-slate-700',
                    };
                    return (
                      <div
                        key={f.id}
                        className="rounded-lg border border-slate-200 p-4 space-y-3 shadow-sm bg-slate-50/20"
                      >
                        {/* Title line */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{f.title}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${style.bg}`}
                              >
                                {f.severity}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              Area: {CATEGORY_MAP[f.area] || f.area} • Status: {f.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFinding(f);
                              setActionDesc('');
                              setActionDueDate('');
                              setShowActionDialog(true);
                            }}
                            className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            + Assign Action
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 leading-normal">{f.description}</p>

                        {/* Associated Corrective Actions */}
                        {f.correctiveActions.length > 0 && (
                          <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Corrective Action Steps
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {f.correctiveActions.map((ca) => (
                                <div
                                  key={ca.id}
                                  className="rounded border border-slate-200 bg-white p-2.5 flex items-center justify-between gap-3 text-xs shadow-sm"
                                >
                                  <div>
                                    <p className="font-medium text-slate-700 line-clamp-1">
                                      {ca.description}
                                    </p>
                                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                                      Owner: {ROLE_MAP[ca.ownerRole] || ca.ownerRole} • Due:{' '}
                                      {ca.dueDate.slice(0, 10)}
                                    </span>
                                  </div>

                                  <div className="flex-shrink-0">
                                    {ca.status === 'OPEN' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleCloseAction(ca.id)}
                                        className="rounded bg-emerald-600 text-white px-2 py-1 text-[10px] font-bold hover:bg-emerald-700 shadow-sm transition"
                                      >
                                        Close
                                      </button>
                                    ) : (
                                      <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[9px] font-bold select-none border border-emerald-100">
                                        Resolved
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {findings.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-16">
                      No findings logged. Audit checks have all passed or are not tested.
                    </div>
                  )}
                </div>
              </div>

              {/* Action plan summary */}
              <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Corrective Status Summary</h3>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-4 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Findings</span>
                    <span className="text-slate-800 font-mono font-bold">{findings.length}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Open Actions</span>
                    <span className="text-slate-800 font-mono font-bold">
                      {findings.reduce(
                        (acc, f) =>
                          acc + f.correctiveActions.filter((ca) => ca.status === 'OPEN').length,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Resolved Actions</span>
                    <span className="text-emerald-700 font-mono font-bold">
                      {findings.reduce(
                        (acc, f) =>
                          acc + f.correctiveActions.filter((ca) => ca.status === 'CLOSED').length,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MANAGEMENT REVIEWS TAB ==================== */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Schedule Form */}
              <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>Schedule Management Review</span>
                </h3>

                <form onSubmit={handleScheduleReview} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Review Period *</label>
                    <input
                      type="month"
                      required
                      value={reviewPeriod}
                      onChange={(e) => setReviewPeriod(e.target.value)}
                      className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">
                      Review Meeting Date *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={reviewDate}
                      onChange={(e) => setReviewDate(e.target.value)}
                      className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="rounded border border-indigo-100 bg-indigo-50/50 p-2.5 text-[10px] text-indigo-900 leading-normal">
                    Reviews schedule board meetings where HR Leadership evaluates corrective
                    actions, audit scopes, and resolves recurring blockages.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-slate-900 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>{loading ? 'Processing...' : 'Schedule Board Review'}</span>
                  </button>
                </form>
              </div>

              {/* Review meetings history */}
              <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Review Meeting Log</h3>

                <div className="divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Period {r.period} Review</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                              r.status === 'SCHEDULED'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">
                          Meeting time: {new Date(r.scheduledFor).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Open actions at schedule: {r.openActionsAtTime} items
                        </p>
                      </div>

                      <div className="text-right">
                        {r.status === 'SCHEDULED' && (
                          <span className="text-[10px] text-slate-400 italic">
                            Awaiting meeting...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-12">
                      No management review meetings scheduled.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ========================================================
          TEST RESULT MODAL DIALOG
      ======================================================== */}
      {showTestDialog && selectedSampleItem && selectedSampleObj && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-800 text-base">Record Audit Test Result</h3>
              <button
                type="button"
                onClick={() => setShowTestDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordTestResult} className="py-4 space-y-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="font-semibold text-slate-800">
                  Target Sample: {selectedSampleItem.name}
                </div>
                <div className="text-slate-400 font-mono mt-0.5">
                  Area: {selectedSampleObj.area}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">
                  Verification Status *
                </label>
                <div className="flex gap-4 mt-1.5">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={testPassed === true}
                      onChange={() => setTestPassed(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-700">Audit PASSED</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={testPassed === false}
                      onChange={() => setTestPassed(false)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-700">Audit FAILED</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Audit Notes / Explanations *
                </label>
                <textarea
                  required
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="Record file findings, date gaps, matching calculations..."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 min-h-[60px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Verification URL / Attachment Link
                </label>
                <input
                  type="url"
                  value={testEvidence}
                  onChange={(e) => setTestEvidence(e.target.value)}
                  placeholder="https://portal.mohre.gov.ae/evidence-receipt.pdf"
                  className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                />
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestDialog(false)}
                  disabled={loading}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{loading ? 'Processing...' : 'Save Result'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          LOG FINDING MODAL DIALOG
      ======================================================== */}
      {showFindingDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-800 text-base">Log Compliance Finding</h3>
              <button
                type="button"
                onClick={() => setShowFindingDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRaiseFinding} className="py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Finding Title / Gap *</label>
                <input
                  type="text"
                  required
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                  placeholder="WPS bank files missing reconciliation"
                  className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Audit Area *</label>
                  <select
                    value={findingArea}
                    onChange={(e) => setFindingArea(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    {selectedPlanAreas.map((area) => (
                      <option key={area} value={area}>
                        {CATEGORY_MAP[area] || area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Severity *</label>
                  <select
                    value={findingSeverity}
                    onChange={(e) => setFindingSeverity(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Blocker</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Finding Description &amp; Details *
                </label>
                <textarea
                  required
                  value={findingDesc}
                  onChange={(e) => setFindingDesc(e.target.value)}
                  placeholder="Elaborate details of the discrepancy, dates, files missing..."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 min-h-[85px]"
                />
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFindingDialog(false)}
                  disabled={loading}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{loading ? 'Processing...' : 'Raise Finding'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ASSIGN CORRECTIVE ACTION MODAL
      ======================================================== */}
      {showActionDialog && selectedFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-800 text-base">Assign Corrective Action</h3>
              <button
                type="button"
                onClick={() => setShowActionDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="py-4 space-y-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="font-semibold text-slate-800">
                  Linked Finding: {selectedFinding.title}
                </div>
                <div className="text-slate-400 mt-1 font-mono">Area: {selectedFinding.area}</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Action Step Description *
                </label>
                <textarea
                  required
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  placeholder="Define concrete steps to resolve the discrepancy..."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Owner Role *</label>
                  <select
                    value={actionOwner}
                    onChange={(e) => setActionOwner(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    <option value="PAYROLL_OFFICER">Payroll Specialist</option>
                    <option value="HR_MANAGER">HR Operations Manager</option>
                    <option value="PRO_OFFICER">Public Relations Officer</option>
                    <option value="HR_ADMIN">HR Administrator</option>
                    <option value="COMPLIANCE_OFFICER">Chief Compliance Officer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Resolution Due Date *</label>
                  <input
                    type="date"
                    required
                    value={actionDueDate}
                    onChange={(e) => setActionDueDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowActionDialog(false)}
                  disabled={loading}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{loading ? 'Processing...' : 'Assign Action'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

/**
 * @component InterEntityTransfer
 * @description Inter-entity employee transfer form — employee selector, source/destination
 *   entity selectors, transfer type, compliance checklist, approval routing, impact preview.
 * @project AURA HCM Platform
 * @section 10.6 — Multi-Entity Management
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  User,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Shield,
  FileText,
  RefreshCw,
  Info,
  Globe,
} from 'lucide-react';
import type {
  LegalEntity,
  InterEntityTransfer as Transfer,
  TransferType,
} from '@/services/multiEntityService';
import { MultiEntityService } from '@/services/multiEntityService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TRANSFER_TYPE_INFO: Record<
  TransferType,
  { label: string; description: string; color: string }
> = {
  permanent: {
    label: 'Permanent Transfer',
    description:
      'Employee permanently moves to the destination entity. Employment contract updated.',
    color: 'border-blue-400 bg-blue-50',
  },
  secondment: {
    label: 'Secondment',
    description:
      'Temporary assignment. Employee returns to home entity after the secondment period.',
    color: 'border-amber-400 bg-amber-50',
  },
  project_based: {
    label: 'Project-Based',
    description: 'Short-term placement for a specific project. No change to home entity contract.',
    color: 'border-purple-400 bg-purple-50',
  },
};

// ── Mock Employees ─────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  {
    id: 'emp-0201',
    name: 'Ahmed Al-Mansouri',
    title: 'Senior Software Engineer',
    entityId: 'ent-001',
    entityName: 'KreupAI HQ',
    salary: 28000,
    currency: 'AED',
  },
  {
    id: 'emp-0312',
    name: 'Rajesh Nair',
    title: 'Data Scientist',
    entityId: 'ent-003',
    entityName: 'KreupAI India',
    salary: 2200000,
    currency: 'INR',
  },
  {
    id: 'emp-0089',
    name: "Liam O'Brien",
    title: 'Product Manager',
    entityId: 'ent-004',
    entityName: 'KreupAI UK',
    salary: 85000,
    currency: 'GBP',
  },
  {
    id: 'emp-0445',
    name: 'Sara Mitchell',
    title: 'Solutions Architect',
    entityId: 'ent-005',
    entityName: 'KreupAI US',
    salary: 160000,
    currency: 'USD',
  },
  {
    id: 'emp-0102',
    name: 'Khalid Al-Otaibi',
    title: 'Business Development Manager',
    entityId: 'ent-002',
    entityName: 'KreupAI KSA',
    salary: 22000,
    currency: 'SAR',
  },
];

// ── Compliance Checklist Items by Destination Country ─────────────────────────

const COMPLIANCE_TEMPLATES: Record<
  string,
  Array<{ id: string; label: string; required: boolean }>
> = {
  AE: [
    { id: 'uae-1', label: 'UAE Employment Visa / Work Permit', required: true },
    { id: 'uae-2', label: 'Emirates ID Application', required: true },
    { id: 'uae-3', label: 'MOHRE Labour Contract Registration', required: true },
    { id: 'uae-4', label: 'DEWS / GPSSA Enrollment', required: false },
    { id: 'uae-5', label: 'Medical Fitness Certificate', required: true },
  ],
  SA: [
    { id: 'ksa-1', label: 'Iqama Transfer / New Work Visa', required: true },
    { id: 'ksa-2', label: 'GOSI Registration', required: true },
    { id: 'ksa-3', label: 'ZATCA Tax Registration', required: true },
    { id: 'ksa-4', label: 'Medical Insurance — CCHI Compliance', required: true },
    { id: 'ksa-5', label: 'Ministry of HR & Social Development Registration', required: true },
  ],
  IN: [
    { id: 'in-1', label: 'Employment Visa (if non-Indian national)', required: false },
    { id: 'in-2', label: 'EPF / ESIC Registration Transfer', required: true },
    { id: 'in-3', label: 'Professional Tax Registration', required: true },
    { id: 'in-4', label: 'Gratuity Calculation Snapshot', required: false },
  ],
  GB: [
    { id: 'uk-1', label: 'UK Right to Work Check', required: true },
    { id: 'uk-2', label: 'UK National Insurance Number', required: true },
    { id: 'uk-3', label: 'Skilled Worker / ICT Visa', required: false },
    { id: 'uk-4', label: 'Pension Auto-Enrolment Setup', required: true },
    { id: 'uk-5', label: 'HMRC PAYE Registration', required: true },
  ],
  US: [
    { id: 'us-1', label: 'I-9 Employment Eligibility Verification', required: true },
    { id: 'us-2', label: 'L-1 Intracompany Transfer Visa', required: false },
    { id: 'us-3', label: 'SSN Application', required: true },
    { id: 'us-4', label: 'State Tax Registration', required: true },
    { id: 'us-5', label: 'Benefits Enrollment (ACA)', required: true },
  ],
};

type Step = 'employee' | 'entities' | 'type' | 'details' | 'compliance' | 'review';

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'employee', label: 'Employee', icon: User },
  { id: 'entities', label: 'Entities', icon: Building2 },
  { id: 'type', label: 'Transfer Type', icon: ArrowLeftRight },
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: Shield },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
];

export default function InterEntityTransfer() {
  const [currentStep, setCurrentStep] = useState<Step>('employee');
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transferHistory, setTransferHistory] = useState<Transfer[]>([]);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<(typeof MOCK_EMPLOYEES)[0] | null>(null);
  const [fromEntityId, setFromEntityId] = useState('');
  const [toEntityId, setToEntityId] = useState('');
  const [transferType, setTransferType] = useState<TransferType>('permanent');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [reason, setReason] = useState('');
  const [salaryAdjustmentPct, setSalaryAdjustmentPct] = useState(0);
  const [complianceChecked, setComplianceChecked] = useState<Record<string, boolean>>({});
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    MultiEntityService.getEntities().then((e) => {
      setEntities(e);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      MultiEntityService.getInterEntityTransfers({ employeeId: selectedEmployee.id }).then(
        setTransferHistory
      );
    }
  }, [selectedEmployee]);

  useEffect(() => {
    const toEntity = entities.find((e) => e.id === toEntityId);
    if (toEntity) {
      const template = COMPLIANCE_TEMPLATES[toEntity.countryCode] ?? [];
      const init: Record<string, boolean> = {};
      template.forEach((item) => {
        init[item.id] = false;
      });
      setComplianceChecked(init);
    }
  }, [toEntityId, entities]);

  const fromEntity = entities.find((e) => e.id === fromEntityId);
  const toEntity = entities.find((e) => e.id === toEntityId);
  const complianceItems = toEntity ? (COMPLIANCE_TEMPLATES[toEntity.countryCode] ?? []) : [];
  const requiredItems = complianceItems.filter((c) => c.required);
  const completedRequired = requiredItems.filter((c) => complianceChecked[c.id]).length;

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  function nextStep() {
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next.id);
  }

  function prevStep() {
    const prev = STEPS[stepIndex - 1];
    if (prev) setCurrentStep(prev.id);
  }

  async function handleSubmit() {
    if (!selectedEmployee || !toEntityId || !fromEntityId) return;
    setSubmitting(true);
    try {
      await MultiEntityService.transferEmployee(
        selectedEmployee.id,
        fromEntityId,
        toEntityId,
        effectiveDate,
        {
          transferType,
          returnDate: returnDate || undefined,
          projectName: projectName || undefined,
          reason,
        }
      );
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Transfer Request Submitted</h2>
          <p className="text-slate-500 text-sm mb-6">
            The transfer request for <strong>{selectedEmployee?.name}</strong> from{' '}
            <strong>{fromEntity?.shortName}</strong> to <strong>{toEntity?.shortName}</strong> has
            been sent for approval.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Type</span>
              <span className="font-medium text-slate-700">
                {TRANSFER_TYPE_INFO[transferType].label}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Effective Date</span>
              <span className="font-medium text-slate-700">
                {effectiveDate ? fmtDate(effectiveDate) : 'TBD'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Approvers</span>
              <span className="font-medium text-slate-700">2 pending</span>
            </div>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep('employee');
              setSelectedEmployee(null);
            }}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Start New Transfer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Inter-Entity Transfer</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Transfer employees between legal entities across countries
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between overflow-x-auto gap-1">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isDone = idx < stepIndex;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isDone && setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1 min-w-[60px] ${isDone ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <p
                    className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </p>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            {/* Step 1: Employee */}
            {currentStep === 'employee' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Select Employee</h2>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search by name or title..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 pl-10"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-2">
                  {MOCK_EMPLOYEES.filter(
                    (e) =>
                      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                      e.title.toLowerCase().includes(employeeSearch.toLowerCase())
                  ).map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setFromEntityId(emp.entityId);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        selectedEmployee?.id === emp.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-slate-800 text-sm">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-600">{emp.entityName}</p>
                        <p className="text-xs text-slate-400">
                          {emp.currency} {emp.salary.toLocaleString()}/yr
                        </p>
                      </div>
                      {selectedEmployee?.id === emp.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Entities */}
            {currentStep === 'entities' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Source & Destination Entities
                </h2>
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading entities...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        From Entity (Source) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={fromEntityId}
                        onChange={(e) => setFromEntityId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="">Select source entity</option>
                        {entities.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.countryFlag} {e.shortName} ({e.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    {fromEntityId && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <div className="p-2 bg-blue-50 rounded-full">
                          <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        To Entity (Destination) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={toEntityId}
                        onChange={(e) => setToEntityId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="">Select destination entity</option>
                        {entities
                          .filter((e) => e.id !== fromEntityId)
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.countryFlag} {e.shortName} ({e.country})
                            </option>
                          ))}
                      </select>
                    </div>

                    {fromEntity && toEntity && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm text-emerald-800">
                          Transfer from <strong>{fromEntity.shortName}</strong> (
                          {fromEntity.countryFlag} {fromEntity.country}) to{' '}
                          <strong>{toEntity.shortName}</strong> ({toEntity.countryFlag}{' '}
                          {toEntity.country}) selected.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Transfer Type */}
            {currentStep === 'type' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Transfer Type</h2>
                <div className="space-y-3">
                  {(
                    Object.entries(TRANSFER_TYPE_INFO) as [
                      TransferType,
                      (typeof TRANSFER_TYPE_INFO)[TransferType],
                    ][]
                  ).map(([type, info]) => (
                    <button
                      key={type}
                      onClick={() => setTransferType(type)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        transferType === type
                          ? info.color
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800">{info.label}</p>
                        {transferType === type && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{info.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === 'details' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Transfer Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Effective Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  {(transferType === 'secondment' || transferType === 'project_based') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  )}

                  {transferType === 'project_based' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Salary Adjustment (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="-20"
                        max="50"
                        value={salaryAdjustmentPct}
                        onChange={(e) => setSalaryAdjustmentPct(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span
                        className={`text-sm font-bold w-12 text-center ${salaryAdjustmentPct > 0 ? 'text-emerald-600' : salaryAdjustmentPct < 0 ? 'text-red-600' : 'text-slate-600'}`}
                      >
                        {salaryAdjustmentPct > 0 ? '+' : ''}
                        {salaryAdjustmentPct}%
                      </span>
                    </div>
                    {selectedEmployee && salaryAdjustmentPct !== 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        New salary: {selectedEmployee.currency}{' '}
                        {Math.round(
                          selectedEmployee.salary * (1 + salaryAdjustmentPct / 100)
                        ).toLocaleString()}
                        /yr
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Reason for Transfer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Provide business justification for this transfer..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Compliance */}
            {currentStep === 'compliance' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Compliance Checklist</h2>
                {toEntity && (
                  <p className="text-sm text-slate-500 mb-4">
                    Requirements for transfer to {toEntity.countryFlag}{' '}
                    <strong>{toEntity.country}</strong>
                  </p>
                )}
                {complianceItems.length > 0 ? (
                  <div className="space-y-3">
                    {complianceItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border ${complianceChecked[item.id] ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                      >
                        <input
                          type="checkbox"
                          id={item.id}
                          checked={complianceChecked[item.id] ?? false}
                          onChange={(e) =>
                            setComplianceChecked((prev) => ({
                              ...prev,
                              [item.id]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 w-4 h-4 accent-emerald-600 shrink-0"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={item.id}
                            className="text-sm font-medium text-slate-700 cursor-pointer"
                          >
                            {item.label}
                          </label>
                          {item.required && (
                            <span className="ml-2 text-xs text-red-500 font-medium">Required</span>
                          )}
                        </div>
                        {complianceChecked[item.id] && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    ))}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-800">
                        {completedRequired} of {requiredItems.length} required items completed.
                        Non-required items can be done post-approval.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500 text-sm">
                    Select a destination entity first to see compliance requirements.
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 'review' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Review & Submit</h2>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Transfer Summary
                    </p>
                    {[
                      { label: 'Employee', value: selectedEmployee?.name },
                      { label: 'Current Title', value: selectedEmployee?.title },
                      {
                        label: 'From',
                        value: `${fromEntity?.countryFlag} ${fromEntity?.shortName}`,
                      },
                      { label: 'To', value: `${toEntity?.countryFlag} ${toEntity?.shortName}` },
                      { label: 'Transfer Type', value: TRANSFER_TYPE_INFO[transferType].label },
                      {
                        label: 'Effective Date',
                        value: effectiveDate ? fmtDate(effectiveDate) : 'Not set',
                      },
                      ...(returnDate ? [{ label: 'Return Date', value: fmtDate(returnDate) }] : []),
                      ...(projectName ? [{ label: 'Project', value: projectName }] : []),
                      {
                        label: 'Salary Adjustment',
                        value:
                          salaryAdjustmentPct === 0
                            ? 'No change'
                            : `${salaryAdjustmentPct > 0 ? '+' : ''}${salaryAdjustmentPct}%`,
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-medium text-slate-700">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Approval Routing */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Approval Routing
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          role: 'Source HR Head',
                          name: fromEntity?.hrHeadName ?? '',
                          entity: fromEntity?.shortName ?? '',
                        },
                        {
                          role: 'Destination HR Head',
                          name: toEntity?.hrHeadName ?? '',
                          entity: toEntity?.shortName ?? '',
                        },
                      ].map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{a.name}</p>
                            <p className="text-xs text-slate-500">
                              {a.role} — {a.entity}
                            </p>
                          </div>
                          <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Progress */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
                    <p className="text-xs text-yellow-800">
                      Compliance: {completedRequired}/{requiredItems.length} required items checked.
                      {completedRequired < requiredItems.length &&
                        ' Remaining items must be completed before the effective date.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Reason
                    </p>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">
                      {reason || 'No reason provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                disabled={stepIndex === 0}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentStep !== 'review' ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 'employee' && !selectedEmployee) ||
                    (currentStep === 'entities' && (!fromEntityId || !toEntityId)) ||
                    (currentStep === 'details' && (!effectiveDate || !reason))
                  }
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Submit Transfer Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-4">
          {/* Selected Employee Card */}
          {selectedEmployee && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Selected Employee
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedEmployee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{selectedEmployee.name}</p>
                  <p className="text-xs text-slate-500">{selectedEmployee.title}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Entity</span>
                  <span className="font-medium text-slate-700">{selectedEmployee.entityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Salary</span>
                  <span className="font-medium text-slate-700">
                    {selectedEmployee.currency} {selectedEmployee.salary.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transfer History for Employee */}
          {transferHistory.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Transfer History
              </p>
              <div className="space-y-2">
                {transferHistory.map((t) => (
                  <div
                    key={t.id}
                    className="text-xs text-slate-600 border-l-2 border-blue-300 pl-3 py-1"
                  >
                    <p className="font-medium">
                      {t.fromEntityName} → {t.toEntityName}
                    </p>
                    <p className="text-slate-400">
                      {t.transferType} · {fmtDate(t.effectiveDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Preview */}
          {fromEntity && toEntity && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Impact Preview
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-600 font-medium">Salary Currency Change</p>
                    <p className="text-slate-400">
                      {fromEntity.currencyCode} → {toEntity.currencyCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-600 font-medium">Benefits Transition</p>
                    <p className="text-slate-400">New {toEntity.country} benefits package</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-600 font-medium">Tax Jurisdiction</p>
                    <p className="text-slate-400">
                      {fromEntity.country} → {toEntity.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-600 font-medium">Required Documents</p>
                    <p className="text-slate-400">
                      {complianceItems.filter((c) => c.required).length} compliance items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

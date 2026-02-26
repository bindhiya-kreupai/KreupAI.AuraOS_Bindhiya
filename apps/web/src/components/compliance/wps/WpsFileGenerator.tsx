'use client';

import React, { useState } from 'react';
import {
  FileText,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ChevronRight,
  Download,
  Calendar,
  Loader2,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GeneratorStep = 'select' | 'preview' | 'validate' | 'generate' | 'done';

interface PayrollRun {
  id: string;
  period: string;
  employeeCount: number;
  totalNetSalary: number;
  status: 'FINALIZED' | 'DRAFT' | 'PROCESSING';
  processedAt: string;
}

interface WpsPreviewRecord {
  lineNumber: number;
  employeeName: string;
  employeeCode: string;
  bankRoutingCode: string;
  accountNumber: string;
  netSalary: number;
  status: 'valid' | 'warning' | 'error';
  issues: string[];
}

interface ValidationSummary {
  isValid: boolean;
  totalRecords: number;
  validRecords: number;
  warnings: number;
  errors: number;
  errorList: Array<{ field: string; message: string; lineNumber?: number }>;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr-001',
    period: 'February 2026',
    employeeCount: 252,
    totalNetSalary: 498400,
    status: 'FINALIZED',
    processedAt: '2026-02-20T14:00:00Z',
  },
  {
    id: 'pr-002',
    period: 'January 2026',
    employeeCount: 247,
    totalNetSalary: 487500,
    status: 'FINALIZED',
    processedAt: '2026-01-20T12:00:00Z',
  },
];

const MOCK_PREVIEW: WpsPreviewRecord[] = [
  {
    lineNumber: 1,
    employeeName: 'Ahmed Al Rashid',
    employeeCode: 'EMP-0001',
    bankRoutingCode: '0302',
    accountNumber: 'AE070331234567890123456',
    netSalary: 18500,
    status: 'valid',
    issues: [],
  },
  {
    lineNumber: 2,
    employeeName: 'Sarah Johnson',
    employeeCode: 'EMP-0002',
    bankRoutingCode: '0302',
    accountNumber: 'AE070331234567890123457',
    netSalary: 22000,
    status: 'valid',
    issues: [],
  },
  {
    lineNumber: 3,
    employeeName: 'Mohammed Hassan',
    employeeCode: 'EMP-0003',
    bankRoutingCode: '0512',
    accountNumber: 'AE070511234567890123401',
    netSalary: 14200,
    status: 'warning',
    issues: ['Bank routing code differs from primary bank — verify'],
  },
  {
    lineNumber: 4,
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP-0004',
    bankRoutingCode: '',
    accountNumber: '',
    netSalary: 12800,
    status: 'error',
    issues: ['Missing bank routing code', 'Missing account number'],
  },
  {
    lineNumber: 5,
    employeeName: 'David Williams',
    employeeCode: 'EMP-0005',
    bankRoutingCode: '0302',
    accountNumber: 'AE070331234567890123459',
    netSalary: 31500,
    status: 'valid',
    issues: [],
  },
];

const MOCK_VALIDATION: ValidationSummary = {
  isValid: false,
  totalRecords: 252,
  validRecords: 248,
  warnings: 3,
  errors: 1,
  errorList: [
    {
      field: 'bankDetails',
      message: 'EMP-0004: Missing bank routing code and account number',
      lineNumber: 4,
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatAED = (amount: number): string =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { key: 'select', label: 'Select Run' },
  { key: 'preview', label: 'Preview' },
  { key: 'validate', label: 'Validate' },
  { key: 'generate', label: 'Generate' },
  { key: 'done', label: 'Done' },
] as const;

function StepIndicator({ current }: { current: GeneratorStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                idx < currentIdx
                  ? 'bg-emerald-500 text-white'
                  : idx === currentIdx
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < currentIdx ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                idx === currentIdx
                  ? 'text-blue-600'
                  : idx < currentIdx
                    ? 'text-emerald-600'
                    : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <ChevronRight
              className={`h-4 w-4 ${idx < currentIdx ? 'text-emerald-400' : 'text-slate-300'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step Panels
// ---------------------------------------------------------------------------

function SelectStep({
  runs,
  selected,
  onSelect,
  onNext,
}: {
  runs: PayrollRun[];
  selected: PayrollRun | null;
  onSelect: (r: PayrollRun) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Select a finalized payroll run to generate the WPS SIF file for MoHRE submission.
      </p>
      <div className="space-y-2">
        {runs.map((run) => (
          <button
            key={run.id}
            onClick={() => onSelect(run)}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
              selected?.id === run.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    selected?.id === run.id ? 'bg-blue-100' : 'bg-slate-100'
                  }`}
                >
                  <Calendar
                    className={`h-4 w-4 ${
                      selected?.id === run.id ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{run.period}</p>
                  <p className="text-xs text-slate-500">
                    Processed on {formatDate(run.processedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatAED(run.totalNetSalary)}
                </p>
                <p className="text-xs text-slate-500">{run.employeeCount} employees</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Preview Records
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PreviewStep({
  records,
  onBack,
  onNext,
}: {
  records: WpsPreviewRecord[];
  onBack: () => void;
  onNext: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? records : records.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs text-blue-700">
            Showing first {records.length} records. Review employee bank details and salary
            information before proceeding to validation.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">
                #
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">
                Employee
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">
                Bank / Account
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">
                Net Salary
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.map((rec) => (
              <tr
                key={rec.lineNumber}
                className={
                  rec.status === 'error'
                    ? 'bg-red-50'
                    : rec.status === 'warning'
                      ? 'bg-amber-50'
                      : ''
                }
              >
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{rec.lineNumber}</td>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-slate-900">{rec.employeeName}</p>
                  <p className="font-mono text-xs text-slate-500">{rec.employeeCode}</p>
                </td>
                <td className="px-4 py-2.5">
                  {rec.bankRoutingCode ? (
                    <>
                      <p className="font-mono text-xs text-slate-700">{rec.bankRoutingCode}</p>
                      <p className="truncate font-mono text-xs text-slate-500 max-w-[160px]">
                        {rec.accountNumber}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-red-500">Not configured</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                  {formatAED(rec.netSalary)}
                </td>
                <td className="px-4 py-2.5">
                  {rec.status === 'valid' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {rec.status === 'warning' && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-amber-600">{rec.issues[0]}</span>
                    </div>
                  )}
                  {rec.status === 'error' && (
                    <div>
                      {rec.issues.map((issue, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-xs text-red-600">{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length > 5 && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {showAll ? 'Show less' : `Show all ${records.length} records`}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Run Validation
          <Play className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ValidateStep({
  validation,
  isLoading,
  onBack,
  onGenerate,
}: {
  validation: ValidationSummary | null;
  isLoading: boolean;
  onBack: () => void;
  onGenerate: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-slate-700">Validating WPS records...</p>
        <p className="mt-1 text-xs text-slate-500">
          Checking bank details, labour cards, and MoHRE rules
        </p>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Total',
            value: validation.totalRecords,
            color: 'bg-slate-50 border-slate-200',
            textColor: 'text-slate-900',
          },
          {
            label: 'Valid',
            value: validation.validRecords,
            color: 'bg-emerald-50 border-emerald-200',
            textColor: 'text-emerald-700',
          },
          {
            label: 'Warnings',
            value: validation.warnings,
            color: 'bg-amber-50 border-amber-200',
            textColor: 'text-amber-700',
          },
          {
            label: 'Errors',
            value: validation.errors,
            color: 'bg-red-50 border-red-200',
            textColor: 'text-red-700',
          },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border p-3 text-center ${c.color}`}>
            <p className={`text-2xl font-bold ${c.textColor}`}>{c.value}</p>
            <p className={`text-xs font-medium ${c.textColor}`}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Errors list */}
      {validation.errors > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 border-b border-red-200 px-4 py-3">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">
              {validation.errors} Validation Error{validation.errors !== 1 ? 's' : ''} — Must Fix
              Before Generating
            </span>
          </div>
          <ul className="divide-y divide-red-100 px-4">
            {validation.errorList.map((err, i) => (
              <li key={i} className="py-2.5">
                <p className="text-sm font-medium text-red-700">{err.message}</p>
                {err.lineNumber && <p className="text-xs text-red-500">Line {err.lineNumber}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.isValid && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Validation Passed — Ready to Generate SIF
              </p>
              <p className="text-xs text-emerald-600">
                All {validation.totalRecords} records passed MoHRE validation rules.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onGenerate}
          disabled={!validation.isValid}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate SIF File
          <FileText className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DoneStep({
  run,
  onSubmitToMoHRE,
  onDownload,
  onReset,
}: {
  run: PayrollRun;
  onSubmitToMoHRE: () => void;
  onDownload: () => void;
  onReset: () => void;
}) {
  const fileName = `WPS_EMP001_${run.period.replace(' ', '')}_${Date.now()}.sif`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">SIF File Generated</h3>
        <p className="mt-1 text-sm text-slate-500">
          The WPS SIF file for {run.period} is ready for MoHRE submission.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">File Name</p>
            <p className="font-mono text-xs font-medium text-slate-900 break-all">{fileName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Payroll Period</p>
            <p className="font-medium text-slate-900">{run.period}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Employees</p>
            <p className="font-medium text-slate-900">{run.employeeCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="font-medium text-slate-900">{formatAED(run.totalNetSalary)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onSubmitToMoHRE}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Submit to MoHRE Portal
        </button>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download SIF File
        </button>
        <button
          onClick={onReset}
          className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
        >
          Generate Another File
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WpsFileGenerator() {
  const [step, setStep] = useState<GeneratorStep>('select');
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);

  const handleNext = () => {
    if (step === 'select') setStep('preview');
    else if (step === 'preview') {
      setStep('validate');
      setIsValidating(true);
      setTimeout(() => {
        setIsValidating(false);
        setValidation(MOCK_VALIDATION);
      }, 2000);
    } else if (step === 'validate') {
      setStep('generate');
      setTimeout(() => setStep('done'), 1500);
    }
  };

  const handleBack = () => {
    if (step === 'preview') setStep('select');
    else if (step === 'validate') setStep('preview');
  };

  const handleReset = () => {
    setStep('select');
    setSelectedRun(null);
    setValidation(null);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-blue-600 p-2.5">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">WPS SIF File Generator</h2>
            <p className="text-sm text-slate-500">Generate salary files for MoHRE submission</p>
          </div>
        </div>
        <StepIndicator current={step} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 'select' && (
          <SelectStep
            runs={MOCK_PAYROLL_RUNS}
            selected={selectedRun}
            onSelect={setSelectedRun}
            onNext={handleNext}
          />
        )}
        {step === 'preview' && (
          <PreviewStep records={MOCK_PREVIEW} onBack={handleBack} onNext={handleNext} />
        )}
        {(step === 'validate' || step === 'generate') && (
          <ValidateStep
            validation={validation}
            isLoading={isValidating || step === 'generate'}
            onBack={handleBack}
            onGenerate={handleNext}
          />
        )}
        {step === 'done' && selectedRun && (
          <DoneStep
            run={selectedRun}
            onSubmitToMoHRE={() => alert('Submitting to MoHRE...')}
            onDownload={() => alert('Downloading SIF file...')}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

export default WpsFileGenerator;

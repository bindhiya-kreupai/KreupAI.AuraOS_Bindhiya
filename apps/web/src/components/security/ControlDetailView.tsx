/**
 * @module ControlDetailView
 * @description Control detail panel with evidence list, test history, upload form,
 *              run-test capability, remediation plan, and related controls.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Upload,
  Play,
  FileText,
  User,
  Calendar,
  TestTube2,
  Link2,
  ChevronDown,
  ChevronUp,
  Loader2,
  _RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  ComplianceFrameworkService,
  type ComplianceControl,
  type ComplianceEvidence,
  type ControlTest,
  type ControlTestResult,
  type SubmitEvidenceInput,
} from '@/services/complianceFrameworkService';

// ── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  compliant: {
    label: 'Compliant',
    icon: ShieldCheck,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  partial: {
    label: 'Partial',
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  'non-compliant': {
    label: 'Non-Compliant',
    icon: ShieldAlert,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  'not-applicable': {
    label: 'N/A',
    icon: Minus,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const RISK_CONFIG = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', className: 'bg-emerald-100 text-emerald-700' },
};

// ── Evidence Item ─────────────────────────────────────────────────────────────

function EvidenceItem({ evidence }: { evidence: ComplianceEvidence }) {
  const statusConfig = {
    verified: { icon: CheckCircle, className: 'text-emerald-500', label: 'Verified' },
    pending: { icon: Clock, className: 'text-amber-500', label: 'Pending Review' },
    expired: { icon: AlertTriangle, className: 'text-orange-500', label: 'Expired' },
    rejected: { icon: XCircle, className: 'text-red-500', label: 'Rejected' },
  }[evidence.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-800">{evidence.fileName}</p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${statusConfig.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{evidence.description}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>Uploaded by {evidence.uploadedBy}</span>
          <span>{new Date(evidence.uploadedAt).toLocaleDateString()}</span>
          {evidence.effectiveDate && <span>Effective: {evidence.effectiveDate}</span>}
          {evidence.verifiedBy && <span>Verified by {evidence.verifiedBy}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Test Result Item ──────────────────────────────────────────────────────────

function TestResultItem({ test }: { test: ControlTest }) {
  const [expanded, setExpanded] = useState(false);

  const resultConfig = {
    pass: {
      icon: CheckCircle,
      className: 'text-emerald-500',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    fail: { icon: XCircle, className: 'text-red-500', bg: 'bg-red-50 border-red-200' },
    partial: { icon: AlertCircle, className: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
    skipped: { icon: Minus, className: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
  }[test.result];

  const ResultIcon = resultConfig.icon;

  return (
    <div className={`rounded-lg border p-3 ${resultConfig.bg}`}>
      <button
        className="w-full flex items-start gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <ResultIcon className={`h-5 w-5 shrink-0 mt-0.5 ${resultConfig.className}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">{test.testName}</p>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            <span>{new Date(test.runAt).toLocaleDateString()}</span>
            <span>by {test.runBy}</span>
            <span>{test.duration}s</span>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="mt-3 pl-8 space-y-2">
          <p className="text-sm text-slate-700">{test.details}</p>
          {test.remediationRequired && (
            <div className="p-2 bg-amber-100 rounded text-xs text-amber-800">
              <span className="font-medium">Remediation Required: </span>
              {test.remediationRequired}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Upload Evidence Form ──────────────────────────────────────────────────────

function UploadEvidenceForm({
  controlId,
  onSuccess,
  onCancel,
}: {
  controlId: string;
  onSuccess: (ev: ComplianceEvidence) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    description: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiresAt: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const input: SubmitEvidenceInput = {
        controlId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        description: formData.description.trim(),
        effectiveDate: formData.effectiveDate,
        expiresAt: formData.expiresAt || undefined,
      };
      const result = await ComplianceFrameworkService.submitEvidence(controlId, input);
      onSuccess(result);
    } catch {
      setError('Failed to submit evidence. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
    >
      <h4 className="font-medium text-slate-800">Upload Evidence</h4>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">File</label>
        <input
          ref={fileRef}
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., Q1 2026 access review report"
          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Effective Date</label>
          <input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, effectiveDate: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Expiry Date (optional)
          </label>
          <input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {submitting ? 'Uploading...' : 'Submit Evidence'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ControlDetailViewProps {
  controlId: string;
  onBack?: () => void;
}

export function ControlDetailView({ controlId, onBack }: ControlDetailViewProps) {
  const [control, setControl] = useState<ComplianceControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [runningTest, setRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<ControlTestResult | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const ctrl = await ComplianceFrameworkService.getControlDetails(controlId);
        if (!ctrl) throw new Error('Control not found');
        setControl(ctrl);
      } catch {
        setError('Failed to load control details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [controlId]);

  const handleRunTest = async () => {
    if (!control) return;
    try {
      setRunningTest(true);
      setTestResult(null);
      const result = await ComplianceFrameworkService.runControlTest(controlId);
      setTestResult(result);
    } catch {
      setError('Failed to run control test.');
    } finally {
      setRunningTest(false);
    }
  };

  const handleEvidenceSuccess = (ev: ComplianceEvidence) => {
    setControl((prev) => (prev ? { ...prev, evidence: [ev, ...prev.evidence] } : prev));
    setShowUpload(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !control) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error ?? 'Control not found.'}</p>
          {onBack && (
            <button onClick={onBack} className="mt-3 text-sm text-blue-600 hover:underline">
              Go back
            </button>
          )}
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[control.status];
  const StatusIcon = statusCfg.icon;
  const riskCfg = RISK_CONFIG[control.riskLevel];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Compliance Dashboard
        </button>
      )}

      {/* Control Info Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {control.code}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusCfg.label}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskCfg.className}`}>
                {riskCfg.label} Risk
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{control.name}</h2>
            <p className="text-sm text-slate-600">{control.description}</p>
            <p className="text-xs text-slate-400 mt-2">Category: {control.category}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{control.ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Last tested: {new Date(control.lastTested).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Next due: {new Date(control.nextTestDue).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Remediation Plan */}
        {control.remediationPlan && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Remediation Plan</p>
                <p className="text-sm text-amber-700">{control.remediationPlan}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900">Evidence ({control.evidence.length})</h3>
            </div>
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>

          {showUpload && (
            <div className="mb-4">
              <UploadEvidenceForm
                controlId={controlId}
                onSuccess={handleEvidenceSuccess}
                onCancel={() => setShowUpload(false)}
              />
            </div>
          )}

          <div className="space-y-2">
            {control.evidence.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No evidence submitted. Upload evidence to support this control.
              </p>
            ) : (
              control.evidence.map((ev) => <EvidenceItem key={ev.id} evidence={ev} />)
            )}
          </div>
        </div>

        {/* Test History Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900">
                Test History ({control.testHistory.length})
              </h3>
            </div>
            <button
              onClick={handleRunTest}
              disabled={runningTest}
              className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {runningTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {runningTest ? 'Running...' : 'Run Test'}
            </button>
          </div>

          {testResult && (
            <div
              className={`mb-3 p-3 rounded-lg border text-sm ${
                testResult.result === 'pass'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : testResult.result === 'partial'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {testResult.result === 'pass' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : testResult.result === 'partial' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="font-medium">Test Result: {testResult.result.toUpperCase()}</span>
              </div>
              <p className="text-xs">{testResult.details}</p>
              {testResult.remediationRequired && (
                <p className="text-xs mt-1 font-medium">
                  Remediation: {testResult.remediationRequired}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {control.testHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No tests run yet. Click &quot;Run Test&quot; to execute an automated check.
              </p>
            ) : (
              control.testHistory.map((test) => <TestResultItem key={test.id} test={test} />)
            )}
          </div>
        </div>
      </div>

      {/* Related Controls */}
      {control.relatedControls.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900">Related Controls</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {control.relatedControls.map((id) => (
              <span
                key={id}
                className="text-sm font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-lg"
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlDetailView;

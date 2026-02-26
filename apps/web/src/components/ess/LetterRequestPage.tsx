/**
 * @module LetterRequestPage
 * @description ESS Letter Self-Service page — template grid, dynamic request form,
 *              my requests table with status/download, letter preview, history (Sec 17.7)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  ChevronRight,
  X,
  Loader2,
  Search,
  ArrowLeft,
  Info,
  BadgeCheck,
} from 'lucide-react';
import {
  LetterService,
  type LetterTemplate,
  type LetterRequest,
  type LetterStatus,
  type LetterLanguage,
} from '@/services/letterService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LetterStatus, { label: string; cls: string; icon: React.ElementType }> =
  {
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600', icon: FileText },
    submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700', icon: Clock },
    under_review: { label: 'Under Review', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: XCircle },
    ready: { label: 'Ready', cls: 'bg-emerald-100 text-emerald-700', icon: BadgeCheck },
    downloaded: { label: 'Downloaded', cls: 'bg-slate-100 text-slate-600', icon: Download },
  };

const LANGUAGE_LABELS: Record<LetterLanguage, string> = {
  en: 'English',
  ar: 'Arabic',
  both: 'English & Arabic',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: LetterTemplate;
  onSelect: (t: LetterTemplate) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
            {template.name}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{template.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {template.requiresApproval ? (
              <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Needs Approval
              </span>
            ) : (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Auto-Generated
              </span>
            )}
            <span className="text-xs text-slate-400">
              {template.slaBusinessDays} biz day{template.slaBusinessDays > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}

// ── Dynamic Form ──────────────────────────────────────────────────────────────

function LetterForm({
  template,
  onSubmit,
  onBack,
  loading,
}: {
  template: LetterTemplate;
  onSubmit: (values: Record<string, string>) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) setErrors((prev) => ({ ...prev, [fieldId]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (f.required && !values[f.id]?.trim()) {
        newErrors[f.id] = `${f.label} is required`;
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h2 className="font-bold text-slate-900">{template.name}</h2>
            <p className="text-sm text-slate-500">{template.purpose}</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className={`flex items-start gap-3 p-3 rounded-xl text-sm ${template.requiresApproval ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}
      >
        <Info
          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${template.requiresApproval ? 'text-amber-600' : 'text-emerald-600'}`}
        />
        <div>
          {template.requiresApproval ? (
            <p className="text-amber-800">
              This letter requires HR approval. Processing time:{' '}
              <strong>{template.slaBusinessDays} business days</strong>.
            </p>
          ) : (
            <p className="text-emerald-800">
              This letter is auto-generated. You can download it immediately after submitting.
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Common uses: {template.commonUses.join(', ')}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${errors[field.id] ? 'border-red-400' : 'border-slate-300'}`}
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                rows={3}
                placeholder={field.placeholder}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none ${errors[field.id] ? 'border-red-400' : 'border-slate-300'}`}
              />
            ) : (
              <input
                type={field.type}
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${errors[field.id] ? 'border-red-400' : 'border-slate-300'}`}
              />
            )}
            {errors[field.id] && <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>}
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {template.requiresApproval ? 'Submit for Approval' : 'Generate Letter'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Letter Preview Modal ──────────────────────────────────────────────────────

function LetterPreviewModal({
  request,
  onClose,
  onDownload,
}: {
  request: LetterRequest;
  onClose: () => void;
  onDownload: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">{request.templateName}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Letter preview body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 font-serif text-sm leading-relaxed max-w-xl mx-auto">
            {/* Letterhead */}
            <div className="text-center mb-8 pb-6 border-b border-slate-200">
              <p className="text-lg font-bold text-indigo-700">KreupAI Technologies</p>
              <p className="text-xs text-slate-400">
                P.O. Box 12345, Riyadh, Kingdom of Saudi Arabia
              </p>
              <p className="text-xs text-slate-400">Tel: +966 11 123 4567 | hr@kreupai.com</p>
            </div>

            <p className="text-right text-slate-500 mb-6">{formatDate(request.requestedAt)}</p>

            {request.addressedTo && (
              <div className="mb-6">
                <p>
                  To: <span className="font-semibold">{request.addressedTo}</span>
                </p>
              </div>
            )}

            <p className="font-semibold mb-4">RE: {request.templateName}</p>

            <p className="mb-4 text-slate-700">To Whom It May Concern,</p>

            <p className="mb-4 text-slate-700">
              This is to certify that <span className="font-semibold">{request.employeeName}</span>{' '}
              is currently employed with KreupAI Technologies in the {request.department}{' '}
              department.
              {request.purpose &&
                ` This letter is being issued for the purpose of: ${request.purpose}.`}
            </p>

            <p className="mb-8 text-slate-700">
              Should you require any further information, please do not hesitate to contact our HR
              department.
            </p>

            <div className="mt-12">
              <p className="font-semibold">____________________________</p>
              <p className="text-sm text-slate-600 mt-1">Human Resources Department</p>
              <p className="text-sm text-slate-500">KreupAI Technologies</p>
            </div>

            {request.expiryDate && (
              <p className="mt-6 text-xs text-slate-400 italic">
                Valid until: {formatDate(request.expiryDate)}
              </p>
            )}
          </div>
        </div>

        <div className="p-5 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Close
          </button>
          {(request.status === 'ready' ||
            request.status === 'approved' ||
            request.status === 'downloaded') && (
            <button
              onClick={() => {
                onDownload(request.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Requests Table ────────────────────────────────────────────────────────────

function RequestsTable({
  requests,
  onPreview,
  onDownload,
}: {
  requests: LetterRequest[];
  onPreview: (r: LetterRequest) => void;
  onDownload: (id: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No letter requests yet. Click on a template to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Letter
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Purpose
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Language
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Requested
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((req) => {
            const { label, cls, icon: Icon } = STATUS_CONFIG[req.status];
            const canDownload = ['ready', 'approved', 'downloaded'].includes(req.status);
            return (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{req.templateName}</p>
                  {req.addressedTo && <p className="text-xs text-slate-400">{req.addressedTo}</p>}
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-32 truncate">{req.purpose}</td>
                <td className="px-4 py-3 text-slate-600">{LANGUAGE_LABELS[req.language]}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                  {req.status === 'rejected' && req.rejectionReason && (
                    <p
                      className="text-xs text-red-500 mt-0.5 max-w-40 truncate"
                      title={req.rejectionReason}
                    >
                      {req.rejectionReason}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(req.requestedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreview(req)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canDownload && (
                      <button
                        onClick={() => onDownload(req.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LetterRequestPage() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [requests, setRequests] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'templates' | 'form' | 'list'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [previewRequest, setPreviewRequest] = useState<LetterRequest | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'requests'>('templates');

  useEffect(() => {
    (async () => {
      const [tmpl, reqs] = await Promise.all([
        LetterService.getLetterTemplates(),
        LetterService.getMyLetterRequests('emp-current'),
      ]);
      setTemplates(tmpl);
      setRequests(reqs);
      setLoading(false);
    })();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectTemplate = (t: LetterTemplate) => {
    setSelectedTemplate(t);
    setView('form');
  };

  const handleSubmitRequest = async (fieldValues: Record<string, string>) => {
    if (!selectedTemplate) return;
    setSubmitLoading(true);
    try {
      const req = await LetterService.requestLetter(selectedTemplate.id, {
        language: (fieldValues['language']?.toLowerCase() as LetterLanguage) ?? 'en',
        purpose: fieldValues['purpose'] ?? '',
        addressedTo: fieldValues['addressed_to'],
        fieldValues,
      });
      setRequests((prev) => [req, ...prev]);
      setView('form');
      setSelectedTemplate(null);
      setActiveTab('requests');
      showToast(
        req.status === 'ready'
          ? 'Letter generated! Ready to download.'
          : 'Request submitted for approval.'
      );
    } catch {
      showToast('Failed to submit request. Please try again.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDownload = async (requestId: string) => {
    try {
      const result = await LetterService.downloadLetter(requestId);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'downloaded' } : r))
      );
      showToast(`Downloading ${result.filename}...`);
    } catch {
      showToast('Download failed. Please try again.', 'error');
    }
  };

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return q
      ? templates.filter(
          (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        )
      : templates;
  }, [templates, searchQuery]);

  const pendingRequests = requests.filter((r) => ['submitted', 'under_review'].includes(r.status));
  const readyRequests = requests.filter((r) => ['ready', 'approved'].includes(r.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Form View
  if (view === 'form' && selectedTemplate) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <LetterForm
          template={selectedTemplate}
          onSubmit={handleSubmitRequest}
          onBack={() => {
            setView('templates');
            setSelectedTemplate(null);
          }}
          loading={submitLoading}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Letter Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Request official HR letters and certificates
          </p>
        </div>
        <div className="flex gap-2">
          {pendingRequests.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-medium">
              <Clock className="w-4 h-4" />
              {pendingRequests.length} pending
            </div>
          )}
          {readyRequests.length > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-sm font-medium">
              <Download className="w-4 h-4" />
              {readyRequests.length} ready
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'templates' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          Request a Letter
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          My Requests
          {requests.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-0.5 font-bold">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search letter types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((t) => (
              <TemplateCard key={t.id} template={t} onSelect={handleSelectTemplate} />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No templates found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <RequestsTable
            requests={requests}
            onPreview={setPreviewRequest}
            onDownload={handleDownload}
          />
        </div>
      )}

      {/* Preview Modal */}
      {previewRequest && (
        <LetterPreviewModal
          request={previewRequest}
          onClose={() => setPreviewRequest(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

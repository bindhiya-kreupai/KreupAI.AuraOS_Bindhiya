'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  Loader2,
  Shield,
  RefreshCw,
} from 'lucide-react';
import type {
  ChangeRequest,
  VerificationDocument,
  VerificationDocumentType,
} from '@/services/profileChangeService';
import { ProfileChangeService } from '@/services/profileChangeService';

// ── Document type labels ──────────────────────────────────────────────────────

const DOC_TYPE_META: Record<VerificationDocumentType, { label: string; description: string }> = {
  cancelled_cheque: {
    label: 'Cancelled Cheque',
    description: 'A cancelled cheque showing your account number and bank details',
  },
  bank_statement: {
    label: 'Bank Statement',
    description: 'Recent bank statement (within last 3 months)',
  },
  utility_bill: {
    label: 'Utility Bill',
    description: 'Electricity, water, or gas bill showing your address (within last 3 months)',
  },
  government_id: {
    label: 'Government ID',
    description: 'Valid government-issued photo ID showing current address',
  },
  address_proof: {
    label: 'Address Proof',
    description: 'Official document confirming your address',
  },
  other: {
    label: 'Other Document',
    description: 'Any other supporting document',
  },
};

// ── Document status badge ─────────────────────────────────────────────────────

function DocStatusBadge({ status }: { status: VerificationDocument['status'] }) {
  if (status === 'verified')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> Verified
      </span>
    );
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400">
      <AlertCircle className="w-3 h-3" /> Pending Review
    </span>
  );
}

// ── Upload zone ───────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onUpload: (file: File, docType: VerificationDocumentType) => void;
  requiredDocTypes: VerificationDocumentType[];
  uploading: boolean;
}

function UploadZone({ onUpload, requiredDocTypes, uploading }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<VerificationDocumentType>(requiredDocTypes[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file, selectedType);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file, selectedType);
  };

  return (
    <div className="space-y-3">
      {/* Document type selector */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          Document Type
        </label>
        <select
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as VerificationDocumentType)}
        >
          {requiredDocTypes.map((dt) => (
            <option key={dt} value={dt}>
              {DOC_TYPE_META[dt].label}
            </option>
          ))}
        </select>
        {selectedType && (
          <p className="mt-1 text-xs text-slate-400">{DOC_TYPE_META[selectedType].description}</p>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
          dragOver
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        ) : (
          <Upload className="w-8 h-8 text-slate-300" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {uploading ? 'Uploading...' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG up to 5 MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}

// ── Admin verify actions ──────────────────────────────────────────────────────

interface VerifyActionsProps {
  changeRequestId: string;
  documentId: string;
  onVerified: () => void;
  isAdminView: boolean;
}

function VerifyActions({
  changeRequestId,
  documentId,
  onVerified,
  isAdminView,
}: VerifyActionsProps) {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const verify = async () => {
    setLoading(true);
    try {
      await ProfileChangeService.verifyDocument(changeRequestId, documentId, 'verified');
      onVerified();
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    if (!rejectionReason.trim()) return;
    setLoading(true);
    try {
      await ProfileChangeService.verifyDocument(
        changeRequestId,
        documentId,
        'rejected',
        rejectionReason
      );
      onVerified();
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminView) return null;

  return (
    <div className="space-y-2">
      {!showRejectForm ? (
        <div className="flex gap-2">
          <button
            onClick={verify}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            Verify
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800 transition-colors"
          >
            <XCircle className="w-3 h-3" />
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={2}
            className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectForm(false)}
              className="flex-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={reject}
              disabled={loading || !rejectionReason.trim()}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ChangeVerificationPanelProps {
  changeRequestId: string;
  isAdminView?: boolean;
}

export function ChangeVerificationPanel({
  changeRequestId,
  isAdminView = false,
}: ChangeVerificationPanelProps) {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    ProfileChangeService.getChangeRequest(changeRequestId)
      .then(setRequest)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [changeRequestId]);

  const handleUpload = async (file: File, docType: VerificationDocumentType) => {
    if (!request) return;
    setUploading(true);
    try {
      await ProfileChangeService.uploadVerificationDocument(changeRequestId, docType, {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      load();
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16 text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Change request not found</p>
      </div>
    );
  }

  // Determine required doc types from change type metadata
  const requiredDocTypes: VerificationDocumentType[] = [
    'cancelled_cheque',
    'bank_statement',
    'utility_bill',
    'address_proof',
  ];

  const pendingDocs = request.verificationDocuments.filter((d) => d.status === 'pending');
  const verifiedDocs = request.verificationDocuments.filter((d) => d.status === 'verified');
  const rejectedDocs = request.verificationDocuments.filter((d) => d.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Document Verification
            </h2>
            <p className="text-xs text-slate-500">
              {request.changeTypeName} · {request.requestCode}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Pending',
            count: pendingDocs.length,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
          },
          {
            label: 'Verified',
            count: verifiedDocs.length,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            label: 'Rejected',
            count: rejectedDocs.length,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upload (employee view) */}
      {!isAdminView && request.status === 'pending_verification' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Upload Supporting Document
          </h3>
          <UploadZone
            onUpload={handleUpload}
            requiredDocTypes={requiredDocTypes}
            uploading={uploading}
          />
        </div>
      )}

      {/* Documents list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Uploaded Documents ({request.verificationDocuments.length})
          </h3>
        </div>

        {request.verificationDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-400">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {request.verificationDocuments.map((doc) => (
              <div key={doc.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {doc.documentName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {DOC_TYPE_META[doc.documentType]?.label ?? doc.documentType} ·{' '}
                          {(doc.fileSize / 1024).toFixed(0)} KB · Uploaded{' '}
                          {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <DocStatusBadge status={doc.status} />
                    </div>

                    {doc.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs text-red-700 dark:text-red-400">
                          <span className="font-medium">Rejection reason:</span>{' '}
                          {doc.rejectionReason}
                        </p>
                      </div>
                    )}

                    {doc.verifiedDate && doc.status === 'verified' && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Verified by {doc.verifiedBy} on{' '}
                        {new Date(doc.verifiedDate).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <button className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                        <Download className="w-3 h-3" /> Download
                      </button>
                      {!isAdminView && doc.status === 'rejected' && (
                        <button className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors ml-auto">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin verification actions */}
                {isAdminView && doc.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <VerifyActions
                      changeRequestId={changeRequestId}
                      documentId={doc.id}
                      onVerified={load}
                      isAdminView={isAdminView}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification guide */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Document Requirements
        </h3>
        <ul className="space-y-2">
          {requiredDocTypes.slice(0, 3).map((dt) => (
            <li
              key={dt}
              className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>
                <span className="font-medium">{DOC_TYPE_META[dt].label}:</span>{' '}
                {DOC_TYPE_META[dt].description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UploadedReceipt {
  id: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
  ocrData?: {
    merchant?: string;
    date?: string;
    amount?: number;
    currency?: string;
    confidence: number;
  };
}

interface ReceiptUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  onUpload?: (receipt: UploadedReceipt) => void;
  onRemove?: (receiptId: string) => void;
  receipts?: UploadedReceipt[];
  disabled?: boolean;
}

// ── Utils ──────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
};

const getFileIcon = (fileType: string): React.ElementType => {
  if (fileType.startsWith('image/')) return Image;
  return FileText;
};

// ── Receipt Preview Card ───────────────────────────────────────────────────────

function ReceiptCard({
  receipt,
  onRemove,
  onPreview,
}: {
  receipt: UploadedReceipt;
  onRemove: (id: string) => void;
  onPreview: (receipt: UploadedReceipt) => void;
}) {
  const FileIcon = getFileIcon(receipt.file.type);
  const isImage = receipt.file.type.startsWith('image/');

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-all ${
        receipt.status === 'error'
          ? 'border-red-200 dark:border-red-800'
          : receipt.status === 'success'
            ? 'border-emerald-200 dark:border-emerald-800'
            : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Preview area */}
      <div
        className="relative w-full h-32 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => onPreview(receipt)}
      >
        {isImage ? (
          <img
            src={receipt.previewUrl}
            alt={receipt.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        )}

        {/* Status overlay */}
        {receipt.status === 'uploading' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        {receipt.status === 'success' && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
        {receipt.status === 'error' && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* File info */}
      <div className="p-3">
        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
          {receipt.file.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(receipt.file.size)}</p>

        {/* OCR data */}
        {receipt.ocrData && receipt.status === 'success' && (
          <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mb-1">
              OCR Detected ({Math.round(receipt.ocrData.confidence * 100)}% confidence)
            </p>
            {receipt.ocrData.merchant && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">
                {receipt.ocrData.merchant}
              </p>
            )}
            {receipt.ocrData.amount !== undefined && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                ${receipt.ocrData.amount.toFixed(2)} {receipt.ocrData.currency ?? ''}
              </p>
            )}
            {receipt.ocrData.date && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{receipt.ocrData.date}</p>
            )}
          </div>
        )}

        {receipt.status === 'error' && receipt.errorMessage && (
          <p className="text-xs text-red-500 mt-1">{receipt.errorMessage}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
        <button
          onClick={() => onPreview(receipt)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={() => onRemove(receipt.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ReceiptUploader({
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  onUpload,
  onRemove,
  receipts: controlledReceipts,
  disabled = false,
}: ReceiptUploaderProps) {
  const [internalReceipts, setInternalReceipts] = useState<UploadedReceipt[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<UploadedReceipt | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const receipts = controlledReceipts ?? internalReceipts;

  const simulateUploadAndOCR = async (file: File): Promise<Partial<UploadedReceipt>> => {
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));
    // Simulate occasional error
    if (Math.random() < 0.05) {
      return { status: 'error', errorMessage: 'Upload failed. Please try again.' };
    }
    // Simulate OCR for images
    const ocrData = file.type.startsWith('image/')
      ? {
          merchant: ['Marriott Hotels', 'Delta Airlines', 'Uber', 'The Capital Grille', 'Staples'][
            Math.floor(Math.random() * 5)
          ],
          date: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString().split('T')[0],
          amount: parseFloat((Math.random() * 500 + 20).toFixed(2)),
          currency: 'USD',
          confidence: 0.75 + Math.random() * 0.25,
        }
      : undefined;
    return { status: 'success', ocrData };
  };

  const processFiles = useCallback(
    async (files: File[]) => {
      if (disabled) return;
      const remaining = maxFiles - receipts.length;
      const toProcess = files.slice(0, remaining);

      for (const file of toProcess) {
        if (!acceptedFormats.includes(file.type)) continue;
        if (file.size > maxSizeMB * 1048576) continue;

        const id = `receipt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const previewUrl = URL.createObjectURL(file);
        const newReceipt: UploadedReceipt = {
          id,
          file,
          previewUrl,
          status: 'uploading',
        };

        if (!controlledReceipts) {
          setInternalReceipts((prev) => [...prev, newReceipt]);
        }
        onUpload?.(newReceipt);

        // Simulate upload
        const result = await simulateUploadAndOCR(file);
        const updated: UploadedReceipt = { ...newReceipt, ...result };

        if (!controlledReceipts) {
          setInternalReceipts((prev) => prev.map((r) => (r.id === id ? updated : r)));
        }
        onUpload?.(updated);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receipts.length, maxFiles, maxSizeMB, acceptedFormats, disabled, controlledReceipts]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
    // Reset so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    if (!controlledReceipts) {
      setInternalReceipts((prev) => prev.filter((r) => r.id !== id));
    }
    onRemove?.(id);
  };

  const canUploadMore = receipts.length < maxFiles;

  const successCount = receipts.filter((r) => r.status === 'success').length;
  const uploadingCount = receipts.filter((r) => r.status === 'uploading').length;
  const errorCount = receipts.filter((r) => r.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canUploadMore && !disabled && (
        <div
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              isDragging ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Upload className={`w-7 h-7 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {isDragging ? 'Drop files here' : 'Drop receipts here or click to upload'}
          </p>
          <p className="text-xs text-slate-400 text-center">
            PDF, JPG, PNG, WebP up to {maxSizeMB}MB &middot; Max {maxFiles} files
          </p>
          {receipts.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              {receipts.length} of {maxFiles} uploaded
            </p>
          )}
        </div>
      )}

      {/* Upload progress summary */}
      {(uploadingCount > 0 || errorCount > 0) && (
        <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          {uploadingCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {uploadingCount} uploading...
            </div>
          )}
          {successCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              {successCount} uploaded
            </div>
          )}
          {errorCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorCount} failed
            </div>
          )}
        </div>
      )}

      {/* Receipt grid */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onRemove={handleRemove}
              onPreview={setPreviewReceipt}
            />
          ))}
        </div>
      )}

      {/* Lightbox preview */}
      {previewReceipt && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewReceipt(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {previewReceipt.file.name}
              </p>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview content */}
            <div className="p-4">
              {previewReceipt.file.type.startsWith('image/') ? (
                <img
                  src={previewReceipt.previewUrl}
                  alt={previewReceipt.file.name}
                  className="w-full max-h-96 object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <FileText className="w-16 h-16 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">{previewReceipt.file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatFileSize(previewReceipt.file.size)}
                  </p>
                </div>
              )}

              {/* OCR data */}
              {previewReceipt.ocrData && (
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                    OCR Results ({Math.round(previewReceipt.ocrData.confidence * 100)}% confidence)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {previewReceipt.ocrData.merchant && (
                      <>
                        <span className="text-slate-500">Merchant</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {previewReceipt.ocrData.merchant}
                        </span>
                      </>
                    )}
                    {previewReceipt.ocrData.amount !== undefined && (
                      <>
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          ${previewReceipt.ocrData.amount.toFixed(2)}{' '}
                          {previewReceipt.ocrData.currency}
                        </span>
                      </>
                    )}
                    {previewReceipt.ocrData.date && (
                      <>
                        <span className="text-slate-500">Date</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {previewReceipt.ocrData.date}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

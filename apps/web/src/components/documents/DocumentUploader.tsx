/**
 * @module DocumentUploader
 * @description Drag-drop file upload component with progress bar for the Document Vault
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  FileText,
  Image,
  Table,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { UploadProgress } from '@/services/documentService';
import { formatFileSize } from '@/services/documentService';

// ── Props ──────────────────────────────────────────────────────────────────────

interface DocumentUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  uploadQueue: UploadProgress[];
  isUploading: boolean;
  onClose?: () => void;
  maxFileSize?: number; // bytes, default 10MB
  acceptedFormats?: string[];
}

// ── File type icons ────────────────────────────────────────────────────────────

function getUploadIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return Table;
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return FileText;
  return File;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  uploadQueue,
  isUploading,
  onClose,
  maxFileSize = 10 * 1024 * 1024,
  acceptedFormats = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.jpg',
    '.jpeg',
    '.png',
  ],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (file.size > maxFileSize) {
          errors.push(`${file.name}: exceeds ${formatFileSize(maxFileSize)} limit`);
          continue;
        }
        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
        if (!acceptedFormats.includes(ext)) {
          errors.push(`${file.name}: unsupported format`);
          continue;
        }
        valid.push(file);
      }

      return { valid, errors };
    },
    [maxFileSize, acceptedFormats]
  );

  // ── Drag & Drop handlers ──────────────────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounter.current = 0;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const { valid, errors } = validateFiles(droppedFiles);
      setValidationErrors(errors);
      setSelectedFiles((prev) => [...prev, ...valid]);
    },
    [validateFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files);
      const { valid, errors } = validateFiles(files);
      setValidationErrors(errors);
      setSelectedFiles((prev) => [...prev, ...valid]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [validateFiles]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    await onUpload(selectedFiles);
    setSelectedFiles([]);
    setValidationErrors([]);
  }, [selectedFiles, onUpload]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/30">
        <h3 className="font-semibold text-sm text-ink-black dark:text-pearl">Upload Documents</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <X className="w-4 h-4 text-silver-mist" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10 scale-[1.01]'
              : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50 hover:bg-pearl/50 dark:hover:bg-deep-cosmos/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              isDragOver ? 'bg-celestial-indigo/20' : 'bg-pearl dark:bg-deep-cosmos'
            }`}
          >
            <Upload
              className={`w-6 h-6 ${isDragOver ? 'text-celestial-indigo' : 'text-silver-mist'}`}
            />
          </div>
          <p className="text-sm font-medium text-ink-black dark:text-pearl">
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-[10px] text-silver-mist mt-1">
            or click to browse · Max {formatFileSize(maxFileSize)} per file
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">PDF, DOC, XLS, PPT, JPG, PNG, TXT</p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-coral-alert/10 rounded-lg p-2 space-y-1">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-[10px] text-coral-alert flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            {selectedFiles.map((file, i) => {
              const Icon = getUploadIcon(file.name);
              return (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 px-3 py-2 bg-pearl/50 dark:bg-deep-cosmos/50 rounded-lg"
                >
                  <Icon className="w-4 h-4 text-celestial-indigo shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-silver-mist">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="p-0.5 rounded hover:bg-coral-alert/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-silver-mist hover:text-coral-alert" />
                  </button>
                </div>
              );
            })}

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-celestial-indigo to-nebula-purple text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}

        {/* Upload Queue / Progress */}
        {uploadQueue.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
              Upload Progress
            </p>
            {uploadQueue.map((item) => (
              <div key={item.fileId} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-neural-mint shrink-0" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-coral-alert shrink-0" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-celestial-indigo animate-spin shrink-0" />
                  )}
                  <span className="text-xs text-ink-black dark:text-pearl truncate flex-1">
                    {item.fileName}
                  </span>
                  <span className="text-[10px] text-silver-mist">
                    {item.status === 'complete'
                      ? 'Done'
                      : item.status === 'error'
                        ? 'Failed'
                        : `${item.progress}%`}
                  </span>
                </div>
                <div className="h-1 bg-cloud dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'error'
                        ? 'bg-coral-alert'
                        : item.status === 'complete'
                          ? 'bg-neural-mint'
                          : 'bg-celestial-indigo'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                {item.error && <p className="text-[10px] text-coral-alert">{item.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;

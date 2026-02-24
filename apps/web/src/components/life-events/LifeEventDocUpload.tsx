/**
 * @module LifeEventDocUpload
 * @description Supporting document upload for life event submissions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Paperclip,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  url?: string;
}

interface LifeEventDocUploadProps {
  requiredDocs: string[];
  documents: UploadedDocument[];
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  return FileText;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const LifeEventDocUpload: React.FC<LifeEventDocUploadProps> = ({
  requiredDocs,
  documents,
  onUpload,
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateFiles = useCallback((files: File[]): File[] => {
    const valid: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds the 10MB size limit.`);
        continue;
      }
      valid.push(file);
    }
    return valid;
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      setError(null);
      const files = validateFiles(Array.from(fileList));
      if (files.length > 0) onUpload(files);
    },
    [onUpload, validateFiles]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-4">
      {/* Required documents checklist */}
      <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3">
        <p className="text-[10px] font-semibold text-ink-black dark:text-pearl mb-2 flex items-center gap-1.5">
          <Paperclip className="w-3 h-3 text-sunset-amber" />
          Required Supporting Documents
        </p>
        <ul className="space-y-1">
          {requiredDocs.map((doc, i) => {
            const hasDoc = documents.some((d) => d.status === 'complete');
            return (
              <li key={i} className="flex items-start gap-2 text-[10px] text-silver-mist">
                <div
                  className={`w-3 h-3 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                    hasDoc && i < documents.filter((d) => d.status === 'complete').length
                      ? 'border-neural-mint bg-neural-mint/10'
                      : 'border-silver-mist/30'
                  }`}
                >
                  {hasDoc && i < documents.filter((d) => d.status === 'complete').length && (
                    <CheckCircle2 className="w-2.5 h-2.5 text-neural-mint" />
                  )}
                </div>
                {doc}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
          isDragging
            ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
            : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50 bg-pearl/30 dark:bg-deep-cosmos/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload
          className={`w-8 h-8 mb-2 ${isDragging ? 'text-celestial-indigo' : 'text-silver-mist/40'}`}
        />
        <p className="text-xs font-medium text-ink-black dark:text-pearl">
          {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
        </p>
        <p className="text-[10px] text-silver-mist mt-1">PDF, JPG, PNG, DOC up to 10MB each</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-coral-alert/5 border border-coral-alert/20">
          <AlertTriangle className="w-3.5 h-3.5 text-coral-alert shrink-0" />
          <p className="text-[10px] text-coral-alert">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-3 h-3 text-coral-alert" />
          </button>
        </div>
      )}

      {/* Uploaded files */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
            Uploaded Documents ({documents.length})
          </p>
          {documents.map((doc) => {
            const Icon = getFileIcon(doc.type);
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/20"
              >
                <div className="p-1.5 rounded-lg bg-pearl dark:bg-deep-cosmos shrink-0">
                  <Icon className="w-4 h-4 text-celestial-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-silver-mist">{formatSize(doc.size)}</p>
                  {doc.status === 'uploading' && (
                    <div className="mt-1 h-1 rounded-full bg-pearl dark:bg-deep-cosmos overflow-hidden">
                      <div
                        className="h-full bg-celestial-indigo rounded-full transition-all"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {doc.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-celestial-indigo animate-spin" />
                  )}
                  {doc.status === 'complete' && (
                    <CheckCircle2 className="w-4 h-4 text-neural-mint" />
                  )}
                  {doc.status === 'error' && <AlertTriangle className="w-4 h-4 text-coral-alert" />}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(doc.id);
                  }}
                  className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-silver-mist" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LifeEventDocUpload;

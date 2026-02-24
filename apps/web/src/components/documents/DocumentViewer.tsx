/**
 * @module DocumentViewer
 * @description Document preview pane with support for PDF, images, and office files + versioning display
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Star,
  Trash2,
  Eye,
  Clock,
  FileText,
  Image,
  Table,
  File,
  ExternalLink,
  Tag,
  User,
  Calendar,
  HardDrive,
  History,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { VaultDocument, VaultDocumentVersion } from '@/services/documentService';
import { formatFileSize, getFileColor } from '@/services/documentService';

// ── Props ──────────────────────────────────────────────────────────────────────

interface DocumentViewerProps {
  document: VaultDocument;
  onClose: () => void;
  onDownload: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

// ── File type icons ────────────────────────────────────────────────────────────

function getPreviewIcon(format: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    txt: FileText,
    xls: Table,
    xlsx: Table,
    jpg: Image,
    jpeg: Image,
    png: Image,
    gif: Image,
  };
  return map[format] || File;
}

function canPreview(mimeType: string): boolean {
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}

// ── Version Row ────────────────────────────────────────────────────────────────

const VersionRow: React.FC<{ version: VaultDocumentVersion }> = ({ version }) => (
  <div
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
      version.isCurrent
        ? 'bg-celestial-indigo/5 dark:bg-celestial-indigo/10 border border-celestial-indigo/20'
        : 'hover:bg-pearl/50 dark:hover:bg-deep-cosmos/30'
    }`}
  >
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        version.isCurrent
          ? 'bg-celestial-indigo text-white'
          : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
      }`}
    >
      v{version.versionNumber}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-ink-black dark:text-pearl truncate">{version.changes}</p>
      <p className="text-[10px] text-silver-mist">
        {version.uploadedByName} · {new Date(version.uploadedDate).toLocaleDateString()}
      </p>
    </div>
    <span className="text-[10px] text-silver-mist shrink-0">
      {formatFileSize(version.fileSize)}
    </span>
    {version.isCurrent && (
      <span className="text-[9px] font-semibold text-celestial-indigo bg-celestial-indigo/10 px-1.5 py-0.5 rounded-full shrink-0">
        Current
      </span>
    )}
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────────

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: doc,
  onClose,
  onDownload,
  onToggleStar,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'versions'>('preview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const PreviewIcon = getPreviewIcon(doc.fileFormat);
  const fileColor = getFileColor(doc.fileFormat);
  const isPreviewable = canPreview(doc.mimeType);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center gap-2 min-w-0">
          <PreviewIcon className={`w-4 h-4 shrink-0 ${fileColor}`} />
          <h3 className="font-semibold text-sm text-ink-black dark:text-pearl truncate">
            {doc.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleStar(doc.id)}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            title={doc.isStarred ? 'Unstar' : 'Star'}
          >
            <Star
              className={`w-4 h-4 ${doc.isStarred ? 'text-sunset-amber fill-sunset-amber' : 'text-silver-mist'}`}
            />
          </button>
          <button
            onClick={() => onDownload(doc.id)}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-silver-mist" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <X className="w-4 h-4 text-silver-mist" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-cloud/50 dark:border-nebula-purple/20">
        {(['preview', 'details', 'versions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors capitalize ${
              activeTab === tab
                ? 'bg-celestial-indigo text-white'
                : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos'
            }`}
          >
            {tab}
            {tab === 'versions' && doc.versions.length > 1 && (
              <span className="ml-1">({doc.versions.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="p-4">
            {isPreviewable ? (
              <div className="rounded-xl overflow-hidden border border-cloud dark:border-nebula-purple/30 bg-pearl/30 dark:bg-deep-cosmos/30">
                {doc.mimeType.startsWith('image/') ? (
                  <div className="flex items-center justify-center p-4 min-h-[300px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.fileUrl}
                      alt={doc.title}
                      className="max-w-full max-h-[400px] object-contain rounded-lg"
                    />
                  </div>
                ) : doc.mimeType === 'application/pdf' ? (
                  <iframe
                    src={doc.fileUrl}
                    title={doc.title}
                    className="w-full h-[500px] border-0"
                  />
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${fileColor.replace('text-', 'bg-').replace('500', '50')} dark:bg-opacity-20`}
                >
                  <PreviewIcon className={`w-8 h-8 ${fileColor}`} />
                </div>
                <h4 className="font-semibold text-ink-black dark:text-pearl mb-1">
                  {doc.fileName}
                </h4>
                <p className="text-xs text-silver-mist mb-4">
                  Preview not available for {doc.fileFormat.toUpperCase()} files
                </p>
                <button
                  onClick={() => onDownload(doc.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-celestial-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Download to view
                </button>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="p-4 space-y-4">
            {/* Description */}
            {doc.description && (
              <div>
                <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-ink-black dark:text-pearl">{doc.description}</p>
              </div>
            )}

            {/* File Info */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                File Information
              </p>
              <div className="grid grid-cols-2 gap-2">
                <InfoItem icon={FileText} label="Format" value={doc.fileFormat.toUpperCase()} />
                <InfoItem icon={HardDrive} label="Size" value={formatFileSize(doc.fileSize)} />
                <InfoItem icon={User} label="Uploaded by" value={doc.uploadedByName} />
                <InfoItem
                  icon={Calendar}
                  label="Uploaded"
                  value={new Date(doc.uploadedDate).toLocaleDateString()}
                />
                <InfoItem
                  icon={Clock}
                  label="Modified"
                  value={new Date(doc.lastModified).toLocaleDateString()}
                />
                <InfoItem icon={History} label="Version" value={`v${doc.version}`} />
                <InfoItem icon={Eye} label="Views" value={String(doc.viewCount)} />
                <InfoItem icon={Download} label="Downloads" value={String(doc.downloadCount)} />
              </div>
            </div>

            {/* Tags */}
            {doc.tags.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1.5">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-celestial-indigo bg-celestial-indigo/10 rounded-full"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-cloud dark:border-nebula-purple/30 space-y-2">
              <button
                onClick={() => onDownload(doc.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download file
              </button>
              <button
                onClick={() => window.open(doc.fileUrl, '_blank')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-coral-alert hover:bg-coral-alert/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete document
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onDelete(doc.id);
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-coral-alert text-white hover:opacity-90 transition-opacity"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-pearl dark:bg-deep-cosmos text-twilight dark:text-silver-mist hover:opacity-80 transition-opacity"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-2">
              Version History ({doc.versions.length})
            </p>
            {doc.versions
              .sort((a, b) => b.versionNumber - a.versionNumber)
              .map((v) => (
                <VersionRow key={v.id} version={v} />
              ))}
            {doc.versions.length === 0 && (
              <p className="text-sm text-silver-mist text-center py-8">No version history</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Info Item ──────────────────────────────────────────────────────────────────

const InfoItem: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-2 px-2.5 py-2 bg-pearl/50 dark:bg-deep-cosmos/30 rounded-lg">
    <Icon className="w-3.5 h-3.5 text-silver-mist shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] text-silver-mist uppercase">{label}</p>
      <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">{value}</p>
    </div>
  </div>
);

export default DocumentViewer;

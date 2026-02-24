/**
 * @module DocumentVault
 * @description Main container for ESS Document Vault — integrates folder tree, file list, search, upload, and preview
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Folder,
  Upload,
  Grid,
  List,
  FileText,
  Image,
  Table,
  File,
  Star,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCategories } from './DocumentCategories';
import { DocumentSearch } from './DocumentSearch';
import { DocumentUploader } from './DocumentUploader';
import { DocumentViewer } from './DocumentViewer';
import { formatFileSize, getFileColor } from '@/services/documentService';
import type { VaultDocument } from '@/services/documentService';

// ── File type icon lookup ──────────────────────────────────────────────────────

function getDocIcon(format: string): LucideIcon {
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

// ── Document Card (Grid View) ──────────────────────────────────────────────────

const DocumentCard: React.FC<{
  doc: VaultDocument;
  onSelect: (doc: VaultDocument) => void;
  onToggleStar: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ doc, onSelect, onToggleStar, onDownload, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = getDocIcon(doc.fileFormat);
  const color = getFileColor(doc.fileFormat);

  return (
    <div
      className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 hover:shadow-lg hover:border-celestial-indigo/20 transition-all group cursor-pointer relative"
      onClick={() => onSelect(doc)}
    >
      {/* Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar(doc.id);
        }}
        className="absolute top-2 left-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Star
          className={`w-3.5 h-3.5 ${doc.isStarred ? 'text-sunset-amber fill-sunset-amber' : 'text-silver-mist'}`}
        />
      </button>

      {/* Menu */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-pearl dark:hover:bg-deep-cosmos transition-all"
        >
          <MoreVertical className="w-3.5 h-3.5 text-silver-mist" />
        </button>
        {showMenu && (
          <div
            className="absolute right-0 top-7 w-36 bg-white dark:bg-deep-cosmos rounded-lg shadow-lg border border-cloud dark:border-nebula-purple/30 py-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onSelect(doc);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => {
                onDownload(doc.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={() => {
                onDelete(doc.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-coral-alert hover:bg-coral-alert/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="flex flex-col items-center text-center pt-2">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${color.replace('text-', 'bg-').replace('500', '50')} dark:bg-opacity-20`}
        >
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        <h4
          className="font-medium text-sm text-ink-black dark:text-pearl truncate w-full"
          title={doc.title}
        >
          {doc.title}
        </h4>
        <p className="text-[10px] text-silver-mist mt-1">
          {formatFileSize(doc.fileSize)} · {new Date(doc.lastModified).toLocaleDateString()}
        </p>
        {doc.version > 1 && (
          <span className="text-[9px] text-celestial-indigo bg-celestial-indigo/10 px-1.5 py-0.5 rounded-full mt-1.5">
            v{doc.version}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Document Row (List View) ───────────────────────────────────────────────────

const DocumentRow: React.FC<{
  doc: VaultDocument;
  onSelect: (doc: VaultDocument) => void;
  onToggleStar: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ doc, onSelect, onToggleStar, onDownload, onDelete }) => {
  const Icon = getDocIcon(doc.fileFormat);
  const color = getFileColor(doc.fileFormat);

  return (
    <tr
      className="hover:bg-pearl/50 dark:hover:bg-deep-cosmos/30 transition-colors cursor-pointer group"
      onClick={() => onSelect(doc)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(doc.id);
            }}
            className="shrink-0"
          >
            <Star
              className={`w-3.5 h-3.5 ${doc.isStarred ? 'text-sunset-amber fill-sunset-amber' : 'text-silver-mist/30 group-hover:text-silver-mist'} transition-colors`}
            />
          </button>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-').replace('500', '50')} dark:bg-opacity-20`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
              {doc.title}
            </p>
            <p className="text-[10px] text-silver-mist truncate">{doc.fileName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-silver-mist hidden md:table-cell">
        {doc.fileFormat.toUpperCase()}
      </td>
      <td className="px-4 py-3 text-xs text-silver-mist hidden md:table-cell">
        {formatFileSize(doc.fileSize)}
      </td>
      <td className="px-4 py-3 text-xs text-silver-mist hidden lg:table-cell">
        {new Date(doc.lastModified).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-xs text-silver-mist hidden lg:table-cell">
        {doc.version > 1 && (
          <span className="text-[9px] text-celestial-indigo bg-celestial-indigo/10 px-1.5 py-0.5 rounded-full">
            v{doc.version}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(doc.id);
            }}
            className="p-1 rounded hover:bg-cloud dark:hover:bg-stellar-blue transition-colors"
            title="Download"
          >
            <Download className="w-3.5 h-3.5 text-silver-mist" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc.id);
            }}
            className="p-1 rounded hover:bg-coral-alert/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-silver-mist hover:text-coral-alert" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Main Container ─────────────────────────────────────────────────────────────

export const DocumentVault: React.FC = () => {
  const {
    documents,
    folders,
    selectedDocument,
    selectedFolderId,
    isLoading,
    filters,
    setFilters,
    uploadQueue,
    isUploading,
    selectDocument,
    selectFolder,
    uploadFiles,
    deleteDocument,
    toggleStar,
    downloadDocument,
    createFolder,
    refreshDocuments,
    searchDocuments,
  } = useDocuments();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Filter documents based on special folder selections
  const filteredDocuments = useMemo(() => {
    if (selectedFolderId === '__starred') return documents.filter((d) => d.isStarred);
    if (selectedFolderId === '__recent') {
      return [...documents]
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 10);
    }
    if (selectedFolderId && !selectedFolderId.startsWith('__')) {
      // Also include docs in child folders
      const folderIds = new Set<string>();
      folderIds.add(selectedFolderId);
      const addChildren = (foldersArr: typeof folders) => {
        for (const f of foldersArr) {
          if (folderIds.has(f.id)) {
            f.children.forEach((c) => folderIds.add(c.id));
          }
          addChildren(f.children);
        }
      };
      addChildren(folders);
      return documents.filter((d) => d.folderId && folderIds.has(d.folderId));
    }
    return documents;
  }, [documents, selectedFolderId, folders]);

  const starredCount = useMemo(() => documents.filter((d) => d.isStarred).length, [documents]);
  const recentCount = useMemo(() => Math.min(documents.length, 10), [documents]);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    if (!selectedFolderId || selectedFolderId.startsWith('__')) return null;
    const trail: string[] = [];
    const findPath = (foldersArr: typeof folders, target: string): boolean => {
      for (const f of foldersArr) {
        if (f.id === target) {
          trail.push(f.name);
          return true;
        }
        if (findPath(f.children, target)) {
          trail.unshift(f.name);
          return true;
        }
      }
      return false;
    };
    findPath(folders, selectedFolderId);
    return trail;
  }, [selectedFolderId, folders]);

  const handleSelectDocument = (doc: VaultDocument) => {
    selectDocument(doc);
    setShowPreview(true);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Left Sidebar - Folder Tree */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-3">
        <DocumentCategories
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={selectFolder}
          onCreateFolder={(name, parentId) => createFolder(name, parentId)}
          totalDocuments={documents.length}
          starredCount={starredCount}
          recentCount={recentCount}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Folder className="w-5 h-5 text-celestial-indigo" />
              Document Vault
            </h1>
            {breadcrumb && (
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => selectFolder(null)}
                  className="text-[10px] text-celestial-indigo hover:underline"
                >
                  All
                </button>
                {breadcrumb.map((name, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight className="w-3 h-3 text-silver-mist" />
                    <span
                      className={`text-[10px] ${i === breadcrumb.length - 1 ? 'text-ink-black dark:text-pearl font-medium' : 'text-silver-mist'}`}
                    >
                      {name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshDocuments}
              className="p-2 rounded-xl hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 text-silver-mist ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-celestial-indigo to-nebula-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-celestial-indigo/20"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Search + View Toggle */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <DocumentSearch
              onSearch={searchDocuments}
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredDocuments.length}
            />
          </div>
          <div className="flex bg-pearl dark:bg-stellar-blue rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-deep-cosmos shadow-sm' : 'text-silver-mist'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-deep-cosmos shadow-sm' : 'text-silver-mist'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {selectedDocument && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-xl hover:bg-pearl dark:hover:bg-stellar-blue transition-colors shrink-0"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? (
                <PanelRightClose className="w-4 h-4 text-silver-mist" />
              ) : (
                <PanelRightOpen className="w-4 h-4 text-silver-mist" />
              )}
            </button>
          )}
        </div>

        {/* Uploader Panel */}
        {showUploader && (
          <div className="mb-4">
            <DocumentUploader
              onUpload={async (files) => {
                await uploadFiles(files);
                setShowUploader(false);
              }}
              uploadQueue={uploadQueue}
              isUploading={isUploading}
              onClose={() => setShowUploader(false)}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* File List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && documents.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-celestial-indigo/20 border-t-celestial-indigo rounded-full animate-spin" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Folder className="w-12 h-12 text-silver-mist/20 mb-3" />
                <p className="text-sm text-silver-mist font-medium">No documents found</p>
                <p className="text-[10px] text-silver-mist/60 mt-1">
                  Upload files or select a different folder
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload documents
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onSelect={handleSelectDocument}
                    onToggleStar={toggleStar}
                    onDownload={downloadDocument}
                    onDelete={deleteDocument}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cloud dark:border-nebula-purple/20">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-silver-mist uppercase tracking-wider hidden md:table-cell">
                        Type
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-silver-mist uppercase tracking-wider hidden md:table-cell">
                        Size
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-silver-mist uppercase tracking-wider hidden lg:table-cell">
                        Modified
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-silver-mist uppercase tracking-wider hidden lg:table-cell">
                        Version
                      </th>
                      <th className="px-4 py-2.5 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cloud/50 dark:divide-nebula-purple/10">
                    {filteredDocuments.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        doc={doc}
                        onSelect={handleSelectDocument}
                        onToggleStar={toggleStar}
                        onDownload={downloadDocument}
                        onDelete={deleteDocument}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Panel - Document Viewer */}
          {showPreview && selectedDocument && (
            <aside className="hidden md:block w-80 lg:w-96 shrink-0">
              <DocumentViewer
                document={selectedDocument}
                onClose={() => {
                  setShowPreview(false);
                  selectDocument(null);
                }}
                onDownload={downloadDocument}
                onToggleStar={toggleStar}
                onDelete={deleteDocument}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;

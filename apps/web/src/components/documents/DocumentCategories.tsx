/**
 * @module DocumentCategories
 * @description Folder tree navigation for the Document Vault
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  User,
  Briefcase,
  DollarSign,
  GraduationCap,
  Building2,
  CreditCard,
  Award,
  Mail,
  Receipt,
  FileText,
  Star,
  Clock,
  FileArchive,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { VaultFolder } from '@/services/documentService';

// ── Icon Map ───────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  User,
  Briefcase,
  DollarSign,
  GraduationCap,
  Building2,
  CreditCard,
  Award,
  Mail,
  Receipt,
  FileText,
  Folder,
  FileSignature: FileText,
};

const COLOR_MAP: Record<string, string> = {
  'celestial-indigo': 'text-celestial-indigo bg-celestial-indigo/10',
  'neural-mint': 'text-neural-mint bg-neural-mint/10',
  'sunset-amber': 'text-sunset-amber bg-sunset-amber/10',
  'quantum-rose': 'text-quantum-rose bg-quantum-rose/10',
  twilight: 'text-twilight bg-twilight/10',
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface DocumentCategoriesProps {
  folders: VaultFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder?: (name: string, parentId: string | null) => void;
  totalDocuments: number;
  starredCount: number;
  recentCount: number;
}

// ── Folder Node ────────────────────────────────────────────────────────────────

const FolderNode: React.FC<{
  folder: VaultFolder;
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  depth: number;
}> = ({ folder, selectedFolderId, onSelect, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;
  const Icon = ICON_MAP[folder.icon] || Folder;
  const colorClasses = COLOR_MAP[folder.color] || 'text-silver-mist bg-silver-mist/10';

  return (
    <div>
      <button
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors group ${
          isSelected
            ? 'bg-celestial-indigo/10 text-celestial-indigo dark:bg-celestial-indigo/20 font-medium'
            : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className={`p-1 rounded ${colorClasses} shrink-0`}>
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-3.5 h-3.5" />
          ) : (
            <Icon className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="truncate flex-1 text-left">{folder.name}</span>
        <span className="text-[10px] text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity">
          {folder.documentCount}
        </span>
      </button>

      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  totalDocuments,
  starredCount,
  recentCount,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreate = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim(), selectedFolderId);
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Filters */}
      <div className="space-y-0.5 mb-4">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === null
              ? 'bg-celestial-indigo/10 text-celestial-indigo dark:bg-celestial-indigo/20 font-medium'
              : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue/50'
          }`}
        >
          <FileArchive className="w-4 h-4" />
          <span className="flex-1 text-left">All Documents</span>
          <span className="text-[10px] text-silver-mist">{totalDocuments}</span>
        </button>
        <button
          onClick={() => onSelectFolder('__starred')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === '__starred'
              ? 'bg-sunset-amber/10 text-sunset-amber dark:bg-sunset-amber/20 font-medium'
              : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue/50'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="flex-1 text-left">Starred</span>
          <span className="text-[10px] text-silver-mist">{starredCount}</span>
        </button>
        <button
          onClick={() => onSelectFolder('__recent')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === '__recent'
              ? 'bg-neural-mint/10 text-neural-mint dark:bg-neural-mint/20 font-medium'
              : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="flex-1 text-left">Recent</span>
          <span className="text-[10px] text-silver-mist">{recentCount}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-cloud dark:border-nebula-purple/30 my-2" />

      {/* Folders Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
          Folders
        </span>
        {onCreateFolder && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-0.5 rounded hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
            title="New folder"
          >
            <Plus className="w-3.5 h-3.5 text-silver-mist" />
          </button>
        )}
      </div>

      {/* New Folder Input */}
      {isCreating && (
        <div className="px-2 mb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            placeholder="Folder name..."
            className="w-full px-2 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/30 outline-none focus:border-celestial-indigo text-ink-black dark:text-pearl placeholder:text-silver-mist"
            autoFocus
          />
        </div>
      )}

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {folders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            selectedFolderId={selectedFolderId}
            onSelect={onSelectFolder}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentCategories;

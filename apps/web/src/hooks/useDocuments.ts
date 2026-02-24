/**
 * @module useDocuments
 * @description React hooks for ESS Document Vault - manages document state, upload, search, and folder operations
 * @project AURA HCM Platform
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DocumentVaultService,
  type VaultDocument,
  type VaultFolder,
  type DocumentFilters,
  type UploadProgress,
} from '@/services/documentService';

// ── Hook Return Type ───────────────────────────────────────────────────────────

interface UseDocumentsReturn {
  // State
  documents: VaultDocument[];
  folders: VaultFolder[];
  selectedDocument: VaultDocument | null;
  selectedFolderId: string | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: DocumentFilters;
  setFilters: (filters: DocumentFilters) => void;

  // Upload
  uploadQueue: UploadProgress[];
  isUploading: boolean;

  // Actions
  selectDocument: (doc: VaultDocument | null) => void;
  selectFolder: (folderId: string | null) => void;
  uploadFiles: (files: File[], folderId?: string | null) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  downloadDocument: (id: string) => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<VaultFolder>;
  refreshDocuments: () => Promise<void>;
  searchDocuments: (query: string) => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<VaultDocument | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<DocumentFilters>({});
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadDocuments = useCallback(async (currentFilters?: DocumentFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const docs = await DocumentVaultService.getDocuments(currentFilters);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      const data = await DocumentVaultService.getFolders();
      setFolders(data);
    } catch (err) {
      /* Failed to load folders */
      void err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, [loadDocuments, loadFolders]);

  // Reload when filters change
  useEffect(() => {
    loadDocuments(filters);
  }, [filters, loadDocuments]);

  // ── Filter / Search ────────────────────────────────────────────────────────

  const setFilters = useCallback((newFilters: DocumentFilters) => {
    setFiltersState(newFilters);
  }, []);

  const searchDocuments = useCallback((query: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setFiltersState((prev) => ({ ...prev, query: query || undefined }));
    }, 250);
  }, []);

  // ── Selection ──────────────────────────────────────────────────────────────

  const selectDocument = useCallback((doc: VaultDocument | null) => {
    setSelectedDocument(doc);
  }, []);

  const selectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
    setFiltersState((prev) => ({ ...prev, folderId }));
  }, []);

  // ── Upload ─────────────────────────────────────────────────────────────────

  const uploadFiles = useCallback(
    async (files: File[], folderId?: string | null) => {
      setIsUploading(true);

      const queue: UploadProgress[] = files.map((f, i) => ({
        fileId: `upload-${Date.now()}-${i}`,
        fileName: f.name,
        progress: 0,
        status: 'pending' as const,
      }));
      setUploadQueue(queue);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = queue[i].fileId;

        // Update status to uploading
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.fileId === fileId ? { ...item, status: 'uploading' as const, progress: 10 } : item
          )
        );

        try {
          // Simulate progress
          setUploadQueue((prev) =>
            prev.map((item) => (item.fileId === fileId ? { ...item, progress: 40 } : item))
          );

          await DocumentVaultService.uploadDocument(file, {
            title: file.name.replace(/\.[^.]+$/, ''),
            folderId: folderId ?? selectedFolderId,
            category: selectedFolderId ? getCategoryFromFolder(selectedFolderId) : 'personal',
          });

          setUploadQueue((prev) =>
            prev.map((item) =>
              item.fileId === fileId
                ? { ...item, status: 'complete' as const, progress: 100 }
                : item
            )
          );
        } catch (err) {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.fileId === fileId
                ? {
                    ...item,
                    status: 'error' as const,
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : item
            )
          );
        }
      }

      setIsUploading(false);
      // Refresh document list
      await loadDocuments(filters);

      // Clear queue after delay
      setTimeout(() => setUploadQueue([]), 3000);
    },
    [selectedFolderId, filters, loadDocuments]
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        await DocumentVaultService.deleteDocument(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedDocument?.id === id) setSelectedDocument(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete document');
      }
    },
    [selectedDocument]
  );

  const toggleStar = useCallback(
    async (id: string) => {
      try {
        const updated = await DocumentVaultService.toggleStar(id);
        setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
        if (selectedDocument?.id === id) setSelectedDocument(updated);
      } catch (err) {
        /* Failed to toggle star */
        void err;
      }
    },
    [selectedDocument]
  );

  const downloadDocument = useCallback(async (id: string) => {
    try {
      await DocumentVaultService.downloadDocument(id);
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, downloadCount: d.downloadCount + 1 } : d))
      );
    } catch (err) {
      /* Failed to download document */
      void err;
    }
  }, []);

  const createFolder = useCallback(
    async (name: string, parentId?: string | null) => {
      const folder = await DocumentVaultService.createFolder(name, parentId ?? null);
      await loadFolders();
      return folder;
    },
    [loadFolders]
  );

  const refreshDocuments = useCallback(async () => {
    await loadDocuments(filters);
  }, [filters, loadDocuments]);

  return {
    documents,
    folders,
    selectedDocument,
    selectedFolderId,
    isLoading,
    error,
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
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getCategoryFromFolder(folderId: string): string {
  const map: Record<string, string> = {
    'folder-personal': 'personal',
    'folder-id-docs': 'personal',
    'folder-certificates': 'personal',
    'folder-employment': 'employment',
    'folder-contracts': 'employment',
    'folder-letters': 'employment',
    'folder-payroll': 'payroll',
    'folder-payslips': 'payroll',
    'folder-tax': 'payroll',
    'folder-training': 'training',
    'folder-company': 'company',
  };
  return map[folderId] || 'personal';
}

export default useDocuments;

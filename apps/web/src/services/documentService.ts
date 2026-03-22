/**
 * @module documentService
 * @description ESS Document Vault - CRUD operations for employee self-service document management
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type FileFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'jpg'
  | 'png'
  | 'zip'
  | 'other';

export interface VaultDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  folderId: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileFormat: FileFormat;
  mimeType: string;
  version: number;
  versions: VaultDocumentVersion[];
  tags: string[];
  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: string;
  lastModified: string;
  isStarred: boolean;
  viewCount: number;
  downloadCount: number;
}

export interface VaultDocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: string;
  changes: string;
  isCurrent: boolean;
}

export interface VaultFolder {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  color: string;
  documentCount: number;
  children: VaultFolder[];
  createdDate: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface DocumentFilters {
  query?: string;
  category?: string;
  folderId?: string | null;
  fileFormat?: FileFormat;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'title' | 'uploadedDate' | 'lastModified' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

// ── Service ────────────────────────────────────────────────────────────────────

export class DocumentVaultService {
  /**
   * Fetch all documents with optional filters
   */
  static async getDocuments(filters?: DocumentFilters): Promise<VaultDocument[]> {
    return APIClient.get<VaultDocument[]>(
      '/v1/documents',
      filters as Record<string, string>
    );
  }

  /**
   * Fetch a single document by ID
   */
  static async getDocumentById(id: string): Promise<VaultDocument | null> {
    return APIClient.get<VaultDocument>(`/v1/documents/${id}`);
  }

  /**
   * Upload a new document with file
   */
  static async uploadDocument(
    file: File,
    metadata: Partial<VaultDocument>
  ): Promise<VaultDocument> {
    // Step 1: Upload file
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
    });
    const uploadResult = await uploadRes.json();

    if (!uploadResult.success) throw new Error(uploadResult.error?.message || 'Upload failed');

    // Step 2: Create document record
    return APIClient.post<VaultDocument>('/v1/documents', {
      ...metadata,
      fileName: file.name,
      fileUrl: uploadResult.data.fileUrl,
      fileSize: file.size,
      fileFormat: getFileFormat(file.name),
      mimeType: file.type,
    });
  }

  /**
   * Update document metadata
   */
  static async updateDocument(id: string, updates: Partial<VaultDocument>): Promise<VaultDocument> {
    return APIClient.put<VaultDocument>(`/v1/documents/${id}`, updates);
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string): Promise<void> {
    await APIClient.delete<void>(`/v1/documents/${id}`);
  }

  /**
   * Toggle starred status
   */
  static async toggleStar(id: string): Promise<VaultDocument> {
    return APIClient.put<VaultDocument>(`/v1/documents/${id}/star`, {});
  }

  /**
   * Fetch folder tree
   */
  static async getFolders(): Promise<VaultFolder[]> {
    return APIClient.get<VaultFolder[]>('/v1/documents/folders');
  }

  /**
   * Create a new folder
   */
  static async createFolder(name: string, parentId: string | null): Promise<VaultFolder> {
    return APIClient.post<VaultFolder>('/v1/documents/folders', { name, parentId });
  }

  /**
   * Download a document (trigger browser download)
   */
  static async downloadDocument(id: string): Promise<void> {
    const doc = await this.getDocumentById(id);
    if (doc) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      link.click();
    }
  }
}

// ── Utility ────────────────────────────────────────────────────────────────────

function getFileFormat(fileName: string): FileFormat {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, FileFormat> = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'docx',
    xls: 'xls',
    xlsx: 'xlsx',
    ppt: 'ppt',
    pptx: 'pptx',
    txt: 'txt',
    jpg: 'jpg',
    jpeg: 'jpg',
    png: 'png',
    zip: 'zip',
  };
  return map[ext] || 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(format: FileFormat): string {
  const map: Record<FileFormat, string> = {
    pdf: 'FileText',
    doc: 'FileText',
    docx: 'FileText',
    xls: 'Table',
    xlsx: 'Table',
    ppt: 'Presentation',
    pptx: 'Presentation',
    txt: 'FileText',
    jpg: 'Image',
    png: 'Image',
    zip: 'Archive',
    other: 'File',
  };
  return map[format] || 'File';
}

export function getFileColor(format: FileFormat): string {
  const map: Record<FileFormat, string> = {
    pdf: 'text-red-500',
    doc: 'text-blue-500',
    docx: 'text-blue-500',
    xls: 'text-green-500',
    xlsx: 'text-green-500',
    ppt: 'text-orange-500',
    pptx: 'text-orange-500',
    txt: 'text-gray-500',
    jpg: 'text-purple-500',
    png: 'text-purple-500',
    zip: 'text-yellow-600',
    other: 'text-gray-400',
  };
  return map[format] || 'text-gray-400';
}

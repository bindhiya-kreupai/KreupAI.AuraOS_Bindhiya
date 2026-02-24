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

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_FOLDERS: VaultFolder[] = [
  {
    id: 'folder-personal',
    name: 'Personal',
    parentId: null,
    icon: 'User',
    color: 'celestial-indigo',
    documentCount: 4,
    children: [
      {
        id: 'folder-id-docs',
        name: 'ID Documents',
        parentId: 'folder-personal',
        icon: 'CreditCard',
        color: 'celestial-indigo',
        documentCount: 3,
        children: [],
        createdDate: '2024-06-01',
      },
      {
        id: 'folder-certificates',
        name: 'Certificates',
        parentId: 'folder-personal',
        icon: 'Award',
        color: 'celestial-indigo',
        documentCount: 2,
        children: [],
        createdDate: '2024-06-01',
      },
    ],
    createdDate: '2024-01-15',
  },
  {
    id: 'folder-employment',
    name: 'Employment',
    parentId: null,
    icon: 'Briefcase',
    color: 'neural-mint',
    documentCount: 5,
    children: [
      {
        id: 'folder-contracts',
        name: 'Contracts',
        parentId: 'folder-employment',
        icon: 'FileSignature',
        color: 'neural-mint',
        documentCount: 2,
        children: [],
        createdDate: '2024-06-01',
      },
      {
        id: 'folder-letters',
        name: 'Letters',
        parentId: 'folder-employment',
        icon: 'Mail',
        color: 'neural-mint',
        documentCount: 3,
        children: [],
        createdDate: '2024-06-01',
      },
    ],
    createdDate: '2024-01-15',
  },
  {
    id: 'folder-payroll',
    name: 'Payroll & Tax',
    parentId: null,
    icon: 'DollarSign',
    color: 'sunset-amber',
    documentCount: 12,
    children: [
      {
        id: 'folder-payslips',
        name: 'Payslips',
        parentId: 'folder-payroll',
        icon: 'Receipt',
        color: 'sunset-amber',
        documentCount: 12,
        children: [],
        createdDate: '2024-06-01',
      },
      {
        id: 'folder-tax',
        name: 'Tax Forms',
        parentId: 'folder-payroll',
        icon: 'FileText',
        color: 'sunset-amber',
        documentCount: 3,
        children: [],
        createdDate: '2024-06-01',
      },
    ],
    createdDate: '2024-01-15',
  },
  {
    id: 'folder-training',
    name: 'Training',
    parentId: null,
    icon: 'GraduationCap',
    color: 'quantum-rose',
    documentCount: 6,
    children: [],
    createdDate: '2024-03-01',
  },
  {
    id: 'folder-company',
    name: 'Company Policies',
    parentId: null,
    icon: 'Building2',
    color: 'twilight',
    documentCount: 8,
    children: [],
    createdDate: '2024-01-01',
  },
];

const MOCK_DOCUMENTS: VaultDocument[] = [
  {
    id: 'vdoc-001',
    title: 'Offer Letter',
    description: 'Original offer letter from the company',
    category: 'employment',
    folderId: 'folder-letters',
    fileName: 'Offer_Letter_2022.pdf',
    fileUrl: '/uploads/documents/offer-letter.pdf',
    fileSize: 1228800,
    fileFormat: 'pdf',
    mimeType: 'application/pdf',
    version: 1,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Offer_Letter_2022.pdf',
        fileUrl: '/uploads/documents/offer-letter.pdf',
        fileSize: 1228800,
        uploadedBy: 'sys',
        uploadedByName: 'System',
        uploadedDate: '2022-06-15',
        changes: 'Original upload',
        isCurrent: true,
      },
    ],
    tags: ['offer', 'employment', 'official'],
    uploadedBy: 'hr-001',
    uploadedByName: 'HR Department',
    uploadedDate: '2022-06-15',
    lastModified: '2022-06-15',
    isStarred: true,
    viewCount: 12,
    downloadCount: 3,
  },
  {
    id: 'vdoc-002',
    title: 'Employment Agreement',
    description: 'Full employment agreement with terms and conditions',
    category: 'employment',
    folderId: 'folder-contracts',
    fileName: 'Employment_Agreement.pdf',
    fileUrl: '/uploads/documents/employment-agreement.pdf',
    fileSize: 2560000,
    fileFormat: 'pdf',
    mimeType: 'application/pdf',
    version: 2,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Employment_Agreement_v1.pdf',
        fileUrl: '/uploads/documents/emp-agreement-v1.pdf',
        fileSize: 2400000,
        uploadedBy: 'hr-001',
        uploadedByName: 'HR Department',
        uploadedDate: '2022-06-15',
        changes: 'Original agreement',
        isCurrent: false,
      },
      {
        id: 'v2',
        versionNumber: 2,
        fileName: 'Employment_Agreement.pdf',
        fileUrl: '/uploads/documents/employment-agreement.pdf',
        fileSize: 2560000,
        uploadedBy: 'hr-001',
        uploadedByName: 'HR Department',
        uploadedDate: '2023-01-10',
        changes: 'Updated salary terms',
        isCurrent: true,
      },
    ],
    tags: ['contract', 'employment', 'legal'],
    uploadedBy: 'hr-001',
    uploadedByName: 'HR Department',
    uploadedDate: '2022-06-15',
    lastModified: '2023-01-10',
    isStarred: true,
    viewCount: 8,
    downloadCount: 2,
  },
  {
    id: 'vdoc-003',
    title: 'November 2025 Payslip',
    description: 'Monthly payslip for November 2025',
    category: 'payroll',
    folderId: 'folder-payslips',
    fileName: 'Payslip_Nov_2025.pdf',
    fileUrl: '/uploads/documents/payslip-nov-2025.pdf',
    fileSize: 819200,
    fileFormat: 'pdf',
    mimeType: 'application/pdf',
    version: 1,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Payslip_Nov_2025.pdf',
        fileUrl: '/uploads/documents/payslip-nov-2025.pdf',
        fileSize: 819200,
        uploadedBy: 'sys',
        uploadedByName: 'Payroll System',
        uploadedDate: '2025-11-30',
        changes: 'Auto-generated',
        isCurrent: true,
      },
    ],
    tags: ['payslip', 'november', '2025'],
    uploadedBy: 'sys',
    uploadedByName: 'Payroll System',
    uploadedDate: '2025-11-30',
    lastModified: '2025-11-30',
    isStarred: false,
    viewCount: 3,
    downloadCount: 1,
  },
  {
    id: 'vdoc-004',
    title: 'Passport Copy',
    description: 'Scanned copy of passport',
    category: 'personal',
    folderId: 'folder-id-docs',
    fileName: 'Passport_Scan.jpg',
    fileUrl: '/uploads/documents/passport-scan.jpg',
    fileSize: 3174400,
    fileFormat: 'jpg',
    mimeType: 'image/jpeg',
    version: 1,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Passport_Scan.jpg',
        fileUrl: '/uploads/documents/passport-scan.jpg',
        fileSize: 3174400,
        uploadedBy: 'emp-001',
        uploadedByName: 'John Doe',
        uploadedDate: '2022-07-01',
        changes: 'Original upload',
        isCurrent: true,
      },
    ],
    tags: ['passport', 'id', 'personal'],
    uploadedBy: 'emp-001',
    uploadedByName: 'John Doe',
    uploadedDate: '2022-07-01',
    lastModified: '2022-07-01',
    isStarred: false,
    viewCount: 5,
    downloadCount: 2,
  },
  {
    id: 'vdoc-005',
    title: 'Resume v4',
    description: 'Latest version of resume',
    category: 'personal',
    folderId: 'folder-personal',
    fileName: 'Resume_v4.docx',
    fileUrl: '/uploads/documents/resume-v4.docx',
    fileSize: 512000,
    fileFormat: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    version: 4,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Resume_v1.docx',
        fileUrl: '/uploads/documents/resume-v1.docx',
        fileSize: 420000,
        uploadedBy: 'emp-001',
        uploadedByName: 'John Doe',
        uploadedDate: '2022-07-10',
        changes: 'Initial resume',
        isCurrent: false,
      },
      {
        id: 'v4',
        versionNumber: 4,
        fileName: 'Resume_v4.docx',
        fileUrl: '/uploads/documents/resume-v4.docx',
        fileSize: 512000,
        uploadedBy: 'emp-001',
        uploadedByName: 'John Doe',
        uploadedDate: '2025-09-10',
        changes: 'Updated skills and experience',
        isCurrent: true,
      },
    ],
    tags: ['resume', 'cv', 'personal'],
    uploadedBy: 'emp-001',
    uploadedByName: 'John Doe',
    uploadedDate: '2022-07-10',
    lastModified: '2025-09-10',
    isStarred: false,
    viewCount: 15,
    downloadCount: 6,
  },
  {
    id: 'vdoc-006',
    title: 'Tax Declaration Form',
    description: 'Annual tax declaration for FY 2025-26',
    category: 'payroll',
    folderId: 'folder-tax',
    fileName: 'Tax_Declaration_FY2025-26.pdf',
    fileUrl: '/uploads/documents/tax-declaration.pdf',
    fileSize: 1048576,
    fileFormat: 'pdf',
    mimeType: 'application/pdf',
    version: 1,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Tax_Declaration_FY2025-26.pdf',
        fileUrl: '/uploads/documents/tax-declaration.pdf',
        fileSize: 1048576,
        uploadedBy: 'emp-001',
        uploadedByName: 'John Doe',
        uploadedDate: '2025-04-15',
        changes: 'Annual submission',
        isCurrent: true,
      },
    ],
    tags: ['tax', 'declaration', 'finance'],
    uploadedBy: 'emp-001',
    uploadedByName: 'John Doe',
    uploadedDate: '2025-04-15',
    lastModified: '2025-04-15',
    isStarred: false,
    viewCount: 2,
    downloadCount: 1,
  },
  {
    id: 'vdoc-007',
    title: 'AWS Solutions Architect Certificate',
    description: 'AWS Certified Solutions Architect - Associate',
    category: 'training',
    folderId: 'folder-certificates',
    fileName: 'AWS_SA_Certificate.pdf',
    fileUrl: '/uploads/documents/aws-cert.pdf',
    fileSize: 614400,
    fileFormat: 'pdf',
    mimeType: 'application/pdf',
    version: 1,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'AWS_SA_Certificate.pdf',
        fileUrl: '/uploads/documents/aws-cert.pdf',
        fileSize: 614400,
        uploadedBy: 'emp-001',
        uploadedByName: 'John Doe',
        uploadedDate: '2025-08-20',
        changes: 'Certificate upload',
        isCurrent: true,
      },
    ],
    tags: ['aws', 'certificate', 'cloud', 'training'],
    uploadedBy: 'emp-001',
    uploadedByName: 'John Doe',
    uploadedDate: '2025-08-20',
    lastModified: '2025-08-20',
    isStarred: true,
    viewCount: 4,
    downloadCount: 1,
  },
  {
    id: 'vdoc-008',
    title: 'Employee Handbook 2026',
    description: 'Company employee handbook and guidelines',
    category: 'company',
    folderId: 'folder-company',
    fileName: 'Employee_Handbook_2026.pdf',
    fileUrl: '/uploads/documents/handbook-2026.pdf',
    fileSize: 5242880,
    fileFormat: 'pdf',
    mimeType: 'application/pdf',
    version: 1,
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        fileName: 'Employee_Handbook_2026.pdf',
        fileUrl: '/uploads/documents/handbook-2026.pdf',
        fileSize: 5242880,
        uploadedBy: 'hr-001',
        uploadedByName: 'HR Department',
        uploadedDate: '2026-01-05',
        changes: 'Annual update',
        isCurrent: true,
      },
    ],
    tags: ['handbook', 'company', 'policy'],
    uploadedBy: 'hr-001',
    uploadedByName: 'HR Department',
    uploadedDate: '2026-01-05',
    lastModified: '2026-01-05',
    isStarred: false,
    viewCount: 45,
    downloadCount: 20,
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

export class DocumentVaultService {
  /**
   * Fetch all documents with optional filters
   */
  static async getDocuments(filters?: DocumentFilters): Promise<VaultDocument[]> {
    try {
      const data = await APIClient.get<VaultDocument[]>(
        '/v1/documents',
        filters as Record<string, string>
      );
      return data;
    } catch {
      // Fallback to mock data for development
      return DocumentVaultService.filterMockDocuments(filters);
    }
  }

  /**
   * Fetch a single document by ID
   */
  static async getDocumentById(id: string): Promise<VaultDocument | null> {
    try {
      return await APIClient.get<VaultDocument>(`/v1/documents/${id}`);
    } catch {
      return MOCK_DOCUMENTS.find((d) => d.id === id) || null;
    }
  }

  /**
   * Upload a new document with file
   */
  static async uploadDocument(
    file: File,
    metadata: Partial<VaultDocument>
  ): Promise<VaultDocument> {
    try {
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
      const doc = await APIClient.post<VaultDocument>('/v1/documents', {
        ...metadata,
        fileName: file.name,
        fileUrl: uploadResult.data.fileUrl,
        fileSize: file.size,
        fileFormat: getFileFormat(file.name),
        mimeType: file.type,
      });

      return doc;
    } catch {
      // Fallback: create mock document
      const newDoc: VaultDocument = {
        id: `vdoc-${Date.now()}`,
        title: metadata.title || file.name.replace(/\.[^.]+$/, ''),
        description: metadata.description || '',
        category: metadata.category || 'personal',
        folderId: metadata.folderId || null,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        fileFormat: getFileFormat(file.name),
        mimeType: file.type,
        version: 1,
        versions: [
          {
            id: `v-${Date.now()}`,
            versionNumber: 1,
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            fileSize: file.size,
            uploadedBy: 'emp-001',
            uploadedByName: 'John Doe',
            uploadedDate: new Date().toISOString(),
            changes: 'Initial upload',
            isCurrent: true,
          },
        ],
        tags: metadata.tags || [],
        uploadedBy: 'emp-001',
        uploadedByName: 'John Doe',
        uploadedDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isStarred: false,
        viewCount: 0,
        downloadCount: 0,
      };
      MOCK_DOCUMENTS.push(newDoc);
      return newDoc;
    }
  }

  /**
   * Update document metadata
   */
  static async updateDocument(id: string, updates: Partial<VaultDocument>): Promise<VaultDocument> {
    try {
      return await APIClient.put<VaultDocument>(`/v1/documents/${id}`, updates);
    } catch {
      const idx = MOCK_DOCUMENTS.findIndex((d) => d.id === id);
      if (idx >= 0) {
        MOCK_DOCUMENTS[idx] = {
          ...MOCK_DOCUMENTS[idx],
          ...updates,
          lastModified: new Date().toISOString(),
        };
        return MOCK_DOCUMENTS[idx];
      }
      throw new Error('Document not found');
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`/v1/documents/${id}`);
    } catch {
      const idx = MOCK_DOCUMENTS.findIndex((d) => d.id === id);
      if (idx >= 0) MOCK_DOCUMENTS.splice(idx, 1);
    }
  }

  /**
   * Toggle starred status
   */
  static async toggleStar(id: string): Promise<VaultDocument> {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
    if (doc) {
      doc.isStarred = !doc.isStarred;
      return doc;
    }
    throw new Error('Document not found');
  }

  /**
   * Fetch folder tree
   */
  static async getFolders(): Promise<VaultFolder[]> {
    try {
      return await APIClient.get<VaultFolder[]>('/v1/documents/folders');
    } catch {
      return MOCK_FOLDERS;
    }
  }

  /**
   * Create a new folder
   */
  static async createFolder(name: string, parentId: string | null): Promise<VaultFolder> {
    const newFolder: VaultFolder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
      icon: 'Folder',
      color: 'celestial-indigo',
      documentCount: 0,
      children: [],
      createdDate: new Date().toISOString(),
    };
    if (parentId) {
      const addToParent = (folders: VaultFolder[]): boolean => {
        for (const f of folders) {
          if (f.id === parentId) {
            f.children.push(newFolder);
            return true;
          }
          if (addToParent(f.children)) return true;
        }
        return false;
      };
      addToParent(MOCK_FOLDERS);
    } else {
      MOCK_FOLDERS.push(newFolder);
    }
    return newFolder;
  }

  /**
   * Download a document (increment counter and trigger download)
   */
  static async downloadDocument(id: string): Promise<void> {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
    if (doc) {
      doc.downloadCount++;
      // In production, trigger actual file download
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      link.click();
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private static filterMockDocuments(filters?: DocumentFilters): VaultDocument[] {
    let docs = [...MOCK_DOCUMENTS];

    if (!filters) return docs;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.category) {
      docs = docs.filter((d) => d.category === filters.category);
    }

    if (filters.folderId !== undefined) {
      docs = docs.filter((d) => d.folderId === filters.folderId);
    }

    if (filters.fileFormat) {
      docs = docs.filter((d) => d.fileFormat === filters.fileFormat);
    }

    if (filters.tags && filters.tags.length > 0) {
      docs = docs.filter((d) => filters.tags!.some((t) => d.tags.includes(t)));
    }

    const sortBy = filters.sortBy || 'lastModified';
    const sortOrder = filters.sortOrder || 'desc';
    docs.sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return docs;
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

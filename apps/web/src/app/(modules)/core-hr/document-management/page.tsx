/**
 * @module DocumentManagement
 * @description Document Management page with file upload, categorization, expiry tracking, and version control
 * @project AURA HCM Platform
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DataPage } from '@aura/ui';
import type { Column } from '@aura/ui';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Upload,
  FileText,
  File,
  FileCheck,
  AlertCircle,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Tag,
} from 'lucide-react';

// Validation schema
const documentFormSchema = z.object({
  documentTypeId: z.string().min(1, 'Document type is required'),
  documentName: z.string().min(1, 'Document name is required'),
  documentNumber: z.string().optional(),
  category: z.enum(['CONTRACT', 'ID_PROOF', 'EDUCATION', 'MEDICAL', 'TAX', 'OTHER']),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isConfidential: z.boolean().default(false),
  accessLevel: z.enum(['EMPLOYEE', 'MANAGER', 'HR_ONLY', 'ADMIN']).default('EMPLOYEE'),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

// Validation errors type
interface ValidationErrors {
  [key: string]: string;
}

// Document type matching backend API response
interface Document {
  id: string;
  tenantId: string;
  employeeId?: string | null;
  documentTypeId: string;
  documentName: string;
  documentNumber?: string | null;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  version: number;
  parentId?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  isExpired: boolean;
  expiryAlertDays: number;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  isConfidential: boolean;
  accessLevel: string;
  description?: string | null;
  tags?: string | null;
  uploadedBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  documentType?: { id: string; name: string; code: string };
  versions?: Array<{ id: string; documentName: string; version: number; createdAt: string }>;
}

// Upload file info
interface UploadedFile {
  fileName: string;
  uploadedFileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

// Master data interfaces
interface MasterData {
  documentTypes: Array<{ id: string; name: string; code: string }>;
}

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [masterData, setMasterData] = useState<MasterData>({
    documentTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== 'ALL' ? `&category=${selectedCategory}` : '';
      const response = await fetch(`/api/v1/documents?${categoryParam}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const documentData = result.data?.data || result.data || [];
        setDocuments(documentData);

        // Count expiring documents
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiring = documentData.filter((doc: Document) => {
          if (!doc.expiryDate || doc.isExpired) return false;
          const expiryDate = new Date(doc.expiryDate);
          return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
        });

        setExpiringCount(expiring.length);
      } else {
        toast.error(result.error?.message || 'Failed to load documents');
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Error loading documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      const response = await fetch('/api/v1/document-types');
      if (response.ok) {
        const data = await response.json();
        setMasterData((prev) => ({
          ...prev,
          documentTypes: data.data?.data || data.data || [],
        }));
      }
    } catch (error: any) {
      console.error('Error loading document types:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchMasterData();
  }, [selectedCategory]);

  // Categories
  const categories = [
    { value: 'ALL', label: 'All Documents', icon: FileText },
    { value: 'CONTRACT', label: 'Contracts', icon: FileCheck },
    { value: 'ID_PROOF', label: 'ID Proofs', icon: File },
    { value: 'EDUCATION', label: 'Education', icon: FileText },
    { value: 'MEDICAL', label: 'Medical', icon: FileText },
    { value: 'TAX', label: 'Tax Documents', icon: FileText },
    { value: 'OTHER', label: 'Other', icon: FileText },
  ];

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiryDate?: string | null): number | null => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, DOCX, JPG, PNG');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFile(result.data);
        toast.success('File uploaded successfully');
      } else {
        toast.error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  // Define table columns
  const columns: Column<Document>[] = [
    {
      key: 'documentName',
      label: 'Document Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-celestial-indigo dark:text-sky-400" />
            <span className="font-semibold text-ink-black dark:text-pearl">{row.documentName}</span>
            {row.isVerified && (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
            {row.isConfidential && (
              <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                Confidential
              </span>
            )}
          </div>
          <div className="text-xs text-silver-mist dark:text-slate-400 mt-0.5">
            {row.fileName} • {formatFileSize(row.fileSize)}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
          {row.category}
        </span>
      ),
    },
    {
      key: 'documentType',
      label: 'Type',
      render: (row) => (
        <span className="text-sm text-ink-black dark:text-pearl">
          {row.documentType?.name || '-'}
        </span>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      sortable: true,
      render: (row) => {
        if (!row.expiryDate) {
          return <span className="text-sm text-silver-mist dark:text-slate-400">No expiry</span>;
        }

        const daysUntilExpiry = getDaysUntilExpiry(row.expiryDate);

        if (row.isExpired || (daysUntilExpiry !== null && daysUntilExpiry < 0)) {
          return (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <div>
                <div className="text-sm font-semibold">Expired</div>
                <div className="text-xs">{formatDate(row.expiryDate)}</div>
              </div>
            </div>
          );
        }

        if (daysUntilExpiry !== null && daysUntilExpiry <= 30) {
          return (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <div>
                <div className="text-sm font-semibold">{daysUntilExpiry} days</div>
                <div className="text-xs">{formatDate(row.expiryDate)}</div>
              </div>
            </div>
          );
        }

        return (
          <div className="text-sm">
            <div className="font-medium text-ink-black dark:text-pearl">{formatDate(row.expiryDate)}</div>
            <div className="text-xs text-silver-mist dark:text-slate-400">{daysUntilExpiry} days</div>
          </div>
        );
      },
    },
    {
      key: 'version',
      label: 'Version',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          v{row.version}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Uploaded',
      sortable: true,
      render: (row) => (
        <div className="text-sm">
          <div className="text-ink-black dark:text-pearl">{formatDate(row.createdAt)}</div>
        </div>
      ),
    },
  ];

  // Validate form data
  const validateForm = (data: Partial<Document>): boolean => {
    setValidationErrors({});

    try {
      if (!uploadedFile && !data.id) {
        toast.error('Please upload a file first');
        return false;
      }

      documentFormSchema.parse(data);
      return true;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach((error) => {
          const field = error.path[0]?.toString();
          if (field) {
            errors[field] = error.message;
          }
        });
        setValidationErrors(errors);

        const firstError = Object.values(errors)[0];
        if (firstError) {
          toast.error(firstError);
        }
      }
      return false;
    }
  };

  // Handle save
  const handleSave = async (data: Partial<Document>) => {
    try {
      if (!validateForm(data)) {
        return;
      }

      let payload: any = { ...data };

      // If creating new document, include file info
      if (!data.id && uploadedFile) {
        payload = {
          ...payload,
          fileName: uploadedFile.fileName,
          fileSize: uploadedFile.fileSize,
          fileType: uploadedFile.fileType,
          fileUrl: uploadedFile.fileUrl,
        };
      }

      const url = data.id
        ? `/api/v1/documents/${data.id}`
        : '/api/v1/documents';
      const method = data.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setValidationErrors({});
        setUploadedFile(null);
        toast.success(
          data.id
            ? 'Document updated successfully'
            : 'Document created successfully'
        );
        await fetchDocuments();
      } else {
        toast.error(result.error?.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error('Error saving document. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (row: Document) => {
    if (!confirm(`Are you sure you want to delete "${row.documentName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/documents/${row.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Document deleted successfully');
        await fetchDocuments();
      } else {
        toast.error(result.error?.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document. Please try again.');
    }
  };

  // Handle export
  const handleExport = async () => {
    toast.info('Export functionality coming soon');
  };

  // Helper to clear field error
  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Get error class for input
  const getInputClass = (field: string) => {
    const errorClass = validationErrors[field]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-silver-mist/30';
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-celestial-indigo focus:border-transparent transition-all bg-white dark:bg-midnight-gray dark:text-pearl ${errorClass}`;
  };

  // Form renderer
  const renderForm = (
    data: Partial<Document>,
    onChange: (field: keyof Document, value: any) => void
  ) => (
    <>
      {/* File Upload Section (only for new documents) */}
      {!data.id && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-ink-black dark:text-pearl">
            Upload File <span className="text-red-500">*</span>
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${uploadedFile
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-silver-mist/30 hover:border-celestial-indigo'
              }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-celestial-indigo"></div>
                <p className="text-sm text-silver-mist">Uploading...</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <p className="font-semibold text-ink-black dark:text-pearl">{uploadedFile.fileName}</p>
                  <p className="text-xs text-silver-mist">
                    {formatFileSize(uploadedFile.fileSize)} • {uploadedFile.fileType}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-silver-mist" />
                <p className="text-sm text-ink-black dark:text-pearl">Click to upload or drag and drop</p>
                <p className="text-xs text-silver-mist">PDF, DOCX, JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 1: Document Type & Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.documentTypeId || ''}
            onChange={(e) => {
              onChange('documentTypeId', e.target.value);
              clearFieldError('documentTypeId');
            }}
            className={getInputClass('documentTypeId')}
            required
          >
            <option value="">Select Type</option>
            {masterData.documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {validationErrors.documentTypeId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.documentTypeId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={data.category || ''}
            onChange={(e) => {
              onChange('category', e.target.value);
              clearFieldError('category');
            }}
            className={getInputClass('category')}
            required
          >
            <option value="">Select Category</option>
            <option value="CONTRACT">Contract</option>
            <option value="ID_PROOF">ID Proof</option>
            <option value="EDUCATION">Education</option>
            <option value="MEDICAL">Medical</option>
            <option value="TAX">Tax</option>
            <option value="OTHER">Other</option>
          </select>
          {validationErrors.category && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
          )}
        </div>
      </div>

      {/* Row 2: Document Name & Number */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.documentName || ''}
            onChange={(e) => {
              onChange('documentName', e.target.value);
              clearFieldError('documentName');
            }}
            className={getInputClass('documentName')}
            placeholder="e.g., Employment Contract"
            required
          />
          {validationErrors.documentName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.documentName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Document Number
          </label>
          <input
            type="text"
            value={data.documentNumber || ''}
            onChange={(e) => {
              onChange('documentNumber', e.target.value);
              clearFieldError('documentNumber');
            }}
            className={getInputClass('documentNumber')}
            placeholder="e.g., DOC-2024-001"
          />
        </div>
      </div>

      {/* Row 3: Issue Date & Expiry Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Issue Date
          </label>
          <input
            type="date"
            value={data.issueDate || ''}
            onChange={(e) => {
              onChange('issueDate', e.target.value);
              clearFieldError('issueDate');
            }}
            className={getInputClass('issueDate')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Expiry Date
          </label>
          <input
            type="date"
            value={data.expiryDate || ''}
            onChange={(e) => {
              onChange('expiryDate', e.target.value);
              clearFieldError('expiryDate');
            }}
            className={getInputClass('expiryDate')}
          />
        </div>
      </div>

      {/* Row 4: Access Level & Confidential */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Access Level
          </label>
          <select
            value={data.accessLevel || 'EMPLOYEE'}
            onChange={(e) => {
              onChange('accessLevel', e.target.value);
              clearFieldError('accessLevel');
            }}
            className={getInputClass('accessLevel')}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="HR_ONLY">HR Only</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Confidential
          </label>
          <div className="flex items-center h-[42px]">
            <input
              type="checkbox"
              checked={data.isConfidential || false}
              onChange={(e) => onChange('isConfidential', e.target.checked)}
              className="w-4 h-4 text-celestial-indigo rounded border-silver-mist/30 focus:ring-celestial-indigo"
            />
            <label className="ml-2 text-sm text-ink-black dark:text-pearl">
              Mark as confidential
            </label>
          </div>
        </div>
      </div>

      {/* Row 5: Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => {
            onChange('description', e.target.value);
            clearFieldError('description');
          }}
          className={getInputClass('description')}
          placeholder="Additional notes or description"
          rows={3}
        />
      </div>

      {/* Info Box */}
      <div className="bg-celestial-indigo/5 dark:bg-sky-900/10 border border-celestial-indigo/20 dark:border-sky-800/30 rounded-lg p-3">
        <p className="text-xs text-celestial-indigo dark:text-sky-400">
          <strong>Note:</strong> Documents are automatically tracked for expiry. You'll receive alerts 30 days before expiration.
        </p>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celestial-indigo"></div>
          <p className="text-sm text-silver-mist dark:text-slate-400">
            Loading documents...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerts Section */}
      {expiringCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                {expiringCount} document{expiringCount !== 1 ? 's' : ''} expiring soon
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Please review and update documents expiring within 30 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${isSelected
                  ? 'bg-celestial-indigo text-white'
                  : 'bg-white dark:bg-midnight-gray text-ink-black dark:text-pearl border border-silver-mist/30 hover:border-celestial-indigo'
                }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <DataPage
        title="Document Management"
        description="Manage employee documents with expiry tracking and version control"
        data={documents}
        columns={columns}
        onSave={handleSave}
        onDelete={handleDelete}
        onExport={handleExport}
        renderForm={renderForm}
        addButtonText="Add Document"
        searchPlaceholder="Search documents..."
        searchKeys={['documentName', 'fileName', 'documentNumber', 'category']}
      />
    </div>
  );
}


// Document Management Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type {
  Document, DocumentVersion, Folder, DocumentTemplate, DocumentRequest, DocumentShare,
  DocumentMetrics, DocumentSettings, SearchFilters
} from '../types';
import {
  DocumentService, FolderService, DocumentTemplateService, DocumentRequestService,
  DocumentShareService, DocumentAnalyticsService, DocumentSettingsService
} from '../services';
import { documentData } from '../data';
import { useToast } from '../../components/Toast';
import { logger } from '@/lib/logger';

interface UseDocumentsReturn {
  // State
  documents: Document[];
  folders: Folder[];
  templates: DocumentTemplate[];
  requests: DocumentRequest[];
  metrics: DocumentMetrics | null;
  settings: DocumentSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;

  // Document Methods
  loadDocuments: (filters?: SearchFilters) => Promise<void>;
  getDocumentById: (id: string) => Promise<Document | null>;
  uploadDocument: (document: Document) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string, deletedBy: string, deletedByName: string) => Promise<void>;
  uploadNewVersion: (documentId: string, version: DocumentVersion) => Promise<Document>;
  approveDocument: (id: string, approverId: string, comments?: string) => Promise<Document>;
  rejectDocument: (id: string, approverId: string, reason: string) => Promise<Document>;
  viewDocument: (id: string) => Promise<void>;
  downloadDocument: (id: string, downloadedBy: string, downloadedByName: string) => Promise<void>;

  // Folder Methods
  loadFolders: () => Promise<void>;
  createFolder: (folder: Folder) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  getDocumentsInFolder: (folderId: string) => Document[];

  // Template Methods
  loadTemplates: () => Promise<void>;
  createTemplate: (template: DocumentTemplate) => Promise<DocumentTemplate>;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
  generateFromTemplate: (templateId: string, data: { [key: string]: string }) => Promise<Document>;

  // Request Methods
  loadRequests: (filters?: { requestedBy?: string; status?: string }) => Promise<void>;
  submitRequest: (request: DocumentRequest) => Promise<DocumentRequest>;
  approveRequest: (id: string, approverId: string) => Promise<DocumentRequest>;
  fulfillRequest: (id: string, fulfilledBy: string, documentId: string) => Promise<DocumentRequest>;

  // Share Methods
  shareDocument: (share: DocumentShare) => Promise<DocumentShare>;
  revokeShare: (documentId: string, shareId: string) => Promise<void>;
  getSharedDocuments: (userId: string) => Document[];

  // Search & Filter Methods
  searchDocuments: (query: string) => Document[];
  filterDocuments: (filters: SearchFilters) => Promise<void>;
  getExpir ingDocuments: () => Document[];
  getPendingApprovals: (approverId?: string) => Document[];

  // Analytics Methods
  loadMetrics: () => Promise<void>;
  refreshMetrics: () => Promise<void>;

  // Settings Methods
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<DocumentSettings>) => Promise<void>;

  // Helper Methods
  validateDocument: (document: Partial<Document>) => { isValid: boolean; errors: string[] };
  checkAccessPermission: (document: Document, userId: string, permission: string) => boolean;
  initializeSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [metrics, setMetrics] = useState<DocumentMetrics | null>(null);
  const [settings, setSettings] = useState<DocumentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toast = useToast();

  // Document Methods
  const loadDocuments = useCallback(async (filters?: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DocumentService.getDocuments(filters);
      setDocuments(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to load documents: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getDocumentById = useCallback(async (id: string): Promise<Document | null> => {
    try {
      const document = await DocumentService.getDocumentById(id);
      return document;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to get document: ${error.message}`);
      return null;
    }
  }, [toast]);

  const uploadDocument = useCallback(async (document: Document): Promise<Document> => {
    try {
      setIsSaving(true);
      setError(null);
      const uploaded = await DocumentService.uploadDocument(document);
      setDocuments((prev) => [...prev, uploaded]);
      await loadMetrics();
      toast.success('Document uploaded successfully');
      return uploaded;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to upload document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document> => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await DocumentService.updateDocument(id, updates);
      setDocuments((prev) => prev.map(d => d.id === id ? updated : d));
      await loadMetrics();
      toast.success('Document updated successfully');
      return updated;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to update document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteDocument = useCallback(async (id: string, deletedBy: string, deletedByName: string): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      await DocumentService.deleteDocument(id, deletedBy, deletedByName);
      setDocuments((prev) => prev.filter(d => d.id !== id));
      await loadMetrics();
      toast.success('Document deleted successfully');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to delete document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const uploadNewVersion = useCallback(async (documentId: string, version: DocumentVersion): Promise<Document> => {
    try {
      setIsSaving(true);
      const updated = await DocumentService.uploadNewVersion(documentId, version);
      setDocuments((prev) => prev.map(d => d.id === documentId ? updated : d));
      toast.success(`New version ${version.versionNumber} uploaded successfully`);
      return updated;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to upload new version: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveDocument = useCallback(async (id: string, approverId: string, comments?: string): Promise<Document> => {
    try {
      setIsSaving(true);
      const approved = await DocumentService.approveDocument(id, approverId, comments);
      setDocuments((prev) => prev.map(d => d.id === id ? approved : d));
      await loadMetrics();
      toast.success('Document approved successfully');
      return approved;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to approve document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const rejectDocument = useCallback(async (id: string, approverId: string, reason: string): Promise<Document> => {
    try {
      setIsSaving(true);
      const rejected = await DocumentService.rejectDocument(id, approverId, reason);
      setDocuments((prev) => prev.map(d => d.id === id ? rejected : d));
      await loadMetrics();
      toast.success('Document rejected');
      return rejected;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to reject document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const viewDocument = useCallback(async (id: string): Promise<void> => {
    try {
      await DocumentService.incrementViewCount(id);
      setDocuments((prev) => prev.map(d => d.id === id ? { ...d, viewCount: d.viewCount + 1 } : d));
    } catch (err) {
      const error = err as Error;
      logger.error('Failed to increment view count:', error);
    }
  }, []);

  const downloadDocument = useCallback(async (id: string, downloadedBy: string, downloadedByName: string): Promise<void> => {
    try {
      await DocumentService.incrementDownloadCount(id, downloadedBy, downloadedByName);
      setDocuments((prev) => prev.map(d => d.id === id ? { ...d, downloadCount: d.downloadCount + 1 } : d));
      toast.success('Document downloaded');
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to download document: ${error.message}`);
    }
  }, [toast]);

  // Folder Methods
  const loadFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await FolderService.getFolders();
      setFolders(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to load folders: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createFolder = useCallback(async (folder: Folder): Promise<Folder> => {
    try {
      setIsSaving(true);
      const created = await FolderService.createFolder(folder);
      setFolders((prev) => [...prev, created]);
      toast.success('Folder created successfully');
      return created;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to create folder: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateFolder = useCallback(async (id: string, updates: Partial<Folder>): Promise<Folder> => {
    try {
      setIsSaving(true);
      const updated = await FolderService.updateFolder(id, updates);
      setFolders((prev) => prev.map(f => f.id === id ? updated : f));
      toast.success('Folder updated successfully');
      return updated;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to update folder: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteFolder = useCallback(async (id: string): Promise<void> => {
    try {
      setIsSaving(true);
      await FolderService.deleteFolder(id);
      setFolders((prev) => prev.filter(f => f.id !== id));
      toast.success('Folder deleted successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to delete folder: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const getDocumentsInFolder = useCallback((folderId: string): Document[] => {
    return documents.filter(d => d.folderId === folderId);
  }, [documents]);

  // Template Methods
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await DocumentTemplateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to load templates: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createTemplate = useCallback(async (template: DocumentTemplate): Promise<DocumentTemplate> => {
    try {
      setIsSaving(true);
      const created = await DocumentTemplateService.createTemplate(template);
      setTemplates((prev) => [...prev, created]);
      toast.success('Template created successfully');
      return created;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to create template: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    try {
      setIsSaving(true);
      const updated = await DocumentTemplateService.updateTemplate(id, updates);
      setTemplates((prev) => prev.map(t => t.id === id ? updated : t));
      toast.success('Template updated successfully');
      return updated;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to update template: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const generateFromTemplate = useCallback(async (templateId: string, data: { [key: string]: string }): Promise<Document> => {
    try {
      setIsSaving(true);
      // This would call a service method to generate document from template
      // For now, creating a placeholder document
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        documentCode: `GEN-${Date.now()}`,
        title: `Generated from ${template.templateName}`,
        description: `Document generated from template ${template.templateName}`,
        documentType: 'form',
        category: template.category,
        status: 'draft',
        accessLevel: 'internal',
        fileUrl: `/generated/${Date.now()}.${template.fileFormat}`,
        fileName: `generated-${Date.now()}.${template.fileFormat}`,
        fileSize: 0,
        fileFormat: template.fileFormat,
        version: 1,
        versionHistory: [],
        tags: ['generated', 'template'],
        owner: {
          ownerId: 'system',
          ownerName: 'System',
          ownerType: 'company'
        },
        uploadedBy: 'system',
        uploadedByName: 'System',
        uploadedDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        approvalRequired: false,
        approvalStatus: 'not_required',
        isExpired: false,
        viewCount: 0,
        downloadCount: 0,
        shares: [],
        metadata: {},
        isTemplate: false,
        isMandatory: false,
        createdDate: new Date().toISOString()
      };

      await uploadDocument(newDocument);
      toast.success('Document generated from template');
      return newDocument;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to generate document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [templates, uploadDocument, toast]);

  // Request Methods
  const loadRequests = useCallback(async (filters?: { requestedBy?: string; status?: string }) => {
    try {
      setIsLoading(true);
      const data = await DocumentRequestService.getRequests(filters);
      setRequests(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to load requests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const submitRequest = useCallback(async (request: DocumentRequest): Promise<DocumentRequest> => {
    try {
      setIsSaving(true);
      const submitted = await DocumentRequestService.submitRequest(request);
      setRequests((prev) => [...prev, submitted]);
      toast.success('Document request submitted');
      return submitted;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to submit request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveRequest = useCallback(async (id: string, approverId: string): Promise<DocumentRequest> => {
    try {
      setIsSaving(true);
      const approved = await DocumentRequestService.approveRequest(id, approverId);
      setRequests((prev) => prev.map(r => r.id === id ? approved : r));
      toast.success('Document request approved');
      return approved;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to approve request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const fulfillRequest = useCallback(async (id: string, fulfilledBy: string, documentId: string): Promise<DocumentRequest> => {
    try {
      setIsSaving(true);
      const fulfilled = await DocumentRequestService.fulfillRequest(id, fulfilledBy, documentId);
      setRequests((prev) => prev.map(r => r.id === id ? fulfilled : r));
      toast.success('Document request fulfilled');
      return fulfilled;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to fulfill request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Share Methods
  const shareDocument = useCallback(async (share: DocumentShare): Promise<DocumentShare> => {
    try {
      setIsSaving(true);
      const created = await DocumentShareService.shareDocument(share);
      // Update local document state
      setDocuments((prev) => prev.map(d => {
        if (d.id === share.documentId) {
          return { ...d, shares: [...d.shares, created] };
        }
        return d;
      }));
      toast.success('Document shared successfully');
      return created;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to share document: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const revokeShare = useCallback(async (documentId: string, shareId: string): Promise<void> => {
    try {
      setIsSaving(true);
      await DocumentShareService.revokeShare(documentId, shareId);
      // Update local document state
      setDocuments((prev) => prev.map(d => {
        if (d.id === documentId) {
          return { ...d, shares: d.shares.filter(s => s.id !== shareId) };
        }
        return d;
      }));
      toast.success('Share revoked');
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to revoke share: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const getSharedDocuments = useCallback((userId: string): Document[] => {
    return documents.filter(d =>
      d.shares.some(s => s.sharedWith === userId || s.sharedWithType === 'public')
    );
  }, [documents]);

  // Search & Filter Methods
  const searchDocuments = useCallback((query: string): Document[] => {
    const lowerQuery = query.toLowerCase();
    return documents.filter(d =>
      d.title.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery) ||
      d.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [documents]);

  const filterDocuments = useCallback(async (filters: SearchFilters) => {
    await loadDocuments(filters);
  }, [loadDocuments]);

  const getExpiringDocuments = useCallback((): Document[] => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return documents.filter(d =>
      d.expiryDate &&
      !d.isExpired &&
      new Date(d.expiryDate) <= thirtyDaysFromNow &&
      new Date(d.expiryDate) > now
    );
  }, [documents]);

  const getPendingApprovals = useCallback((approverId?: string): Document[] => {
    return documents.filter(d => {
      if (d.approvalStatus !== 'pending') return false;
      if (!approverId) return true;
      return d.approvers?.some(a => a.approverId === approverId && a.status === 'pending');
    });
  }, [documents]);

  // Analytics Methods
  const loadMetrics = useCallback(async () => {
    try {
      const data = await DocumentAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to load metrics: ${error.message}`);
    }
  }, [toast]);

  const refreshMetrics = useCallback(async () => {
    await loadMetrics();
    toast.success('Metrics refreshed');
  }, [loadMetrics, toast]);

  // Settings Methods
  const loadSettings = useCallback(async () => {
    try {
      const data = await DocumentSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to load settings: ${error.message}`);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<DocumentSettings>) => {
    try {
      setIsSaving(true);
      const updated = await DocumentSettingsService.updateSettings(updates);
      setSettings(updated);
      toast.success('Settings updated successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Helper Methods
  const validateDocument = useCallback((document: Partial<Document>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!document.title) errors.push('Title is required');
    if (!document.documentType) errors.push('Document type is required');
    if (!document.category) errors.push('Category is required');
    if (!document.fileUrl) errors.push('File is required');
    if (!document.accessLevel) errors.push('Access level is required');
    if (document.tags && document.tags.length === 0) errors.push('At least one tag is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const checkAccessPermission = useCallback((document: Document, userId: string, permission: string): boolean => {
    // Public documents - everyone can view
    if (document.accessLevel === 'public' && permission === 'view') return true;

    // Owner always has full access
    if (document.owner.ownerId === userId) return true;

    // Check shares
    const share = document.shares.find(s => s.sharedWith === userId);
    if (share) {
      if (permission === 'view') return true;
      if (permission === 'download' && ['download', 'edit', 'admin'].includes(share.permission)) return true;
      if (permission === 'edit' && ['edit', 'admin'].includes(share.permission)) return true;
      if (permission === 'admin' && share.permission === 'admin') return true;
    }

    return false;
  }, []);

  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);

      // Load sample data
      for (const document of documentData.documents) {
        await DocumentService.uploadDocument(document);
      }

      for (const folder of documentData.folders) {
        await FolderService.createFolder(folder);
      }

      for (const template of documentData.templates) {
        await DocumentTemplateService.createTemplate(template);
      }

      for (const request of documentData.requests) {
        await DocumentRequestService.submitRequest(request);
      }

      await loadDocuments();
      await loadFolders();
      await loadTemplates();
      await loadRequests();
      await loadMetrics();
      await loadSettings();

      toast.success('Sample data initialized successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to initialize sample data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const clearAllData = useCallback(async () => {
    try {
      setIsSaving(true);

      localStorage.removeItem('documents');
      localStorage.removeItem('document_folders');
      localStorage.removeItem('document_templates');
      localStorage.removeItem('document_requests');
      localStorage.removeItem('document_checkouts');
      localStorage.removeItem('document_reviews');
      localStorage.removeItem('document_audits');
      localStorage.removeItem('document_policies');
      localStorage.removeItem('document_metrics');
      localStorage.removeItem('document_settings');

      setDocuments([]);
      setFolders([]);
      setTemplates([]);
      setRequests([]);
      setMetrics(null);
      setSettings(null);

      toast.success('All document data cleared');
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to clear data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Load initial data
  useEffect(() => {
    loadDocuments();
    loadFolders();
    loadTemplates();
    loadMetrics();
    loadSettings();
  }, []);

  return {
    // State
    documents,
    folders,
    templates,
    requests,
    metrics,
    settings,
    isLoading,
    isSaving,
    error,

    // Document Methods
    loadDocuments,
    getDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
    uploadNewVersion,
    approveDocument,
    rejectDocument,
    viewDocument,
    downloadDocument,

    // Folder Methods
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getDocumentsInFolder,

    // Template Methods
    loadTemplates,
    createTemplate,
    updateTemplate,
    generateFromTemplate,

    // Request Methods
    loadRequests,
    submitRequest,
    approveRequest,
    fulfillRequest,

    // Share Methods
    shareDocument,
    revokeShare,
    getSharedDocuments,

    // Search & Filter Methods
    searchDocuments,
    filterDocuments,
    getExpiringDocuments,
    getPendingApprovals,

    // Analytics Methods
    loadMetrics,
    refreshMetrics,

    // Settings Methods
    loadSettings,
    updateSettings,

    // Helper Methods
    validateDocument,
    checkAccessPermission,
    initializeSampleData,
    clearAllData
  };
};

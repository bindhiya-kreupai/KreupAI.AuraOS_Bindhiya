// Document Management Services
import { APIClient } from '@/lib/api-client';
import type {
  Document, DocumentVersion, Folder, DocumentTemplate, DocumentRequest, DocumentCheckout,
  DocumentReview, DocumentAudit, DocumentPolicy, DocumentMetrics, DocumentSettings,
  DocumentShare, SearchFilters, BulkUploadResult
} from './types';

export class DocumentService {
  static async getDocuments(filters?: SearchFilters): Promise<Document[]> {
    return APIClient.get<Document[]>('/documents', filters);
  }

  static async getDocumentById(id: string): Promise<Document | null> {
    return APIClient.get<Document | null>(`/documents/${id}`);
  }

  static async uploadDocument(document: Document): Promise<Document> {
    return APIClient.post<Document>('/documents', document);
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    return APIClient.put<Document>(`/documents/${id}`, updates);
  }

  static async deleteDocument(id: string, deletedBy: string, deletedByName: string): Promise<void> {
    return APIClient.delete<void>(`/documents/${id}`, { deletedBy, deletedByName });
  }

  static async uploadNewVersion(documentId: string, version: DocumentVersion): Promise<Document> {
    return APIClient.post<Document>(`/documents/${documentId}/versions`, version);
  }

  static async approveDocument(id: string, approverId: string, comments?: string): Promise<Document> {
    return APIClient.post<Document>(`/documents/${id}/approve`, { approverId, comments });
  }

  static async rejectDocument(id: string, approverId: string, reason: string): Promise<Document> {
    return APIClient.post<Document>(`/documents/${id}/reject`, { approverId, reason });
  }

  static async incrementViewCount(id: string): Promise<void> {
    return APIClient.post<void>(`/documents/${id}/view`, {});
  }

  static async incrementDownloadCount(id: string, downloadedBy: string, downloadedByName: string): Promise<void> {
    return APIClient.post<void>(`/documents/${id}/download`, { downloadedBy, downloadedByName });
  }
}

export class FolderService {
  static async getFolders(): Promise<Folder[]> {
    return APIClient.get<Folder[]>('/documents/folders');
  }

  static async createFolder(folder: Folder): Promise<Folder> {
    return APIClient.post<Folder>('/documents/folders', folder);
  }

  static async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    return APIClient.put<Folder>(`/documents/folders/${id}`, updates);
  }

  static async deleteFolder(id: string): Promise<void> {
    return APIClient.delete<void>(`/documents/folders/${id}`);
  }
}

export class DocumentTemplateService {
  static async getTemplates(): Promise<DocumentTemplate[]> {
    return APIClient.get<DocumentTemplate[]>('/documents/templates');
  }

  static async createTemplate(template: DocumentTemplate): Promise<DocumentTemplate> {
    return APIClient.post<DocumentTemplate>('/documents/templates', template);
  }

  static async updateTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    return APIClient.put<DocumentTemplate>(`/documents/templates/${id}`, updates);
  }
}

export class DocumentRequestService {
  static async getRequests(filters?: { requestedBy?: string; status?: string }): Promise<DocumentRequest[]> {
    return APIClient.get<DocumentRequest[]>('/documents/requests', filters);
  }

  static async submitRequest(request: DocumentRequest): Promise<DocumentRequest> {
    return APIClient.post<DocumentRequest>('/documents/requests', request);
  }

  static async updateRequest(id: string, updates: Partial<DocumentRequest>): Promise<DocumentRequest> {
    return APIClient.put<DocumentRequest>(`/documents/requests/${id}`, updates);
  }

  static async approveRequest(id: string, approverId: string): Promise<DocumentRequest> {
    return APIClient.post<DocumentRequest>(`/documents/requests/${id}/approve`, { approverId });
  }

  static async fulfillRequest(id: string, fulfilledBy: string, documentId: string): Promise<DocumentRequest> {
    return APIClient.post<DocumentRequest>(`/documents/requests/${id}/fulfill`, { fulfilledBy, documentId });
  }
}

export class DocumentShareService {
  static async shareDocument(share: DocumentShare): Promise<DocumentShare> {
    return APIClient.post<DocumentShare>(`/documents/${share.documentId}/share`, share);
  }

  static async revokeShare(documentId: string, shareId: string): Promise<void> {
    return APIClient.delete<void>(`/documents/${documentId}/shares/${shareId}`);
  }
}

export class DocumentCheckoutService {
  static async checkoutDocument(checkout: DocumentCheckout): Promise<DocumentCheckout> {
    return APIClient.post<DocumentCheckout>('/documents/checkouts', checkout);
  }

  static async returnDocument(checkoutId: string): Promise<DocumentCheckout> {
    return APIClient.post<DocumentCheckout>(`/documents/checkouts/${checkoutId}/return`, {});
  }
}

export class DocumentReviewService {
  static async submitReview(review: DocumentReview): Promise<DocumentReview> {
    return APIClient.post<DocumentReview>('/documents/reviews', review);
  }

  static async getReviewsForDocument(documentId: string): Promise<DocumentReview[]> {
    return APIClient.get<DocumentReview[]>(`/documents/${documentId}/reviews`);
  }
}

export class DocumentAuditService {
  static async logAction(documentId: string, action: DocumentAudit['action'], performedBy: string, performedByName: string, details?: string): Promise<DocumentAudit> {
    return APIClient.post<DocumentAudit>(`/documents/${documentId}/audit`, {
      action,
      performedBy,
      performedByName,
      details
    });
  }

  static async getAuditLog(documentId: string): Promise<DocumentAudit[]> {
    return APIClient.get<DocumentAudit[]>(`/documents/${documentId}/audit`);
  }
}

export class DocumentAnalyticsService {
  static async getMetrics(): Promise<DocumentMetrics> {
    return APIClient.get<DocumentMetrics>('/documents/analytics/metrics');
  }
}

export class DocumentSettingsService {
  static async getSettings(): Promise<DocumentSettings> {
    return APIClient.get<DocumentSettings>('/documents/settings');
  }

  static async updateSettings(updates: Partial<DocumentSettings>): Promise<DocumentSettings> {
    return APIClient.put<DocumentSettings>('/documents/settings', updates);
  }
}

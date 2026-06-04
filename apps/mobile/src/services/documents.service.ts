/**
 * Documents Service (mobile)
 * Bridges to /api/v1/documents for employee ESS document access (payslips,
 * tax docs, contracts, certificates). Returns a presigned URL the native
 * Linking module can hand off to the platform PDF viewer.
 */

import { apiService } from './api.service';

export type DocumentCategory =
  | 'PAYSLIP'
  | 'TAX_CERTIFICATE'
  | 'CONTRACT'
  | 'OFFER_LETTER'
  | 'EXPERIENCE_LETTER'
  | 'EDUCATION_CERTIFICATE'
  | 'IDENTITY_DOCUMENT'
  | 'OTHER';

export interface EmployeeDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  fileSize?: number;
  contentType?: string;
  issuedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export interface DocumentListResponse {
  items: EmployeeDocument[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

class DocumentsService {
  async list(params?: {
    category?: DocumentCategory;
    page?: number;
    limit?: number;
  }): Promise<DocumentListResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiService.get<DocumentListResponse>(`/v1/documents?${query.toString()}`);
  }

  async getDownloadUrl(id: string): Promise<string> {
    const response = await apiService.get<{ downloadUrl: string }>(
      `/v1/documents/${id}/download-url`
    );
    return response.downloadUrl;
  }
}

export const documentsService = new DocumentsService();

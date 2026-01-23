import axios from 'axios';

const BASE_PATH = '/api/v1/documents';

// Types
export interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  metadata: Record<string, string>;
  uploadedBy: string;
  employeeId?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetDocumentsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Service functions
export async function uploadDocument(
  file: File,
  category: string,
  metadata?: Record<string, string>
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const response = await axios.post<Document>(BASE_PATH, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function getDocuments(
  params: GetDocumentsParams
): Promise<PaginatedResponse<Document>> {
  const response = await axios.get<PaginatedResponse<Document>>(BASE_PATH, {
    params,
  });

  return response.data;
}

export async function getDocumentById(id: string): Promise<Document> {
  const response = await axios.get<Document>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function downloadDocument(id: string): Promise<Blob> {
  const response = await axios.get(`${BASE_PATH}/${id}/download`, {
    responseType: 'blob',
  });

  return response.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

export async function getEmployeeDocuments(
  employeeId: string
): Promise<Document[]> {
  const response = await axios.get<Document[]>(
    `${BASE_PATH}/employee/${employeeId}`
  );

  return response.data;
}

import axios from 'axios';

const BASE_PATH = '/api/v1/admin/data-import';

// Types
export interface ImportUpload {
  id: string;
  fileName: string;
  rowCount: number;
  columns: string[];
  preview: Record<string, unknown>[];
}

export interface ColumnMapping {
  sourceColumns: string[];
  targetFields: {
    name: string;
    label: string;
    required: boolean;
    type: string;
  }[];
  suggestedMapping: Record<string, string>;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
  warnings: {
    row: number;
    field: string;
    message: string;
  }[];
}

export interface ImportJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export interface ImportStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  processedRows: number;
  totalRows: number;
  errors: string[];
  completedAt?: string;
}

// Service functions
export async function uploadFile(file: File): Promise<ImportUpload> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<ImportUpload>(
    `${BASE_PATH}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function getColumnMapping(
  uploadId: string
): Promise<ColumnMapping> {
  const response = await axios.get<ColumnMapping>(
    `${BASE_PATH}/${uploadId}/mapping`
  );
  return response.data;
}

export async function setMapping(
  uploadId: string,
  mapping: Record<string, string>
): Promise<void> {
  await axios.put(`${BASE_PATH}/${uploadId}/mapping`, { mapping });
}

export async function validateImport(
  uploadId: string
): Promise<ValidationResult> {
  const response = await axios.post<ValidationResult>(
    `${BASE_PATH}/${uploadId}/validate`
  );
  return response.data;
}

export async function executeImport(uploadId: string): Promise<ImportJob> {
  const response = await axios.post<ImportJob>(
    `${BASE_PATH}/${uploadId}/execute`
  );
  return response.data;
}

export async function getImportStatus(jobId: string): Promise<ImportStatus> {
  const response = await axios.get<ImportStatus>(
    `${BASE_PATH}/jobs/${jobId}`
  );
  return response.data;
}

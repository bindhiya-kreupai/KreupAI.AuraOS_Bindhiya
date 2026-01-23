import axios from 'axios';

const BASE_PATH = '/api/v1/tax-documents';

// Types
export interface TaxDocument {
  id: string;
  type: 'W2' | '1099' | 'Form16' | 'P60';
  year: number;
  employeeName: string;
  status: 'available' | 'processing' | 'unavailable';
  generatedAt?: string;
  fileSize?: number;
}

// Service functions
export async function listTaxDocuments(
  year?: number
): Promise<TaxDocument[]> {
  const response = await axios.get<TaxDocument[]>(BASE_PATH, {
    params: year ? { year } : undefined,
  });
  return response.data;
}

export async function getTaxDocument(id: string): Promise<TaxDocument> {
  const response = await axios.get<TaxDocument>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function downloadTaxDocument(id: string): Promise<Blob> {
  const response = await axios.get(`${BASE_PATH}/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function getAvailableYears(): Promise<number[]> {
  const response = await axios.get<number[]>(`${BASE_PATH}/years`);
  return response.data;
}

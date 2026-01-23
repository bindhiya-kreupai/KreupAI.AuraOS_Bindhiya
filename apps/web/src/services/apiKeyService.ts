import axios from 'axios';

const BASE_PATH = '/api/v1/admin/api-keys';

// Types
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  active: boolean;
}

export interface ApiKeyCreate {
  name: string;
  scopes: string[];
  expiresAt?: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  secret: string;
}

export interface ApiKeyUsage {
  keyId: string;
  requestCount: number;
  lastRequest?: string;
  topEndpoints: {
    endpoint: string;
    count: number;
  }[];
}

// Service functions
export async function listApiKeys(): Promise<ApiKey[]> {
  const response = await axios.get<ApiKey[]>(BASE_PATH);
  return response.data;
}

export async function generateApiKey(
  data: ApiKeyCreate
): Promise<ApiKeyWithSecret> {
  const response = await axios.post<ApiKeyWithSecret>(BASE_PATH, data);
  return response.data;
}

export async function revokeApiKey(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

export async function getApiKeyUsage(id: string): Promise<ApiKeyUsage> {
  const response = await axios.get<ApiKeyUsage>(
    `${BASE_PATH}/${id}/usage`
  );
  return response.data;
}

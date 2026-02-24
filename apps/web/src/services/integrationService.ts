import axios from 'axios';

const BASE_PATH = '/api/v1/integrations';

// Types
export interface Integration {
  id: string;
  name: string;
  provider:
    | 'slack'
    | 'teams'
    | 'google'
    | 'outlook'
    | 'docusign'
    | 'zoom'
    | 'jira'
    | 'salesforce';
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: string;
  config: Record<string, string>;
}

export interface IntegrationCatalogItem {
  id: string;
  name: string;
  provider: string;
  description: string;
  category:
    | 'communication'
    | 'calendar'
    | 'hr'
    | 'productivity'
    | 'finance';
  icon: string;
  setupRequired: string[];
}

export interface ConnectionResult {
  success: boolean;
  integrationId?: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
}

export interface SyncStatus {
  lastSync: string;
  nextSync: string;
  status: 'idle' | 'syncing' | 'error';
  progress?: number;
}

// Service functions
export async function listIntegrations(): Promise<Integration[]> {
  const response = await axios.get<Integration[]>(BASE_PATH);
  return response.data;
}

export async function getIntegration(id: string): Promise<Integration> {
  const response = await axios.get<Integration>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function connectIntegration(
  id: string,
  config: Record<string, string>
): Promise<ConnectionResult> {
  const response = await axios.post<ConnectionResult>(
    `${BASE_PATH}/${id}/connect`,
    config
  );
  return response.data;
}

export async function disconnectIntegration(id: string): Promise<void> {
  await axios.post(`${BASE_PATH}/${id}/disconnect`);
}

export async function syncIntegration(id: string): Promise<SyncResult> {
  const response = await axios.post<SyncResult>(
    `${BASE_PATH}/${id}/sync`
  );
  return response.data;
}

export async function getSyncStatus(id: string): Promise<SyncStatus> {
  const response = await axios.get<SyncStatus>(
    `${BASE_PATH}/${id}/sync-status`
  );
  return response.data;
}

export async function getAvailableIntegrations(): Promise<
  IntegrationCatalogItem[]
> {
  const response = await axios.get<IntegrationCatalogItem[]>(
    `${BASE_PATH}/catalog`
  );
  return response.data;
}

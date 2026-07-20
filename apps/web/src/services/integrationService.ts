import axios from 'axios';

/**
 * Integration service layer.
 *
 * Canonical backend: `/api/integrations` (catalog / connections / connect /
 * disconnect / sync) — the same DB-backed routes used by the Integration Hub
 * UI at `/dashboard/integration-hub/*`. The older `/api/v1/integrations/*`
 * per-resource CRUD endpoints referenced by an earlier draft of this file
 * never existed (only OAuth callbacks live under that path), so all calls here
 * now target the live contract.
 */

const BASE_PATH = '/api/integrations';

// Types
export interface Integration {
  id: string;
  integrationId: string;
  name: string;
  provider?: string;
  category?: string;
  status: string; // 'connected' | 'disconnected' | 'error' | 'ACTIVE' | ...
  lastSyncAt?: string | null;
  config?: Record<string, unknown>;
}

export interface IntegrationCatalogItem {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  category?: string;
  icon?: string;
}

export interface ConnectionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Service functions
export async function listConnections(): Promise<Integration[]> {
  const response = await axios.get<ApiEnvelope<Integration[] | { connections: Integration[] }>>(
    `${BASE_PATH}?type=connections`
  );
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  return (data as { connections?: Integration[] })?.connections ?? [];
}

export async function getAvailableIntegrations(): Promise<IntegrationCatalogItem[]> {
  const response = await axios.get<
    ApiEnvelope<{ integrations: IntegrationCatalogItem[] } | IntegrationCatalogItem[]>
  >(`${BASE_PATH}?type=catalog`);
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  return (data as { integrations?: IntegrationCatalogItem[] })?.integrations ?? [];
}

export async function connectIntegration(
  integrationId: string,
  configuration: Record<string, unknown> = {},
  credentials: Record<string, unknown> = {}
): Promise<ConnectionResult> {
  const response = await axios.post<ConnectionResult>(BASE_PATH, {
    action: 'connect',
    integrationId,
    configuration,
    credentials,
  });
  return response.data;
}

export async function disconnectIntegration(connectionId: string): Promise<ConnectionResult> {
  const response = await axios.post<ConnectionResult>(BASE_PATH, {
    action: 'disconnect',
    connectionId,
  });
  return response.data;
}

export async function syncIntegration(
  connectionId: string,
  entity = 'all',
  syncType: 'INCREMENTAL' | 'FULL' = 'INCREMENTAL'
): Promise<SyncResult> {
  const response = await axios.post<SyncResult>(BASE_PATH, {
    action: 'sync',
    connectionId,
    entity,
    syncType,
  });
  return response.data;
}

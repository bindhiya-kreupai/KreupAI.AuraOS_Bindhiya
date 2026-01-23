import axios from 'axios';

const BASE_PATH = '/api/v1/webhooks';

// Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface WebhookCreate {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}

export interface WebhookLog {
  id: string;
  eventType: string;
  payload: string;
  responseStatus: number;
  responseBody: string;
  deliveredAt: string;
  success: boolean;
}

export interface WebhookTestResult {
  success: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
}

// Service functions
export async function createWebhook(data: WebhookCreate): Promise<Webhook> {
  const response = await axios.post<Webhook>(BASE_PATH, data);
  return response.data;
}

export async function listWebhooks(): Promise<Webhook[]> {
  const response = await axios.get<Webhook[]>(BASE_PATH);
  return response.data;
}

export async function getWebhook(id: string): Promise<Webhook> {
  const response = await axios.get<Webhook>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function updateWebhook(
  id: string,
  data: Partial<WebhookCreate>
): Promise<Webhook> {
  const response = await axios.patch<Webhook>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

export async function deleteWebhook(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

export async function getWebhookLogs(
  id: string,
  params?: { page?: number }
): Promise<PaginatedResponse<WebhookLog>> {
  const response = await axios.get<PaginatedResponse<WebhookLog>>(
    `${BASE_PATH}/${id}/logs`,
    { params }
  );
  return response.data;
}

export async function testWebhook(id: string): Promise<WebhookTestResult> {
  const response = await axios.post<WebhookTestResult>(
    `${BASE_PATH}/${id}/test`
  );
  return response.data;
}

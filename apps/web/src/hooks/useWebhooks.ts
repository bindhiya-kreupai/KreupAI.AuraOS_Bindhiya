'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as webhookService from '@/services/webhookService';

const webhookKeys = {
  all: ['webhooks'] as const,
  list: () => [...webhookKeys.all, 'list'] as const,
  detail: (id: string) => [...webhookKeys.all, 'detail', id] as const,
  logs: (id: string) => [...webhookKeys.all, 'logs', id] as const,
};

export function useWebhookList() {
  return useQuery({ queryKey: webhookKeys.list(), queryFn: webhookService.listWebhooks });
}
export function useWebhookDetail(id: string) {
  return useQuery({ queryKey: webhookKeys.detail(id), queryFn: () => webhookService.getWebhook(id), enabled: !!id });
}
export function useWebhookLogs(id: string, params?: { page?: number }) {
  return useQuery({ queryKey: [...webhookKeys.logs(id), params], queryFn: () => webhookService.getWebhookLogs(id, params), enabled: !!id });
}
export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: webhookService.createWebhook, onSuccess: () => { qc.invalidateQueries({ queryKey: webhookKeys.all }); } });
}
export function useUpdateWebhook() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Parameters<typeof webhookService.updateWebhook>[1] }) => webhookService.updateWebhook(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: webhookKeys.all }); } });
}
export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: webhookService.deleteWebhook, onSuccess: () => { qc.invalidateQueries({ queryKey: webhookKeys.all }); } });
}
export function useTestWebhook() {
  return useMutation({ mutationFn: webhookService.testWebhook });
}

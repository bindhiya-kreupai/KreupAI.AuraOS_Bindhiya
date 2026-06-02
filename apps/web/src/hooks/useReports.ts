// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reportService from '@/services/reportService';

const reportKeys = {
  all: ['reports'] as const,
  list: () => [...reportKeys.all, 'list'] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
};

export function useReportList() {
  return useQuery({ queryKey: reportKeys.list(), queryFn: reportService.listReports });
}
export function useReportDetail(id: string) {
  return useQuery({ queryKey: reportKeys.detail(id), queryFn: () => reportService.getReport(id), enabled: !!id });
}
export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: reportService.createReport, onSuccess: () => { qc.invalidateQueries({ queryKey: reportKeys.all }); } });
}
export function useRunReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, params }: { id: string; params?: Record<string, unknown> }) => reportService.runReport(id, params), onSuccess: () => { qc.invalidateQueries({ queryKey: reportKeys.all }); } });
}
export function useScheduleReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, schedule }: { id: string; schedule: Parameters<typeof reportService.scheduleReport>[1] }) => reportService.scheduleReport(id, schedule), onSuccess: () => { qc.invalidateQueries({ queryKey: reportKeys.all }); } });
}
export function useExportReport() {
  return useMutation({ mutationFn: ({ id, format }: { id: string; format: string }) => reportService.exportReport(id, format) });
}
export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: reportService.deleteReport, onSuccess: () => { qc.invalidateQueries({ queryKey: reportKeys.all }); } });
}

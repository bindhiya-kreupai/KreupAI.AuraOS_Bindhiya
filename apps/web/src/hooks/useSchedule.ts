'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as scheduleService from '@/services/scheduleService';

const scheduleKeys = {
  all: ['schedules'] as const,
  list: (params?: Record<string, unknown>) => [...scheduleKeys.all, 'list', params] as const,
  templates: () => [...scheduleKeys.all, 'templates'] as const,
};

export function useSchedules(params?: Record<string, unknown>) {
  return useQuery({ queryKey: scheduleKeys.list(params), queryFn: () => scheduleService.getSchedules(params) });
}
export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: scheduleService.createSchedule, onSuccess: () => { qc.invalidateQueries({ queryKey: scheduleKeys.all }); } });
}
export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Parameters<typeof scheduleService.updateSchedule>[1] }) => scheduleService.updateSchedule(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: scheduleKeys.all }); } });
}
export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: scheduleService.deleteSchedule, onSuccess: () => { qc.invalidateQueries({ queryKey: scheduleKeys.all }); } });
}
export function useCopySchedule() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ sourceWeek, targetWeek }: { sourceWeek: string; targetWeek: string }) => scheduleService.copySchedule(sourceWeek, targetWeek), onSuccess: () => { qc.invalidateQueries({ queryKey: scheduleKeys.all }); } });
}
export function useShiftTemplates() {
  return useQuery({ queryKey: scheduleKeys.templates(), queryFn: scheduleService.getShiftTemplates });
}

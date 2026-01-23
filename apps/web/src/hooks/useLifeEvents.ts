'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as lifeEventService from '@/services/lifeEventService';

const lifeEventKeys = {
  all: ['lifeEvents'] as const,
  list: () => [...lifeEventKeys.all, 'list'] as const,
  detail: (id: string) => [...lifeEventKeys.all, 'detail', id] as const,
};

export function useLifeEvents() {
  return useQuery({ queryKey: lifeEventKeys.list(), queryFn: lifeEventService.getLifeEvents });
}
export function useLifeEventDetails(id: string) {
  return useQuery({ queryKey: lifeEventKeys.detail(id), queryFn: () => lifeEventService.getLifeEventDetails(id), enabled: !!id });
}
export function useReportLifeEvent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: lifeEventService.reportLifeEvent, onSuccess: () => { qc.invalidateQueries({ queryKey: lifeEventKeys.all }); } });
}
export function useUploadSupportingDoc() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ eventId, file }: { eventId: string; file: File }) => lifeEventService.uploadSupportingDoc(eventId, file), onSuccess: () => { qc.invalidateQueries({ queryKey: lifeEventKeys.all }); } });
}

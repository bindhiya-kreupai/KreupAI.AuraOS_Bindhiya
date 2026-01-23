'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dependentService from '@/services/dependentService';

const dependentKeys = {
  all: ['dependents'] as const,
  list: () => [...dependentKeys.all, 'list'] as const,
  detail: (id: string) => [...dependentKeys.all, 'detail', id] as const,
};

export function useDependentList() {
  return useQuery({ queryKey: dependentKeys.list(), queryFn: dependentService.listDependents });
}
export function useDependentDetail(id: string) {
  return useQuery({ queryKey: dependentKeys.detail(id), queryFn: () => dependentService.getDependent(id), enabled: !!id });
}
export function useAddDependent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: dependentService.addDependent, onSuccess: () => { qc.invalidateQueries({ queryKey: dependentKeys.all }); } });
}
export function useUpdateDependent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Parameters<typeof dependentService.updateDependent>[1] }) => dependentService.updateDependent(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: dependentKeys.all }); } });
}
export function useRemoveDependent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: dependentService.removeDependent, onSuccess: () => { qc.invalidateQueries({ queryKey: dependentKeys.all }); } });
}

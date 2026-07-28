import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from '@/lib/api-client';
import type { FacultyMember, TenureApplication, ResearchGrant, AdjunctFaculty } from '../types';

// ============================================================================
// FACULTY TENURE QUERIES
// ============================================================================

export function useFaculty(params?: any) {
  return useQuery({
    queryKey: ['education', 'faculty', params],
    queryFn: () =>
      APIClient.get<FacultyMember[]>(
        '/education/faculty' + (params?.search ? `?search=${params.search}` : '')
      ),
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facultyData: Partial<FacultyMember>) =>
      APIClient.post<FacultyMember>('/education/faculty', facultyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'faculty'] });
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ facultyId, updates }: { facultyId: string; updates: Partial<FacultyMember> }) =>
      APIClient.put<FacultyMember>(`/education/faculty/${facultyId}`, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'faculty'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'faculty', variables.facultyId] });
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facultyId: string) => APIClient.delete(`/education/faculty/${facultyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'faculty'] });
    },
  });
}

export function useTenureApplications(params?: any) {
  return useQuery({
    queryKey: ['education', 'tenure', params],
    queryFn: () =>
      APIClient.get<TenureApplication[]>(
        '/education/tenure' + (params?.search ? `?search=${params.search}` : '')
      ),
  });
}

export function useCreateTenureApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TenureApplication>) =>
      APIClient.post<TenureApplication>('/education/tenure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'tenure'] });
    },
  });
}

export function useUpdateTenureApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      updates,
    }: {
      applicationId: string;
      updates: Partial<TenureApplication>;
    }) => APIClient.put<TenureApplication>(`/education/tenure/${applicationId}`, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'tenure'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'tenure', variables.applicationId] });
    },
  });
}

export function useDeleteTenureApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => APIClient.delete(`/education/tenure/${applicationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'tenure'] });
    },
  });
}

// ============================================================================
// RESEARCH GRANTS QUERIES
// ============================================================================

export function useGrants(params?: any) {
  return useQuery({
    queryKey: ['education', 'grants', params],
    queryFn: () =>
      APIClient.get<ResearchGrant[]>(
        '/education/grants' + (params?.search ? `?search=${params.search}` : '')
      ),
  });
}

export function useCreateGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grantData: Partial<ResearchGrant>) =>
      APIClient.post<ResearchGrant>('/education/grants', grantData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'grants'] });
    },
  });
}

export function useUpdateGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ grantId, updates }: { grantId: string; updates: Partial<ResearchGrant> }) =>
      APIClient.put<ResearchGrant>(`/education/grants/${grantId}`, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'grants'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'grants', variables.grantId] });
    },
  });
}

export function useDeleteGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grantId: string) => APIClient.delete(`/education/grants/${grantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'grants'] });
    },
  });
}

// ============================================================================
// ADJUNCT MANAGEMENT QUERIES
// ============================================================================

export function useAdjuncts(params?: any) {
  return useQuery({
    queryKey: ['education', 'adjuncts', params],
    queryFn: () =>
      APIClient.get<AdjunctFaculty[]>(
        '/education/adjunct' + (params?.search ? `?search=${params.search}` : '')
      ),
  });
}

export function useCreateAdjunct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adjunctData: Partial<AdjunctFaculty>) =>
      APIClient.post<AdjunctFaculty>('/education/adjunct', adjunctData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'adjuncts'] });
    },
  });
}

export function useUpdateAdjunct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adjunctId, updates }: { adjunctId: string; updates: Partial<AdjunctFaculty> }) =>
      APIClient.put<AdjunctFaculty>(`/education/adjunct/${adjunctId}`, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'adjuncts'] });
      queryClient.invalidateQueries({ queryKey: ['education', 'adjuncts', variables.adjunctId] });
    },
  });
}

export function useDeleteAdjunct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adjunctId: string) => APIClient.delete(`/education/adjunct/${adjunctId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'adjuncts'] });
    },
  });
}

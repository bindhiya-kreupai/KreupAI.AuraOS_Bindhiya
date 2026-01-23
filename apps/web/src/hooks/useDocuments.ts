import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  getEmployeeDocuments,
  GetDocumentsParams,
  Document,
  PaginatedResponse,
} from '../services/documentService';

// Query key factory
const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params: GetDocumentsParams) =>
    [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  employee: (employeeId: string) =>
    [...documentKeys.all, 'employee', employeeId] as const,
};

export function useDocumentsList(params: GetDocumentsParams = {}) {
  return useQuery<PaginatedResponse<Document>>({
    queryKey: documentKeys.list(params),
    queryFn: () => getDocuments(params),
  });
}

export function useDocumentUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      category,
      metadata,
    }: {
      file: File;
      category: string;
      metadata?: Record<string, string>;
    }) => uploadDocument(file, category, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

export function useDocumentDownload() {
  return useMutation({
    mutationFn: (id: string) => downloadDocument(id),
  });
}

export function useDocumentDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useEmployeeDocuments(employeeId: string) {
  return useQuery<Document[]>({
    queryKey: documentKeys.employee(employeeId),
    queryFn: () => getEmployeeDocuments(employeeId),
    enabled: !!employeeId,
  });
}

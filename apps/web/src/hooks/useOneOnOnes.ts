'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMeetings,
  scheduleMeeting,
  getMeetingDetails,
  updateMeeting,
  cancelMeeting,
  addNotes,
  getNotes,
  addActionItem,
  updateActionItem,
  getHistory,
  getAgendaTemplates,
  Meeting,
  MeetingNote,
  ActionItem,
  ScheduleRequest,
  ActionItemRequest,
  AgendaTemplate,
  PaginatedResponse,
} from '../services/oneOnOneService';

// Query key factory
const oneOnOneKeys = {
  all: ['one-on-ones'] as const,
  meetings: (params?: { status?: string; page?: number }) =>
    [...oneOnOneKeys.all, 'meetings', params] as const,
  meetingDetail: (id: string) =>
    [...oneOnOneKeys.all, 'meeting', id] as const,
  notes: (meetingId: string) =>
    [...oneOnOneKeys.all, 'notes', meetingId] as const,
  history: (employeeId: string) =>
    [...oneOnOneKeys.all, 'history', employeeId] as const,
  agendaTemplates: () =>
    [...oneOnOneKeys.all, 'agenda-templates'] as const,
};

export function useMeetings(params?: { status?: string; page?: number }) {
  return useQuery<PaginatedResponse<Meeting>>({
    queryKey: oneOnOneKeys.meetings(params),
    queryFn: () => getMeetings(params),
  });
}

export function useScheduleMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleRequest) => scheduleMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oneOnOneKeys.all });
    },
  });
}

export function useMeetingDetails(id: string) {
  return useQuery<Meeting>({
    queryKey: oneOnOneKeys.meetingDetail(id),
    queryFn: () => getMeetingDetails(id),
    enabled: !!id,
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleRequest> }) =>
      updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oneOnOneKeys.all });
    },
  });
}

export function useCancelMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oneOnOneKeys.all });
    },
  });
}

export function useAddNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, notes }: { meetingId: string; notes: string }) =>
      addNotes(meetingId, notes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: oneOnOneKeys.notes(variables.meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: oneOnOneKeys.meetingDetail(variables.meetingId),
      });
    },
  });
}

export function useMeetingNotes(meetingId: string) {
  return useQuery<MeetingNote[]>({
    queryKey: oneOnOneKeys.notes(meetingId),
    queryFn: () => getNotes(meetingId),
    enabled: !!meetingId,
  });
}

export function useAddActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      data,
    }: {
      meetingId: string;
      data: ActionItemRequest;
    }) => addActionItem(meetingId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: oneOnOneKeys.meetingDetail(variables.meetingId),
      });
    },
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: Partial<ActionItem>;
    }) => updateActionItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oneOnOneKeys.all });
    },
  });
}

export function useMeetingHistory(employeeId: string) {
  return useQuery<Meeting[]>({
    queryKey: oneOnOneKeys.history(employeeId),
    queryFn: () => getHistory(employeeId),
    enabled: !!employeeId,
  });
}

export function useAgendaTemplates() {
  return useQuery<AgendaTemplate[]>({
    queryKey: oneOnOneKeys.agendaTemplates(),
    queryFn: getAgendaTemplates,
  });
}

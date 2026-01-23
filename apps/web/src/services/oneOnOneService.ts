import axios from 'axios';

const BASE_PATH = '/api/v1/one-on-ones';

// Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MeetingNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Meeting {
  id: string;
  title: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: MeetingNote[];
  actionItems: ActionItem[];
  agenda?: string;
}

export interface ScheduleRequest {
  title: string;
  participantId: string;
  scheduledAt: string;
  duration: number;
  agenda?: string;
}

export interface ActionItemRequest {
  title: string;
  assigneeId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgendaTemplate {
  id: string;
  name: string;
  items: string[];
}

// Service functions
export async function getMeetings(
  params?: { status?: string; page?: number }
): Promise<PaginatedResponse<Meeting>> {
  const response = await axios.get<PaginatedResponse<Meeting>>(BASE_PATH, {
    params,
  });
  return response.data;
}

export async function scheduleMeeting(
  data: ScheduleRequest
): Promise<Meeting> {
  const response = await axios.post<Meeting>(BASE_PATH, data);
  return response.data;
}

export async function getMeetingDetails(id: string): Promise<Meeting> {
  const response = await axios.get<Meeting>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function updateMeeting(
  id: string,
  data: Partial<ScheduleRequest>
): Promise<Meeting> {
  const response = await axios.patch<Meeting>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

export async function cancelMeeting(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

export async function addNotes(
  meetingId: string,
  notes: string
): Promise<MeetingNote> {
  const response = await axios.post<MeetingNote>(
    `${BASE_PATH}/${meetingId}/notes`,
    { content: notes }
  );
  return response.data;
}

export async function getNotes(meetingId: string): Promise<MeetingNote[]> {
  const response = await axios.get<MeetingNote[]>(
    `${BASE_PATH}/${meetingId}/notes`
  );
  return response.data;
}

export async function addActionItem(
  meetingId: string,
  data: ActionItemRequest
): Promise<ActionItem> {
  const response = await axios.post<ActionItem>(
    `${BASE_PATH}/${meetingId}/action-items`,
    data
  );
  return response.data;
}

export async function updateActionItem(
  itemId: string,
  data: Partial<ActionItem>
): Promise<ActionItem> {
  const response = await axios.patch<ActionItem>(
    `${BASE_PATH}/action-items/${itemId}`,
    data
  );
  return response.data;
}

export async function getHistory(employeeId: string): Promise<Meeting[]> {
  const response = await axios.get<Meeting[]>(
    `${BASE_PATH}/history/${employeeId}`
  );
  return response.data;
}

export async function getAgendaTemplates(): Promise<AgendaTemplate[]> {
  const response = await axios.get<AgendaTemplate[]>(
    `${BASE_PATH}/agenda-templates`
  );
  return response.data;
}

import axios from 'axios';

const BASE_PATH = '/api/v1/life-events';

// Types
export interface BenefitChange {
  planId: string;
  planName: string;
  action: 'add' | 'remove' | 'modify';
}

export interface LifeEvent {
  id: string;
  type:
    | 'marriage'
    | 'divorce'
    | 'birth'
    | 'adoption'
    | 'death'
    | 'address_change'
    | 'loss_of_coverage';
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  documents: string[];
  benefitChanges?: BenefitChange[];
  createdAt: string;
}

export interface LifeEventReport {
  type:
    | 'marriage'
    | 'divorce'
    | 'birth'
    | 'adoption'
    | 'death'
    | 'address_change'
    | 'loss_of_coverage';
  date: string;
  description: string;
  documentIds?: string[];
}

// Service functions
export async function reportLifeEvent(
  data: LifeEventReport
): Promise<LifeEvent> {
  const response = await axios.post<LifeEvent>(BASE_PATH, data);
  return response.data;
}

export async function getLifeEvents(): Promise<LifeEvent[]> {
  const response = await axios.get<LifeEvent[]>(BASE_PATH);
  return response.data;
}

export async function getLifeEventDetails(id: string): Promise<LifeEvent> {
  const response = await axios.get<LifeEvent>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function uploadSupportingDoc(
  eventId: string,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  await axios.post(`${BASE_PATH}/${eventId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

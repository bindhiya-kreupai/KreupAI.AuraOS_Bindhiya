import axios from 'axios';

const BASE_PATH = '/api/v1/dependents';

// Types
export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'parent' | 'domestic_partner';
  dateOfBirth: string;
  ssn: string;
  gender: string;
  benefitEligible: boolean;
  enrolledPlans: string[];
}

export interface DependentCreate {
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'parent' | 'domestic_partner';
  dateOfBirth: string;
  ssn: string;
  gender: string;
}

// Service functions
export async function listDependents(): Promise<Dependent[]> {
  const response = await axios.get<Dependent[]>(BASE_PATH);
  return response.data;
}

export async function addDependent(data: DependentCreate): Promise<Dependent> {
  const response = await axios.post<Dependent>(BASE_PATH, data);
  return response.data;
}

export async function getDependent(id: string): Promise<Dependent> {
  const response = await axios.get<Dependent>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function updateDependent(
  id: string,
  data: Partial<DependentCreate>
): Promise<Dependent> {
  const response = await axios.patch<Dependent>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

export async function removeDependent(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

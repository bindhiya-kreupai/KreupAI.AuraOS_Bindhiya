import axios from 'axios';

const BASE_PATH = '/api/v1/forms';

// Types
export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FormField {
  id: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'email'
    | 'dropdown'
    | 'radio'
    | 'checkbox'
    | 'file'
    | 'signature'
    | 'calculated';
  label: string;
  required: boolean;
  options?: string[];
  validation?: ValidationRule;
  placeholder?: string;
  helpText?: string;
}

export interface CustomForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  submissionCount: number;
}

export interface FormCreate {
  name: string;
  description?: string;
  fields: FormField[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedBy: string;
  submittedAt: string;
}

// Service functions
export async function listForms(): Promise<CustomForm[]> {
  const response = await axios.get<CustomForm[]>(BASE_PATH);
  return response.data;
}

export async function getForm(id: string): Promise<CustomForm> {
  const response = await axios.get<CustomForm>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function createForm(data: FormCreate): Promise<CustomForm> {
  const response = await axios.post<CustomForm>(BASE_PATH, data);
  return response.data;
}

export async function updateForm(
  id: string,
  data: Partial<FormCreate>
): Promise<CustomForm> {
  const response = await axios.patch<CustomForm>(
    `${BASE_PATH}/${id}`,
    data
  );
  return response.data;
}

export async function deleteForm(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

export async function submitForm(
  formId: string,
  data: Record<string, unknown>
): Promise<FormSubmission> {
  const response = await axios.post<FormSubmission>(
    `${BASE_PATH}/${formId}/submissions`,
    data
  );
  return response.data;
}

export async function getSubmissions(
  formId: string
): Promise<FormSubmission[]> {
  const response = await axios.get<FormSubmission[]>(
    `${BASE_PATH}/${formId}/submissions`
  );
  return response.data;
}

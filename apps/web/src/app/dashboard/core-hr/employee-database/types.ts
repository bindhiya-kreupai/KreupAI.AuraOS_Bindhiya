/**
 * Type definitions for Employee Profile module
 */

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type EmploymentStatus = 'Active' | 'On Leave' | 'Notice Period' | 'Terminated';
export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type DocumentType = 'ID Card' | 'Resume' | 'Certificate' | 'Contract' | 'Offer Letter' | 'Other';
export type HistoryEventType = 'Hired' | 'Promoted' | 'Transfer' | 'Salary Change' | 'Title Change';

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

export interface FamilyMember {
    name: string;
    relationship: string;
    dateOfBirth: string;
    dependent: boolean;
}

export interface PersonalInfo {
    dateOfBirth: string;
    gender: Gender;
    maritalStatus: MaritalStatus;
    nationality: string;
    phone: string;
    personalEmail: string;
    address: Address;
    emergencyContacts: EmergencyContact[];
    familyMembers: FamilyMember[];
}

export interface JobDetails {
    employeeId: string;
    title: string;
    department: string;
    location: string;
    manager: string;
    managerId?: string;
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    hireDate: string;
    probationEndDate?: string;
    reportingTo: string[];
    workSchedule: string;
    costCenter: string;
}

export interface Compensation {
    baseSalary: number;
    currency: string;
    payFrequency: 'Monthly' | 'Bi-weekly' | 'Weekly';
    effectiveDate: string;
    bonus?: number;
    stockOptions?: number;
    benefits: string[];
    bankAccountNumber?: string;
    bankName?: string;
    taxId?: string;
}

export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    uploadedDate: string;
    uploadedBy: string;
    fileSize: number;
    fileUrl?: string;
    expiryDate?: string;
    verified: boolean;
}

export interface EmploymentHistoryEvent {
    id: string;
    date: string;
    type: HistoryEventType;
    description: string;
    fromValue?: string;
    toValue?: string;
    notes?: string;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department: string;
    location: string;
    personalInfo: PersonalInfo;
    jobDetails: JobDetails;
    compensation: Compensation;
    documents: Document[];
    employmentHistory: EmploymentHistoryEvent[];
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    newHiresThisMonth: number;
    onLeave: number;
    byDepartment: { [key: string]: number };
    byLocation: { [key: string]: number };
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export interface EmployeeWithRelations {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  company: {
    id: string;
    name: string;
    code: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  location: {
    id: string;
    name: string;
    code: string;
  };
  jobProfile: {
    id: string;
    title: string;
    code: string;
  };
  grade: {
    id: string;
    name: string;
    code: string;
    level: number;
  };
  status: {
    id: string;
    name: string;
    code: string;
  };
  type: {
    id: string;
    name: string;
    code: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
  };
  joiningDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgChartNode {
  id: string;
  name: string;
  employeeCode: string;
  jobTitle: string;
}

export interface OrgChartData {
  employee: OrgChartNode;
  managerChain: OrgChartNode[];
  directReports: OrgChartNode[];
}

export interface EmploymentHistoryRecord {
  action: 'HIRED' | 'PROMOTED' | 'TRANSFERRED' | 'TERMINATED' | 'ROLE_CHANGE';
  effectiveDate: Date;
  department?: string;
  jobProfile?: string;
  grade?: string;
  status?: string;
  notes?: string;
}

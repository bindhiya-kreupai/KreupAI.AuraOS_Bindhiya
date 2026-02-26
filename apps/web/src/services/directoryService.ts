/**
 * @module directoryService
 * @description Employee Directory Service — search, org chart, profiles,
 *              department/location data, and reporting chain (Sec 17.4)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
export type WorkLocation = 'office' | 'remote' | 'hybrid';

export interface DirectoryEmployee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  extension?: string;
  designation: string;
  department: string;
  departmentId: string;
  location: string;
  locationId: string;
  managerId?: string;
  managerName?: string;
  employmentType: EmploymentType;
  workLocation: WorkLocation;
  joinDate: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  skills: string[];
  directReportsCount: number;
  isActive: boolean;
}

export interface OrgChartNode {
  employee: DirectoryEmployee;
  children: OrgChartNode[];
  level: number;
  isExpanded: boolean;
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
  headName?: string;
  employeeCount: number;
  parentDepartmentId?: string;
  description?: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  employeeCount: number;
  address?: string;
  isHeadquarters: boolean;
}

export interface DirectorySearchFilters {
  query?: string;
  departmentId?: string;
  locationId?: string;
  designation?: string;
  employmentType?: EmploymentType;
  workLocation?: WorkLocation;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const MOCK_EMPLOYEES: DirectoryEmployee[] = [
  {
    id: 'emp-001',
    employeeId: 'AUR-2021-001',
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    email: 'jane.doe@company.com',
    phone: '+1 (555) 201-4001',
    extension: '4001',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-011',
    managerName: 'Karen White',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2021-03-15',
    avatarInitials: 'JD',
    avatarColor: AVATAR_COLORS[0],
    skills: ['React', 'TypeScript', 'Node.js'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-002',
    employeeId: 'AUR-2020-002',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 202-4002',
    extension: '4002',
    designation: 'Sales Manager',
    department: 'Sales & Marketing',
    departmentId: 'dept-002',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-012',
    managerName: 'Robert Chen',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2020-07-01',
    avatarInitials: 'JS',
    avatarColor: AVATAR_COLORS[1],
    skills: ['CRM', 'Negotiation', 'Salesforce'],
    directReportsCount: 5,
    isActive: true,
  },
  {
    id: 'emp-003',
    employeeId: 'AUR-2022-003',
    firstName: 'Sarah',
    lastName: 'Lee',
    fullName: 'Sarah Lee',
    email: 'sarah.lee@company.com',
    phone: '+1 (555) 203-4003',
    extension: '4003',
    designation: 'HR Business Partner',
    department: 'Human Resources',
    departmentId: 'dept-003',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-013',
    managerName: 'Diana Foster',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2022-01-10',
    avatarInitials: 'SL',
    avatarColor: AVATAR_COLORS[2],
    skills: ['HRBP', 'Employee Relations', 'Talent Management'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-004',
    employeeId: 'AUR-2019-004',
    firstName: 'Michael',
    lastName: 'Zhang',
    fullName: 'Michael Zhang',
    email: 'michael.zhang@company.com',
    phone: '+1 (555) 204-4004',
    extension: '4004',
    designation: 'Senior Financial Analyst',
    department: 'Finance',
    departmentId: 'dept-004',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-014',
    managerName: 'Patricia Moore',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2019-09-15',
    avatarInitials: 'MZ',
    avatarColor: AVATAR_COLORS[3],
    skills: ['Financial Modeling', 'Excel', 'SAP'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-005',
    employeeId: 'AUR-2023-005',
    firstName: 'Priya',
    lastName: 'Patel',
    fullName: 'Priya Patel',
    email: 'priya.patel@company.com',
    phone: '+1 (555) 205-4005',
    extension: '4005',
    designation: 'Operations Analyst',
    department: 'Operations',
    departmentId: 'dept-005',
    location: 'Austin',
    locationId: 'loc-003',
    managerId: 'emp-015',
    managerName: 'James Wilson',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2023-02-20',
    avatarInitials: 'PP',
    avatarColor: AVATAR_COLORS[4],
    skills: ['Process Improvement', 'SQL', 'Analytics'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-006',
    employeeId: 'AUR-2021-006',
    firstName: 'David',
    lastName: 'Kim',
    fullName: 'David Kim',
    email: 'david.kim@company.com',
    phone: '+1 (555) 206-4006',
    extension: '4006',
    designation: 'Senior Product Manager',
    department: 'Product',
    departmentId: 'dept-006',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-016',
    managerName: 'Anna Rodriguez',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2021-06-01',
    avatarInitials: 'DK',
    avatarColor: AVATAR_COLORS[5],
    skills: ['Product Strategy', 'Agile', 'Roadmapping'],
    directReportsCount: 2,
    isActive: true,
  },
  {
    id: 'emp-007',
    employeeId: 'AUR-2022-007',
    firstName: 'Lisa',
    lastName: 'Wang',
    fullName: 'Lisa Wang',
    email: 'lisa.wang@company.com',
    phone: '+1 (555) 207-4007',
    extension: '4007',
    designation: 'Marketing Specialist',
    department: 'Sales & Marketing',
    departmentId: 'dept-002',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-002',
    managerName: 'John Smith',
    employmentType: 'full_time',
    workLocation: 'remote',
    joinDate: '2022-04-11',
    avatarInitials: 'LW',
    avatarColor: AVATAR_COLORS[6],
    skills: ['Content Marketing', 'SEO', 'HubSpot'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-008',
    employeeId: 'AUR-2020-008',
    firstName: 'Tom',
    lastName: 'Johnson',
    fullName: 'Tom Johnson',
    email: 'tom.johnson@company.com',
    phone: '+1 (555) 208-4008',
    extension: '4008',
    designation: 'Lead Software Engineer',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'Austin',
    locationId: 'loc-003',
    managerId: 'emp-011',
    managerName: 'Karen White',
    employmentType: 'full_time',
    workLocation: 'remote',
    joinDate: '2020-11-01',
    avatarInitials: 'TJ',
    avatarColor: AVATAR_COLORS[7],
    skills: ['Python', 'AWS', 'Kubernetes'],
    directReportsCount: 3,
    isActive: true,
  },
  {
    id: 'emp-009',
    employeeId: 'AUR-2023-009',
    firstName: 'Emily',
    lastName: 'Chen',
    fullName: 'Emily Chen',
    email: 'emily.chen@company.com',
    phone: '+1 (555) 209-4009',
    extension: '4009',
    designation: 'Customer Success Manager',
    department: 'Customer Success',
    departmentId: 'dept-007',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-017',
    managerName: 'Ben Harris',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2023-05-15',
    avatarInitials: 'EC',
    avatarColor: AVATAR_COLORS[0],
    skills: ['Customer Relations', 'Zendesk', 'Onboarding'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-010',
    employeeId: 'AUR-2018-010',
    firstName: 'Robert',
    lastName: 'Brown',
    fullName: 'Robert Brown',
    email: 'robert.brown@company.com',
    phone: '+1 (555) 210-4010',
    extension: '4010',
    designation: 'Legal Counsel',
    department: 'Legal',
    departmentId: 'dept-008',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-018',
    managerName: 'Samantha Mills',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2018-03-01',
    avatarInitials: 'RB',
    avatarColor: AVATAR_COLORS[1],
    skills: ['Contract Law', 'Compliance', 'IP Law'],
    directReportsCount: 1,
    isActive: true,
  },
  {
    id: 'emp-011',
    employeeId: 'AUR-2017-011',
    firstName: 'Karen',
    lastName: 'White',
    fullName: 'Karen White',
    email: 'karen.white@company.com',
    phone: '+1 (555) 211-4011',
    extension: '4011',
    designation: 'VP Engineering',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2017-01-15',
    avatarInitials: 'KW',
    avatarColor: AVATAR_COLORS[2],
    skills: ['Engineering Leadership', 'Architecture', 'Agile'],
    directReportsCount: 8,
    isActive: true,
  },
  {
    id: 'emp-012',
    employeeId: 'AUR-2016-012',
    firstName: 'Robert',
    lastName: 'Chen',
    fullName: 'Robert Chen',
    email: 'robert.chen@company.com',
    phone: '+1 (555) 212-4012',
    extension: '4012',
    designation: 'VP Sales',
    department: 'Sales & Marketing',
    departmentId: 'dept-002',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2016-06-01',
    avatarInitials: 'RC',
    avatarColor: AVATAR_COLORS[3],
    skills: ['Sales Strategy', 'Revenue Growth', 'Enterprise Sales'],
    directReportsCount: 10,
    isActive: true,
  },
  {
    id: 'emp-013',
    employeeId: 'AUR-2015-013',
    firstName: 'Diana',
    lastName: 'Foster',
    fullName: 'Diana Foster',
    email: 'diana.foster@company.com',
    phone: '+1 (555) 213-4013',
    extension: '4013',
    designation: 'Chief People Officer',
    department: 'Human Resources',
    departmentId: 'dept-003',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2015-09-01',
    avatarInitials: 'DF',
    avatarColor: AVATAR_COLORS[4],
    skills: ['People Strategy', 'Culture', 'Talent Acquisition'],
    directReportsCount: 6,
    isActive: true,
  },
  {
    id: 'emp-014',
    employeeId: 'AUR-2016-014',
    firstName: 'Patricia',
    lastName: 'Moore',
    fullName: 'Patricia Moore',
    email: 'patricia.moore@company.com',
    phone: '+1 (555) 214-4014',
    extension: '4014',
    designation: 'Chief Financial Officer',
    department: 'Finance',
    departmentId: 'dept-004',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2016-02-01',
    avatarInitials: 'PM',
    avatarColor: AVATAR_COLORS[5],
    skills: ['Financial Planning', 'M&A', 'Investor Relations'],
    directReportsCount: 7,
    isActive: true,
  },
  {
    id: 'emp-015',
    employeeId: 'AUR-2018-015',
    firstName: 'James',
    lastName: 'Wilson',
    fullName: 'James Wilson',
    email: 'james.wilson@company.com',
    phone: '+1 (555) 215-4015',
    extension: '4015',
    designation: 'VP Operations',
    department: 'Operations',
    departmentId: 'dept-005',
    location: 'Austin',
    locationId: 'loc-003',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2018-05-15',
    avatarInitials: 'JW',
    avatarColor: AVATAR_COLORS[6],
    skills: ['Ops Management', 'Supply Chain', 'Lean'],
    directReportsCount: 5,
    isActive: true,
  },
  {
    id: 'emp-016',
    employeeId: 'AUR-2019-016',
    firstName: 'Anna',
    lastName: 'Rodriguez',
    fullName: 'Anna Rodriguez',
    email: 'anna.rodriguez@company.com',
    phone: '+1 (555) 216-4016',
    extension: '4016',
    designation: 'Chief Product Officer',
    department: 'Product',
    departmentId: 'dept-006',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2019-03-01',
    avatarInitials: 'AR',
    avatarColor: AVATAR_COLORS[7],
    skills: ['Product Vision', 'UX Strategy', 'Go-to-Market'],
    directReportsCount: 9,
    isActive: true,
  },
  {
    id: 'emp-017',
    employeeId: 'AUR-2020-017',
    firstName: 'Ben',
    lastName: 'Harris',
    fullName: 'Ben Harris',
    email: 'ben.harris@company.com',
    phone: '+1 (555) 217-4017',
    extension: '4017',
    designation: 'VP Customer Success',
    department: 'Customer Success',
    departmentId: 'dept-007',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2020-01-06',
    avatarInitials: 'BH',
    avatarColor: AVATAR_COLORS[0],
    skills: ['Customer Experience', 'NPS', 'Churn Reduction'],
    directReportsCount: 4,
    isActive: true,
  },
  {
    id: 'emp-018',
    employeeId: 'AUR-2017-018',
    firstName: 'Samantha',
    lastName: 'Mills',
    fullName: 'Samantha Mills',
    email: 'samantha.mills@company.com',
    phone: '+1 (555) 218-4018',
    extension: '4018',
    designation: 'General Counsel',
    department: 'Legal',
    departmentId: 'dept-008',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-020',
    managerName: 'Alex Mercer',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2017-07-01',
    avatarInitials: 'SM',
    avatarColor: AVATAR_COLORS[1],
    skills: ['Corporate Law', 'Governance', 'Risk Management'],
    directReportsCount: 3,
    isActive: true,
  },
  {
    id: 'emp-019',
    employeeId: 'AUR-2023-019',
    firstName: 'Kevin',
    lastName: 'Park',
    fullName: 'Kevin Park',
    email: 'kevin.park@company.com',
    phone: '+1 (555) 219-4019',
    extension: '4019',
    designation: 'Software Engineer',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'Austin',
    locationId: 'loc-003',
    managerId: 'emp-008',
    managerName: 'Tom Johnson',
    employmentType: 'full_time',
    workLocation: 'remote',
    joinDate: '2023-08-01',
    avatarInitials: 'KP',
    avatarColor: AVATAR_COLORS[2],
    skills: ['Go', 'PostgreSQL', 'Docker'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-020',
    employeeId: 'AUR-2014-020',
    firstName: 'Alex',
    lastName: 'Mercer',
    fullName: 'Alex Mercer',
    email: 'alex.mercer@company.com',
    phone: '+1 (555) 220-4020',
    extension: '4020',
    designation: 'Chief Executive Officer',
    department: 'Executive',
    departmentId: 'dept-009',
    location: 'San Francisco',
    locationId: 'loc-001',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2014-01-01',
    avatarInitials: 'AM',
    avatarColor: AVATAR_COLORS[3],
    skills: ['Leadership', 'Strategy', 'P&L Management'],
    directReportsCount: 8,
    isActive: true,
  },
  {
    id: 'emp-021',
    employeeId: 'AUR-2022-021',
    firstName: 'Olivia',
    lastName: 'Brown',
    fullName: 'Olivia Brown',
    email: 'olivia.brown@company.com',
    phone: '+1 (555) 221-4021',
    extension: '4021',
    designation: 'UX Designer',
    department: 'Product',
    departmentId: 'dept-006',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-006',
    managerName: 'David Kim',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2022-09-12',
    avatarInitials: 'OB',
    avatarColor: AVATAR_COLORS[4],
    skills: ['Figma', 'User Research', 'Prototyping'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-022',
    employeeId: 'AUR-2021-022',
    firstName: 'Daniel',
    lastName: 'Taylor',
    fullName: 'Daniel Taylor',
    email: 'daniel.taylor@company.com',
    phone: '+1 (555) 222-4022',
    extension: '4022',
    designation: 'Data Scientist',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-008',
    managerName: 'Tom Johnson',
    employmentType: 'full_time',
    workLocation: 'hybrid',
    joinDate: '2021-07-19',
    avatarInitials: 'DT',
    avatarColor: AVATAR_COLORS[5],
    skills: ['Machine Learning', 'Python', 'TensorFlow'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-023',
    employeeId: 'AUR-2023-023',
    firstName: 'Mia',
    lastName: 'Nguyen',
    fullName: 'Mia Nguyen',
    email: 'mia.nguyen@company.com',
    phone: '+1 (555) 223-4023',
    extension: '4023',
    designation: 'Account Executive',
    department: 'Sales & Marketing',
    departmentId: 'dept-002',
    location: 'New York',
    locationId: 'loc-002',
    managerId: 'emp-002',
    managerName: 'John Smith',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2023-03-06',
    avatarInitials: 'MN',
    avatarColor: AVATAR_COLORS[6],
    skills: ['B2B Sales', 'Prospecting', 'Closing'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-024',
    employeeId: 'AUR-2022-024',
    firstName: 'Ethan',
    lastName: 'Scott',
    fullName: 'Ethan Scott',
    email: 'ethan.scott@company.com',
    phone: '+1 (555) 224-4024',
    extension: '4024',
    designation: 'DevOps Engineer',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'Austin',
    locationId: 'loc-003',
    managerId: 'emp-011',
    managerName: 'Karen White',
    employmentType: 'full_time',
    workLocation: 'remote',
    joinDate: '2022-02-14',
    avatarInitials: 'ES',
    avatarColor: AVATAR_COLORS[7],
    skills: ['CI/CD', 'Terraform', 'GCP'],
    directReportsCount: 0,
    isActive: true,
  },
  {
    id: 'emp-025',
    employeeId: 'AUR-2024-025',
    firstName: 'Sophia',
    lastName: 'Adams',
    fullName: 'Sophia Adams',
    email: 'sophia.adams@company.com',
    phone: '+1 (555) 225-4025',
    extension: '4025',
    designation: 'HR Coordinator',
    department: 'Human Resources',
    departmentId: 'dept-003',
    location: 'San Francisco',
    locationId: 'loc-001',
    managerId: 'emp-013',
    managerName: 'Diana Foster',
    employmentType: 'full_time',
    workLocation: 'office',
    joinDate: '2024-01-08',
    avatarInitials: 'SA',
    avatarColor: AVATAR_COLORS[0],
    skills: ['Onboarding', 'Payroll', 'HRIS'],
    directReportsCount: 0,
    isActive: true,
  },
];

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-001',
    name: 'Engineering',
    headId: 'emp-011',
    headName: 'Karen White',
    employeeCount: 8,
  },
  {
    id: 'dept-002',
    name: 'Sales & Marketing',
    headId: 'emp-012',
    headName: 'Robert Chen',
    employeeCount: 5,
  },
  {
    id: 'dept-003',
    name: 'Human Resources',
    headId: 'emp-013',
    headName: 'Diana Foster',
    employeeCount: 3,
  },
  {
    id: 'dept-004',
    name: 'Finance',
    headId: 'emp-014',
    headName: 'Patricia Moore',
    employeeCount: 2,
  },
  {
    id: 'dept-005',
    name: 'Operations',
    headId: 'emp-015',
    headName: 'James Wilson',
    employeeCount: 2,
  },
  {
    id: 'dept-006',
    name: 'Product',
    headId: 'emp-016',
    headName: 'Anna Rodriguez',
    employeeCount: 3,
  },
  {
    id: 'dept-007',
    name: 'Customer Success',
    headId: 'emp-017',
    headName: 'Ben Harris',
    employeeCount: 2,
  },
  {
    id: 'dept-008',
    name: 'Legal',
    headId: 'emp-018',
    headName: 'Samantha Mills',
    employeeCount: 2,
  },
  { id: 'dept-009', name: 'Executive', employeeCount: 1 },
];

const MOCK_LOCATIONS: OfficeLocation[] = [
  {
    id: 'loc-001',
    name: 'HQ — San Francisco',
    city: 'San Francisco',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    employeeCount: 14,
    address: '123 Innovation Drive, San Francisco, CA 94105',
    isHeadquarters: true,
  },
  {
    id: 'loc-002',
    name: 'East Coast — New York',
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    employeeCount: 8,
    address: '456 Manhattan Ave, New York, NY 10001',
    isHeadquarters: false,
  },
  {
    id: 'loc-003',
    name: 'South — Austin',
    city: 'Austin',
    country: 'USA',
    timezone: 'America/Chicago',
    employeeCount: 5,
    address: '789 Tech Blvd, Austin, TX 78701',
    isHeadquarters: false,
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class DirectoryService {
  /**
   * Search employees by name, email, ID, department
   */
  static async searchEmployees(
    query?: string,
    filters?: DirectorySearchFilters
  ): Promise<DirectoryEmployee[]> {
    try {
      return await APIClient.get<DirectoryEmployee[]>('/v1/directory/employees', {
        query,
        ...filters,
      });
    } catch {
      let results = MOCK_EMPLOYEES.filter((e) => e.isActive);
      if (query) {
        const q = query.toLowerCase();
        results = results.filter(
          (e) =>
            e.fullName.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.employeeId.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q) ||
            e.designation.toLowerCase().includes(q)
        );
      }
      if (filters?.departmentId)
        results = results.filter((e) => e.departmentId === filters.departmentId);
      if (filters?.locationId) results = results.filter((e) => e.locationId === filters.locationId);
      if (filters?.employmentType)
        results = results.filter((e) => e.employmentType === filters.employmentType);
      if (filters?.workLocation)
        results = results.filter((e) => e.workLocation === filters.workLocation);
      if (filters?.designation) {
        const d = filters.designation.toLowerCase();
        results = results.filter((e) => e.designation.toLowerCase().includes(d));
      }
      return results.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
  }

  /**
   * Get full employee profile card data
   */
  static async getEmployee(id: string): Promise<DirectoryEmployee | null> {
    try {
      return await APIClient.get<DirectoryEmployee>(`/v1/directory/employees/${id}`);
    } catch {
      return MOCK_EMPLOYEES.find((e) => e.id === id) ?? null;
    }
  }

  /**
   * Get hierarchical org chart structure
   */
  static async getOrgChart(rootId?: string): Promise<OrgChartNode | null> {
    try {
      return await APIClient.get<OrgChartNode>('/v1/directory/org-chart', { rootId });
    } catch {
      const root = MOCK_EMPLOYEES.find((e) => e.id === (rootId ?? 'emp-020'));
      if (!root) return null;
      return buildOrgNode(root, MOCK_EMPLOYEES, 0);
    }
  }

  /**
   * Get all departments with head counts
   */
  static async getDepartments(): Promise<Department[]> {
    try {
      return await APIClient.get<Department[]>('/v1/directory/departments');
    } catch {
      return MOCK_DEPARTMENTS;
    }
  }

  /**
   * Get office locations with employee counts
   */
  static async getLocations(): Promise<OfficeLocation[]> {
    try {
      return await APIClient.get<OfficeLocation[]>('/v1/directory/locations');
    } catch {
      return MOCK_LOCATIONS;
    }
  }

  /**
   * Get reporting chain from employee up to CEO
   */
  static async getReportingChain(employeeId: string): Promise<DirectoryEmployee[]> {
    try {
      return await APIClient.get<DirectoryEmployee[]>(
        `/v1/directory/employees/${employeeId}/reporting-chain`
      );
    } catch {
      const chain: DirectoryEmployee[] = [];
      let current = MOCK_EMPLOYEES.find((e) => e.id === employeeId);
      while (current) {
        chain.push(current);
        if (!current.managerId) break;
        current = MOCK_EMPLOYEES.find((e) => e.id === current!.managerId);
      }
      return chain;
    }
  }

  /**
   * Get direct reports for a manager
   */
  static async getDirectReports(managerId: string): Promise<DirectoryEmployee[]> {
    try {
      return await APIClient.get<DirectoryEmployee[]>(
        `/v1/directory/employees/${managerId}/direct-reports`
      );
    } catch {
      return MOCK_EMPLOYEES.filter((e) => e.managerId === managerId && e.isActive);
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function buildOrgNode(
  employee: DirectoryEmployee,
  allEmployees: DirectoryEmployee[],
  level: number
): OrgChartNode {
  const directReports = allEmployees.filter((e) => e.managerId === employee.id && e.isActive);
  return {
    employee,
    children: directReports.map((r) => buildOrgNode(r, allEmployees, level + 1)),
    level,
    isExpanded: level < 2,
  };
}

/**
 * @module searchService
 * @description Enterprise Search Service — global search, employee search with facets,
 *              typeahead suggestions, and recent search management.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type SearchResultType =
  | 'employee'
  | 'document'
  | 'policy'
  | 'transaction'
  | 'leave_request'
  | 'expense_report';

export interface SearchFacet {
  label: string;
  value: string;
  count: number;
}

export interface SearchFacets {
  departments: SearchFacet[];
  locations: SearchFacet[];
  statuses: SearchFacet[];
  types: SearchFacet[];
}

// ── Result item types ─────────────────────────────────────────────────────────

export interface EmployeeSearchResult {
  id: string;
  type: 'employee';
  name: string;
  employeeCode: string;
  email: string;
  title: string;
  department: string;
  departmentId: string;
  location: string;
  locationId: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatarUrl?: string;
  managerId?: string;
  managerName?: string;
  hireDate: string;
  phone?: string;
  score: number;
  highlights?: string[];
}

export interface DocumentSearchResult {
  id: string;
  type: 'document';
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  path: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  score: number;
  highlights?: string[];
}

export interface PolicySearchResult {
  id: string;
  type: 'policy';
  title: string;
  description: string;
  category: string;
  version: string;
  effectiveDate: string;
  status: 'active' | 'draft' | 'archived';
  path: string;
  score: number;
  highlights?: string[];
}

export interface TransactionSearchResult {
  id: string;
  type: 'transaction';
  reference: string;
  description: string;
  amount: number;
  currency: string;
  transactionType: string;
  date: string;
  status: string;
  employeeId: string;
  employeeName: string;
  path: string;
  score: number;
}

export interface LeaveRequestSearchResult {
  id: string;
  type: 'leave_request';
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  path: string;
  score: number;
}

export interface ExpenseReportSearchResult {
  id: string;
  type: 'expense_report';
  reportCode: string;
  reportName: string;
  employeeId: string;
  employeeName: string;
  totalAmount: number;
  currency: string;
  status: string;
  submittedDate?: string;
  path: string;
  score: number;
}

export type AnySearchResult =
  | EmployeeSearchResult
  | DocumentSearchResult
  | PolicySearchResult
  | TransactionSearchResult
  | LeaveRequestSearchResult
  | ExpenseReportSearchResult;

export interface GlobalSearchResults {
  query: string;
  totalCount: number;
  results: AnySearchResult[];
  facets: SearchFacets;
  took: number; // ms
}

export interface SearchSuggestion {
  query: string;
  type: 'recent' | 'popular' | 'employee' | 'module';
  count?: number;
}

export interface GlobalSearchOptions {
  types?: SearchResultType[];
  departmentId?: string;
  locationId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeSearchFilters {
  departmentId?: string;
  locationId?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  managerId?: string;
  title?: string;
  page?: number;
  pageSize?: number;
}

export interface EmployeeSearchResults {
  query: string;
  totalCount: number;
  results: EmployeeSearchResult[];
  facets: {
    departments: SearchFacet[];
    locations: SearchFacet[];
    statuses: SearchFacet[];
    titles: SearchFacet[];
  };
}

// ============================================================================
// MOCK DATA
// ============================================================================

const RECENT_SEARCHES_KEY = 'aura_search_recent';
const MAX_RECENT = 10;

const MOCK_EMPLOYEES: EmployeeSearchResult[] = [
  {
    id: 'emp-001',
    type: 'employee',
    name: 'Sarah Johnson',
    employeeCode: 'EMP-001',
    email: 'sarah.johnson@company.com',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    departmentId: 'dept-002',
    location: 'New York',
    locationId: 'loc-001',
    status: 'active',
    managerId: 'emp-010',
    managerName: 'Mike Chen',
    hireDate: '2022-03-15',
    phone: '+1-555-0101',
    score: 0,
  },
  {
    id: 'emp-002',
    type: 'employee',
    name: 'John Smith',
    employeeCode: 'EMP-002',
    email: 'john.smith@company.com',
    title: 'VP Sales',
    department: 'Sales & Marketing',
    departmentId: 'dept-005',
    location: 'Chicago',
    locationId: 'loc-002',
    status: 'active',
    hireDate: '2021-06-01',
    score: 0,
  },
  {
    id: 'emp-003',
    type: 'employee',
    name: 'Sarah Lee',
    employeeCode: 'EMP-003',
    email: 'sarah.lee@company.com',
    title: 'HR Manager',
    department: 'Human Resources',
    departmentId: 'dept-003',
    location: 'San Francisco',
    locationId: 'loc-003',
    status: 'active',
    hireDate: '2020-01-15',
    score: 0,
  },
  {
    id: 'emp-004',
    type: 'employee',
    name: 'David Kim',
    employeeCode: 'EMP-004',
    email: 'david.kim@company.com',
    title: 'Finance Controller',
    department: 'Finance',
    departmentId: 'dept-004',
    location: 'New York',
    locationId: 'loc-001',
    status: 'active',
    hireDate: '2019-08-20',
    score: 0,
  },
  {
    id: 'emp-005',
    type: 'employee',
    name: 'Priya Sharma',
    employeeCode: 'EMP-005',
    email: 'priya.sharma@company.com',
    title: 'Product Manager',
    department: 'Product',
    departmentId: 'dept-006',
    location: 'Austin',
    locationId: 'loc-004',
    status: 'active',
    hireDate: '2023-02-10',
    score: 0,
  },
  {
    id: 'emp-006',
    type: 'employee',
    name: 'Alex Turner',
    employeeCode: 'EMP-006',
    email: 'alex.turner@company.com',
    title: 'Data Analyst',
    department: 'Analytics',
    departmentId: 'dept-007',
    location: 'Remote',
    locationId: 'loc-005',
    status: 'on_leave',
    hireDate: '2021-11-01',
    score: 0,
  },
];

const MOCK_DOCUMENTS: DocumentSearchResult[] = [
  {
    id: 'doc-001',
    type: 'document',
    title: 'Employee Handbook 2026',
    description: 'Comprehensive employee handbook covering all HR policies and procedures',
    category: 'HR Policies',
    fileType: 'pdf',
    fileSize: 2457600,
    path: '/dashboard/core-hr/documents',
    createdBy: 'HR Team',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    tags: ['policy', 'handbook', 'hr', 'mandatory'],
    score: 0,
  },
  {
    id: 'doc-002',
    type: 'document',
    title: 'Leave Policy v3.2',
    description: 'Detailed leave management policy including annual, sick, and maternity leave',
    category: 'HR Policies',
    fileType: 'pdf',
    fileSize: 512000,
    path: '/dashboard/leave',
    createdBy: 'HR Team',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    tags: ['policy', 'leave', 'hr'],
    score: 0,
  },
  {
    id: 'doc-003',
    type: 'document',
    title: 'Expense Reimbursement SOP',
    description: 'Standard operating procedure for expense submission and reimbursement',
    category: 'Finance',
    fileType: 'pdf',
    fileSize: 768000,
    path: '/dashboard/expenses',
    createdBy: 'Finance Team',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    tags: ['sop', 'expense', 'finance', 'reimbursement'],
    score: 0,
  },
  {
    id: 'doc-004',
    type: 'document',
    title: 'IT Security Policy',
    description: 'Information security policy and acceptable use guidelines',
    category: 'IT & Security',
    fileType: 'pdf',
    fileSize: 1024000,
    path: '/dashboard/admin/security',
    createdBy: 'IT Team',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
    tags: ['policy', 'security', 'it', 'mandatory'],
    score: 0,
  },
];

const MOCK_POLICIES: PolicySearchResult[] = [
  {
    id: 'pol-001',
    type: 'policy',
    title: 'Remote Work Policy',
    description: 'Guidelines for remote and hybrid work arrangements',
    category: 'HR Policies',
    version: '2.1',
    effectiveDate: '2026-01-01',
    status: 'active',
    path: '/dashboard/core-hr/policies',
    score: 0,
  },
  {
    id: 'pol-002',
    type: 'policy',
    title: 'Code of Conduct',
    description: 'Employee code of conduct and ethics policy',
    category: 'Compliance',
    version: '3.0',
    effectiveDate: '2025-07-01',
    status: 'active',
    path: '/dashboard/compliance',
    score: 0,
  },
];

const POPULAR_SEARCHES = [
  'leave balance',
  'payslip',
  'expense report',
  'org chart',
  'holiday calendar',
  'training courses',
  'performance review',
  'benefits enrollment',
];

// ============================================================================
// SCORING
// ============================================================================

function scoreResult(item: AnySearchResult, query: string): number {
  const q = query.toLowerCase().trim();
  let score = 0;

  const checkField = (text: string, weight: number) => {
    const t = text.toLowerCase();
    if (t === q) score += weight * 2;
    else if (t.startsWith(q)) score += weight * 1.5;
    else if (t.includes(q)) score += weight;
    else {
      // Word-level match
      const words = q.split(/\s+/);
      const matched = words.filter((w) => t.includes(w));
      if (matched.length > 0) score += (matched.length / words.length) * weight * 0.5;
    }
  };

  if ('name' in item) checkField(item.name, 100);
  if ('title' in item && item.type === 'employee')
    checkField((item as EmployeeSearchResult).title, 60);
  if ('title' in item && item.type !== 'employee')
    checkField((item as DocumentSearchResult).title, 100);
  if ('department' in item) checkField((item as EmployeeSearchResult).department, 40);
  if ('email' in item) checkField((item as EmployeeSearchResult).email, 50);
  if ('description' in item) checkField((item as DocumentSearchResult).description, 30);
  if ('tags' in item) {
    const tags = (item as DocumentSearchResult).tags ?? [];
    tags.forEach((tag) => checkField(tag, 20));
  }
  if ('employeeCode' in item) checkField((item as EmployeeSearchResult).employeeCode, 80);

  return score;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class SearchService {
  /**
   * Global search across all entity types
   */
  static async globalSearch(
    query: string,
    options: GlobalSearchOptions = {}
  ): Promise<GlobalSearchResults> {
    try {
      return await APIClient.get<GlobalSearchResults>('/v1/search', { query, ...options });
    } catch {
      const startTime = Date.now();
      const q = query.trim();

      // Filter and score employees
      const employees = MOCK_EMPLOYEES.map((e) => ({ ...e, score: scoreResult(e, q) }))
        .filter((e) => e.score > 0)
        .sort((a, b) => b.score - a.score);

      // Filter and score documents
      const documents = MOCK_DOCUMENTS.map((d) => ({ ...d, score: scoreResult(d, q) }))
        .filter((d) => d.score > 0)
        .sort((a, b) => b.score - a.score);

      // Filter and score policies
      const policies = MOCK_POLICIES.map((p) => ({ ...p, score: scoreResult(p, q) }))
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score);

      // Apply type filters
      let results: AnySearchResult[] = [...employees, ...documents, ...policies];
      if (options.types && options.types.length > 0) {
        results = results.filter((r) => options.types!.includes(r.type as SearchResultType));
      }
      if (options.departmentId) {
        results = results.filter(
          (r) => 'departmentId' in r && r.departmentId === options.departmentId
        );
      }
      if (options.locationId) {
        results = results.filter((r) => 'locationId' in r && r.locationId === options.locationId);
      }

      // Sort
      if (options.sortBy === 'name') {
        results.sort((a, b) => {
          const nameA = 'name' in a ? a.name : 'title' in a ? a.title : '';
          const nameB = 'name' in b ? b.name : 'title' in b ? b.title : '';
          return options.sortOrder === 'desc'
            ? nameB.localeCompare(nameA)
            : nameA.localeCompare(nameB);
        });
      } else {
        results.sort((a, b) => b.score - a.score);
      }

      // Pagination
      const page = options.page ?? 1;
      const pageSize = options.pageSize ?? 20;
      const paginated = results.slice((page - 1) * pageSize, page * pageSize);

      // Build facets
      const deptCounts = new Map<string, { label: string; count: number; id: string }>();
      for (const e of employees) {
        const key = e.departmentId;
        const existing = deptCounts.get(key);
        if (existing) existing.count++;
        else deptCounts.set(key, { label: e.department, count: 1, id: key });
      }

      return {
        query,
        totalCount: results.length,
        results: paginated,
        facets: {
          departments: [...deptCounts.values()].map((d) => ({
            label: d.label,
            value: d.id,
            count: d.count,
          })),
          locations: [],
          statuses: [
            {
              label: 'Active',
              value: 'active',
              count: employees.filter((e) => e.status === 'active').length,
            },
            {
              label: 'On Leave',
              value: 'on_leave',
              count: employees.filter((e) => e.status === 'on_leave').length,
            },
          ],
          types: [
            { label: 'Employees', value: 'employee', count: employees.length },
            { label: 'Documents', value: 'document', count: documents.length },
            { label: 'Policies', value: 'policy', count: policies.length },
          ],
        },
        took: Date.now() - startTime,
      };
    }
  }

  /**
   * Employee-specific search with facets
   */
  static async searchEmployees(
    query: string,
    filters: EmployeeSearchFilters = {}
  ): Promise<EmployeeSearchResults> {
    try {
      return await APIClient.get<EmployeeSearchResults>('/v1/search/employees', {
        query,
        ...filters,
      });
    } catch {
      let results = MOCK_EMPLOYEES.map((e) => ({
        ...e,
        score: query ? scoreResult(e, query) : 1,
      })).filter((e) => !query || e.score > 0);

      if (filters.departmentId) {
        results = results.filter((e) => e.departmentId === filters.departmentId);
      }
      if (filters.locationId) {
        results = results.filter((e) => e.locationId === filters.locationId);
      }
      if (filters.status) {
        results = results.filter((e) => e.status === filters.status);
      }

      results.sort((a, b) => b.score - a.score);

      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? 20;
      const paginated = results.slice((page - 1) * pageSize, page * pageSize);

      // Build department facets
      const deptMap = new Map<string, number>();
      results.forEach((e) => {
        deptMap.set(e.departmentId, (deptMap.get(e.departmentId) ?? 0) + 1);
      });

      return {
        query,
        totalCount: results.length,
        results: paginated,
        facets: {
          departments: MOCK_EMPLOYEES.reduce((acc, e) => {
            const existing = acc.find((f) => f.value === e.departmentId);
            if (existing) existing.count++;
            else acc.push({ label: e.department, value: e.departmentId, count: 1 });
            return acc;
          }, [] as SearchFacet[]),
          locations: MOCK_EMPLOYEES.reduce((acc, e) => {
            const existing = acc.find((f) => f.value === e.locationId);
            if (existing) existing.count++;
            else acc.push({ label: e.location, value: e.locationId, count: 1 });
            return acc;
          }, [] as SearchFacet[]),
          statuses: [
            {
              label: 'Active',
              value: 'active',
              count: results.filter((e) => e.status === 'active').length,
            },
            {
              label: 'On Leave',
              value: 'on_leave',
              count: results.filter((e) => e.status === 'on_leave').length,
            },
            {
              label: 'Inactive',
              value: 'inactive',
              count: results.filter((e) => e.status === 'inactive').length,
            },
          ],
          titles: [],
        },
      };
    }
  }

  /**
   * Get typeahead suggestions for a partial query
   */
  static async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      return await APIClient.get<SearchSuggestion[]>('/v1/search/suggestions', { query });
    } catch {
      const q = query.toLowerCase().trim();
      const suggestions: SearchSuggestion[] = [];

      // Add matching employees
      MOCK_EMPLOYEES.filter((e) => e.name.toLowerCase().startsWith(q))
        .slice(0, 3)
        .forEach((e) => {
          suggestions.push({ query: e.name, type: 'employee' });
        });

      // Add matching popular searches
      POPULAR_SEARCHES.filter((s) => s.includes(q))
        .slice(0, 3)
        .forEach((s) => {
          suggestions.push({ query: s, type: 'popular' });
        });

      // Add matching recent searches
      const recent = SearchService.getRecentSearches();
      recent
        .filter((r) => r.query.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((r) => {
          suggestions.push({ query: r.query, type: 'recent' });
        });

      return suggestions.slice(0, 8);
    }
  }

  /**
   * Get recent searches from localStorage
   */
  static getRecentSearches(): { query: string; timestamp: number }[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Save a search query to recent searches
   */
  static saveRecentSearch(query: string): void {
    if (!query.trim()) return;
    try {
      const existing = SearchService.getRecentSearches();
      const filtered = existing.filter((r) => r.query.toLowerCase() !== query.toLowerCase());
      const updated = [{ query: query.trim(), timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENT
      );
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // localStorage not available
    }
  }

  /**
   * Clear all recent searches
   */
  static clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // localStorage not available
    }
  }
}

export default SearchService;

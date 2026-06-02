/**
 * Employee Search Service
 * Integrates with @aura/search for employee search functionality
 */

import type { SearchQuery} from '@aura/search';
import { getSearchClient, SearchResult } from '@aura/search';
import { logger } from '@/lib/logger';

const EMPLOYEE_INDEX = 'aura_employees';

export interface EmployeeSearchDocument {
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  employeeNumber: string;
  department?: string;
  designation?: string;
  location?: string;
  status: string;
  dateOfJoining: string;
  tenantId: string;
}

export interface EmployeeSearchParams {
  tenantId: string;
  query?: string;
  department?: string;
  status?: string;
  location?: string;
  from?: number;
  size?: number;
  sortBy?: 'fullName' | 'dateOfJoining' | 'employeeNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeSearchResults {
  employees: EmployeeSearchDocument[];
  total: number;
  took: number;
  from: number;
  size: number;
}

/**
 * Employee Search Service
 */
export class EmployeeSearchService {
  private searchClient = getSearchClient();
  private isInitialized = false;

  /**
   * Initialize the search service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.searchClient.connect();
      this.isInitialized = true;
      logger.info('Employee search service initialized successfully');
    } catch (error: any) {
      logger.error({ error }, 'Failed to initialize employee search service');
      throw error;
    }
  }

  /**
   * Search employees
   */
  async searchEmployees(params: EmployeeSearchParams): Promise<EmployeeSearchResults> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const filters: Record<string, unknown> = {};

      if (params.department) {
        filters['department.keyword'] = params.department;
      }

      if (params.status) {
        filters.status = params.status;
      }

      if (params.location) {
        filters['location.keyword'] = params.location;
      }

      const searchQuery: SearchQuery = {
        tenantId: params.tenantId,
        query: params.query,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        from: params.from || 0,
        size: params.size || 20,
        sort: params.sortBy
          ? [{ [params.sortBy]: params.sortOrder || 'asc' }]
          : [{ _score: 'desc' }],
      };

      const result = await this.searchClient.search<EmployeeSearchDocument>(
        EMPLOYEE_INDEX,
        searchQuery
      );

      logger.info(
        {
          tenantId: params.tenantId,
          query: params.query,
          total: result.total,
          took: result.took,
        },
        'Employee search completed'
      );

      return {
        employees: result.hits,
        total: result.total,
        took: result.took,
        from: params.from || 0,
        size: params.size || 20,
      };
    } catch (error: any) {
      logger.error({ error, params }, 'Error searching employees');
      throw error;
    }
  }

  /**
   * Autocomplete employee names
   */
  async autocompleteEmployees(
    tenantId: string,
    prefix: string,
    size: number = 10
  ): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const suggestions = await this.searchClient.autocomplete(
        EMPLOYEE_INDEX,
        'fullName',
        prefix,
        tenantId,
        size
      );

      logger.info(
        { tenantId, prefix, count: suggestions.length },
        'Employee autocomplete completed'
      );

      return suggestions;
    } catch (error: any) {
      logger.error({ error, tenantId, prefix }, 'Error autocompleting employees');
      throw error;
    }
  }

  /**
   * Index an employee
   */
  async indexEmployee(employee: EmployeeSearchDocument): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.searchClient.indexDocument(
        EMPLOYEE_INDEX,
        employee.employeeId,
        employee
      );

      logger.info({ employeeId: employee.employeeId }, 'Employee indexed successfully');
    } catch (error: any) {
      logger.error({ error, employeeId: employee.employeeId }, 'Error indexing employee');
      throw error;
    }
  }

  /**
   * Bulk index employees
   */
  async bulkIndexEmployees(employees: EmployeeSearchDocument[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const documents = employees.map((emp) => ({
        id: emp.employeeId,
        doc: emp,
      }));

      await this.searchClient.bulkIndex(EMPLOYEE_INDEX, documents);

      logger.info({ count: employees.length }, 'Employees bulk indexed successfully');
    } catch (error: any) {
      logger.error({ error, count: employees.length }, 'Error bulk indexing employees');
      throw error;
    }
  }

  /**
   * Update an employee in the index
   */
  async updateEmployee(
    employeeId: string,
    updates: Partial<EmployeeSearchDocument>
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.searchClient.updateDocument(EMPLOYEE_INDEX, employeeId, updates);

      logger.info({ employeeId }, 'Employee updated successfully');
    } catch (error: any) {
      logger.error({ error, employeeId }, 'Error updating employee');
      throw error;
    }
  }

  /**
   * Remove an employee from the index
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.searchClient.deleteDocument(EMPLOYEE_INDEX, employeeId);

      logger.info({ employeeId }, 'Employee deleted from index successfully');
    } catch (error: any) {
      logger.error({ error, employeeId }, 'Error deleting employee from index');
      throw error;
    }
  }

  /**
   * Get employee statistics by department
   */
  async getEmployeeStatsByDepartment(tenantId: string): Promise<Record<string, number>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.searchClient.aggregate(
        EMPLOYEE_INDEX,
        {
          by_department: {
            terms: {
              field: 'department.keyword',
              size: 100,
            },
          },
        },
        tenantId
      );

      const stats: Record<string, number> = {};

      if (result && typeof result === 'object' && 'by_department' in result) {
        const byDept = result.by_department as any;
        if (byDept.buckets) {
          byDept.buckets.forEach((bucket: any) => {
            stats[bucket.key] = bucket.doc_count;
          });
        }
      }

      logger.info({ tenantId, departmentCount: Object.keys(stats).length }, 'Employee stats retrieved');

      return stats;
    } catch (error: any) {
      logger.error({ error, tenantId }, 'Error getting employee stats');
      throw error;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.searchClient.isReady();
  }

  /**
   * Disconnect from search service
   */
  async disconnect(): Promise<void> {
    await this.searchClient.disconnect();
    this.isInitialized = false;
    logger.info('Employee search service disconnected');
  }
}

// Export singleton instance
export const employeeSearchService = new EmployeeSearchService();

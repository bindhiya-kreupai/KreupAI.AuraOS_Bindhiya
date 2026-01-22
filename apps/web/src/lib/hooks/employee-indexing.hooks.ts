/**
 * Employee Indexing Hooks
 * Automatically index employees in Elasticsearch when they are created/updated
 */

import { employeeSearchService, EmployeeSearchDocument } from '@/lib/search/employee-search.service';
import { logger } from '@/lib/logger';

/**
 * Index employee after creation
 */
export async function indexEmployeeOnCreate(employee: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  employeeNumber: string;
  department: string | null;
  designation: string | null;
  location: string | null;
  status: string;
  dateOfJoining: Date;
  tenantId: string;
}): Promise<void> {
  try {
    const searchDocument: EmployeeSearchDocument = {
      employeeId: employee.id,
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      email: employee.email,
      phoneNumber: employee.phoneNumber || undefined,
      employeeNumber: employee.employeeNumber,
      department: employee.department || undefined,
      designation: employee.designation || undefined,
      location: employee.location || undefined,
      status: employee.status,
      dateOfJoining: employee.dateOfJoining.toISOString(),
      tenantId: employee.tenantId,
    };

    await employeeSearchService.indexEmployee(searchDocument);

    logger.info({ employeeId: employee.id }, 'Employee indexed in Elasticsearch');
  } catch (error) {
    // Don't throw - indexing failure shouldn't break employee creation
    logger.error({ error, employeeId: employee.id }, 'Failed to index employee');
  }
}

/**
 * Update employee index after update
 */
export async function updateEmployeeIndex(
  employeeId: string,
  updates: Partial<EmployeeSearchDocument>
): Promise<void> {
  try {
    // If name fields are updated, update fullName
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      updates.fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
    }

    await employeeSearchService.updateEmployee(employeeId, updates);

    logger.info({ employeeId }, 'Employee index updated in Elasticsearch');
  } catch (error) {
    // Don't throw - indexing failure shouldn't break employee update
    logger.error({ error, employeeId }, 'Failed to update employee index');
  }
}

/**
 * Remove employee from index after deletion
 */
export async function removeEmployeeFromIndex(employeeId: string): Promise<void> {
  try {
    await employeeSearchService.deleteEmployee(employeeId);

    logger.info({ employeeId }, 'Employee removed from Elasticsearch index');
  } catch (error) {
    // Don't throw - indexing failure shouldn't break employee deletion
    logger.error({ error, employeeId }, 'Failed to remove employee from index');
  }
}

/**
 * Bulk reindex all employees
 * Use this for initial indexing or full reindex
 */
export async function bulkReindexEmployees(employees: Array<{
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  employeeNumber: string;
  department: string | null;
  designation: string | null;
  location: string | null;
  status: string;
  dateOfJoining: Date;
  tenantId: string;
}>): Promise<void> {
  try {
    const searchDocuments: EmployeeSearchDocument[] = employees.map((emp) => ({
      employeeId: emp.id,
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      fullName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      email: emp.email,
      phoneNumber: emp.phoneNumber || undefined,
      employeeNumber: emp.employeeNumber,
      department: emp.department || undefined,
      designation: emp.designation || undefined,
      location: emp.location || undefined,
      status: emp.status,
      dateOfJoining: emp.dateOfJoining.toISOString(),
      tenantId: emp.tenantId,
    }));

    await employeeSearchService.bulkIndexEmployees(searchDocuments);

    logger.info({ count: employees.length }, 'Employees bulk indexed in Elasticsearch');
  } catch (error) {
    logger.error({ error, count: employees.length }, 'Failed to bulk index employees');
    throw error;
  }
}

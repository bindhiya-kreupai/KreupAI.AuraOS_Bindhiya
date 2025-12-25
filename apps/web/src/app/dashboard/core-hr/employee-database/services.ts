/**
 * Employee Profile Service Layer
 * Handles all API interactions and data persistence
 */

import type { Employee, EmployeeStats, Document, EmploymentHistoryEvent } from './types';
import { APIClient, APIError } from '@/lib/api-client';
import { logger } from '@/lib/logger';

const API_ENDPOINT = '/employees';

/**
 * Employees API Service
 */
export class EmployeesService {
    /**
     * Fetch all employees
     */
    static async getEmployees(): Promise<Employee[]> {
        try {
            return await APIClient.get<Employee[]>(API_ENDPOINT);
        } catch {
            logger.error('Error fetching employees:', error);
            const message = error instanceof APIError
                ? `Failed to load employees: ${error.message}`
                : 'Failed to load employees. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Get single employee by ID
     */
    static async getEmployee(id: string): Promise<Employee | null> {
        try {
            return await APIClient.get<Employee>(`${API_ENDPOINT}/${id}`);
        } catch {
            if (error instanceof APIError && error.statusCode === 404) {
                return null;
            }
            logger.error('Error fetching employee:', error);
            const message = error instanceof APIError
                ? `Failed to load employee details: ${error.message}`
                : 'Failed to load employee details. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Create new employee
     */
    static async createEmployee(employee: Employee): Promise<Employee> {
        try {
            return await APIClient.post<Employee>(API_ENDPOINT, employee);
        } catch {
            logger.error('Error creating employee:', error);
            const message = error instanceof APIError
                ? `Failed to create employee: ${error.message}`
                : 'Failed to create employee. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Update employee
     */
    static async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
        try {
            return await APIClient.patch<Employee>(`${API_ENDPOINT}/${id}`, updates);
        } catch {
            logger.error('Error updating employee:', error);
            const message = error instanceof APIError
                ? `Failed to update employee: ${error.message}`
                : 'Failed to update employee. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Delete employee
     */
    static async deleteEmployee(id: string): Promise<void> {
        try {
            await APIClient.delete<void>(`${API_ENDPOINT}/${id}`);
        } catch {
            logger.error('Error deleting employee:', error);
            const message = error instanceof APIError
                ? `Failed to delete employee: ${error.message}`
                : 'Failed to delete employee. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Upload document
     */
    static async uploadDocument(employeeId: string, document: Document): Promise<Document> {
        try {
            return await APIClient.post<Document>(
                `${API_ENDPOINT}/${employeeId}/documents`,
                document
            );
        } catch {
            logger.error('Error uploading document:', error);
            const message = error instanceof APIError
                ? `Failed to upload document: ${error.message}`
                : 'Failed to upload document. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Delete document
     */
    static async deleteDocument(employeeId: string, documentId: string): Promise<void> {
        try {
            await APIClient.delete<void>(
                `${API_ENDPOINT}/${employeeId}/documents/${documentId}`
            );
        } catch {
            logger.error('Error deleting document:', error);
            const message = error instanceof APIError
                ? `Failed to delete document: ${error.message}`
                : 'Failed to delete document. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Add employment history event
     */
    static async addHistoryEvent(
        employeeId: string,
        event: EmploymentHistoryEvent
    ): Promise<EmploymentHistoryEvent> {
        try {
            return await APIClient.post<EmploymentHistoryEvent>(
                `${API_ENDPOINT}/${employeeId}/history`,
                event
            );
        } catch {
            logger.error('Error adding history event:', error);
            const message = error instanceof APIError
                ? `Failed to add history event: ${error.message}`
                : 'Failed to add history event. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Get employee statistics
     */
    static async getStats(): Promise<EmployeeStats> {
        try {
            return await APIClient.get<EmployeeStats>(`${API_ENDPOINT}/stats`);
        } catch {
            logger.error('Error fetching stats:', error);
            const message = error instanceof APIError
                ? `Failed to load statistics: ${error.message}`
                : 'Failed to load statistics. Please try again.';
            throw new Error(message);
        }
    }
}

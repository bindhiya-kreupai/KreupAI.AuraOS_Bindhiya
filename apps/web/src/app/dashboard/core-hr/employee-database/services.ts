/**
 * Employee Profile Service Layer
 * Handles all API interactions and data persistence
 */

import { Employee, EmployeeStats, Document, EmploymentHistoryEvent } from './types';

const API_BASE = '/api/employees';
const STORAGE_KEY = 'aura_employee_profiles';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * LocalStorage Helper
 */
class StorageService {
    static save(employees: Employee[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
        } catch (error) {
            console.error('Failed to save employees to localStorage:', error);
        }
    }

    static load(): Employee[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load employees from localStorage:', error);
            return [];
        }
    }

    static clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * Employees API Service
 */
export class EmployeesService {
    /**
     * Fetch all employees
     */
    static async getEmployees(): Promise<Employee[]> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(API_BASE);
            // if (!response.ok) throw new Error('Failed to fetch employees');
            // return response.json();

            return StorageService.load();
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw new Error('Failed to load employees. Please try again.');
        }
    }

    /**
     * Get single employee by ID
     */
    static async getEmployee(id: string): Promise<Employee | null> {
        await delay(200);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${id}`);
            // if (!response.ok) throw new Error('Failed to fetch employee');
            // return response.json();

            const employees = StorageService.load();
            return employees.find(e => e.id === id) || null;
        } catch (error) {
            console.error('Error fetching employee:', error);
            throw new Error('Failed to load employee details. Please try again.');
        }
    }

    /**
     * Create new employee
     */
    static async createEmployee(employee: Employee): Promise<Employee> {
        await delay(500);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(API_BASE, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(employee),
            // });
            // if (!response.ok) throw new Error('Failed to create employee');
            // return response.json();

            const employees = StorageService.load();
            employees.push(employee);
            StorageService.save(employees);
            return employee;
        } catch (error) {
            console.error('Error creating employee:', error);
            throw new Error('Failed to create employee. Please try again.');
        }
    }

    /**
     * Update employee
     */
    static async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${id}`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(updates),
            // });
            // if (!response.ok) throw new Error('Failed to update employee');
            // return response.json();

            const employees = StorageService.load();
            const index = employees.findIndex(e => e.id === id);
            if (index === -1) throw new Error('Employee not found');

            employees[index] = { ...employees[index], ...updates, updatedAt: new Date().toISOString() };
            StorageService.save(employees);
            return employees[index];
        } catch (error) {
            console.error('Error updating employee:', error);
            throw new Error('Failed to update employee. Please try again.');
        }
    }

    /**
     * Delete employee
     */
    static async deleteEmployee(id: string): Promise<void> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            // if (!response.ok) throw new Error('Failed to delete employee');

            const employees = StorageService.load();
            const filtered = employees.filter(e => e.id !== id);
            StorageService.save(filtered);
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw new Error('Failed to delete employee. Please try again.');
        }
    }

    /**
     * Upload document
     */
    static async uploadDocument(employeeId: string, document: Document): Promise<Document> {
        await delay(500);

        try {
            // TODO: Replace with real API call with file upload
            // const formData = new FormData();
            // formData.append('file', file);
            // const response = await fetch(`${API_BASE}/${employeeId}/documents`, {
            //     method: 'POST',
            //     body: formData,
            // });
            // if (!response.ok) throw new Error('Failed to upload document');
            // return response.json();

            const employees = StorageService.load();
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) throw new Error('Employee not found');

            employee.documents.push(document);
            employee.updatedAt = new Date().toISOString();
            StorageService.save(employees);
            return document;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw new Error('Failed to upload document. Please try again.');
        }
    }

    /**
     * Delete document
     */
    static async deleteDocument(employeeId: string, documentId: string): Promise<void> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${employeeId}/documents/${documentId}`, {
            //     method: 'DELETE',
            // });
            // if (!response.ok) throw new Error('Failed to delete document');

            const employees = StorageService.load();
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) throw new Error('Employee not found');

            employee.documents = employee.documents.filter(d => d.id !== documentId);
            employee.updatedAt = new Date().toISOString();
            StorageService.save(employees);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Failed to delete document. Please try again.');
        }
    }

    /**
     * Add employment history event
     */
    static async addHistoryEvent(
        employeeId: string,
        event: EmploymentHistoryEvent
    ): Promise<EmploymentHistoryEvent> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${employeeId}/history`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(event),
            // });
            // if (!response.ok) throw new Error('Failed to add history event');
            // return response.json();

            const employees = StorageService.load();
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) throw new Error('Employee not found');

            employee.employmentHistory.unshift(event);
            employee.updatedAt = new Date().toISOString();
            StorageService.save(employees);
            return event;
        } catch (error) {
            console.error('Error adding history event:', error);
            throw new Error('Failed to add history event. Please try again.');
        }
    }

    /**
     * Get employee statistics
     */
    static async getStats(employees: Employee[]): Promise<EmployeeStats> {
        await delay(200);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/stats`);
            // if (!response.ok) throw new Error('Failed to fetch stats');
            // return response.json();

            const activeEmployees = employees.filter(e => e.jobDetails.employmentStatus === 'Active');
            const onLeave = employees.filter(e => e.jobDetails.employmentStatus === 'On Leave');

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newHires = employees.filter(
                e => new Date(e.jobDetails.hireDate) > thirtyDaysAgo
            );

            const byDepartment: { [key: string]: number } = {};
            const byLocation: { [key: string]: number } = {};

            employees.forEach(e => {
                byDepartment[e.department] = (byDepartment[e.department] || 0) + 1;
                byLocation[e.location] = (byLocation[e.location] || 0) + 1;
            });

            return {
                totalEmployees: employees.length,
                activeEmployees: activeEmployees.length,
                newHiresThisMonth: newHires.length,
                onLeave: onLeave.length,
                byDepartment,
                byLocation,
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw new Error('Failed to load statistics. Please try again.');
        }
    }
}

export { StorageService };

/**
 * Employees Hook - Production Ready
 * Manages all employee operations with loading states, error handling, and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Employee, Document, EmploymentHistoryEvent, EmployeeStats } from '../types';
import { EmployeesService } from '../services';
import { generateSampleEmployees } from '../data';
import { useToast } from './useToast';

export const useEmployees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    // Load employees on mount
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setIsLoading(true);
                const data = await EmployeesService.getEmployees();

                // If no data in localStorage, initialize with sample data
                if (data.length === 0) {
                    const initialData = generateSampleEmployees();
                    setEmployees(initialData);
                    // Save initial data to localStorage
                    for (const employee of initialData) {
                        await EmployeesService.createEmployee(employee);
                    }
                } else {
                    setEmployees(data);
                }
            } catch (error) {
                toast.error((error as Error).message || 'Failed to load employees');
                setEmployees(generateSampleEmployees()); // Fallback to sample data
            } finally {
                setIsLoading(false);
            }
        };

        loadEmployees();
    }, []);

    // Get single employee
    const getEmployee = useCallback(async (id: string): Promise<Employee | null> => {
        try {
            return await EmployeesService.getEmployee(id);
        } catch (error) {
            toast.error((error as Error).message || 'Failed to load employee');
            return null;
        }
    }, [toast]);

    // Create employee
    const createEmployee = useCallback(async (employee: Employee) => {
        try {
            setIsSaving(true);
            await EmployeesService.createEmployee(employee);
            setEmployees(prev => [employee, ...prev]);
            toast.success('Employee created successfully!');
            return employee;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create employee');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Update employee
    const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
        try {
            setIsSaving(true);
            const updated = await EmployeesService.updateEmployee(id, updates);
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
            toast.success('Employee updated successfully!');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update employee');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Delete employee
    const deleteEmployee = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await EmployeesService.deleteEmployee(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Employee deleted successfully!');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete employee');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Upload document
    const uploadDocument = useCallback(async (employeeId: string, document: Document) => {
        try {
            setIsSaving(true);
            await EmployeesService.uploadDocument(employeeId, document);
            setEmployees(prev => prev.map(e =>
                e.id === employeeId ? { ...e, documents: [...e.documents, document] } : e
            ));
            toast.success('Document uploaded successfully!');
            return document;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to upload document');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Delete document
    const deleteDocument = useCallback(async (employeeId: string, documentId: string) => {
        try {
            setIsSaving(true);
            await EmployeesService.deleteDocument(employeeId, documentId);
            setEmployees(prev => prev.map(e =>
                e.id === employeeId ? { ...e, documents: e.documents.filter(d => d.id !== documentId) } : e
            ));
            toast.success('Document deleted successfully!');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete document');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Add history event
    const addHistoryEvent = useCallback(async (employeeId: string, event: EmploymentHistoryEvent) => {
        try {
            setIsSaving(true);
            await EmployeesService.addHistoryEvent(employeeId, event);
            setEmployees(prev => prev.map(e =>
                e.id === employeeId ? { ...e, employmentHistory: [event, ...e.employmentHistory] } : e
            ));
            toast.success('History event added successfully!');
            return event;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to add history event');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Get statistics
    const getStats = useCallback(async (): Promise<EmployeeStats> => {
        try {
            return await EmployeesService.getStats(employees);
        } catch (error) {
            toast.error((error as Error).message || 'Failed to load statistics');
            return {
                totalEmployees: 0,
                activeEmployees: 0,
                newHiresThisMonth: 0,
                onLeave: 0,
                byDepartment: {},
                byLocation: {},
            };
        }
    }, [employees, toast]);

    return {
        employees,
        isLoading,
        isSaving,
        getEmployee,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        uploadDocument,
        deleteDocument,
        addHistoryEvent,
        getStats,
        toast,
    };
};

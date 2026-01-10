/**
 * useEmployees Hook Tests
 * Tests employee CRUD operations, loading states, error handling, and persistence
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmployees } from './useEmployees';
import { EmployeesService } from '../services';
import type { Employee, Document, EmploymentHistoryEvent } from '../types';

// Mock the service layer
vi.mock('../services', () => ({
  EmployeesService: {
    getEmployees: vi.fn(),
    getEmployee: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    uploadDocument: vi.fn(),
    deleteDocument: vi.fn(),
    addHistoryEvent: vi.fn(),
    getStats: vi.fn(),
  },
}));

// Mock toast
vi.mock('./useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

// Mock sample data generator
vi.mock('../data', () => ({
  generateSampleEmployees: vi.fn(() => [
    {
      id: 'sample-1',
      name: 'Sample Employee',
      email: 'sample@example.com',
      personalInfo: {},
      jobDetails: {},
      compensation: {},
      documents: [],
      employmentHistory: [],
    },
  ]),
}));

const mockEmployee: Employee = {
  id: 'emp-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://example.com/avatar.jpg',
  personalInfo: {
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'American',
    phone: '+1-555-0100',
    personalEmail: 'john@personal.com',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    emergencyContacts: [],
    familyMembers: [],
  },
  jobDetails: {
    employeeId: 'EMP-001',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'San Francisco',
    manager: 'Jane Manager',
    employmentType: 'Full-time',
    employmentStatus: 'Active',
    hireDate: '2023-01-15',
    reportingTo: [],
    workSchedule: '9 AM - 5 PM',
    costCenter: 'ENG-001',
  },
  compensation: {
    baseSalary: 120000,
    currency: 'USD',
    payFrequency: 'Monthly',
    effectiveDate: '2023-01-15',
    benefits: ['Health Insurance', '401k'],
  },
  documents: [],
  employmentHistory: [],
};

const mockDocument: Document = {
  id: 'doc-001',
  name: 'Resume.pdf',
  type: 'Resume',
  uploadedDate: '2023-01-15',
  uploadedBy: 'HR Admin',
  fileSize: 1024000,
  verified: false,
};

const mockHistoryEvent: EmploymentHistoryEvent = {
  id: 'hist-001',
  date: '2023-01-15',
  type: 'Hired',
  description: 'Initial hire as Software Engineer',
};

describe('useEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with loading state', () => {
      vi.mocked(EmployeesService.getEmployees).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useEmployees());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.employees).toEqual([]);
    });

    it('loads existing employees on mount', async () => {
      const employees = [mockEmployee];
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue(employees);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.employees).toEqual(employees);
      expect(EmployeesService.getEmployees).toHaveBeenCalledTimes(1);
    });

    it('initializes with sample data when no employees exist', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.employees.length).toBeGreaterThan(0);
      expect(result.current.employees[0].id).toBe('sample-1');
    });

    it('saves sample data to localStorage when initializing', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.createEmployee).mockResolvedValue(undefined);

      renderHook(() => useEmployees());

      await waitFor(() => {
        expect(EmployeesService.createEmployee).toHaveBeenCalled();
      });
    });

    it('handles initialization errors gracefully', async () => {
      vi.mocked(EmployeesService.getEmployees).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fallback to sample data
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    it('sets isSaving to false initially', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('getEmployee', () => {
    it('retrieves single employee by id', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.getEmployee).mockResolvedValue(mockEmployee);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let employee: Employee | null = null;
      await act(async () => {
        employee = await result.current.getEmployee('emp-001');
      });

      expect(employee).toEqual(mockEmployee);
      expect(EmployeesService.getEmployee).toHaveBeenCalledWith('emp-001');
    });

    it('returns null when employee not found', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.getEmployee).mockResolvedValue(null);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let employee: Employee | null = null;
      await act(async () => {
        employee = await result.current.getEmployee('non-existent');
      });

      expect(employee).toBeNull();
    });

    it('handles getEmployee errors', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.getEmployee).mockRejectedValue(
        new Error('Database error')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let employee: Employee | null = null;
      await act(async () => {
        employee = await result.current.getEmployee('emp-001');
      });

      expect(employee).toBeNull();
    });
  });

  describe('createEmployee', () => {
    it('creates new employee successfully', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.createEmployee).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createEmployee(mockEmployee);
      });

      expect(result.current.employees).toContainEqual(mockEmployee);
      expect(EmployeesService.createEmployee).toHaveBeenCalledWith(mockEmployee);
    });

    it('adds new employee to beginning of list', async () => {
      const existingEmployee = { ...mockEmployee, id: 'emp-002' };
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([existingEmployee]);
      vi.mocked(EmployeesService.createEmployee).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createEmployee(mockEmployee);
      });

      expect(result.current.employees[0]).toEqual(mockEmployee);
      expect(result.current.employees[1]).toEqual(existingEmployee);
    });

    it('sets isSaving state during creation', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.createEmployee).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createEmployee(mockEmployee);
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('handles creation errors', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.createEmployee).mockRejectedValue(
        new Error('Validation error')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createEmployee(mockEmployee);
        })
      ).rejects.toThrow();

      expect(result.current.employees).not.toContainEqual(mockEmployee);
    });

    it('resets isSaving after error', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);
      vi.mocked(EmployeesService.createEmployee).mockRejectedValue(
        new Error('Error')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      try {
        await act(async () => {
          await result.current.createEmployee(mockEmployee);
        });
      } catch (error) {
        // Expected error
      }

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('updateEmployee', () => {
    it('updates employee successfully', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.updateEmployee).mockResolvedValue({
        ...mockEmployee,
        name: 'John Updated',
      });

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEmployee('emp-001', { name: 'John Updated' });
      });

      expect(result.current.employees[0].name).toBe('John Updated');
      expect(EmployeesService.updateEmployee).toHaveBeenCalledWith('emp-001', {
        name: 'John Updated',
      });
    });

    it('only updates matching employee', async () => {
      const employee2 = { ...mockEmployee, id: 'emp-002', name: 'Jane Doe' };
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([
        mockEmployee,
        employee2,
      ]);
      vi.mocked(EmployeesService.updateEmployee).mockResolvedValue({
        ...mockEmployee,
        name: 'John Updated',
      });

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEmployee('emp-001', { name: 'John Updated' });
      });

      expect(result.current.employees[0].name).toBe('John Updated');
      expect(result.current.employees[1].name).toBe('Jane Doe'); // Unchanged
    });

    it('sets isSaving state during update', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.updateEmployee).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateEmployee('emp-001', { name: 'Updated' });
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('handles update errors', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.updateEmployee).mockRejectedValue(
        new Error('Update failed')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.updateEmployee('emp-001', { name: 'Updated' });
        })
      ).rejects.toThrow();

      expect(result.current.employees[0].name).toBe('John Doe'); // Unchanged
    });
  });

  describe('deleteEmployee', () => {
    it('deletes employee successfully', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.deleteEmployee).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteEmployee('emp-001');
      });

      expect(result.current.employees).not.toContainEqual(mockEmployee);
      expect(EmployeesService.deleteEmployee).toHaveBeenCalledWith('emp-001');
    });

    it('removes only the specified employee', async () => {
      const employee2 = { ...mockEmployee, id: 'emp-002' };
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([
        mockEmployee,
        employee2,
      ]);
      vi.mocked(EmployeesService.deleteEmployee).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteEmployee('emp-001');
      });

      expect(result.current.employees).toHaveLength(1);
      expect(result.current.employees[0].id).toBe('emp-002');
    });

    it('sets isSaving state during deletion', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.deleteEmployee).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.deleteEmployee('emp-001');
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('handles deletion errors', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.deleteEmployee).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteEmployee('emp-001');
        })
      ).rejects.toThrow();

      expect(result.current.employees).toContainEqual(mockEmployee); // Still present
    });
  });

  describe('uploadDocument', () => {
    it('uploads document successfully', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.uploadDocument).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.uploadDocument('emp-001', mockDocument);
      });

      expect(result.current.employees[0].documents).toContainEqual(mockDocument);
      expect(EmployeesService.uploadDocument).toHaveBeenCalledWith(
        'emp-001',
        mockDocument
      );
    });

    it('adds document to correct employee', async () => {
      const employee2 = { ...mockEmployee, id: 'emp-002', documents: [] };
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([
        mockEmployee,
        employee2,
      ]);
      vi.mocked(EmployeesService.uploadDocument).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.uploadDocument('emp-001', mockDocument);
      });

      expect(result.current.employees[0].documents).toContainEqual(mockDocument);
      expect(result.current.employees[1].documents).toHaveLength(0); // Unchanged
    });

    it('handles upload errors', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.uploadDocument).mockRejectedValue(
        new Error('Upload failed')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.uploadDocument('emp-001', mockDocument);
        })
      ).rejects.toThrow();

      expect(result.current.employees[0].documents).not.toContainEqual(mockDocument);
    });
  });

  describe('deleteDocument', () => {
    it('deletes document successfully', async () => {
      const employeeWithDoc = { ...mockEmployee, documents: [mockDocument] };
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([employeeWithDoc]);
      vi.mocked(EmployeesService.deleteDocument).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteDocument('emp-001', 'doc-001');
      });

      expect(result.current.employees[0].documents).not.toContainEqual(mockDocument);
      expect(EmployeesService.deleteDocument).toHaveBeenCalledWith('emp-001', 'doc-001');
    });

    it('removes document from correct employee only', async () => {
      const doc2 = { ...mockDocument, id: 'doc-002' };
      const employee2 = { ...mockEmployee, id: 'emp-002', documents: [doc2] };
      const employeeWithDoc = { ...mockEmployee, documents: [mockDocument] };

      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([
        employeeWithDoc,
        employee2,
      ]);
      vi.mocked(EmployeesService.deleteDocument).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteDocument('emp-001', 'doc-001');
      });

      expect(result.current.employees[0].documents).toHaveLength(0);
      expect(result.current.employees[1].documents).toContainEqual(doc2); // Unchanged
    });

    it('handles delete document errors', async () => {
      const employeeWithDoc = { ...mockEmployee, documents: [mockDocument] };
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([employeeWithDoc]);
      vi.mocked(EmployeesService.deleteDocument).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteDocument('emp-001', 'doc-001');
        })
      ).rejects.toThrow();

      expect(result.current.employees[0].documents).toContainEqual(mockDocument);
    });
  });

  describe('addHistoryEvent', () => {
    it('adds history event successfully', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.addHistoryEvent).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addHistoryEvent('emp-001', mockHistoryEvent);
      });

      expect(result.current.employees[0].employmentHistory).toContainEqual(
        mockHistoryEvent
      );
      expect(EmployeesService.addHistoryEvent).toHaveBeenCalledWith(
        'emp-001',
        mockHistoryEvent
      );
    });

    it('adds event to beginning of history', async () => {
      const existingEvent = { ...mockHistoryEvent, id: 'hist-002' };
      const employeeWithHistory = {
        ...mockEmployee,
        employmentHistory: [existingEvent],
      };

      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([employeeWithHistory]);
      vi.mocked(EmployeesService.addHistoryEvent).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addHistoryEvent('emp-001', mockHistoryEvent);
      });

      expect(result.current.employees[0].employmentHistory[0]).toEqual(mockHistoryEvent);
      expect(result.current.employees[0].employmentHistory[1]).toEqual(existingEvent);
    });

    it('handles add history event errors', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.addHistoryEvent).mockRejectedValue(
        new Error('Add failed')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.addHistoryEvent('emp-001', mockHistoryEvent);
        })
      ).rejects.toThrow();

      expect(result.current.employees[0].employmentHistory).not.toContainEqual(
        mockHistoryEvent
      );
    });
  });

  describe('getStats', () => {
    it('retrieves statistics successfully', async () => {
      const mockStats = {
        totalEmployees: 10,
        activeEmployees: 8,
        newHiresThisMonth: 2,
        onLeave: 1,
        byDepartment: { Engineering: 5, Sales: 3 },
        byLocation: { 'San Francisco': 6, 'New York': 4 },
      };

      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.getStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let stats;
      await act(async () => {
        stats = await result.current.getStats();
      });

      expect(stats).toEqual(mockStats);
      expect(EmployeesService.getStats).toHaveBeenCalledWith([mockEmployee]);
    });

    it('returns default stats on error', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.getStats).mockRejectedValue(
        new Error('Stats error')
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let stats;
      await act(async () => {
        stats = await result.current.getStats();
      });

      expect(stats).toEqual({
        totalEmployees: 0,
        activeEmployees: 0,
        newHiresThisMonth: 0,
        onLeave: 0,
        byDepartment: {},
        byLocation: {},
      });
    });
  });

  describe('Loading States', () => {
    it('manages isLoading state correctly', async () => {
      let resolveEmployees: (value: Employee[]) => void;
      const promise = new Promise<Employee[]>((resolve) => {
        resolveEmployees = resolve;
      });

      vi.mocked(EmployeesService.getEmployees).mockReturnValue(promise);

      const { result } = renderHook(() => useEmployees());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveEmployees!([mockEmployee]);
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('manages isSaving state for multiple operations', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.createEmployee).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );
      vi.mocked(EmployeesService.updateEmployee).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create operation
      act(() => {
        result.current.createEmployee(mockEmployee);
      });
      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });

      // Update operation
      act(() => {
        result.current.updateEmployee('emp-001', { name: 'Updated' });
      });
      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty employee list', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should initialize with sample data
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    it('handles concurrent operations', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([mockEmployee]);
      vi.mocked(EmployeesService.updateEmployee).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockEmployee), 50))
      );

      const { result } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Fire multiple updates concurrently
      await act(async () => {
        await Promise.all([
          result.current.updateEmployee('emp-001', { name: 'Update 1' }),
          result.current.updateEmployee('emp-001', { name: 'Update 2' }),
        ]);
      });

      expect(EmployeesService.updateEmployee).toHaveBeenCalledTimes(2);
    });

    it('maintains referential stability of callback functions', async () => {
      vi.mocked(EmployeesService.getEmployees).mockResolvedValue([]);

      const { result, rerender } = renderHook(() => useEmployees());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstGetEmployee = result.current.getEmployee;
      const firstCreateEmployee = result.current.createEmployee;

      rerender();

      expect(result.current.getEmployee).toBe(firstGetEmployee);
      expect(result.current.createEmployee).toBe(firstCreateEmployee);
    });
  });
});

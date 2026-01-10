/**
 * useCoreHR Hook Tests
 * Tests comprehensive Core HR operations including employees, organization, documents, and more
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCoreHR } from './useCoreHR';

// Mock all services
vi.mock('../services', () => ({
  EmployeeService: {
    getAllEmployees: vi.fn(() => Promise.resolve([])),
    createEmployee: vi.fn((data) => Promise.resolve(data)),
    updateEmployee: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    terminateEmployee: vi.fn(() => Promise.resolve()),
    searchEmployees: vi.fn(() => Promise.resolve([])),
  },
  OrganizationService: {
    getAllUnits: vi.fn(() => Promise.resolve([])),
    createUnit: vi.fn((data) => Promise.resolve(data)),
    updateUnit: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    getHierarchy: vi.fn(() => Promise.resolve({})),
  },
  EmploymentHistoryService: {
    getEmployeeHistory: vi.fn(() => Promise.resolve([])),
    recordChange: vi.fn((data) => Promise.resolve(data)),
  },
  DocumentService: {
    getAllDocuments: vi.fn(() => Promise.resolve([])),
    getEmployeeDocuments: vi.fn(() => Promise.resolve([])),
    uploadDocument: vi.fn((data) => Promise.resolve(data)),
    verifyDocument: vi.fn(() => Promise.resolve()),
    getAllTemplates: vi.fn(() => Promise.resolve([])),
  },
  PositionService: {
    getAllPositions: vi.fn(() => Promise.resolve([])),
    createPosition: vi.fn((data) => Promise.resolve(data)),
    updatePosition: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    closePosition: vi.fn(() => Promise.resolve()),
  },
  CostCenterService: {
    getAllCostCenters: vi.fn(() => Promise.resolve([])),
    createCostCenter: vi.fn((data) => Promise.resolve(data)),
    updateCostCenter: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    allocateBudget: vi.fn(() => Promise.resolve()),
  },
  LifeEventService: {
    getAllEvents: vi.fn(() => Promise.resolve([])),
    getEmployeeEvents: vi.fn(() => Promise.resolve([])),
    recordEvent: vi.fn((data) => Promise.resolve(data)),
    processEvent: vi.fn(() => Promise.resolve()),
  },
  MassUpdateService: {
    getAllUpdates: vi.fn(() => Promise.resolve([])),
    createUpdate: vi.fn((data) => Promise.resolve(data)),
    executeUpdate: vi.fn(() => Promise.resolve({ successCount: 10, failureCount: 0 })),
    previewUpdate: vi.fn(() => Promise.resolve({})),
  },
  IDCardService: {
    getAllCards: vi.fn(() => Promise.resolve([])),
    getEmployeeCard: vi.fn(() => Promise.resolve(null)),
    generateCard: vi.fn((id, type) => Promise.resolve({ id, type })),
    deactivateCard: vi.fn(() => Promise.resolve()),
  },
  LetterService: {
    getAllRequests: vi.fn(() => Promise.resolve([])),
    getEmployeeRequests: vi.fn(() => Promise.resolve([])),
    createRequest: vi.fn((data) => Promise.resolve(data)),
    approveRequest: vi.fn(() => Promise.resolve()),
    getAllTemplates: vi.fn(() => Promise.resolve([])),
  },
  ExitService: {
    getAllExits: vi.fn(() => Promise.resolve([])),
    initiateExit: vi.fn((data) => Promise.resolve(data)),
    updateClearanceItem: vi.fn(() => Promise.resolve()),
    completeFinalSettlement: vi.fn(() => Promise.resolve()),
    getAllClearanceTemplates: vi.fn(() => Promise.resolve([])),
  },
  AnniversaryService: {
    getAllAnniversaries: vi.fn(() => Promise.resolve([])),
    generateAnniversaries: vi.fn(() => Promise.resolve(10)),
    sendNotifications: vi.fn(() => Promise.resolve()),
  },
  AutoNumberService: {
    getAllSequences: vi.fn(() => Promise.resolve([])),
    createSequence: vi.fn((data) => Promise.resolve(data)),
    resetSequence: vi.fn(() => Promise.resolve()),
  },
  ProbationService: {
    getAllRecords: vi.fn(() => Promise.resolve([])),
    getEmployeeProbation: vi.fn(() => Promise.resolve(null)),
    addReview: vi.fn(() => Promise.resolve()),
    extendProbation: vi.fn(() => Promise.resolve()),
  },
  ConfirmationService: {
    getAllConfirmations: vi.fn(() => Promise.resolve([])),
    getEmployeeConfirmations: vi.fn(() => Promise.resolve([])),
    generateLetter: vi.fn((id, data) => Promise.resolve({ id, ...data })),
  },
  AssetService: {
    getAllAssets: vi.fn(() => Promise.resolve([])),
    createAsset: vi.fn((data) => Promise.resolve(data)),
    updateAsset: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    assignAsset: vi.fn(() => Promise.resolve()),
    returnAsset: vi.fn(() => Promise.resolve()),
    retireAsset: vi.fn(() => Promise.resolve()),
    getEmployeeAssets: vi.fn(() => Promise.resolve([])),
  },
  CoreHRSettingsService: {
    getSettings: vi.fn(() => Promise.resolve(null)),
    updateSettings: vi.fn((data) => Promise.resolve(data)),
  },
}));

// Mock sample data
vi.mock('../data', () => ({
  sampleEmployees: [],
  sampleOrganizationUnits: [],
  sampleEmploymentHistory: [],
  sampleEmployeeDocuments: [],
  samplePositions: [],
  sampleCostCenters: [],
  sampleLifeEvents: [],
  sampleMassUpdates: [],
  sampleIDCards: [],
  sampleLetterRequests: [],
  sampleExitProcesses: [],
  sampleAnniversaries: [],
  sampleAutoNumberSequences: [],
  sampleProbationRecords: [],
  sampleConfirmationLetters: [],
  sampleAssets: [],
  sampleCoreHRSettings: null,
  sampleDocumentTemplates: [],
  sampleLetterTemplates: [],
  sampleClearanceTemplates: [],
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCoreHR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with loading state', async () => {
      const { result } = renderHook(() => useCoreHR());

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('loads all data modules on mount', async () => {
      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.employees).toBeDefined();
      expect(result.current.organizationUnits).toBeDefined();
      expect(result.current.positions).toBeDefined();
      expect(result.current.costCenters).toBeDefined();
      expect(result.current.assets).toBeDefined();
    });

    it('initializes localStorage when no data exists', async () => {
      renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(localStorageMock.getItem('core_hr_employees')).toBeTruthy();
        expect(localStorageMock.getItem('core_hr_organization_units')).toBeTruthy();
        expect(localStorageMock.getItem('core_hr_positions')).toBeTruthy();
      });
    });

    it('handles initialization errors gracefully', async () => {
      const {  EmployeeService } = await import('../services');
      vi.mocked(EmployeeService.getAllEmployees).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have error toast
      expect(result.current.toasts.length).toBeGreaterThan(0);
      expect(result.current.toasts[0].type).toBe('error');
    });
  });

  describe('Employee Operations', () => {
    it('loads employees successfully', async () => {
      const mockEmployees = [{ id: 'emp-001', name: 'John Doe' }];
      const { EmployeeService } = await import('../services');
      vi.mocked(EmployeeService.getAllEmployees).mockResolvedValue(mockEmployees as any);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadEmployees();
      });

      expect(result.current.employees).toEqual(mockEmployees);
    });

    it('creates employee successfully', async () => {
      const mockEmployee = { name: 'Jane Smith', email: 'jane@example.com' };
      const { EmployeeService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let created;
      await act(async () => {
        created = await result.current.createEmployee(mockEmployee);
      });

      expect(EmployeeService.createEmployee).toHaveBeenCalledWith(mockEmployee);
      expect(created).toEqual(mockEmployee);
      expect(result.current.toasts).toContainEqual(
        expect.objectContaining({ type: 'success' })
      );
    });

    it('updates employee successfully', async () => {
      const { EmployeeService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEmployee('emp-001', { name: 'Updated Name' });
      });

      expect(EmployeeService.updateEmployee).toHaveBeenCalledWith('emp-001', {
        name: 'Updated Name',
      });
      expect(result.current.toasts).toContainEqual(
        expect.objectContaining({ type: 'success' })
      );
    });

    it('terminates employee successfully', async () => {
      const { EmployeeService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.terminateEmployee('emp-001', '2025-01-31', 'Resignation');
      });

      expect(EmployeeService.terminateEmployee).toHaveBeenCalledWith(
        'emp-001',
        '2025-01-31',
        'Resignation'
      );
    });

    it('searches employees successfully', async () => {
      const mockResults = [{ id: 'emp-001', name: 'John Doe' }];
      const { EmployeeService } = await import('../services');
      vi.mocked(EmployeeService.searchEmployees).mockResolvedValue(mockResults as any);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let results;
      await act(async () => {
        results = await result.current.searchEmployees('John');
      });

      expect(results).toEqual(mockResults);
      expect(EmployeeService.searchEmployees).toHaveBeenCalledWith('John');
    });

    it('handles employee operation errors', async () => {
      const { EmployeeService } = await import('../services');
      vi.mocked(EmployeeService.createEmployee).mockRejectedValue(
        new Error('Validation error')
      );

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createEmployee({ name: 'Test' });
        })
      ).rejects.toThrow();

      expect(result.current.toasts).toContainEqual(
        expect.objectContaining({ type: 'error' })
      );
    });
  });

  describe('Organization Operations', () => {
    it('loads organization units', async () => {
      const mockUnits = [{ id: 'unit-001', name: 'Engineering' }];
      const { OrganizationService } = await import('../services');
      vi.mocked(OrganizationService.getAllUnits).mockResolvedValue(mockUnits as any);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadOrganizationUnits();
      });

      expect(result.current.organizationUnits).toEqual(mockUnits);
    });

    it('creates organization unit', async () => {
      const mockUnit = { name: 'Sales', type: 'department' };
      const { OrganizationService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createOrganizationUnit(mockUnit);
      });

      expect(OrganizationService.createUnit).toHaveBeenCalledWith(mockUnit);
      expect(result.current.toasts).toContainEqual(
        expect.objectContaining({ type: 'success' })
      );
    });

    it('gets organization hierarchy', async () => {
      const mockHierarchy = { root: { children: [] } };
      const { OrganizationService } = await import('../services');
      vi.mocked(OrganizationService.getHierarchy).mockResolvedValue(mockHierarchy);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let hierarchy;
      await act(async () => {
        hierarchy = await result.current.getOrganizationHierarchy();
      });

      expect(hierarchy).toEqual(mockHierarchy);
    });
  });

  describe('Document Operations', () => {
    it('loads all documents', async () => {
      const mockDocs = [{ id: 'doc-001', name: 'Resume.pdf' }];
      const { DocumentService } = await import('../services');
      vi.mocked(DocumentService.getAllDocuments).mockResolvedValue(mockDocs as any);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadDocuments();
      });

      expect(result.current.documents).toEqual(mockDocs);
    });

    it('loads employee-specific documents', async () => {
      const mockDocs = [{ id: 'doc-001', employeeId: 'emp-001' }];
      const { DocumentService } = await import('../services');
      vi.mocked(DocumentService.getEmployeeDocuments).mockResolvedValue(mockDocs as any);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadDocuments('emp-001');
      });

      expect(DocumentService.getEmployeeDocuments).toHaveBeenCalledWith('emp-001');
    });

    it('uploads document successfully', async () => {
      const mockDoc = { name: 'Contract.pdf', employeeId: 'emp-001' };
      const { DocumentService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.uploadDocument(mockDoc);
      });

      expect(DocumentService.uploadDocument).toHaveBeenCalledWith(mockDoc);
      expect(result.current.toasts).toContainEqual(
        expect.objectContaining({ type: 'success', message: expect.stringContaining('uploaded') })
      );
    });

    it('verifies document', async () => {
      const { DocumentService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.verifyDocument('doc-001', 'admin-user');
      });

      expect(DocumentService.verifyDocument).toHaveBeenCalledWith('doc-001', 'admin-user');
    });
  });

  describe('Position Operations', () => {
    it('creates position', async () => {
      const mockPosition = { title: 'Senior Developer', department: 'Engineering' };
      const { PositionService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createPosition(mockPosition);
      });

      expect(PositionService.createPosition).toHaveBeenCalledWith(mockPosition);
    });

    it('closes position', async () => {
      const { PositionService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.closePosition('pos-001');
      });

      expect(PositionService.closePosition).toHaveBeenCalledWith('pos-001');
    });
  });

  describe('Cost Center Operations', () => {
    it('creates cost center', async () => {
      const mockCC = { name: 'ENG-001', budget: 100000 };
      const { CostCenterService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createCostCenter(mockCC);
      });

      expect(CostCenterService.createCostCenter).toHaveBeenCalledWith(mockCC);
    });

    it('allocates budget', async () => {
      const { CostCenterService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.allocateBudget('cc-001', 50000, 2025);
      });

      expect(CostCenterService.allocateBudget).toHaveBeenCalledWith('cc-001', 50000, 2025);
    });
  });

  describe('Life Event Operations', () => {
    it('records life event', async () => {
      const mockEvent = { employeeId: 'emp-001', type: 'marriage', date: '2025-06-01' };
      const { LifeEventService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.recordLifeEvent(mockEvent);
      });

      expect(LifeEventService.recordEvent).toHaveBeenCalledWith(mockEvent);
    });

    it('processes life event', async () => {
      const { LifeEventService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.processLifeEvent('event-001', 'hr-admin');
      });

      expect(LifeEventService.processEvent).toHaveBeenCalledWith('event-001', 'hr-admin');
    });
  });

  describe('Mass Update Operations', () => {
    it('executes mass update with success message', async () => {
      const { MassUpdateService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.executeMassUpdate('update-001', 'admin');
      });

      expect(MassUpdateService.executeUpdate).toHaveBeenCalledWith('update-001', 'admin');
      expect(result.current.toasts).toContainEqual(
        expect.objectContaining({
          type: 'success',
          message: expect.stringContaining('10 successful'),
        })
      );
    });

    it('previews mass update', async () => {
      const mockPreview = { affectedCount: 25, changes: [] };
      const { MassUpdateService } = await import('../services');
      vi.mocked(MassUpdateService.previewUpdate).mockResolvedValue(mockPreview);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let preview;
      await act(async () => {
        preview = await result.current.previewMassUpdate('update-001');
      });

      expect(preview).toEqual(mockPreview);
    });
  });

  describe('ID Card Operations', () => {
    it('generates ID card', async () => {
      const { IDCardService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.generateIDCard('emp-001', 'employee');
      });

      expect(IDCardService.generateCard).toHaveBeenCalledWith('emp-001', 'employee');
    });

    it('deactivates ID card', async () => {
      const { IDCardService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deactivateIDCard('card-001');
      });

      expect(IDCardService.deactivateCard).toHaveBeenCalledWith('card-001');
    });
  });

  describe('Asset Operations', () => {
    it('assigns asset to employee', async () => {
      const { AssetService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.assignAsset('asset-001', 'emp-001', 'John Doe');
      });

      expect(AssetService.assignAsset).toHaveBeenCalledWith('asset-001', 'emp-001', 'John Doe');
    });

    it('returns asset', async () => {
      const { AssetService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.returnAsset('asset-001');
      });

      expect(AssetService.returnAsset).toHaveBeenCalledWith('asset-001');
    });

    it('retires asset', async () => {
      const { AssetService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.retireAsset('asset-001', 'donation', '2025-01-15');
      });

      expect(AssetService.retireAsset).toHaveBeenCalledWith('asset-001', 'donation', '2025-01-15');
    });

    it('gets employee assets', async () => {
      const mockAssets = [{ id: 'asset-001', name: 'Laptop' }];
      const { AssetService } = await import('../services');
      vi.mocked(AssetService.getEmployeeAssets).mockResolvedValue(mockAssets as any);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let assets;
      await act(async () => {
        assets = await result.current.getEmployeeAssets('emp-001');
      });

      expect(assets).toEqual(mockAssets);
    });
  });

  describe('Toast Management', () => {
    it('adds toast notification', async () => {
      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.addToast({ type: 'info', message: 'Test notification' });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'info',
        message: 'Test notification',
      });
      expect(result.current.toasts[0].id).toBeDefined();
    });

    it('removes toast by id', async () => {
      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let toastId: string;
      act(() => {
        result.current.addToast({ type: 'success', message: 'Test' });
        toastId = result.current.toasts[0].id;
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('maintains multiple toasts', async () => {
      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.addToast({ type: 'success', message: 'Toast 1' });
        result.current.addToast({ type: 'error', message: 'Toast 2' });
        result.current.addToast({ type: 'warning', message: 'Toast 3' });
      });

      expect(result.current.toasts).toHaveLength(3);
    });
  });

  describe('Loading States', () => {
    it('sets loading state during operations', async () => {
      const { EmployeeService } = await import('../services');
      let resolveCreate: (value: any) => void;
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });
      vi.mocked(EmployeeService.createEmployee).mockReturnValue(createPromise);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.createEmployee({ name: 'Test' });
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveCreate!({ name: 'Test' });
        await createPromise;
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('resets loading on error', async () => {
      const { EmployeeService } = await import('../services');
      vi.mocked(EmployeeService.createEmployee).mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      try {
        await act(async () => {
          await result.current.createEmployee({ name: 'Test' });
        });
      } catch (error) {
        // Expected
      }

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Settings Operations', () => {
    it('updates settings successfully', async () => {
      const mockUpdates = { defaultCurrency: 'USD', timeZone: 'America/New_York' };
      const { CoreHRSettingsService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings(mockUpdates);
      });

      expect(CoreHRSettingsService.updateSettings).toHaveBeenCalledWith(mockUpdates);
      expect(result.current.settings).toEqual(mockUpdates);
    });
  });

  describe('Edge Cases', () => {
    it('handles concurrent operations', async () => {
      const { EmployeeService } = await import('../services');

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.createEmployee({ name: 'Employee 1' }),
          result.current.createEmployee({ name: 'Employee 2' }),
          result.current.updateEmployee('emp-001', { name: 'Updated' }),
        ]);
      });

      expect(EmployeeService.createEmployee).toHaveBeenCalledTimes(2);
      expect(EmployeeService.updateEmployee).toHaveBeenCalledTimes(1);
    });

    it('handles filtering out null values', async () => {
      const { IDCardService } = await import('../services');
      vi.mocked(IDCardService.getEmployeeCard).mockResolvedValue(null);

      const { result } = renderHook(() => useCoreHR());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadIDCards('emp-001');
      });

      expect(result.current.idCards).toHaveLength(0); // null filtered out
    });
  });
});

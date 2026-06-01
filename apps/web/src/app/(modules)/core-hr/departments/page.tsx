/**
 * @module DepartmentManagement
 * @description Department Management page with full CRUD operations and hierarchy support
 * @project AURA HCM Platform
 * @reference Backend Engineer GPS - Organization APIs (Week 1-2)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { DataPage } from '@aura/ui';
import type { Column } from '@aura/ui';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema matching backend
const departmentFormSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  code: z.string().min(1, 'Department code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Department name is required').max(100, 'Name too long'),
  parentId: z.string().optional(),
  costCenterId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

// Validation errors type
interface ValidationErrors {
  [key: string]: string;
}

// Department type matching backend API response
interface Department {
  id: string;
  companyId: string;
  code: string;
  name: string;
  parentId?: string | null;
  costCenterId?: string | null;
  // Populated relations from backend
  company?: { id: string; name: string; code: string };
  parent?: { id: string; name: string; code: string };
  costCenter?: { id: string; name: string; code: string };
  children?: Department[];
  _count?: {
    employees: number;
  };
}

// Master data interfaces
interface MasterData {
  companies: Array<{ id: string; name: string }>;
  costCenters: Array<{ id: string; name: string; code: string }>;
  departments: Array<{ id: string; name: string; code: string }>; // For parent selection
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [masterData, setMasterData] = useState<MasterData>({
    companies: [],
    costCenters: [],
    departments: [],
  });
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/departments');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Handle both direct data array and nested data structure
        const departmentData = result.data?.data || result.data || [];
        setDepartments(departmentData);

        // Update departments list for parent dropdown
        setMasterData((prev) => ({
          ...prev,
          departments: departmentData.map((dept: Department) => ({
            id: dept.id,
            name: dept.name,
            code: dept.code,
          })),
        }));
      } else {
        toast.error(result.error?.message || 'Failed to load departments');
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Error loading departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data for dropdowns
  const fetchMasterData = async () => {
    const endpoints = [
      { key: 'companies', url: '/api/v1/companies' },
      { key: 'costCenters', url: '/api/v1/cost-centers' },
    ];

    try {
      const results = await Promise.allSettled(
        endpoints.map(async ({ key, url }) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${key}`);
          const data = await response.json();
          return { key, data: data.data?.data || data.data || [] };
        })
      );

      const newMasterData: any = { ...masterData };

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { key, data } = result.value;
          newMasterData[key as keyof MasterData] = data;
        } else {
          console.error(`Failed to fetch ${endpoints[index].key}:`, result.reason);
          toast.error(`Failed to load ${endpoints[index].key}`);
        }
      });

      setMasterData(newMasterData);
    } catch (error) {
      console.error('Error loading master data:', error);
      toast.error('Error loading form data');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchMasterData();
  }, []);

  // Helper: Get full hierarchy path (breadcrumb)
  const getDepartmentPath = (dept: Department): string => {
    if (!dept.parent) return dept.name;
    const parentDept = departments.find(d => d.id === dept.parentId);
    if (!parentDept) return dept.name;
    return `${getDepartmentPath(parentDept)} > ${dept.name}`;
  };

  // Helper: Find all descendants (for circular reference prevention)
  const findAllDescendants = (deptId: string): string[] => {
    const children = departments.filter(d => d.parentId === deptId);
    return [
      ...children.map(c => c.id),
      ...children.flatMap(c => findAllDescendants(c.id))
    ];
  };

  // Helper: Get available parents (exclude self and descendants)
  const getAvailableParents = (currentDeptId?: string): Department[] => {
    if (!currentDeptId) return departments;

    const descendants = findAllDescendants(currentDeptId);
    return departments.filter(d =>
      d.id !== currentDeptId &&
      !descendants.includes(d.id)
    );
  };

  // Define table columns
  const columns: Column<Department>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-celestial-indigo dark:text-sky-400">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Department Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-ink-black dark:text-pearl">{row.name}</div>
          <div className="text-xs text-silver-mist dark:text-slate-400">
            {row.company?.name || 'N/A'}
          </div>
          {/* Breadcrumb Path */}
          {row.parent && (
            <div className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              📍 {getDepartmentPath(row)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'parent',
      label: 'Parent Department',
      render: (row) => (
        <span className="text-sm text-ink-black dark:text-pearl">
          {row.parent?.name || '-'}
        </span>
      ),
    },
    {
      key: 'costCenter',
      label: 'Cost Center',
      render: (row) => (
        <div className="text-sm">
          {row.costCenter ? (
            <>
              <div className="font-medium text-ink-black dark:text-pearl">
                {row.costCenter.name}
              </div>
              <div className="text-xs text-silver-mist dark:text-slate-400 font-mono">
                {row.costCenter.code}
              </div>
            </>
          ) : (
            <span className="text-silver-mist dark:text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'employees',
      label: 'Team Size',
      render: (row) => (
        <div className="text-sm">
          <div className="font-bold text-celestial-indigo dark:text-sky-400">
            {row._count?.employees || 0} employees
          </div>
          {row.children && row.children.length > 0 && (
            <div className="text-xs text-silver-mist dark:text-slate-400 mt-0.5">
              {row.children.length} sub-dept{row.children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'hierarchy',
      label: 'Level',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          !row.parentId
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'
        }`}>
          {!row.parentId ? 'Top Level' : 'Sub-Department'}
        </span>
      ),
    },
  ];

  // Validate form data
  const validateForm = (data: Partial<Department>): boolean => {
    setValidationErrors({}); // Clear previous errors

    try {
      // For updates, use partial schema (only validate provided fields)
      if (data.id) {
        departmentFormSchema.partial().parse(data);
      } else {
        // For creates, validate all required fields
        departmentFormSchema.parse(data);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach((error) => {
          const field = error.path[0]?.toString();
          if (field) {
            errors[field] = error.message;
          }
        });
        setValidationErrors(errors);

        // Show first error as toast
        const firstError = Object.values(errors)[0];
        if (firstError) {
          toast.error(firstError);
        }
      }
      return false;
    }
  };

  // Handle save (create/update)
  const handleSave = async (data: Partial<Department>) => {
    try {
      // Client-side validation before API call
      if (!validateForm(data)) {
        return; // Stop if validation fails
      }

      // Prepare payload - convert empty strings to null for optional fields
      const payload = {
        ...data,
        parentId: data.parentId || null,
        costCenterId: data.costCenterId || null,
      };

      const url = data.id
        ? `/api/v1/departments/${data.id}`
        : '/api/v1/departments';
      const method = data.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setValidationErrors({}); // Clear errors on success
        toast.success(
          data.id
            ? 'Department updated successfully'
            : 'Department created successfully'
        );
        await fetchDepartments(); // Refresh the list
      } else {
        // Handle backend validation errors
        if (result.error?.code === 'E2001' && result.error?.details?.errors) {
          const backendErrors: ValidationErrors = {};
          result.error.details.errors.forEach((err: any) => {
            const field = err.path?.[0]?.toString();
            if (field) {
              backendErrors[field] = err.message;
            }
          });
          setValidationErrors(backendErrors);
        }
        toast.error(result.error?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error saving department. Please try again.'
      );
    }
  };

  // Handle delete
  const handleDelete = async (row: Department) => {
    const employeeCount = row._count?.employees || 0;
    const childCount = row.children?.length || 0;

    let confirmMessage = `Are you sure you want to delete department "${row.name}"?`;

    if (employeeCount > 0 || childCount > 0) {
      confirmMessage += `\n\n⚠️ Warning:`;
      if (employeeCount > 0) {
        confirmMessage += `\n• This department has ${employeeCount} employee${employeeCount !== 1 ? 's' : ''}`;
      }
      if (childCount > 0) {
        confirmMessage += `\n• This department has ${childCount} sub-department${childCount !== 1 ? 's' : ''}`;
      }
      confirmMessage += `\n\nDeletion will fail if there are dependencies.`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/departments/${row.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Department deleted successfully');
        await fetchDepartments();
      } else {
        toast.error(result.error?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Error deleting department. Please try again.');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('Preparing export...');
      const response = await fetch('/api/v1/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'DEPARTMENTS',
          format: 'CSV',
          filters: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          'Export request submitted. You will be notified when ready.'
        );
      } else {
        toast.error(result.error?.message || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error exporting data. Please try again.');
    }
  };

  // Helper to clear field error
  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Get error class for input
  const getInputClass = (field: string, baseClass: string = '') => {
    const errorClass = validationErrors[field]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-silver-mist/30';
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-celestial-indigo focus:border-transparent transition-all bg-white dark:bg-midnight-gray dark:text-pearl ${errorClass} ${baseClass}`;
  };

  // Form renderer
  const renderForm = (
    data: Partial<Department>,
    onChange: (field: keyof Department, value: any) => void
  ) => (
    <>
      {/* Row 1: Code & Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Department Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.code || ''}
            onChange={(e) => {
              onChange('code', e.target.value);
              clearFieldError('code');
            }}
            className={getInputClass('code')}
            placeholder="DEPT001"
            required
            disabled={!!data.id} // Can't change code after creation
          />
          {validationErrors.code && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.code}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Department Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => {
              onChange('name', e.target.value);
              clearFieldError('name');
            }}
            className={getInputClass('name')}
            placeholder="Engineering"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
          )}
        </div>
      </div>

      {/* Row 2: Company & Parent Department */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Company <span className="text-red-500">*</span>
          </label>
          <select
            value={data.companyId || ''}
            onChange={(e) => {
              onChange('companyId', e.target.value);
              clearFieldError('companyId');
            }}
            className={getInputClass('companyId')}
            required
          >
            <option value="">Select Company</option>
            {masterData.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {validationErrors.companyId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.companyId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Parent Department
          </label>
          <select
            value={data.parentId || ''}
            onChange={(e) => {
              onChange('parentId', e.target.value || null);
              clearFieldError('parentId');
            }}
            className={getInputClass('parentId')}
          >
            <option value="">None (Top Level)</option>
            {getAvailableParents(data.id).map((d) => (
              <option key={d.id} value={d.id}>
                {`${d.name} (${d.code})`}
              </option>
            ))}
          </select>
          {validationErrors.parentId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.parentId}</p>
          )}
          {data.id && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ⚠️ Cannot select child departments as parent (prevents circular reference)
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Cost Center */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
          Cost Center
        </label>
        <select
          value={data.costCenterId || ''}
          onChange={(e) => {
            onChange('costCenterId', e.target.value || null);
            clearFieldError('costCenterId');
          }}
          className={getInputClass('costCenterId')}
        >
          <option value="">None</option>
          {masterData.costCenters.map((cc) => (
            <option key={cc.id} value={cc.id}>
              {`${cc.name} (${cc.code})`}
            </option>
          ))}
        </select>
        {validationErrors.costCenterId && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.costCenterId}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-celestial-indigo/5 dark:bg-sky-900/10 border border-celestial-indigo/20 dark:border-sky-800/30 rounded-lg p-3">
        <p className="text-xs text-celestial-indigo dark:text-sky-400">
          <strong>Hierarchy:</strong> Departments can be organized hierarchically. Select a parent department to create a sub-department.
        </p>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celestial-indigo"></div>
          <p className="text-sm text-silver-mist dark:text-slate-400">
            Loading departments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DataPage
      title="Department Management"
      description="Manage organizational departments and hierarchy structure"
      data={departments}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      onExport={handleExport}
      renderForm={renderForm}
      addButtonText="Add Department"
      searchPlaceholder="Search departments..."
      searchKeys={['code', 'name', 'company.name', 'parent.name']}
    />
  );
}


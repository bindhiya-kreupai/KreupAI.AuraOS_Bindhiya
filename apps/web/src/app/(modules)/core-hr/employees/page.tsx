/**
 * @module EmployeeManagement
 * @description Employee Management page with full CRUD operations
 * @project AURA HCM Platform
 * @reference Backend Engineer GPS - Employee APIs (Week 1-2)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { DataPage } from '@aura/ui';
import type { Column } from '@aura/ui';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema matching backend
const employeeFormSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required').max(20, 'Employee code too long'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Valid email is required'),
  companyId: z.string().min(1, 'Company is required'),
  departmentId: z.string().min(1, 'Department is required'),
  locationId: z.string().min(1, 'Location is required'),
  jobProfileId: z.string().min(1, 'Job profile is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  statusId: z.string().min(1, 'Status is required'),
  typeId: z.string().min(1, 'Employment type is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  managerId: z.string().optional(),
  addressId: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Validation errors type
interface ValidationErrors {
  [key: string]: string;
}

// Employee type matching backend API response
interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  departmentId: string;
  locationId: string;
  jobProfileId: string;
  gradeId: string;
  statusId: string;
  typeId: string;
  joiningDate: string;
  managerId?: string;
  addressId?: string;
  // Populated relations from backend
  company?: { id: string; name: string; code: string };
  department?: { id: string; name: string; code: string };
  location?: { id: string; name: string; code: string };
  jobProfile?: { id: string; title: string; code: string };
  grade?: { id: string; name: string; code: string; level: number };
  status?: { id: string; name: string; code: string };
  type?: { id: string; name: string; code: string };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
  };
}

// Master data interfaces
interface MasterData {
  companies: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  jobProfiles: Array<{ id: string; title: string }>;
  grades: Array<{ id: string; name: string }>;
  statuses: Array<{ id: string; name: string }>;
  types: Array<{ id: string; name: string }>;
  employees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  }>;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [masterData, setMasterData] = useState<MasterData>({
    companies: [],
    departments: [],
    locations: [],
    jobProfiles: [],
    grades: [],
    statuses: [],
    types: [],
    employees: [],
  });
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/employees');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Handle both direct data array and nested data structure
        const employeeData = result.data?.data || result.data || [];
        setEmployees(employeeData);

        // Also update employees list for manager dropdown
        setMasterData((prev) => ({
          ...prev,
          employees: employeeData.map((emp: Employee) => ({
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            employeeCode: emp.employeeCode,
          })),
        }));
      } else {
        toast.error(result.error?.message || 'Failed to load employees');
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast.error('Error loading employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data for dropdowns
  const fetchMasterData = async () => {
    try {
      const endpoints = [
        { key: 'companies', url: '/api/v1/companies' },
        { key: 'departments', url: '/api/v1/departments' },
        { key: 'locations', url: '/api/v1/locations' },
        { key: 'jobProfiles', url: '/api/v1/job-profiles' },
        { key: 'grades', url: '/api/v1/grades' },
        { key: 'statuses', url: '/api/v1/employee-statuses' },
        { key: 'types', url: '/api/v1/employment-types' },
      ];

      const results = await Promise.allSettled(
        endpoints.map(async ({ key, url }) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${key}`);
          }
          const data = await response.json();
          return { key, data: data.data?.data || data.data || [] };
        })
      );

      const newMasterData = { ...masterData };

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
    } catch (error: any) {
      console.error('Error fetching master data:', error);
      toast.error('Error loading form data');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Table columns
  const columns: Column<Employee>[] = [
    {
      key: 'employeeCode',
      header: 'Employee Code',
      width: '120px',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-celestial-indigo">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '200px',
      render: (row) => (
        <div>
          <div className="font-medium text-ink-black dark:text-pearl">
            {`${row.firstName} ${row.lastName}`}
          </div>
          <div className="text-xs text-silver-mist">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      width: '150px',
      render: (row) => (
        <span className="text-sm">{row.department?.name || '-'}</span>
      ),
    },
    {
      key: 'jobProfile',
      header: 'Job Title',
      width: '180px',
      render: (row) => (
        <span className="text-sm">{row.jobProfile?.title || '-'}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      width: '130px',
      render: (row) => (
        <span className="text-sm">{row.location?.name || '-'}</span>
      ),
    },
    {
      key: 'manager',
      header: 'Manager',
      width: '150px',
      render: (row) =>
        row.manager ? (
          <span className="text-sm">
            {`${row.manager.firstName} ${row.manager.lastName}`}
          </span>
        ) : (
          <span className="text-silver-mist text-sm">-</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.status?.code === 'ACTIVE'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : row.status?.code === 'PROBATION'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
          }`}
        >
          {row.status?.name || '-'}
        </span>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      width: '120px',
      render: (row) => (
        <span className="text-sm">
          {new Date(row.joiningDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  // Validate form data
  const validateForm = (data: Partial<Employee>): boolean => {
    setValidationErrors({}); // Clear previous errors

    try {
      // For updates, use partial schema (only validate provided fields)
      if (data.id) {
        employeeFormSchema.partial().parse(data);
      } else {
        // For creates, validate all required fields
        employeeFormSchema.parse(data);
      }
      return true;
    } catch (error: any) {
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
  const handleSave = async (data: Partial<Employee>) => {
    try {
      // Client-side validation before API call
      if (!validateForm(data)) {
        return; // Stop if validation fails
      }

      // Prepare payload
      const payload = {
        ...data,
        // Convert joiningDate to ISO string if it's a date input value
        joiningDate: data.joiningDate
          ? new Date(data.joiningDate).toISOString()
          : undefined,
        // Remove empty strings for optional fields
        managerId: data.managerId || undefined,
        addressId: data.addressId || undefined,
      };

      const url = data.id
        ? `/api/v1/employees/${data.id}`
        : '/api/v1/employees';
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
            ? 'Employee updated successfully'
            : 'Employee created successfully'
        );
        await fetchEmployees(); // Refresh the list
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
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error saving employee. Please try again.'
      );
    }
  };

  // Handle delete
  const handleDelete = async (row: Employee) => {
    if (
      !confirm(
        `Are you sure you want to delete ${row.firstName} ${row.lastName}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/employees/${row.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Employee deleted successfully');
        await fetchEmployees(); // Refresh the list
      } else {
        toast.error(result.error?.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error('Error deleting employee. Please try again.');
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
          entity: 'EMPLOYEES',
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
    } catch (error: any) {
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
    data: Partial<Employee>,
    onChange: (field: keyof Employee, value: any) => void
  ) => (
    <>
      {/* Row 1: Employee Code & Email */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Employee Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.employeeCode || ''}
            onChange={(e) => {
              onChange('employeeCode', e.target.value);
              clearFieldError('employeeCode');
            }}
            className={getInputClass('employeeCode')}
            placeholder="EMP001"
            required
            disabled={!!data.id} // Can't change employee code after creation
          />
          {validationErrors.employeeCode && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.employeeCode}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => {
              onChange('email', e.target.value);
              clearFieldError('email');
            }}
            className={getInputClass('email')}
            placeholder="john.doe@company.com"
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
          )}
        </div>
      </div>

      {/* Row 2: First Name & Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.firstName || ''}
            onChange={(e) => {
              onChange('firstName', e.target.value);
              clearFieldError('firstName');
            }}
            className={getInputClass('firstName')}
            placeholder="John"
            required
          />
          {validationErrors.firstName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.lastName || ''}
            onChange={(e) => {
              onChange('lastName', e.target.value);
              clearFieldError('lastName');
            }}
            className={getInputClass('lastName')}
            placeholder="Doe"
            required
          />
          {validationErrors.lastName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Row 3: Company & Department */}
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
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={data.departmentId || ''}
            onChange={(e) => {
              onChange('departmentId', e.target.value);
              clearFieldError('departmentId');
            }}
            className={getInputClass('departmentId')}
            required
          >
            <option value="">Select Department</option>
            {masterData.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {validationErrors.departmentId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.departmentId}</p>
          )}
        </div>
      </div>

      {/* Row 4: Location & Job Profile */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Location <span className="text-red-500">*</span>
          </label>
          <select
            value={data.locationId || ''}
            onChange={(e) => {
              onChange('locationId', e.target.value);
              clearFieldError('locationId');
            }}
            className={getInputClass('locationId')}
            required
          >
            <option value="">Select Location</option>
            {masterData.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {validationErrors.locationId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.locationId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Job Profile <span className="text-red-500">*</span>
          </label>
          <select
            value={data.jobProfileId || ''}
            onChange={(e) => {
              onChange('jobProfileId', e.target.value);
              clearFieldError('jobProfileId');
            }}
            className={getInputClass('jobProfileId')}
            required
          >
            <option value="">Select Job Profile</option>
            {masterData.jobProfiles.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          {validationErrors.jobProfileId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.jobProfileId}</p>
          )}
        </div>
      </div>

      {/* Row 5: Grade & Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Grade <span className="text-red-500">*</span>
          </label>
          <select
            value={data.gradeId || ''}
            onChange={(e) => {
              onChange('gradeId', e.target.value);
              clearFieldError('gradeId');
            }}
            className={getInputClass('gradeId')}
            required
          >
            <option value="">Select Grade</option>
            {masterData.grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {validationErrors.gradeId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.gradeId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={data.statusId || ''}
            onChange={(e) => {
              onChange('statusId', e.target.value);
              clearFieldError('statusId');
            }}
            className={getInputClass('statusId')}
            required
          >
            <option value="">Select Status</option>
            {masterData.statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {validationErrors.statusId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.statusId}</p>
          )}
        </div>
      </div>

      {/* Row 6: Employment Type & Joining Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.typeId || ''}
            onChange={(e) => {
              onChange('typeId', e.target.value);
              clearFieldError('typeId');
            }}
            className={getInputClass('typeId')}
            required
          >
            <option value="">Select Type</option>
            {masterData.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {validationErrors.typeId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.typeId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
            Joining Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={
              data.joiningDate
                ? data.joiningDate.split('T')[0]
                : new Date().toISOString().split('T')[0]
            }
            onChange={(e) => {
              onChange('joiningDate', e.target.value);
              clearFieldError('joiningDate');
            }}
            className={getInputClass('joiningDate')}
            required
          />
          {validationErrors.joiningDate && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.joiningDate}</p>
          )}
        </div>
      </div>

      {/* Row 7: Manager (Optional) */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
          Reporting Manager
        </label>
        <select
          value={data.managerId || ''}
          onChange={(e) => onChange('managerId', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-silver-mist/30 rounded-lg focus:ring-2 focus:ring-celestial-indigo focus:border-transparent transition-all bg-white dark:bg-midnight-gray dark:text-pearl"
        >
          <option value="">No Manager</option>
          {masterData.employees
            .filter((e) => e.id !== data.id) // Don't allow self-reporting
            .map((e) => (
              <option key={e.id} value={e.id}>
                {`${e.firstName} ${e.lastName} (${e.employeeCode})`}
              </option>
            ))}
        </select>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-celestial-indigo border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-silver-mist">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <DataPage
      title="Employees"
      breadcrumbs={[
        { label: 'Core HR', href: '/core-hr' },
        { label: 'Employees' },
      ]}
      data={employees}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      onExport={handleExport}
      renderForm={renderForm}
      defaultValues={{
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        joiningDate: new Date().toISOString().split('T')[0],
      }}
    />
  );
}


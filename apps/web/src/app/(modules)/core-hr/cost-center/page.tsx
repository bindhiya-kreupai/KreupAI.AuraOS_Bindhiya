'use client';

import React, { useEffect, useState } from 'react';
import { DataPage } from '@aura/ui';
import type { Column } from '@aura/ui';
import { toast } from 'sonner';
import { z } from 'zod';

const costCenterFormSchema = z.object({
  code: z.string().min(1, 'Cost center code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Cost center name is required').max(100, 'Name too long'),
});

interface ValidationErrors {
  [key: string]: string;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
  departmentCount: number;
  departments: Array<{ id: string; name: string; code: string }>;
}

export default function CostCenterPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/core-hr/cost-centers');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setCostCenters(result.costCenters || []);
    } catch (error: any) {
      console.error('Error fetching cost centers:', error);
      toast.error('Error loading cost centers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const columns: Column<CostCenter>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '140px',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-celestial-indigo">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '250px',
      render: (row) => (
        <span className="font-medium text-ink-black dark:text-pearl">{row.name}</span>
      ),
    },
    {
      key: 'departmentCount',
      header: 'Departments',
      width: '130px',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.departmentCount > 0
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-900/20 dark:text-gray-400'
          }`}
        >
          {row.departmentCount} {row.departmentCount === 1 ? 'dept' : 'depts'}
        </span>
      ),
    },
    {
      key: 'departments',
      header: 'Linked Departments',
      width: '300px',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.departments.length > 0 ? (
            row.departments.slice(0, 3).map((d) => (
              <span
                key={d.id}
                className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"
              >
                {d.name}
              </span>
            ))
          ) : (
            <span className="text-silver-mist text-sm">-</span>
          )}
          {row.departments.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              +{row.departments.length - 3} more
            </span>
          )}
        </div>
      ),
    },
  ];

  const validateForm = (data: Partial<CostCenter>): boolean => {
    setValidationErrors({});
    try {
      if (data.id) {
        costCenterFormSchema.partial().parse(data);
      } else {
        costCenterFormSchema.parse(data);
      }
      return true;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach((error) => {
          const field = error.path[0]?.toString();
          if (field) errors[field] = error.message;
        });
        setValidationErrors(errors);
        const firstError = Object.values(errors)[0];
        if (firstError) toast.error(firstError);
      }
      return false;
    }
  };

  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getInputClass = (field: string) => {
    const errorClass = validationErrors[field]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-silver-mist/30';
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-celestial-indigo focus:border-transparent transition-all bg-white dark:bg-midnight-gray dark:text-pearl ${errorClass}`;
  };

  const handleSave = async (data: Partial<CostCenter>) => {
    try {
      if (!validateForm(data)) return;

      const payload = { code: data.code, name: data.name };

      const url = data.id ? '/api/core-hr/cost-centers' : '/api/core-hr/cost-centers';
      const method = data.id ? 'PUT' : 'POST';
      const body = data.id ? { id: data.id, ...payload } : payload;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Operation failed');
        return;
      }

      const result = await response.json();
      if (result.costCenter) {
        setValidationErrors({});
        toast.success(data.id ? 'Cost center updated' : 'Cost center created');
        await fetchCostCenters();
      }
    } catch (error: any) {
      console.error('Error saving cost center:', error);
      toast.error('Error saving cost center. Please try again.');
    }
  };

  const handleDelete = async (row: CostCenter) => {
    if (!confirm(`Are you sure you want to delete "${row.name}" (${row.code})?`)) return;

    try {
      // The API doesn't have a DELETE endpoint yet, show info
      toast.info('Delete operation is not yet supported for cost centers.');
    } catch (error: any) {
      console.error('Error deleting cost center:', error);
      toast.error('Error deleting cost center.');
    }
  };

  const renderForm = (
    data: Partial<CostCenter>,
    onChange: (field: keyof CostCenter, value: any) => void
  ) => (
    <>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
          Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.code || ''}
          onChange={(e) => {
            onChange('code', e.target.value);
            clearFieldError('code');
          }}
          className={getInputClass('code')}
          placeholder="CC-001"
          disabled={!!data.id}
        />
        {validationErrors.code && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.code}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-ink-black dark:text-pearl">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => {
            onChange('name', e.target.value);
            clearFieldError('name');
          }}
          className={getInputClass('name')}
          placeholder="e.g. Engineering Operations"
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
        )}
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-celestial-indigo border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-silver-mist">Loading cost centers...</p>
        </div>
      </div>
    );
  }

  return (
    <DataPage
      title="Cost Centers"
      breadcrumbs={[{ label: 'Core HR', href: '/core-hr' }, { label: 'Cost Centers' }]}
      data={costCenters}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      renderForm={renderForm}
      defaultValues={{
        code: '',
        name: '',
      }}
    />
  );
}

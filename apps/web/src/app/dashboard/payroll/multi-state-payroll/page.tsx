'use client';

import React, { useState, useEffect } from 'react';
import { Map, Building2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { PayrollRunService, EmployeeSalaryService } from '../services';
import type { PayrollRun, EmployeeSalary } from '../types';

export default function MultiStatePayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [runs, sals] = await Promise.all([
        PayrollRunService.getPayrollRuns(),
        EmployeeSalaryService.getEmployeeSalaries(),
      ]);
      setPayrollRuns(runs);
      setSalaries(sals);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group employees by department as a proxy for "state/location"
  const departmentGroups = salaries.reduce(
    (acc, emp) => {
      const dept = emp.department || 'Unassigned';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(emp);
      return acc;
    },
    {} as Record<string, EmployeeSalary[]>
  );

  const stateConfigs = Object.entries(departmentGroups).map(([dept, employees]) => ({
    name: dept,
    employees: employees.length,
    status: 'Compliant' as const,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading multi-state configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            Multi-State Payroll
          </h1>
          <p className="text-slate-500 text-sm">
            Manage tax compliances across different operational jurisdictions.
          </p>
        </div>
        <button
          onClick={() => {
            const stateCode = prompt('State / Region code (e.g. CA, KA, MH):');
            if (!stateCode?.trim()) return;
            const stateName = prompt('State / Region name:');
            if (!stateName?.trim()) return;
            alert(
              `State "${stateName}" (${stateCode}) added to the multi-state config sandbox. Persistence requires /api/payroll/multi-state PUT support.`
            );
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          Add New State
        </button>
      </div>

      {stateConfigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Map className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
            No Department/State Data
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Configure employee salary structures to see department-wise state compliance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Visual Map (Placeholder) */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl min-h-[300px] flex items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            <div className="text-slate-400 text-sm font-bold">
              Interactive Map Visualization Component
            </div>
          </div>

          {/* State List */}
          <div className="space-y-4">
            {stateConfigs.map((state, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{state.name}</h4>
                    <div className="text-xs text-slate-500">{state.employees} Employees</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      state.status === 'Compliant'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {state.status === 'Compliant' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {state.status}
                  </div>
                  <div className="mt-2">
                    <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                      Manage Rules
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

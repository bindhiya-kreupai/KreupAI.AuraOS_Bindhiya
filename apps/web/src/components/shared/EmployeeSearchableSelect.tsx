'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode?: string;
}

interface EmployeeSearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EmployeeSearchableSelect({
  value,
  onChange,
  placeholder = 'Select employee...',
  className = '',
  disabled = false,
}: EmployeeSearchableSelectProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/v1/employees?limit=200');
        const p = await r.json();
        if (p.success) {
          setEmployees(p.data?.items ?? p.data ?? []);
        }
      } catch (err) {
        console.error('Failed to load employees for dropdown', err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedEmployee = employees.find((emp) => emp.id === value);
  const displayText = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeCode ?? ''})`
    : '';

  const filtered = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const code = (emp.employeeCode ?? '').toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || code.includes(query);
  });

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span
          className={
            selectedEmployee
              ? 'text-slate-900 dark:text-slate-100 text-left truncate pr-2'
              : 'text-slate-400 dark:text-slate-500 text-left truncate pr-2'
          }
        >
          {selectedEmployee ? displayText : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-md">
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-2 py-1 sticky top-0 bg-white dark:bg-slate-900">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-500" />
            <input
              type="text"
              className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="pt-1">
            {filtered.length === 0 ? (
              <div className="py-2 px-3 text-sm text-slate-500 dark:text-slate-400">
                No employee found
              </div>
            ) : (
              filtered.map((emp) => {
                const isSelected = emp.id === value;
                return (
                  <div
                    key={emp.id}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 font-medium text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                    onClick={() => {
                      onChange(emp.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                  >
                    {emp.firstName} {emp.lastName}{' '}
                    <span className="ml-1 text-xs text-slate-450 dark:text-slate-500">
                      ({emp.employeeCode})
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

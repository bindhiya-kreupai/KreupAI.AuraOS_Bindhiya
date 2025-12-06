"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function PayrollPage() {
  const features = [
    'Payroll Processing',
    'Tax Calculation',
    'Statutory Deductions',
    'Bank File Generation',
    'Payslip Generation',
    'Reimbursements',
    'Loan Recovery',
    'Arrears Management',
    'Bonus Processing',
    'Year-end Processing',
    'Multi-State Payroll',
    'Payroll Reconciliation',
    'Garnishments',
    'Off-cycle Payments',
    'Payroll Reports',
    'Additional Tasks (per doc)',
    'Payslips'
  ];

  return (
    <ModuleGrid
      title="Payroll"
      description="Manage your payroll operations and settings."
      features={features}
      basePath="/dashboard/payroll"
    />
  );
}

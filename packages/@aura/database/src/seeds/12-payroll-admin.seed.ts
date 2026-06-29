/**
 * @module PayrollAdminSeed
 * @description Seed data for Payroll and Admin tables (Pay Components, Roles, Holidays)
 * @project AURA HCM Platform
 */

export const payComponentsSeed = [
    { code: 'BASIC', name: 'Basic Salary', type: 'Earning' },
    { code: 'HRA', name: 'House Rent Allowance (HRA)', type: 'Earning' },
    { code: 'HOUSING', name: 'Housing Allowance', type: 'Earning' }, // GCC equivalent
    { code: 'TRANSPORT', name: 'Transport Allowance', type: 'Earning' },
    { code: 'SPECIAL', name: 'Special Allowance', type: 'Earning' },
    { code: 'BONUS', name: 'Performance Bonus', type: 'Earning' },
    { code: 'PF_EMP', name: 'Provident Fund (Employee)', type: 'Deduction' },
    { code: 'TAX_TDS', name: 'Tax Deducted at Source (TDS)', type: 'Deduction' },
    { code: 'GOSI', name: 'GOSI Contribution', type: 'Deduction' }, // Saudi
    { code: 'EOS', name: 'End of Service Gratuity', type: 'Earning' }, // GCC
    { code: 'PASI', name: 'PASI Contribution (Oman)', type: 'Deduction' },
    { code: 'SIO', name: 'SIO Contribution (Bahrain)', type: 'Deduction' },
    { code: 'QSSI', name: 'Social Security (Qatar)', type: 'Deduction' }
];

export const rolesSeed = [
    { name: 'Super Admin', description: 'Full System Access' },
    { name: 'HR Admin', description: 'Access to all HR & Payroll Modules'},
    { name: 'IT Admin', description: 'System Settings and User Management'},
    { name: 'Manager', description: 'Team Management Access'},
    { name: 'Employee', description: 'Self-Service Portal Access'},
    { name: 'Recruiter', description: 'Recruitment Module Access'}
];

export const holidaysSeed = [
    { name: 'New Year\'s Day', date: '2025-01-01', type: 'International' },
    { name: 'Eid Al Fitr', date: '2025-03-31', type: 'National' }, // Approx
    { name: 'Eid Al Adha', date: '2025-06-07', type: 'National' }, // Approx
    { name: 'UAE National Day', date: '2025-12-02', type: 'National' }, // UAE
    { name: 'Diwali', date: '2025-10-20', type: 'National' }, // India Approx
    { name: 'Independence Day (India)', date: '2025-08-15', type: 'National' }, // India
    { name: 'Republic Day (India)', date: '2025-01-26', type: 'National' }, // India
    { name: 'Saudi Founding Day', date: '2025-02-22', type: 'National' }, // KSA
    { name: 'Saudi National Day', date: '2025-09-23', type: 'National' }, // KSA
    { name: 'Qatar National Day', date: '2025-12-18', type: 'National' },
    { name: 'Bahrain National Day', date: '2025-12-16', type: 'National' },
    { name: 'Oman National Day', date: '2025-11-18', type: 'National' }
];


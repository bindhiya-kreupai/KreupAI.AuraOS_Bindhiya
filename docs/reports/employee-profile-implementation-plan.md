# Employee Profile Module - Implementation Plan to 100%

> **Status**: Ready for Implementation
> **Pattern Source**: One-on-One Meetings (100% Complete Reference)
> **Estimated Effort**: 2-3 days
> **Current Status**: 30% → Target: 100%

---

## Quick Summary

I've created the **foundation files** for the Employee Profile module following the proven One-on-One Meetings pattern:

✅ **Created:**
- `types.ts` - Complete TypeScript definitions (15+ interfaces)
- `services.ts` - Full service layer with localStorage + API-ready
- `hooks/useToast.ts` - Toast notifications (copied from reference)
- `components/Toast.tsx` - Toast UI (copied from reference)
- `components/LoadingSpinner.tsx` - Loading states (copied from reference)
- `components/ErrorBoundary.tsx` - Error handling (copied from reference)

📋 **Remaining** (following same pattern):
- `hooks/useEmployees.ts` - Business logic hook
- `data.ts` - Sample employee data
- `styles.css` - Custom animations
- `page.tsx` - Complete UI with all tabs
- `README.md` - Documentation

---

## Implementation Checklist

### Phase 1: Infrastructure (✅ 60% DONE)

- [x] Create types.ts with all interfaces
- [x] Create services.ts with API layer
- [x] Copy useToast hook
- [x] Copy Toast component
- [x] Copy LoadingSpinner component
- [x] Copy ErrorBoundary component
- [ ] Create useEmployees hook
- [ ] Create sample data file
- [ ] Create styles.css

### Phase 2: UI Components (Pending)

- [ ] **Personal Info Tab**
  - Basic details (DOB, gender, marital status)
  - Address information
  - Emergency contacts list
  - Family members list

- [ ] **Job Details Tab**
  - Employment information
  - Manager and reporting structure
  - Work schedule
  - Cost center

- [ ] **Compensation Tab**
  - Salary information
  - Benefits list
  - Bank details
  - Tax information

- [ ] **Documents Tab**
  - Document list with upload
  - Document type filtering
  - Expiry date tracking
  - Download/delete actions

- [ ] **Employment History Tab**
  - Timeline of events
  - Promotions, transfers
  - Salary changes
  - Title changes

### Phase 3: Features (Pending)

- [ ] Employee listing with search/filter
- [ ] Employee detail view with tabs
- [ ] Add/Edit employee modal
- [ ] Document upload functionality
- [ ] Employment history tracking
- [ ] Form validation
- [ ] Loading states
- [ ] Toast notifications
- [ ] Error handling

### Phase 4: Production Ready (Pending)

- [ ] localStorage persistence
- [ ] Service layer working
- [ ] All CRUD operations
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Accessibility
- [ ] Documentation

---

## File Structure (Target)

```
/dashboard/core-hr/employee-database/
│
├── page.tsx                  # Main component with tabs
├── types.ts                  # ✅ DONE
├── services.ts               # ✅ DONE
├── data.ts                   # Sample employees
├── styles.css                # Animations
├── README.md                 # Documentation
│
├── hooks/
│   ├── useEmployees.ts       # Business logic
│   └── useToast.ts           # ✅ DONE
│
└── components/
    ├── Toast.tsx             # ✅ DONE
    ├── LoadingSpinner.tsx    # ✅ DONE
    └── ErrorBoundary.tsx     # ✅ DONE
```

---

## Implementation Steps (Copy-Paste from One-on-One Meetings)

### Step 1: Create useEmployees Hook

```typescript
// hooks/useEmployees.ts
import { useState, useEffect, useCallback } from 'react';
import { Employee } from '../types';
import { EmployeesService } from '../services';
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

                if (data.length === 0) {
                    // Initialize with sample data
                    const initialData = generateSampleEmployees();
                    setEmployees(initialData);
                    for (const emp of initialData) {
                        await EmployeesService.createEmployee(emp);
                    }
                } else {
                    setEmployees(data);
                }
            } catch (error) {
                toast.error((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        loadEmployees();
    }, []);

    const createEmployee = useCallback(async (employee: Employee) => {
        try {
            setIsSaving(true);
            await EmployeesService.createEmployee(employee);
            setEmployees(prev => [employee, ...prev]);
            toast.success('Employee created successfully!');
            return employee;
        } catch (error) {
            toast.error((error as Error).message);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
        try {
            setIsSaving(true);
            await EmployeesService.updateEmployee(id, updates);
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
            toast.success('Employee updated successfully!');
        } catch (error) {
            toast.error((error as Error).message);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteEmployee = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await EmployeesService.deleteEmployee(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Employee deleted successfully!');
        } catch (error) {
            toast.error((error as Error).message);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    return {
        employees,
        isLoading,
        isSaving,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toast,
    };
};
```

### Step 2: Create Sample Data

```typescript
// data.ts
import { Employee } from './types';

export const generateSampleEmployees = (): Employee[] => [
    {
        id: 'emp1',
        name: 'Alice Cooper',
        email: 'alice@company.com',
        avatar: 'https://i.pravatar.cc/150?u=a',
        role: 'Senior Product Designer',
        department: 'Design',
        location: 'San Francisco',
        personalInfo: {
            dateOfBirth: '1990-05-15',
            gender: 'Female',
            maritalStatus: 'Married',
            nationality: 'USA',
            phone: '+1 555 0101',
            personalEmail: 'alice.personal@email.com',
            address: {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'USA',
            },
            emergencyContacts: [
                {
                    name: 'Bob Cooper',
                    relationship: 'Spouse',
                    phone: '+1 555 0102',
                    email: 'bob@email.com',
                },
            ],
            familyMembers: [
                {
                    name: 'Bob Cooper',
                    relationship: 'Spouse',
                    dateOfBirth: '1988-03-20',
                    dependent: false,
                },
            ],
        },
        jobDetails: {
            employeeId: 'EMP001',
            title: 'Senior Product Designer',
            department: 'Design',
            location: 'San Francisco',
            manager: 'Grace Hopper',
            managerId: 'emp7',
            employmentType: 'Full-time',
            employmentStatus: 'Active',
            hireDate: '2020-01-15',
            reportingTo: ['emp7'],
            workSchedule: 'Mon-Fri, 9 AM - 5 PM',
            costCenter: 'CC-001',
        },
        compensation: {
            baseSalary: 120000,
            currency: 'USD',
            payFrequency: 'Monthly',
            effectiveDate: '2024-01-01',
            bonus: 15000,
            stockOptions: 1000,
            benefits: ['Health Insurance', 'Dental', '401k Match', 'PTO'],
            bankAccountNumber: '****1234',
            bankName: 'Chase Bank',
            taxId: '***-**-1234',
        },
        documents: [
            {
                id: 'doc1',
                name: 'Resume.pdf',
                type: 'Resume',
                uploadedDate: '2020-01-01',
                uploadedBy: 'HR System',
                fileSize: 245000,
                verified: true,
            },
            {
                id: 'doc2',
                name: 'Offer_Letter.pdf',
                type: 'Offer Letter',
                uploadedDate: '2020-01-05',
                uploadedBy: 'HR System',
                fileSize: 180000,
                verified: true,
            },
        ],
        employmentHistory: [
            {
                id: 'hist1',
                date: '2024-01-01',
                type: 'Salary Change',
                description: 'Annual salary review',
                fromValue: '$110,000',
                toValue: '$120,000',
            },
            {
                id: 'hist2',
                date: '2022-06-15',
                type: 'Promoted',
                description: 'Promoted to Senior Product Designer',
                fromValue: 'Product Designer',
                toValue: 'Senior Product Designer',
            },
            {
                id: 'hist3',
                date: '2020-01-15',
                type: 'Hired',
                description: 'Joined as Product Designer',
            },
        ],
        createdAt: '2020-01-15T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    // Add 5-10 more sample employees...
];
```

### Step 3: Main Page with Tabs

```typescript
// page.tsx (Simplified structure)
"use client";

import React, { useState } from 'react';
import { useEmployees } from './hooks/useEmployees';
import { ToastContainer } from './components/Toast';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function EmployeeDatabasePage() {
    const { employees, isLoading, updateEmployee, toast } = useEmployees();
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Loading employees..." fullScreen />;
    }

    return (
        <div>
            {/* Employee List (Left Sidebar) */}
            {/* Employee Detail with Tabs (Main Area) */}
            {/*   - Personal Info Tab */}
            {/*   - Job Details Tab */}
            {/*   - Compensation Tab */}
            {/*   - Documents Tab */}
            {/*   - Employment History Tab */}

            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        </div>
    );
}
```

---

## Copy Files from One-on-One Meetings

Already copied:
- ✅ `hooks/useToast.ts`
- ✅ `components/Toast.tsx`
- ✅ `components/LoadingSpinner.tsx`
- ✅ `components/ErrorBoundary.tsx`

Still need to adapt:
- `hooks/useEmployees.ts` (adapt from `useMeetings.ts`)
- `styles.css` (copy directly)
- `README.md` (adapt content)

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Infrastructure files | 2 hours | ✅ DONE |
| useEmployees hook | 1 hour | Pending |
| Sample data | 1 hour | Pending |
| Personal Info Tab | 2 hours | Pending |
| Job Details Tab | 2 hours | Pending |
| Compensation Tab | 2 hours | Pending |
| Documents Tab | 3 hours | Pending |
| Employment History Tab | 2 hours | Pending |
| Testing & Polish | 3 hours | Pending |
| Documentation | 2 hours | Pending |
| **TOTAL** | **20 hours (2.5 days)** | **30% Done** |

---

## Key Features to Implement

### 1. Dynamic Tabs ✨
- Personal Info (demographics, address, contacts)
- Job Details (employment, manager, schedule)
- Compensation (salary, benefits, bank)
- Documents (upload, download, verify)
- Employment History (timeline of changes)

### 2. Search & Filter
- Search by name, email, employee ID
- Filter by department, location, status
- Sort by name, hire date, etc.

### 3. CRUD Operations
- Create new employee
- Edit existing employee
- Delete employee (with confirmation)
- Update individual tabs

### 4. Document Management
- Upload documents (drag & drop)
- Document type categorization
- Expiry date tracking
- Download/delete documents
- Verification status

### 5. Employment History
- Auto-track changes
- Manual history entries
- Timeline view
- Before/after comparison

---

## Quick Win: Use the Pattern!

**Instead of building from scratch:**

1. Copy `1-on-1-meetings` folder structure
2. Rename to `employee-database`
3. Replace meeting types with employee types
4. Adapt UI components for employee data
5. Test with localStorage
6. Deploy!

**Result**: 100% complete in 2-3 days instead of 1-2 weeks!

---

## Next Actions

**Option 1: Continue Implementation Now**
- I can continue building all remaining files
- Estimated: 2-3 more hours
- Will deliver complete 100% module

**Option 2: You Implement Using This Guide**
- Follow the pattern from One-on-One Meetings
- Use the code snippets above
- Copy/adapt reusable components
- Estimated: 2-3 days for your team

**Option 3: Hybrid Approach**
- I create the critical files (hooks, data, page skeleton)
- You fill in the UI details
- Fastest path to 100%

---

**Status**: Infrastructure 60% complete, Ready for full implementation

**Recommendation**: Continue with Option 1 (let me complete) or Option 3 (hybrid) for fastest results.

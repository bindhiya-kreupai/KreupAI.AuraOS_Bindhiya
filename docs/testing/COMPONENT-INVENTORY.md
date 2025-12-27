# Component & Hook Testing Inventory
**Date:** December 27, 2024
**Developer:** Dev B (QA Specialist)
**Purpose:** Comprehensive inventory of all components and hooks requiring tests

---

## Executive Summary

This document provides a complete inventory of all React components and custom hooks in the AuraOS codebase that require testing as part of Week 2 (Component Testing) work.

**Total Items to Test:**
- **6 Web App Components** (apps/web)
- **11 UI Package Components** (packages/@aura/ui)
- **75+ Custom Hooks** (apps/web)
- **Estimated Testing Effort:** ~160 hours (2 developers, Week 2-4)

---

## Testing Status Legend

| Status | Symbol | Meaning |
|--------|--------|---------|
| Tested | ✅ | Tests written and passing |
| In Progress | 🚧 | Tests being written |
| Not Started | ⏳ | No tests yet |
| Blocked | 🚨 | Dependencies missing |

---

## Web App Components (apps/web/src/components)

### Core Components

| Component | Path | Status | Test Coverage | Priority |
|-----------|------|--------|---------------|----------|
| ErrorBoundary | components/error-boundary.tsx | ✅ | 22 tests | P1 Critical |
| EmptyPage | components/ui/empty-page.tsx | ✅ | 40+ tests | P2 High |
| ModulePage | components/ui/module-page.tsx | ⏳ | 0 tests | P2 High |
| AppLayout | components/layouts/app-layout.tsx | ⏳ | 0 tests | P1 Critical |
| ModuleGrid | components/dashboard/module-grid.tsx | ⏳ | 0 tests | P2 High |
| CreateJobModal | components/recruitment/create-job-modal.tsx | ⏳ | 0 tests | P3 Medium |

**Total:** 6 components (2 tested, 4 pending)

### Testing Notes

#### ErrorBoundary ✅ COMPLETE
- **Status:** Fully tested with 22 test cases
- **Coverage:** Normal rendering, error catching, custom fallback, callbacks, recovery, reset keys, accessibility, dev vs prod, edge cases
- **Reference:** [error-boundary.test.tsx](../../../apps/web/src/components/error-boundary.test.tsx)

#### EmptyPage ✅ COMPLETE
- **Status:** Fully tested with 40+ test cases
- **Coverage:** All 5 variants, interactions, conditional rendering, accessibility, edge cases, visual regression
- **Reference:** [empty-page.test.tsx](../../../apps/web/src/components/ui/empty-page.test.tsx)

#### ModulePage ⏳ PENDING
- **Complexity:** Medium
- **Estimated Tests:** 25-30 tests
- **Focus Areas:** Rendering, routing, module configuration, error states, accessibility

#### AppLayout ⏳ PENDING
- **Complexity:** High (Critical component)
- **Estimated Tests:** 35-40 tests
- **Focus Areas:** Navigation, responsive layout, authentication state, menu interactions, accessibility
- **Priority:** P1 - Should be tested early in Week 2

#### ModuleGrid ⏳ PENDING
- **Complexity:** Medium
- **Estimated Tests:** 20-25 tests
- **Focus Areas:** Grid rendering, module cards, search/filter, responsive grid, accessibility

#### CreateJobModal ⏳ PENDING
- **Complexity:** Medium
- **Estimated Tests:** 25-30 tests
- **Focus Areas:** Form validation, modal open/close, data submission, error handling, accessibility

---

## UI Package Components (packages/@aura/ui/src/components)

### Layout Components

| Component | Path | Status | Test Coverage | Priority |
|-----------|------|--------|---------------|----------|
| PageHeader | layout/page-header.tsx | ⏳ | 0 tests | P2 High |
| RightPanel | layout/right-panel.tsx | ⏳ | 0 tests | P3 Medium |

### Menu Components

| Component | Path | Status | Test Coverage | Priority |
|-----------|------|--------|---------------|----------|
| MenuIcons | menu/menu-icons.tsx | ⏳ | 0 tests | P3 Medium |
| MobileMenu | menu/mobile-menu.tsx | ⏳ | 0 tests | P2 High |
| RightSidebar | menu/right-sidebar.tsx | ⏳ | 0 tests | P3 Medium |
| SidebarMenu | menu/sidebar-menu.tsx | ⏳ | 0 tests | P1 Critical |
| TopNav | menu/top-nav.tsx | ⏳ | 0 tests | P1 Critical |

### UI Components

| Component | Path | Status | Test Coverage | Priority |
|-----------|------|--------|---------------|----------|
| Button | ui/button.tsx | ⏳ | 0 tests | P1 Critical |
| DataPage | ui/data-page.tsx | ⏳ | 0 tests | P2 High |
| DataTable | ui/data-table.tsx | ⏳ | 0 tests | P1 Critical |
| Sheet | ui/sheet.tsx | ⏳ | 0 tests | P2 High |

**Total:** 11 components (0 tested, 11 pending)

### Testing Priorities

**P1 Critical (Test First):**
1. Button - Most commonly used component
2. DataTable - Critical for data display
3. SidebarMenu - Core navigation
4. TopNav - Core navigation

**P2 High (Test Second):**
1. PageHeader - Common layout component
2. MobileMenu - Mobile navigation
3. DataPage - Common page structure
4. Sheet - Modal/drawer functionality

**P3 Medium (Test Third):**
1. MenuIcons - Icon system
2. RightSidebar - Secondary navigation
3. RightPanel - Side panel functionality

---

## Custom Hooks Inventory

### Critical Hooks (P1) - Core HR Module

| Hook | Path | Status | Priority | Notes |
|------|------|--------|----------|-------|
| useEmployees | core-hr/employee-database/hooks/useEmployees.ts | ⏳ | P1 | Core HR functionality |
| useCoreHR | core-hr/hooks/useCoreHR.ts | ⏳ | P1 | Core HR module |

### Critical Hooks (P1) - Payroll

| Hook | Path | Status | Priority | Notes |
|------|------|--------|----------|-------|
| usePayroll | payroll/hooks/usePayroll.ts | ⏳ | P1 | Payroll processing |

### High Priority Hooks (P2) - Leave Management

| Hook | Path | Status | Priority | Notes |
|------|------|--------|----------|-------|
| useLeave | leave/hooks/useLeave.ts | ⏳ | P2 | Leave management |

### High Priority Hooks (P2) - Recruitment

| Hook | Path | Status | Priority | Notes |
|------|------|--------|----------|-------|
| useRecruitment | recruitment/hooks/useRecruitment.ts | ⏳ | P2 | Recruitment module |

### High Priority Hooks (P2) - Performance Management

| Hook | Path | Status | Priority | Notes |
|------|------|--------|----------|-------|
| useMeetings | performance/1-on-1-meetings/hooks/useMeetings.ts | ⏳ | P2 | 1-on-1 meetings |
| usePerformance | performance/core/hooks/usePerformance.ts | ⏳ | P2 | Performance reviews |

### High Priority Hooks (P2) - Time & Attendance

| Hook | Path | Status | Priority | Notes |
|------|------|--------|----------|-------|
| useTimeTracking | time-tracking/hooks/useTimeTracking.ts | ⏳ | P2 | Time tracking |
| useShifts | shifts/hooks/useShifts.ts | ⏳ | P2 | Shift management |

### Medium Priority Hooks (P3) - All Other Modules

| Hook | Module | Status | Notes |
|------|--------|--------|-------|
| useAgriculture | Agriculture | ⏳ | Industry-specific |
| useAIAutomation | AI Automation | ⏳ | AI features |
| useAlumniNetwork | Alumni Network | ⏳ | Alumni management |
| useAnalytics | Analytics | ⏳ | Analytics dashboard |
| useAssets | Assets | ⏳ | Asset management |
| useAutomotive | Automotive | ⏳ | Industry-specific |
| useAviation | Aviation | ⏳ | Industry-specific |
| useBenefits | Benefits | ⏳ | Benefits management |
| useCareer | Career | ⏳ | Career development |
| useChatbot | Chatbot Builder | ⏳ | Chatbot features |
| useCollaboration | Collaboration | ⏳ | Team collaboration |
| useCompensation | Compensation | ⏳ | Compensation management |
| useConstruction | Construction | ⏳ | Industry-specific |
| useDEI | DEI | ⏳ | Diversity & Inclusion |
| useDocuments | Documents | ⏳ | Document management |
| useEducation | Education | ⏳ | Industry-specific |
| useEnergy | Energy | ⏳ | Industry-specific |
| useEngagement | Engagement | ⏳ | Employee engagement |
| useExpenses | Expenses | ⏳ | Expense management |
| useFinance | Finance | ⏳ | Financial management |
| useFinancial | Financial Services | ⏳ | Industry-specific |
| useGamification | Gamification | ⏳ | Gamification features |
| useGoals | Goals | ⏳ | Goal management |
| useGovernment | Government | ⏳ | Industry-specific |
| useHealthcare | Healthcare | ⏳ | Industry-specific |
| useHelpdesk | Helpdesk | ⏳ | Support ticketing |
| useHospitality | Hospitality | ⏳ | Industry-specific |
| useLearning | Learning | ⏳ | Learning management |
| useLogistics | Logistics | ⏳ | Industry-specific |
| useManagerSelfService | Manager Self-Service | ⏳ | Manager features |
| useManufacturing | Manufacturing | ⏳ | Industry-specific |
| useMaritime | Maritime | ⏳ | Industry-specific |
| useMedia | Media | ⏳ | Industry-specific |
| useMining | Mining | ⏳ | Industry-specific |
| useMobileApp | Mobile App | ⏳ | Mobile features |
| useMobility | Mobility | ⏳ | Mobility management |
| useNonprofit | Nonprofit | ⏳ | Industry-specific |
| useOffboarding | Offboarding | ⏳ | Offboarding process |
| useOnboarding | Onboarding | ⏳ | Onboarding process |
| useOrgDesign | Org Design | ⏳ | Organization design |
| useOrganization | Organization | ⏳ | Organization management |
| usePolicyMgmt | Policy Management | ⏳ | Policy management |
| useRecognition | Recognition | ⏳ | Employee recognition |
| useRemoteWork | Remote Work | ⏳ | Remote work features |
| useRetail | Retail | ⏳ | Industry-specific |
| useSecurity | Security | ⏳ | Security features |
| useSuccession | Succession Planning | ⏳ | Succession planning |
| useTravel | Travel | ⏳ | Travel management |
| useWellness | Wellness | ⏳ | Wellness programs |
| useWorkflow | Workflow Engine | ⏳ | Workflow automation |
| useWorkforcePlanning | Workforce Planning | ⏳ | Workforce planning |
| useCompetencyLibrary | Competency Library | ⏳ | Competency management |

**Total Custom Hooks:** 75+

### Utility Hooks (Found Multiple Times)

| Hook | Occurrences | Notes |
|------|-------------|-------|
| useToast | 10+ | Toast notification hook (duplicated across modules) |

---

## Testing Strategy

### Week 2 Allocation (Per QA-WORK-ALLOCATION.md)

**Dev A (Claude) - 70% workload:**
- ✅ All UI components (Button, Modal, Card, DataTable, etc.) - 11 components
- ✅ Custom hooks (Core functionality hooks) - Priority 1 & 2 hooks
- ✅ Form validations
- ✅ Set up snapshot testing
- ✅ Configure React Testing Library utilities

**Dev B (Human) - 30% workload:**
- ✅ Test error boundaries (COMPLETED)
- ✅ Set up accessibility testing (COMPLETED in Week 1)
- ✅ Create accessibility test checklist (COMPLETED in Week 1)
- ✅ Document component testing best practices (COMPLETED in Week 1)
- ⏳ Review and approve component tests from Dev A

---

## Recommended Testing Order

### Phase 1: Critical Components (Week 2, Days 1-2)
**Assignee:** Dev A

1. **Button** (P1 Critical)
   - Variants, sizes, states, accessibility
   - Estimated: 20-25 tests

2. **DataTable** (P1 Critical)
   - Rendering, sorting, filtering, pagination, accessibility
   - Estimated: 35-40 tests

3. **AppLayout** (P1 Critical)
   - Navigation, responsive, authentication, accessibility
   - Estimated: 35-40 tests

### Phase 2: Core Navigation (Week 2, Days 3-4)
**Assignee:** Dev A

4. **SidebarMenu** (P1 Critical)
   - Menu items, active states, collapse/expand, accessibility
   - Estimated: 25-30 tests

5. **TopNav** (P1 Critical)
   - User menu, search, notifications, accessibility
   - Estimated: 25-30 tests

6. **MobileMenu** (P2 High)
   - Mobile navigation, responsive, accessibility
   - Estimated: 20-25 tests

### Phase 3: Common Components (Week 2, Days 5-7)
**Assignee:** Dev A

7. **ModulePage** (P2 High)
8. **DataPage** (P2 High)
9. **PageHeader** (P2 High)
10. **Sheet** (P2 High)
11. **ModuleGrid** (P2 High)

### Phase 4: Critical Hooks (Week 3, Days 1-3)
**Assignee:** Dev A

12. **useEmployees** (P1 Critical)
13. **useCoreHR** (P1 Critical)
14. **usePayroll** (P1 Critical)
15. **useLeave** (P2 High)
16. **useRecruitment** (P2 High)

### Phase 5: Performance & Time Hooks (Week 3, Days 4-5)
**Assignee:** Dev A

17. **useMeetings** (P2 High)
18. **usePerformance** (P2 High)
19. **useTimeTracking** (P2 High)
20. **useShifts** (P2 High)

### Phase 6: Review & Approval (Week 3, Days 6-7)
**Assignee:** Dev B

- Review all component tests from Dev A
- Run full test suite with coverage
- Identify gaps
- Approve or request changes

### Phase 7: Medium Priority Hooks (Week 4)
**Assignees:** Dev A & Dev B collaborate

- Test remaining medium priority hooks
- Focus on most-used modules first
- Can be deprioritized if time runs short

---

## Testing Metrics Targets

### Coverage Targets (Per TESTING-STANDARDS.md)

| Component Type | Target Coverage | Current |
|----------------|-----------------|---------|
| Core Components | 95% | 33% (2/6) |
| UI Components | 85% | 0% (0/11) |
| Critical Hooks | 95% | 0% (0/10) |
| Other Hooks | 75% | 0% (0/65) |

### Test Count Estimates

| Category | Components | Est. Tests per Component | Total Est. Tests |
|----------|------------|-------------------------|------------------|
| Critical Components | 6 | 30 | 180 |
| UI Package Components | 11 | 25 | 275 |
| Critical Hooks | 10 | 15 | 150 |
| Medium Priority Hooks | 65 | 10 | 650 |
| **Total** | **92** | | **~1,255 tests** |

---

## Dependencies Needed

### Currently Missing (Blocking test execution)

✅ Added to package.json (awaiting installation):
- `jsdom@^24.0.0`
- `@vitejs/plugin-react@^4.3.4`
- `@testing-library/user-event@^14.5.2`

✅ Already added (Week 1):
- `jest-axe@^9.0.0`
- `vitest-axe@^1.0.0`
- `axe-core@^4.10.2`
- `@axe-core/react@^4.10.2`

### Installation Command

```bash
cd /Users/sabujohnbosco/KreupAI/KreupAI.AuraOS
pnpm install
# Answer 'Y' to all prompts
```

---

## Risk Assessment

### High Risk 🚨

- **Volume of Work:** 92 components/hooks requiring ~1,255 tests
  - *Mitigation:* Prioritize critical components first, defer medium priority hooks to Week 4+

### Medium Risk ⚠️

- **Dependency Installation:** Blocking test execution
  - *Mitigation:* Documented installation steps, packages added to package.json

- **Hook Complexity:** Some hooks may have complex state management
  - *Mitigation:* Use React Testing Library's renderHook, mock API calls

### Low Risk ✅

- **Component Testing:** Good examples exist (ErrorBoundary, EmptyPage)
- **Documentation:** Comprehensive guides in place
- **Tooling:** Vitest configured, setupAxe ready

---

## Estimated Timeline

### Week 2: Component Testing (Current Week)
- **Days 1-7:** Focus on critical components and navigation
- **Target:** 6 web components + 5 UI package components
- **Estimated Tests:** ~300 tests

### Week 3: Component Testing Continued
- **Days 1-5:** Critical and high-priority hooks
- **Days 6-7:** Review and approval
- **Target:** 10 critical hooks
- **Estimated Tests:** ~150 tests

### Week 4: Component Testing Completion
- **Days 1-7:** Medium priority hooks (as many as possible)
- **Target:** 20-30 medium priority hooks
- **Estimated Tests:** ~300 tests

### Remaining Weeks (5+)
- Continue testing medium priority hooks as time allows
- Prioritize most-used modules

---

## Next Actions

### Immediate (Dev B)
1. ✅ Complete component inventory (THIS DOCUMENT)
2. ⏳ Review existing component code to understand complexity
3. ⏳ Wait for dependency installation
4. ⏳ Begin reviewing Dev A's tests as they're created

### Immediate (Dev A)
1. ⏳ Install dependencies (`pnpm install`)
2. ⏳ Start with Button component tests
3. ⏳ Continue with DataTable component tests
4. ⏳ Create tests for AppLayout
5. ⏳ Follow recommended testing order

---

## References

- [TESTING-STANDARDS.md](./TESTING-STANDARDS.md) - Testing standards and coverage targets
- [COMPONENT-TESTING-GUIDE.md](./COMPONENT-TESTING-GUIDE.md) - Component testing best practices
- [QA-WORK-ALLOCATION.md](../gps-solutions/QA-WORK-ALLOCATION.md) - Work allocation between Dev A and Dev B
- [error-boundary.test.tsx](../../apps/web/src/components/error-boundary.test.tsx) - Example comprehensive test
- [empty-page.test.tsx](../../apps/web/src/components/ui/empty-page.test.tsx) - Example component test with accessibility

---

## Appendix: Hook Testing Pattern Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useEmployees } from './useEmployees';

describe('useEmployees', () => {
  it('fetches employees on mount', async () => {
    const { result } = renderHook(() => useEmployees());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.employees).toHaveLength(10);
  });

  it('handles errors gracefully', async () => {
    // Mock API to throw error
    global.fetch = vi.fn(() => Promise.reject(new Error('API Error')));

    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
    });
  });
});
```

---

**End of Component Inventory**

*This inventory will be updated as tests are created and completed.*

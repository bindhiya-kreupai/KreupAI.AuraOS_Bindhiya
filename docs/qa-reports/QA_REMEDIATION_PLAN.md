# QA Assessment — Remediation Plan

**Date:** March 23, 2026
**Based on:** [QA_ASSESSMENT.md](QA_ASSESSMENT.md)
**Validated against:** Codebase source review

---

## 0. QA Assessment Accuracy Check

The QA assessment was performed via browser testing. Cross-referencing with the source code reveals several findings are **overstated** — some features ARE implemented in code but may not have been working in the test environment (build issues, hydration, or environment configuration). The plan below reflects the **actual code state**.

| QA Claim                               | Actual Code State                                                                      | Verdict                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Sidebar chevrons ALL non-functional    | `toggleModule()` + `toggleSubModule()` handlers wired, `<Link>` elements present       | **LIKELY ENVIRONMENT ISSUE** — verify in fresh build |
| ALL 10 header buttons non-functional   | 6/10 are wired (Search/⌘K, Dark Mode, Settings, Sidebar Collapse, Logo, Favorites)     | **OVERSTATED** — 4 need fixes                        |
| Zero backend integration               | Leave, Attendance, Payroll, Analytics, Recruitment have services + API routes          | **OVERSTATED** — ~5 modules integrated               |
| All 500+ action buttons non-functional | Some pages have handlers (Candidate Screening, Approval Center, Attendance Exceptions) | **PARTIALLY ACCURATE** — majority are stubs          |

**Action:** Before starting fixes, run a clean build (`pnpm build && pnpm dev`) and re-verify BUG-001 and BUG-002 in a fresh session.

---

## 1. Phase 1 — P0 Critical Fixes (Week 1)

These block basic usability and any demo.

### 1.1 Verify Sidebar Navigation (BUG-001)

**Risk:** May be a build/hydration issue, not a code bug.

**Steps:**

1. Clean build: `pnpm clean && pnpm install && pnpm build`
2. Start dev server: `pnpm dev`
3. Test sidebar in fresh incognito browser window
4. If sidebar works → close BUG-001 as environment issue
5. If sidebar still broken → investigate:
   - Check if `SidebarMenu` is server-rendered (should be client-only: `"use client"`)
   - Check if `superAdminMenu` data loads correctly at runtime
   - Check if `pathname` from `usePathname()` matches expected route patterns
   - Verify `toggleModule()` fires on click (add `console.log` temporarily)

**Files:**

- [sidebar-menu.tsx](packages/@aura/ui/src/components/menu/sidebar-menu.tsx) — lines 77-92 (toggle handlers), 194 (click binding)
- [app-layout.tsx](apps/web/src/components/layouts/app-layout.tsx) — layout wrapper

**Acceptance Criteria:**

- All 51 sidebar modules expand on click to show sub-items
- Sub-item links navigate to correct `/dashboard/{module}/{sub-module}` routes
- Active module/feature is visually highlighted

---

### 1.2 Fix Sidebar Search Input (BUG-003 partial)

**Status:** Confirmed broken in code — input has no `value` or `onChange` binding.

**File:** [sidebar-menu.tsx](packages/@aura/ui/src/components/menu/sidebar-menu.tsx) — lines 150-154

**Fix:**

```tsx
// Current (broken):
<input type="text" placeholder="Search modules..." className="..." />

// Required:
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search modules..."
  className="..."
/>
```

**Additional:** Add a clear button (X icon) when `searchQuery` is non-empty.

**Acceptance Criteria:**

- Typing in sidebar search filters the module list in real-time
- Clear button resets the filter
- Empty search shows all modules

---

### 1.3 Fix Header Bar Gaps (BUG-002 partial)

**File:** [top-nav.tsx](packages/@aura/ui/src/components/menu/top-nav.tsx)

Only **4 buttons** actually need fixes:

| Button        | Line     | Issue                     | Fix                                                                        |
| ------------- | -------- | ------------------------- | -------------------------------------------------------------------------- |
| AI Assistant  | 90-93    | No `onClick` handler      | Add `onClick` to open HRChatbot (share state via context or callback prop) |
| Help          | 108-111  | No `onClick` handler      | Add `onClick` → navigate to `/help` or open help modal                     |
| Notifications | 113-134  | UI works, no backend data | Wire to notification API when available; acceptable as-is for demo         |
| Sign Out      | ~180-182 | Button has no `onClick`   | Add logout handler: clear session → redirect to `/auth/login`              |

**Priority order:** Sign Out > AI Assistant > Help > Notifications

**Acceptance Criteria:**

- Sign Out clears auth state and redirects to login
- AI Assistant button opens the HRChatbot panel
- Help button navigates to a help page or opens a help modal
- Notifications dropdown indicates "coming soon" or shows real data

---

### 1.4 Fix Password Eye Toggle (BUG-008)

**File:** Login page component — `apps/web/src/app/auth/login/page.tsx` (or similar)

**Fix:** Add state toggle for password visibility:

```tsx
const [showPassword, setShowPassword] = useState(false);
<input type={showPassword ? 'text' : 'password'} ... />
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

**Acceptance Criteria:** Eye icon toggles password field between visible/masked.

---

## 2. Phase 2 — Core Module API Wiring (Weeks 2-3)

Connect the 5 most important modules to their existing backend services.

### 2.1 Audit Existing Backend Integration

Before wiring new pages, confirm what already works:

| Module             | Service File              | API Routes            | Hooks                | Status                |
| ------------------ | ------------------------- | --------------------- | -------------------- | --------------------- |
| Leave              | `leave.service.ts`        | `/api/v1/leaves/`     | `useLeave` hooks     | **Verify end-to-end** |
| Attendance         | `attendance/*.service.ts` | `/api/v1/attendance/` | Attendance hooks     | **Verify end-to-end** |
| Payroll            | `payroll.service.ts`      | `/api/v1/payroll/`    | Payroll hooks        | **Verify end-to-end** |
| Analytics          | `analyticsService.ts`     | `/api/v1/analytics/`  | `useAnalytics` hooks | **Verify end-to-end** |
| Core HR (Employee) | `employee.service.ts`     | `/api/v1/employees/`  | Needs hooks          | **Wire to pages**     |

**Steps:**

1. For each module, test the API route directly (`curl localhost:3006/api/v1/leaves`)
2. Confirm Prisma queries execute against seeded data
3. Verify TanStack Query hooks are imported in the page components
4. If hooks exist but aren't used in pages — wire them in

---

### 2.2 Wire Sub-Module Action Buttons (BUG-004)

**Scope:** Focus on the 5 core modules first (Core HR, Leave, Payroll, Attendance, Performance).

**Pattern to follow** (from working pages like Candidate Screening):

```tsx
// 1. Import service
import { LeaveRequestService } from '../services/leave-request.service';

// 2. State
const [items, setItems] = useState([]);
const [showModal, setShowModal] = useState(false);

// 3. Fetch on mount
useEffect(() => {
  fetchItems();
}, []);
const fetchItems = async () => {
  const data = await LeaveRequestService.getAll();
  setItems(data);
};

// 4. Wire action button
<button onClick={() => setShowModal(true)}>+ New Leave Request</button>;

// 5. Handle form submit
const handleCreate = async (formData) => {
  await LeaveRequestService.create(formData);
  await fetchItems();
  setShowModal(false);
};
```

**Estimated work per sub-module page:**

- Pages with existing services: ~30 min each (wire handlers + modal)
- Pages needing new services: ~2 hours each (service + API route + handlers + modal)

**Priority sub-module pages (core 5 modules, ~50 pages):**

| Module      | Key Sub-Modules to Wire                                                | Service Exists?        |
| ----------- | ---------------------------------------------------------------------- | ---------------------- |
| Core HR     | Employee Database, Org Structure, Document Mgmt, Position Mgmt         | Partial                |
| Leave       | Leave Balance, Leave Requests, Leave Types, Policies, Holiday Calendar | Yes                    |
| Payroll     | Payroll Processing, Salary Structure, Tax Config, Deductions, Payslips | Yes                    |
| Attendance  | Time Tracking, Shifts, Overtime, Regularization                        | Yes                    |
| Performance | Goal Setting, Reviews, OKRs, Continuous Feedback                       | No — needs new service |

---

### 2.3 Connect Dashboard KPIs to Real Data

**File:** Dashboard overview page

**Current state:** All KPI values are hardcoded (1,234 employees, 12 on leave, etc.)

**Fix:** Replace hardcoded values with API calls:

```tsx
const { data: workforce } = useWorkforceMetrics();
const { data: recruitment } = useRecruitmentMetrics();
```

**Acceptance Criteria:**

- KPI cards show real counts from the database
- Cards are clickable and navigate to the relevant module
- Loading skeletons show while data fetches

---

## 3. Phase 3 — P1 UX Improvements (Week 3-4)

### 3.1 Header Search / Command Palette (⌘K)

**Status:** `GlobalSearchCommand` component exists and is fully implemented (238 lines). Verify it's mounted in the layout and the `onSearchClick` prop reaches it.

**File:** [GlobalSearchCommand.tsx](apps/web/src/components/search/GlobalSearchCommand.tsx)

**Verify:**

- `useSearch()` hook is used in AppLayout
- `setSearchOpen(true)` triggers the command palette overlay
- `Cmd+K` / `Ctrl+K` keyboard shortcut works

---

### 3.2 Breadcrumb Navigation

Add breadcrumbs for the `module > sub-module` hierarchy.

**Pattern:**

```
Dashboard > Core HR > Employee Database
```

**Implementation:** Parse the URL path segments and render a breadcrumb component in the dashboard layout.

---

### 3.3 Loading & Empty States

**Current:** Empty state messages exist but no loading skeletons.

**Add:** Skeleton loaders for data tables while API calls are in flight. Use TanStack Query's `isLoading` state.

---

### 3.4 Remove Misleading Indicators (BUG-007)

- Remove the red dot on the notification bell until real notifications exist
- Remove the red badge "1" on the right mini-sidebar history icon

**File:** [top-nav.tsx](packages/@aura/ui/src/components/menu/top-nav.tsx) — line 120

---

## 4. Phase 4 — P2 Cleanup (Week 4-5)

### 4.1 Resolve L&D Duplication (BUG-010)

**File:** [super-admin-menu.ts](packages/@aura/config/src/super-admin-menu.ts)

Remove duplicate "L&D" entry — keep "Learning & Development" as the canonical module.

---

### 4.2 Fix Module Count (BUG-009)

**File:** Sidebar footer component

Replace hardcoded "43 Modules • 394 Features" with dynamic count from `superAdminMenu.items`.

---

### 4.3 Build Out Settings Page

Navigate to `/settings` currently shows "Coming Soon." Build a basic settings page:

- Profile settings (name, email, avatar)
- Notification preferences
- Theme preferences (already works via toggle)
- Language/locale selection

---

### 4.4 Floating Chat Widget (BUG-006)

**Status:** `HRChatbot` component exists at [HRChatbot.tsx](apps/web/src/components/ai/HRChatbot.tsx) (386 lines).

**Verify:** Is it mounted in the layout? If the FAB renders but doesn't open, check the onClick handler and z-index.

---

## 5. Phase 5 — P3 Future Enhancements (Week 5+)

### 5.1 Accessibility (Section 8 of QA Report)

- Add ARIA labels to all header buttons
- Add `role="navigation"` and `aria-label` to sidebar
- Implement keyboard navigation (Tab, Enter, Escape)
- Add skip-to-content link
- Add visible focus indicators

### 5.2 Build Placeholder Modules (14 modules)

Convert the 14 "Under Development" placeholder modules to functional hub pages with sub-module cards.

### 5.3 Session Management

- Implement session timeout with warning modal
- Add CSRF token handling
- Implement "Remember me" persistence
- Add login validation (empty fields, invalid email format)

### 5.4 User Onboarding

- First-time user walkthrough (product tour)
- Module introduction tooltips

---

## 6. Implementation Priority Matrix

| #   | Task                                       | Phase | Effort | Impact   | Owner                              |
| --- | ------------------------------------------ | ----- | ------ | -------- | ---------------------------------- |
| 1   | Verify sidebar in clean build              | P0    | 1h     | Critical | Copilot                            |
| 2   | Fix sidebar search binding                 | P0    | 30m    | Critical | Copilot                            |
| 3   | Fix Sign Out handler                       | P0    | 1h     | Critical | Copilot                            |
| 4   | Fix AI Assistant button                    | P0    | 1h     | High     | Copilot                            |
| 5   | Fix password eye toggle                    | P0    | 30m    | Medium   | Copilot                            |
| 6   | Audit existing API integration (5 modules) | P0    | 4h     | Critical | Claude (review) + Copilot (verify) |
| 7   | Wire Core HR sub-module pages              | P1    | 8h     | High     | Copilot                            |
| 8   | Wire Leave sub-module pages                | P1    | 4h     | High     | Copilot                            |
| 9   | Wire Payroll sub-module pages              | P1    | 6h     | High     | Copilot                            |
| 10  | Wire Attendance sub-module pages           | P1    | 4h     | High     | Copilot                            |
| 11  | Wire Performance sub-module pages          | P1    | 8h     | High     | Copilot                            |
| 12  | Connect dashboard KPIs                     | P1    | 4h     | High     | Copilot                            |
| 13  | Verify command palette (⌘K)                | P1    | 1h     | Medium   | Copilot                            |
| 14  | Add breadcrumb navigation                  | P2    | 3h     | Medium   | Copilot                            |
| 15  | Add loading skeletons                      | P2    | 4h     | Medium   | Copilot                            |
| 16  | Remove misleading indicators               | P2    | 30m    | Low      | Copilot                            |
| 17  | Fix L&D duplication                        | P2    | 30m    | Low      | Copilot                            |
| 18  | Fix module count                           | P2    | 30m    | Low      | Copilot                            |
| 19  | Build settings page                        | P2    | 6h     | Medium   | Copilot                            |
| 20  | Verify chat widget                         | P2    | 1h     | Low      | Copilot                            |
| 21  | Accessibility improvements                 | P3    | 8h     | Medium   | Copilot                            |
| 22  | Build 14 placeholder modules               | P3    | 16h    | Medium   | Copilot                            |
| 23  | Session management                         | P3    | 6h     | High     | Copilot                            |
| 24  | User onboarding                            | P3    | 8h     | Low      | Copilot                            |

**Total estimated effort:** ~95 hours across 5 phases

---

## 7. Quick Wins (Can Ship Today)

These are code-level fixes that take < 1 hour each:

1. **Sidebar search binding** — add `value` + `onChange` to input (1 line change)
2. **Remove notification red dot** — delete line 120 in top-nav.tsx
3. **Fix module count** — replace hardcoded "43" with `superAdminMenu.items.length`
4. **Remove L&D duplicate** — delete duplicate entry in super-admin-menu.ts
5. **Password eye toggle** — add state + toggle handler on login page
6. **Sign Out handler** — add `onClick` that calls logout API + redirect

---

## 8. Success Metrics

| Metric                        | Current            | Target (Phase 1)     | Target (Phase 2)    |
| ----------------------------- | ------------------ | -------------------- | ------------------- |
| Working header buttons        | 6/10               | 10/10                | 10/10               |
| Sidebar navigation            | Needs verification | All 51 modules work  | All 51 + search     |
| Modules with API integration  | ~5                 | 5 verified           | 5 fully wired to UI |
| Working action buttons        | ~10                | ~50 (core 5 modules) | ~150                |
| Dashboard KPIs from real data | 0/12               | 0/12                 | 12/12               |
| Accessibility issues          | 5+                 | 5+                   | 3                   |

---

_Generated: March 23, 2026 | AuraOS QA Remediation Plan_

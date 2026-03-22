# Mobile Integration Completion — Claude Planning Document

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Status**: Planning Complete — Ready for Copilot Handoff
**Workstream**: Mobile Integration Completion (Weeks 15–16)
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Mobile Integration Completion Guide](./GUIDE-MOBILE-INTEGRATION-COMPLETION.md)

---

## Executive Assessment

**Verdict: Most mature mobile foundation in the program.** A full Expo-based React Native app exists at `apps/mobile/` with 46 TS/TSX files, 9 service files, offline-first architecture, geofencing, biometric auth, and push notifications. The gap is that **priority screens use hardcoded mock data** instead of calling the web APIs that already exist.

### What Exists

| Layer | Count | Status |
|-------|-------|--------|
| Expo mobile app | 46 TS/TSX files | REAL — cross-platform iOS/Android |
| Mobile screens | 8 main + 18 nested | REAL — full navigation structure |
| Mobile services | 9 service files | REAL — API client, auth, offline, location, push |
| Offline storage | 1 (351 lines) | REAL — AsyncStorage queue with retry |
| Location/geofencing | 1 (351 lines) | REAL — GPS tracking, auto check-in |
| Push notifications | 1 (437 lines) | REAL — Expo, 6 Android channels |
| Biometric auth | BiometricScreen | REAL — Face ID / Touch ID / Fingerprint |
| Web mobile components | 20 files | REAL — admin dashboard views |
| Prisma notification models | 3 | REAL — Notification, NotificationRecipient, NotificationTemplate |
| Mobile API routes | `/api/mobile-app/notifications/*` | REAL — 3 routes with auth |
| PWA test suite | 527 lines | Tests exist, NO implementation |

### What Needs Work

1. **Priority screens use mock data** — Paystubs, Directory, Approvals, Notifications, Performance screens contain hardcoded arrays instead of API calls
2. **Mobile services don't call web APIs** — The mobile `api.service.ts` has the HTTP client infrastructure but screens bypass it with inline mock data
3. **No device registration endpoint** — Mobile push token registration endpoint is a stub
4. **ESS Portal is a stub** — `apps/web/src/app/(modules)/ess/page.tsx` has `isImplemented={false}`
5. **PWA not implemented** — manifest.json, service-worker.js missing (test suite exists)
6. **No MobileDevice Prisma model** — Device registration/management not in schema

---

## Scope Confirmation

### In-Scope (Weeks 15–16)

1. Wire Paystubs screen to real payroll API (`/api/v1/payroll/pay-stubs`)
2. Wire Directory screen to real employee API (`/api/v1/employees`)
3. Wire Approvals screen to real workflow API (leave approvals, expense approvals)
4. Wire Notifications screen to real notification API (`/api/mobile-app/notifications`)
5. Wire Performance screen to real performance API (`/api/v1/performance`)
6. Verify auth token refresh and session handling
7. Remove mock arrays from all priority screens
8. Verify offline queue replays correctly when reconnected
9. Run mobile QA regression on priority flows

### Deferred (Not Weeks 15–16)

1. PWA implementation (manifest.json, service worker, offline page)
2. MobileDevice Prisma model and device management
3. Backend biometric verification service
4. Direct Firebase/APNS integration (Expo proxy is acceptable)
5. Mobile analytics and crash reporting service
6. ESS Portal full build-out
7. Wearable support
8. Background sync for PWA

---

## Critical Findings

### Finding 1: Mobile Infrastructure is Excellent

The mobile app has production-grade infrastructure:
- **Offline queue** (351 lines) — AsyncStorage-backed, 3 max retries, status tracking (pending → processing → completed/failed)
- **Location service** (351 lines) — GPS with geofencing, background tracking via TaskManager, 100m default radius
- **Push notifications** (437 lines) — Expo token registration, 6 Android channels, local scheduling, deep linking
- **Biometric auth** — Face ID/Touch ID with fallback to password, i18n (EN/AR/HI)
- **API client** — Axios with token refresh interceptors

The problem is not infrastructure — it's that **screens don't use the infrastructure**.

### Finding 2: Web APIs Already Support Mobile

All the APIs that mobile screens need already exist in the web backend:
- Paystubs: `/api/v1/payroll/pay-stubs/*` (real Prisma)
- Directory: `/api/v1/employees` (real Prisma)
- Leave: `/api/v1/leave/*` (real Prisma)
- Attendance: `/api/v1/attendance/*` (real Prisma)
- Notifications: `/api/mobile-app/notifications/*` (real Prisma)
- Performance: `/api/v1/performance/*` (exists)

Mobile completion is primarily a **wiring task** — point screens at existing APIs.

### Finding 3: i18n Support Already Built

The mobile app has react-i18next configured with 3 locales:
- English (EN)
- Arabic (AR)
- Hindi (HI)

This aligns with the AuraOS MENA focus and statutory countries (UAE, KSA, India).

### Finding 4: Expo Dependency Versions

Key dependencies from `apps/mobile/package.json`:
```
expo: ~50.0
react-native: 0.73.1
expo-camera: ~14.0.0
expo-location: ~16.3.0
expo-notifications: ~0.25.0
expo-secure-store: ~12.5.0
react-native-maps: ^1.8.0
```

These are established versions. No upgrades needed for Week 15–16 scope.

---

## File/Module Impact Map

### Must-Change Files

| File | Change | LOC Est. |
|------|--------|----------|
| `apps/mobile/src/screens/payroll/PaystubsScreen.tsx` | Replace mock payslip data with API call via payroll.service | ~80 lines |
| `apps/mobile/src/screens/employees/DirectoryScreen.tsx` | Replace mock directory with API call | ~60 lines |
| `apps/mobile/src/screens/dashboard/ApprovalsScreen.tsx` | Replace mock approvals with real workflow API | ~80 lines |
| `apps/mobile/src/screens/notifications/NotificationsScreen.tsx` | Wire to `/api/mobile-app/notifications` | ~50 lines |
| `apps/mobile/src/screens/performance/PerformanceScreen.tsx` | Wire to performance API | ~50 lines |
| `apps/mobile/src/services/payroll.service.ts` | Verify API endpoints match web backend routes | ~20 lines |
| `apps/mobile/src/services/auth.service.ts` | Verify token refresh interceptor works end-to-end | ~10 lines |

### Verify-Only Files

| File | Verify |
|------|--------|
| `apps/mobile/src/services/api.service.ts` | Axios base URL, interceptors, token refresh all functional |
| `apps/mobile/src/services/attendance.service.ts` | Calls real attendance APIs |
| `apps/mobile/src/services/leave.service.ts` | Calls real leave APIs |
| `apps/mobile/src/services/offlineStorage.ts` | Queue replays correctly on reconnect |
| `apps/mobile/src/services/location.service.ts` | Geofencing works with attendance check-in |
| `apps/mobile/src/services/notification.service.ts` | Push token registration sends to backend |

### No-Change Files

| File | Reason |
|------|--------|
| `packages/@aura/database/prisma/schema.prisma` | Zero schema changes needed for Week 15–16 |
| All web mobile components (20 files) | Admin dashboard views, not mobile app |
| `apps/mobile/App.tsx` | Entry point already correct |
| Navigation structure | Already configured |

---

## Acceptance Criteria

### AC-1: Paystubs Screen API-Backed
Paystubs screen displays real payslip data from `/api/v1/payroll/pay-stubs` scoped to the authenticated employee. No hardcoded payslip arrays.

### AC-2: Directory Screen API-Backed
Directory screen searches and displays employees from `/api/v1/employees`. Search, pagination, and department filtering work against real data.

### AC-3: Approvals Screen API-Backed
Approvals screen lists and processes real pending approvals (leave requests, expense requests). Approve/reject actions persist through the backend.

### AC-4: Notifications Screen API-Backed
Notifications screen fetches from `/api/mobile-app/notifications`. Mark-as-read updates persist. Push notification taps navigate to correct screens.

### AC-5: Performance Screen API-Backed
Performance screen displays real review data, goals, and ratings from the performance API.

### AC-6: Session Handling
Token refresh interceptor handles expired access tokens silently. Expired refresh tokens redirect to login. No silent fallback to mock data on auth failure.

### AC-7: No Mock Arrays in Priority Screens
All 5 priority screens (Paystubs, Directory, Approvals, Notifications, Performance) contain zero hardcoded mock arrays. Empty states show appropriate UI when no data exists.

---

## Test Strategy

### Integration Tests (5 tests)

| # | Test | Target |
|---|------|--------|
| I1 | Login → token stored → API call with auth header succeeds | Auth flow |
| I2 | Paystubs screen fetches and displays real data | Paystubs API |
| I3 | Directory search returns matching employees | Directory API |
| I4 | Approve leave request → verify backend state changed | Approvals flow |
| I5 | Notification fetch and mark-read persists | Notifications API |

### Manual Regression (4 tests)

| # | Test | Target |
|---|------|--------|
| M1 | Expired session → token refresh → seamless continuation | Session handling |
| M2 | Tenant A user cannot see Tenant B data | Multi-tenant isolation |
| M3 | Airplane mode → offline indicator → reconnect → sync | Offline handling |
| M4 | Empty data state shows appropriate UI (not blank screen) | Empty states |

### Release Validation (3 tests)

| # | Test | Target |
|---|------|--------|
| R1 | All 5 priority screens load real data | Screen parity |
| R2 | No priority screen contains hardcoded mock arrays | Mock elimination |
| R3 | Crash/error reporting hooks capture API failures | Monitoring |

---

## Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| MR-1 | Web APIs change response shape before mobile wiring | Mobile screens break | Pin mobile to API contract version; use shared types if feasible |
| MR-2 | Payroll/Attendance API not production-ready by Week 15 | Paystubs/Attendance screens blocked | These depend on earlier workstreams (Weeks 7-11); schedule accordingly |
| MR-3 | Token refresh mechanism has edge cases | Intermittent auth failures | Test token refresh with expired tokens, concurrent requests, network interruptions |
| MR-4 | Offline queue replay creates duplicates | Duplicate leave requests, double check-ins | Implement idempotency keys in queue actions |
| MR-5 | Expo SDK version drift | Build failures on update | Freeze Expo version for Weeks 15–16; upgrade separately |
| MR-6 | Mobile testing requires physical devices or simulators | QA infrastructure gap | Use Expo Go for dev testing; Detox or Maestro for automation |

---

## Copilot Handoff — Weeks 15–16

### Task 1: Wire Paystubs Screen to Real API
**File**: `apps/mobile/src/screens/payroll/PaystubsScreen.tsx`
**Action**: Remove hardcoded payslip data. Call `payroll.service.ts` methods which should hit `/api/v1/payroll/pay-stubs` with the authenticated user's employee ID. Display loading, error, and empty states appropriately.
**Depends on**: Payroll Engine (Weeks 9-11) must have wired pay stub queries.

### Task 2: Wire Directory Screen to Real API
**File**: `apps/mobile/src/screens/employees/DirectoryScreen.tsx`
**Action**: Remove mock employee array. Use the mobile API service to call `/api/v1/employees` with search and pagination params. Implement pull-to-refresh with real refetch.

### Task 3: Wire Approvals Screen to Real API
**File**: `apps/mobile/src/screens/dashboard/ApprovalsScreen.tsx`
**Action**: Remove mock approval list. Call real workflow APIs for pending leave approvals, expense approvals, etc. Implement approve/reject actions that POST to the backend.

### Task 4: Wire Notifications Screen to Real API
**File**: `apps/mobile/src/screens/notifications/NotificationsScreen.tsx`
**Action**: Remove mock notifications. Call `/api/mobile-app/notifications` for the authenticated user. Implement mark-as-read via the notification API.

### Task 5: Wire Performance Screen to Real API
**File**: `apps/mobile/src/screens/performance/PerformanceScreen.tsx`
**Action**: Remove mock performance data. Call `/api/v1/performance` endpoints for reviews, goals, and ratings.

### Task 6: Verify Auth Token Refresh
**File**: `apps/mobile/src/services/auth.service.ts`, `api.service.ts`
**Action**: Test the Axios interceptor chain:
1. Make API call with valid token → succeeds
2. Make API call with expired access token → interceptor refreshes → retries → succeeds
3. Make API call with expired refresh token → redirects to login
4. Concurrent requests during refresh → all wait for refresh, then retry
**Critical**: Ensure no screen silently falls back to mock data on auth failure.

### Task 7: Verify Offline Queue Replay
**File**: `apps/mobile/src/services/offlineStorage.ts`
**Action**: Test the offline queue:
1. Go offline → submit leave request → enqueued in AsyncStorage
2. Come online → queue processes → leave request persisted in backend
3. Verify idempotency (replaying same action doesn't create duplicates)
**Note**: If idempotency keys are missing, add them to the queue action schema.

### Task 8: Verify Push Token Registration
**File**: `apps/mobile/src/services/notification.service.ts`
**Action**: Verify `registerForPushNotifications()` successfully:
1. Gets Expo push token
2. Sends to backend via `/notifications/register-device`
3. Backend persists the token
4. Push notifications from backend reach the device
**Note**: If the backend endpoint is a stub, implement it.

### Task 9: Remove Mock Data from All Priority Screens
**Files**: All 5 priority screen files
**Action**: Audit all files for any remaining hardcoded arrays, inline mock objects, or `const MOCK_*` declarations. Delete them all. Ensure error states show UI messages, not fallback mock data.

### Task 10: Run Mobile QA Regression
**Action**: Execute the 5 integration tests, 4 manual regression tests, and 3 release validation checks from the Test Strategy section. Document results.
**Tool**: Use Expo Go on physical device or simulator. For automated tests, use Detox if configured, otherwise manual testing is acceptable for Weeks 15-16.

---

## Architecture Notes

### Mobile → Web API Contract

Mobile screens should call the **same API routes** as the web dashboard. There is no need for mobile-specific business logic APIs. The flow is:

```
Mobile Screen → mobile service (api.service.ts) → same /api/v1/* routes → Prisma
```

The only mobile-specific route is `/api/mobile-app/notifications/*` which handles push notification management.

### Offline-First Design

The offline storage service uses a queue pattern:
```
Action enqueued (AsyncStorage) → Online? → Process → API call → Mark completed
                                → Offline? → Wait → Check connectivity → Retry
```

This is well-designed but needs idempotency keys to prevent duplicate operations on replay.

### Expo Push Notification Architecture

```
Mobile App → Expo SDK → Expo Push Service → FCM (Android) / APNS (iOS)
Backend → Expo Push API → Expo Push Service → Device
```

Expo acts as a proxy to FCM/APNS. This is acceptable for production and eliminates the need for direct Firebase SDK integration.

---

## Related Documents

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Mobile Integration Completion Guide](./GUIDE-MOBILE-INTEGRATION-COMPLETION.md)
4. [Export and Reporting Planning](./EXPORT-REPORTING-PLANNING.md)

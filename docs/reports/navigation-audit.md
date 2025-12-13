# Navigation Audit

> Reference: `packages/@aura/config/src/super-admin-menu.ts` and `apps/web/src/app/dashboard`

## Findings

- **Implemented but not surfaced in sidebar:** `/dashboard/ai`, `/dashboard/community`, `/dashboard/construction`, `/dashboard/energy`, `/dashboard/esg`, `/dashboard/facilities`, `/dashboard/financial-services`, `/dashboard/legal`, `/dashboard/localization`, `/dashboard/media`, `/dashboard/overview`, `/dashboard/projects`, `/dashboard/[...slug]` (catch-all).
- **Menu entries without a landing page:** `/dashboard/wellness`, `/dashboard/workflow-engine`, `/dashboard/workforce-planning`, `/dashboard/industry-solutions`, `/dashboard/industry/*`, `/dashboard/performance/competency-library` (sub-page exists at `/dashboard/performance/competency-assessment/*`, not at the configured path).
- **Path mismatches / duplicates:** Industry menu items point to `/dashboard/industry/<vertical>` but the implemented routes live at `/dashboard/<vertical>` (e.g., manufacturing, retail, healthcare). The `super-admin-menu` contains duplicate `engagement` entries. Finance points to `/dashboard/finance/budget` while no `/dashboard/finance/page.tsx` exists.
- **Admin navigation:** Menu anchors to `/dashboard/admin/master-data` but there is no `/dashboard/admin/page.tsx`; users cannot land on an admin overview.

## Recommendations
- Add landing pages for wellness, workflow-engine, workforce-planning, finance, and admin (or update menu links to the first valid subpage).
- Update industry menu links to the actual routes (`/dashboard/<vertical>`) or introduce the `/dashboard/industry/*` folder to match the menu.
- Surface the hidden but implemented modules (construction, energy, esg, facilities, localization, media, financial-services, ai, community, legal, overview, projects) or gate them behind feature flags to avoid orphan routes.
- Remove duplicate menu items and align performance competency links to `/dashboard/performance/competency-assessment`.
- Add smoke tests to verify that every sidebar link resolves to an existing route and returns 200.

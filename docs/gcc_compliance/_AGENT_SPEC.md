# Backlog Authoring Spec (read fully before writing)

You are writing part of the **AuraOS HRMS** product backlog — a GCC HR / Payroll / Immigration /
Workforce **compliance** platform. Stack to assume in all stories:

- Backend: **NestJS + TypeScript**, **PostgreSQL** (Prisma), REST APIs, an **event bus** (Kafka/RabbitMQ)
- Frontend: **React / Next.js** (employee self-service + manager + admin portals)
- Platform services: **configurable country rule engine**, **workflow/approval engine**,
  **RBAC**, **full audit trail**, **alerts/notifications**, **dashboards/reporting**, document store
- Domain = GCC: UAE, Saudi Arabia, Bahrain, Qatar, Oman, Kuwait. Authorities/platforms:
  MOHRE, ICP, GDRFA, MHRSD, Qiwa, Mudad, GOSI, GPSSA, LMRA, SIO, PAM, PACI; WPS/Mudad wage files;
  Emiratisation/Nitaqat/Bahrainization/Omanisation; EOSB/gratuity; visa/work-permit/Iqama/CPR/QID.

## Inputs

- `epics_master.json` (same folder): JSON array; each item = `{id,title,module,slug,chapter,sections[]}`.
  `sections[]` are the **handbook requirements you must cover**.

## Output

For EACH assigned epic id, write ONE file: `epics/{id}-{slug}.md` (use the slug from the JSON).
Do not print file bodies back; reply only with a one-line confirmation per epic.

## Module label map (pick the one matching the epic's module)

core-hr · recruitment · payroll · wps · time-attendance · leave · social-insurance ·
nationalization · immigration · benefits · welfare · hse · employee-relations · separation ·
eosb · analytics · policies · forms · platform · audit

## Personas

HR Admin · HR Manager · Payroll Officer · PRO / Immigration Officer · Compliance Officer ·
Line Manager · Employee (Self-Service) · Internal Auditor · Executive / Leadership · System Administrator

## EXACT file structure

```
# {id}: {title}

> **Source:** GCC HR Compliance Handbook — {chapter}
> **Module:** {module} · **Labels:** `epic`, `gcc-compliance`, `{module-label}`
> **Status:** Backlog · **Priority:** Must|Should

## Epic Goal
(2–4 sentences; concrete AuraOS product outcome.)

## Business Value
(compliance/penalty avoidance, automation, audit-readiness, employee experience.)

## Requirements Covered (handbook sections)
- (list EVERY entry of sections[] verbatim — traceability)

## Out of Scope
- (2–4 bullets)

## Dependencies
- (other EPIC-XX, or "—")

## Epic Definition of Done
- [ ] (5–7 checkboxes)

---

## User Stories

### {id}-S01 — {short title}
**Labels:** `user-story`, `{module-label}` · **Priority:** Must|Should|Could · **Estimate:** {1|2|3|5|8|13}
**As a** {persona}, **I want** {capability}, **so that** {benefit}.

**Description**
(2–5 sentences, specific AuraOS product detail.)

**Acceptance Criteria**
- [ ] Given … when … then … (4–8 specific, testable criteria; include validation rules,
      country-specific behaviour, permissions/RBAC, and audit-trail capture where relevant)

**Tasks**
- [ ] Backend: {entity/schema/migration with realistic field names}
- [ ] Backend: {API/service/rule-engine logic}
- [ ] Frontend: {screen/component}
- [ ] Rules/Config: {country rule / threshold / validation}
- [ ] Alerts/Workflow: {approval or notification, if relevant}
- [ ] Tests: {unit/integration/e2e}
(5–9 concrete tasks)

**Covers:** {exact section numbers from sections[]}
**Dependencies:** {ids or "—"}
```

## Rules

1. **Full coverage:** every section in `sections[]` MUST be covered by ≥1 story. One story may cover
   several closely-related sections. After the stories, the union of all `Covers:` must equal `sections[]`.
2. **Story count:** as many as needed for full coverage — typically 8–16 per epic (more for large epics).
3. **Be concrete & GCC-specific.** No generic CRUD filler. Use real thresholds & rules, e.g.
   "alert at 60/30/7 days before visa/permit expiry", "WPS file due within statutory window and
   flag salary delay > 15 days", "block payroll lock if any mandatory input missing",
   "maker-checker: preparer ≠ approver", "EOSB = 21 days/yr for first 5 yrs then 30 days/yr (UAE)".
4. For "Sample \_\_\_ Form/Template/Register/Certificate" sections → a story to build that form/register
   as a configurable digital form + export. For "KPIs/Dashboard" → analytics stories. For "Audit
   Checklist/Risk Matrix" → a configurable checklist/red-flag + risk-register story.
5. Keep IDs sequential per epic: S01, S02, …
6. Final reply: one line per epic — `{id}: N stories, all {len(sections)} sections covered`. <120 words total.

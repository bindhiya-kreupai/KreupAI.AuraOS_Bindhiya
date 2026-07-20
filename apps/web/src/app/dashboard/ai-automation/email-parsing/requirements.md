# Email Parsing — Requirements

**Feature URL**: `/dashboard/ai-automation/email-parsing`  
**Module**: AI & Automation → Process Automation  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; inference mostly mock / static)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give HR operations and shared-services teams a **human-in-the-loop email automation pipeline** that classifies inbound HR-related messages (leave, expense, support ticket), extracts structured fields with confidence scores, previews downstream actions in **dry-run** mode, and only commits domain records (leave request, expense claim, ticket) after explicit approval — with full audit trail.

---

## 2. Current State (as of this document)

| Area        | Reality                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI          | Split-pane dashboard: raw email textarea + extracted JSON panel with per-field confidence                                                                                |
| Data        | Page shows hardcoded `MOCK_EMAIL` (vendor **invoice** content) and `EXTRACTED_DATA` (invoice fields); API responses unrelated                                            |
| Client      | `emailParser.parseEmails()` → GET `/api/ai/email-parser` (returns **stats**, not email list); `processEmail()` → POST `/api/ai/email-parser/process` (**route missing**) |
| Primary API | `/api/ai/email-parser` — static JSON; POST `action: parse` **always** returns `type: LEAVE_REQUEST` regardless of input                                                  |
| Legacy API  | `/api/ai-automation/email-parsing` — regex stub + `AIRunRecord` (`runType: email_parse`); orphan (page does not call it)                                                 |
| LLM         | Not wired; no structured JSON extraction pipeline                                                                                                                        |
| Auth        | Target standard: `ai-automation:read` / `ai-automation:write` (legacy route has auth; `/api/ai/email-parser` has **none**)                                               |
| Persistence | `AIRunRecord` stub exists; no `EmailMessage` / parse-result entity; no link to Leave / Expense / Ticket modules                                                          |

---

## 3. Personas & Goals

| Persona                   | Goals                                                                    |
| ------------------------- | ------------------------------------------------------------------------ |
| HR Operations             | Triage inbox volume; auto-route leave/expense/ticket emails              |
| Shared Services / Finance | Extract invoice/expense fields accurately; reduce manual keying          |
| Employee (indirect)       | Faster acknowledgement when leave/expense submitted by email             |
| System Admin              | Configure allowed categories, confidence thresholds, IMAP/webhook intake |
| Auditor                   | Trace who approved each committed action and what was extracted          |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                 | Acceptance criteria                                                                                                                   |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped intake**    | Parsed emails and runs belong to session tenant only; no cross-tenant message IDs                                                     |
| M2  | **Category classification** | Each message assigned primary type: `LEAVE_REQUEST` \| `EXPENSE_REPORT` \| `SUPPORT_TICKET` \| `GENERAL` \| `UNKNOWN` with confidence |
| M3  | **Structured extraction**   | Type-specific JSON schema returned (dates, amounts, employee refs, ticket subject, etc.) with per-field confidence 0–1                |
| M4  | **Dry-run preview**         | Default POST path returns extraction + **suggested actions** without creating Leave / Expense / Ticket records                        |
| M5  | **Explicit commit**         | Separate `action: commit` (or dedicated route) creates domain records only after `ai-automation:write` + user confirmation            |
| M6  | **Human-in-the-loop**       | No auto-commit on low confidence; threshold configurable per tenant                                                                   |
| M7  | **Permission gates**        | `ai-automation:read` for list/view/dry-run; `ai-automation:write` for commit / batch reprocess                                        |
| M8  | **Persist parse runs**      | Each parse/commit writes `AIRunRecord` (`runType: email_parse` \| `email_parse_commit`) with input hash + output JSON                 |
| M9  | **Bilingual API errors**    | Error payloads include `error` + `errorAr`                                                                                            |
| M10 | **No fabricated employees** | Extracted employee must resolve to real `Employee` or flag `employeeUnresolved: true`; never invent IDs in production                 |
| M11 | **Audit on commit**         | Leave/expense/ticket creation emits audit event referencing `runId` and approver userId                                               |

### 4.2 Essential

| ID  | Requirement                   | Acceptance criteria                                                                                                                             |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | **Multi-category extractors** | Distinct schemas for leave (type, start/end, reason), expense (vendor, amount, currency, receipt ref), ticket (category, priority, description) |
| E2  | **Inbox queue UI**            | List pending emails with status: `PENDING` / `PARSED` / `COMMITTED` / `REJECTED` / `FAILED`                                                     |
| E3  | **Batch upload / IMAP**       | Support paste, `.eml` upload, and optional mailbox sync (Phase 2)                                                                               |
| E4  | **Suggested actions panel**   | Show mapped workflow actions (e.g. `CREATE_LEAVE_REQUEST`) with params pre-filled from extraction                                               |
| E5  | **Confidence UX**             | Highlight fields below threshold; block commit until reviewed or overridden                                                                     |
| E6  | **Re-parse**                  | Allow re-run extraction after template/rule change without duplicating commits                                                                  |
| E7  | **Stats dashboard**           | GET summary: processed count by category, avg confidence, avg processing time — from `AIRunRecord`, not hardcoded                               |
| E8  | **LLM JSON extract**          | Server-side LLM returns validated JSON per schema; regex/heuristic fallback when LLM unavailable                                                |
| E9  | **Routing hints**             | Suggest department/assignee from category + tenant config                                                                                       |

### 4.3 Good-to-Have

| ID  | Requirement                 | Acceptance criteria                                                                                |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| G1  | **Auto-reply draft**        | Optional `respond` action generates acknowledgement email (draft only until sent via comms module) |
| G2  | **Attachment OCR**          | Extract from PDF/image receipts linked to expense emails                                           |
| G3  | **Duplicate detection**     | Flag if same sender/subject/amount parsed within N days                                            |
| G4  | **Workflow Engine handoff** | High-risk or multi-step cases spawn Workflow Engine instance instead of direct commit              |
| G5  | **Language detection**      | Support Arabic/English mixed content; bilingual field labels in UI                                 |
| G6  | **Sender allowlist**        | Restrict auto-processing to corporate domains                                                      |
| G7  | **Export**                  | CSV of parsed extractions for compliance review                                                    |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                                                   |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| N1  | Performance   | Single-email dry-run &lt; 5s (LLM path); batch queue processes asynchronously                                 |
| N2  | Scalability   | Queue 1k+ emails/day per tenant via background job + poll status                                              |
| N3  | Security      | All LLM calls server-side; strip bank/PII from logs; API keys never in browser                                |
| N4  | Privacy       | Store email body encrypted or hashed where policy requires; retention configurable                            |
| N5  | Reliability   | LLM failure → deterministic fallback (`email-parsing-fallback.ts`); never return invoice mock for leave email |
| N6  | Observability | Log runId, tenantId, category, durationMs; no full email body in unstructured logs                            |
| N7  | Compliance    | Treat expense/leave extraction as auditable HR processing; human approval before commit                       |

---

## 6. Data Inputs (feature sources)

| Input               | Sources (examples)                                                    |
| ------------------- | --------------------------------------------------------------------- |
| Raw message         | IMAP/webhook, manual paste, `.eml` upload                             |
| Employee resolution | `Employee` by email, employee number, or signature parsing            |
| Leave context       | Active leave policies, balances (`LeaveBalance`) for validation hints |
| Expense context     | Expense categories, approval limits, vendor master (future)           |
| Ticket context      | HR case categories, SLA rules (future)                                |
| Tenant config       | Allowed categories, confidence thresholds, routing rules              |

Initial **v1** may use paste/upload + employee email lookup; mailbox sync is Phase 2.

---

## 7. API Surface (target)

| Method | Path                                | Purpose                                                     |
| ------ | ----------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/ai/email-parser`              | Queue list + aggregate stats (session tenant)               |
| GET    | `/api/ai/email-parser/[id]`         | Single parse result + suggested actions                     |
| POST   | `/api/ai/email-parser`              | `action: classify \| extract \| dry-run \| commit \| batch` |
| GET    | `/api/ai/email-parser/runs/[runId]` | Async batch status                                          |

**Deprecation note**: Converge `/api/ai-automation/email-parsing` into `/api/ai/email-parser` (keep `AIRunRecord` writes). Implement missing `/email-parser/process` or remove client reference.

**Request body (dry-run example)**:

```json
{
  "action": "dry-run",
  "email": { "subject": "...", "body": "...", "from": "user@company.com" }
}
```

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. Raw content panel (selected queue item or upload)
2. Extracted data panel with per-field confidence badges
3. Category badge + suggested actions list
4. **Dry-run → Review → Commit** flow (replace fake progress bar)
5. Batch upload / refresh queue

UX constraints (product):

- Remove mismatch: invoice mock in UI vs leave response from API
- Loading, empty queue, and error states
- Block commit when required fields missing or employee unresolved
- Never show static 96% confidence in production mode

---

## 9. Out of Scope

- Full enterprise email client replacement (Outlook/Gmail UI)
- Autonomous commit without human approval (v1)
- Building OCR vendor integrations beyond basic attachment text extract (Phase 2+)
- Duplicating Workflow Engine execution runtime (hand off only)

---

## 10. Success Metrics

| Metric                       | Target                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| Mock dependency on page load | 0 hardcoded `MOCK_EMAIL` / `EXTRACTED_DATA` in production path  |
| Classification accuracy      | ≥ 90% on labeled tenant sample set (leave vs expense vs ticket) |
| Field extraction F1          | ≥ 85% on required fields per category                           |
| Commit audit coverage        | 100% of commits have `AIRunRecord` + domain audit event         |
| API auth coverage            | 100% routes use session tenant + `ai-automation:*`              |

---

## 11. Traceability

| Product statement                                              | Requirement IDs |
| -------------------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “Email Parsing — Intelligent email extraction” | M2–M5, E1, E8   |
| GUIDE Phase 4 Process Automation                               | M8, E2, E6, N5  |
| GUIDE: structured extraction pipeline (reuse shared AI core)   | E8, M4–M5       |

---

## 12. Open Decisions

1. Intake model: store raw emails in new table vs ephemeral parse-only + `AIRunRecord` output.
2. Expense module target: internal Expense claim API vs Workflow Engine payload only.
3. Whether ticket category maps to existing HR case management or generic task queue.
4. Single POST with `action` enum vs RESTful sub-routes (`/classify`, `/commit`).
5. Minimum confidence for showing auto-suggested commit button (default 0.85?).

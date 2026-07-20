# Job Matching — Requirements

**Feature URL**: `/dashboard/ai-automation/job-matching`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; hardcoded Alex Johnson; API/UI contract mismatch)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Help HR and talent teams **match people to open roles** — internal mobility (employee → requisition) and external recruitment (candidate → job) — with **explainable fit scores**, strengths/gaps, and recommendations grounded in skills and experience, reusing resume-screening scoring concepts instead of demo profiles like “Alex Johnson.”

---

## 2. Current State (as of this document)

| Area             | Reality                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI               | “Internal Mobility Matcher” with hardcoded **Alex Johnson**, static skills; match cards expect `role`, `match_score`, `strengths`, `gaps`, `action` |
| Client           | `jobMatching.getMatches()` → GET `/api/ai/job-matching` (returns summary stats only — **no matches array**)                                         |
| Mock API         | `/api/ai/job-matching` POST — fictional Jane Doe/John Smith; fields `matchScore`, `title`, `reasons`, `gaps` (0–1 scale)                            |
| Orphan API       | `/api/ai-automation/job-matching` — auth + skill-overlap against `Candidate` + `JobPosting`; returns `score` not `match_score`; no strengths/gaps   |
| Services drift   | `JobMatchingService` in `services.ts` calls `/ai-automation/job-matching/{employeeId}` — unused by page                                             |
| Resume screening | Mature 4-layer stack (`resume-screening-*`) with `overallScore`, skill/experience percentages — **should inform matching**                          |
| Auth             | Orphan route has permissions; `/api/ai/job-matching` has none                                                                                       |

### Contract mismatch (must fix)

| UI field                | Mock API           | Orphan API      |
| ----------------------- | ------------------ | --------------- |
| `match_score` (0–100)   | `matchScore` (0–1) | `score` (0–100) |
| `role`                  | `title`            | `jobTitle`      |
| `strengths`             | `reasons`          | _(missing)_     |
| `gaps`                  | `gaps`             | _(missing)_     |
| `action: 'Recommended'` | _(missing)_        | _(missing)_     |

---

## 3. Personas & Goals

| Persona                | Goals                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| HR / Internal Mobility | Find employees suited to open reqs; reduce attrition via growth paths |
| Recruiter              | Rank candidates for a requisition quickly                             |
| Hiring Manager         | Compare side-by-side fit with evidence                                |
| Employee               | Discover eligible internal roles (self-service phase 2)               |
| System Admin           | Tune weights, audit match runs, fairness review                       |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                | Acceptance criteria                                                                                                  |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| M1  | **Unified match contract** | All APIs return `matchScore` 0–100 (integer) plus alias documented; UI uses single shape via `job-matching-types.ts` |
| M2  | **Dual entity modes**      | Support `employeeId` (internal mobility) and `candidateId` (external) with same response envelope                    |
| M3  | **Tenant-scoped jobs**     | Only tenant `JobPosting` / `JobRequisition` with open/active status                                                  |
| M4  | **Explainable output**     | Each match includes `strengths[]`, `gaps[]`, `primaryFactor` or top reason                                           |
| M5  | **Skill overlap core**     | v1 deterministic overlap (required skills) — extend with resume-screening weights                                    |
| M6  | **Permission gates**       | `ai-automation:read` for match/list; `ai-automation:write` for batch recompute / export                              |
| M7  | **Persist match runs**     | `AIRunRecord` (`runType: job_matching`) with counts + top match ids                                                  |
| M8  | **Bilingual API errors**   | Error payloads include `error` + `errorAr`                                                                           |
| M9  | **No fabricated people**   | No Alex Johnson / Jane Doe in production API                                                                         |
| M10 | **Bias awareness**         | Flag when match leans on non-job-related proxies (align with resume-screening bias block)                            |

### 4.2 Essential

| ID  | Requirement                 | Acceptance criteria                                                             |
| --- | --------------------------- | ------------------------------------------------------------------------------- |
| E1  | **Subject picker**          | UI selects employee or candidate from tenant directory                          |
| E2  | **Job context**             | Show department, location, employment type on match cards                       |
| E3  | **Top pick badge**          | Highest score above threshold gets `action: 'Recommended'`                      |
| E4  | **Match for job (reverse)** | POST with `jobId` returns ranked candidates/employees                           |
| E5  | **Reuse screening scores**  | When resume screening exists for candidate+job, blend or surface `overallScore` |
| E6  | **Filters**                 | Department, location, remote, min score                                         |
| E7  | **Compare side-by-side**    | Wire CTA to comparison view (two roles or two candidates)                       |
| E8  | **Batch match**             | Rank all active employees against a req (async for large tenants)               |
| E9  | **Audit**                   | Match batch and export emit audit events                                        |

### 4.3 Good-to-Have

| ID  | Requirement                      | Acceptance criteria                                           |
| --- | -------------------------------- | ------------------------------------------------------------- |
| G1  | **LLM narrative**                | Optional “why this match” paragraph — scores stay rules-based |
| G2  | **Career goal input**            | Employee stated goals influence ranking                       |
| G3  | **Succession link**              | High-potential employees ↔ critical reqs                      |
| G4  | **Employee self-service portal** | Restricted view of own matches                                |
| G5  | **Export**                       | CSV of top N matches                                          |
| G6  | **Feedback loop**                | Mark match accepted/rejected → future tuning                  |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                           |
| --- | ------------- | --------------------------------------------------------------------- |
| N1  | Performance   | Single-subject match &lt; 2s for ≤ 200 open jobs                      |
| N2  | Scalability   | Batch via background job; poll run status                             |
| N3  | Security      | LLM optional server-side only                                         |
| N4  | Privacy       | Employee career intent sensitive — RBAC enforced                      |
| N5  | Reliability   | Missing skills data → lower confidence flag, not fabricated strengths |
| N6  | Observability | Log runId, subjectId, matchCount                                      |
| N7  | Fairness      | Document scoring weights; bias flags reviewable                       |

---

## 6. Data Inputs (feature sources)

| Feature family         | Sources                                                                          |
| ---------------------- | -------------------------------------------------------------------------------- |
| Person skills          | `Employee` competencies, `Candidate.skills`, resume screening `extracted.skills` |
| Job requirements       | `JobPosting`, `JobRequisition.requiredSkills`, screening job options             |
| Experience             | Tenure, screening `yearsExperience`, job min experience                          |
| Performance / mobility | Optional performance rating, internal mobility preferences                       |
| Prior screening        | Resume screening results for same candidate                                      |

Initial **v1** uses orphan skill-overlap + resume-screening percentage helpers; LLM optional in v2.

---

## 7. API Surface (target)

| Method | Path                                  | Purpose                                                           |
| ------ | ------------------------------------- | ----------------------------------------------------------------- |
| GET    | `/api/ai/job-matching`                | Summary stats + optional `?employeeId=` / `?candidateId=` matches |
| POST   | `/api/ai/job-matching`                | `action: match \| match_for_job \| analyze \| batch`              |
| GET    | `/api/ai/job-matching/job/[jobId]`    | Ranked candidates for job                                         |
| GET    | `/api/ai/job-matching/candidate/[id]` | Ranked jobs for candidate                                         |
| GET    | `/api/ai/job-matching/employee/[id]`  | Ranked jobs for employee (internal mobility)                      |
| GET    | `/api/ai/job-matching/runs/[runId]`   | Batch status                                                      |

**Deprecation note**: Merge `/api/ai-automation/job-matching` into `/api/ai/job-matching`. Fix client methods to match implemented routes.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. Profile card: selected employee/candidate, skills, tenure/career goal
2. Open opportunities list: role title, dept, location, **matchScore%**, strengths/gaps
3. Top Pick badge when `action === 'Recommended'`
4. Compare side-by-side CTA (wire or hide until ready)

UX constraints:

- Loading / empty (no open jobs / no subject selected)
- Error banner on API failure — no fallback to Alex Johnson
- Color thresholds on score (&gt;90 green, &gt;70 amber, else rose) use unified 0–100

---

## 9. Out of Scope

- Autonomous job transfers or offer letters without workflow approval
- Full duplicate of **Resume Screening** UI — consume its scores, don’t rebuild upload flow here
- External job board matching (see Job Boards integration)
- ML embedding model training platform v1

---

## 10. Success Metrics

| Metric                                            | Target                                              |
| ------------------------------------------------- | --------------------------------------------------- |
| Contract mismatch (`match_score` vs `matchScore`) | 0 after types enforced                              |
| Hardcoded profile on page                         | 0 in production                                     |
| Match explainability                              | 100% matches have ≥1 strength or gap                |
| Screening reuse                                   | When screening exists, referenced in match metadata |
| Internal mobility placements                      | Track accepted matches → transfer requests          |

---

## 11. Traceability

| Product statement                                | Requirement IDs |
| ------------------------------------------------ | --------------- |
| GUIDE Phase 3: Job Matching                      | M1–M5, E4–E5    |
| FEATURES-GUIDE: Internal mobility / job matching | E1, E3, E7      |
| Resume Screening completion                      | M5, E5          |

---

## 12. Open Decisions

1. Primary subject for this page: internal **Employee** only vs toggle Employee/Candidate.
2. Authoritative job entity: `JobPosting` vs `JobRequisition` (may union both).
3. Normalization: store `matchScore` as 0–100 everywhere vs 0–1 in DB JSON.
4. Whether `JobMatchingService` (`services.ts`) is deleted or aliased to new client.

# Job Matching — Architecture

**Feature URL**: `/dashboard/ai-automation/job-matching`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Job Matching is a **non-chat scoring feature** that ranks **subject ↔ job** pairs (employee or candidate against open requisitions). Per the AI Automation guide:

1. Authenticate + resolve tenant
2. Retrieve skills/requirements from domain tables
3. Run similarity scoring (rules v1; optional LLM narrative)
4. Persist run metadata on `AIRunRecord`
5. Serve UI from API — **never hardcoded Alex Johnson**

**Reuse resume-screening concepts**: skill overlap percentages, experience/education bands, bias flags, and structured strengths/gaps from `lib/ai/resume-screening-*` — matching is the symmetric “who fits this job” problem after screening’s “does this resume fit.”

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR / TA User │ ─────────────► │ AuraOS Web (Next.js)                │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  job-matching                       │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/job-matching/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Job Matching Engine                 │
                                │ (skill overlap + screening blend)   │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Employee /       │    │ Optional LLM    │
              │ JobPosting,    │    │ Candidate,       │    │ (narrative only)│
              │ AIRunRecord    │    │ Resume screening │    │                 │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer                | Location                                                      | Responsibility                              |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| Presentation         | `.../job-matching/page.tsx`                                   | Profile + match cards                       |
| Client               | `lib/services/ai-automation-client.ts` → `jobMatching`        | Typed fetch — fix GET to return `matches[]` |
| API                  | `app/api/ai/job-matching/**`                                  | Auth, match orchestration                   |
| Legacy API           | `app/api/ai-automation/job-matching/route.ts`                 | Skill overlap POST — merge                  |
| Legacy service class | `dashboard/ai-automation/services.ts` → `JobMatchingService`  | Deprecate or align                          |
| Resume screening     | `lib/ai/resume-screening-*`                                   | Shared scoring helpers                      |
| Target AI lib        | `lib/ai/job-matching-*`                                       | 4-layer pattern                             |
| Persistence          | `AIRunRecord`; optional future `Prediction`-style match cache | Run audit                                   |
| Shared auth          | `withEnhancedAuth` + `ai-automation:*`                        | Tenant + RBAC                               |

### Target 4-layer layout

| File                               | Role                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `lib/ai/job-matching-types.ts`     | **Canonical contract** — fixes `matchScore`, `role`, `strengths`, `gaps` |
| `lib/ai/job-matching-rules.ts`     | Weights, thresholds, Recommended badge cutover, bias rules               |
| `lib/ai/job-matching-retrieval.ts` | Employee/candidate skills, open jobs, prior screening results            |
| `lib/ai/job-matching-ai.ts`        | Orchestration: score → enrich → persist run → optional LLM summary       |
| `lib/ai/job-matching-fallback.ts`  | Pure skill-overlap path (orphan route logic) when AI off                 |

---

## 4. Match request lifecycle

```text
Client (page)
   │  GET /api/ai/job-matching?employeeId=...
   ▼
Auth (session → tenantId, permissions)
   │
   ├── retrieval: subject skills, open jobs, screening artifacts
   ├── rules: overlap + weighted score → strengths/gaps
   ├── optional: blend resume screening overallScore when present
   ├── persist: AIRunRecord (job_matching)
   └── respond: { matches: JobMatch[], stats }

Reverse path (job → candidates):
   POST { action: match_for_job, jobId }
```

---

## 5. Data model

### 5.1 Canonical API type (fixes contract drift)

```ts
type JobMatch = {
  jobId: string;
  role: string; // job title — UI field name
  department: string;
  location?: string;
  remote?: boolean;
  matchScore: number; // 0-100 INTEGER — UI displays as %
  skillMatch?: number; // 0-100
  experienceMatch?: number;
  strengths: string[];
  gaps: string[];
  action?: 'Recommended'; // top pick if matchScore >= threshold
  screeningId?: string; // link when resume screening exists
  biasFlagged?: boolean;
  biasReasons?: string[];
};
```

**Normalization rule**: internally compute `0–1` floats if convenient; **always** emit `matchScore: Math.round(float * 100)` at API boundary. UI may bind `match.matchScore` (remove snake_case `match_score` in TS types).

### 5.2 Scoring v1 (deterministic)

From orphan `/api/ai-automation/job-matching`:

```text
overlap = |requiredSkills ∩ subjectSkills|
baseScore = required.length ? overlap / required.length : 0
```

Extended with resume-screening weights:

| Component                | Weight (v1) |
| ------------------------ | ----------- |
| Required skill overlap   | 50%         |
| Preferred skills         | 15%         |
| Experience band fit      | 20%         |
| Education / level        | 10%         |
| Screening prior (if any) | 5% blend    |

### 5.3 Strengths / gaps generation (rules)

- **Strength**: matched required skill, experience ≥ job minimum, screening `matchedSkills`
- **Gap**: missing required skill, experience shortfall, screening `missingCriticalSkills`
- **Recommended**: `matchScore >= 85` and no critical gap (tunable in `job-matching-rules.ts`)

### 5.4 AIRunRecord

```json
{
  "runType": "job_matching",
  "inputContext": { "employeeId": "...", "mode": "internal" },
  "output": { "count": 12, "topJobId": "...", "avgScore": 72 }
}
```

---

## 6. Integration with resume screening

```text
if screening = findScreening(candidateId, jobId):
  matchScore = round(0.7 * rulesScore + 0.3 * screening.overallScore / 100)
  strengths += screening.strengths (dedupe)
  gaps += screening.missingCriticalSkills
else:
  matchScore = rulesScore only
```

Share normalization helpers from `resume-screening-rules.ts` where possible (skill tokenization, case folding).

---

## 7. API design

### 7.1 GET `/api/ai/job-matching`

```json
{
  "success": true,
  "data": {
    "stats": {
      "activeJobs": 15,
      "matchesFound": 8,
      "avgMatchScore": 72
    },
    "matches": [
      {
        "jobId": "uuid",
        "role": "Technical Lead",
        "department": "IT",
        "location": "Remote",
        "matchScore": 88,
        "strengths": ["React", "Mentoring experience"],
        "gaps": ["Product management certification"],
        "action": "Recommended"
      }
    ]
  }
}
```

Requires `employeeId`, `candidateId`, or `jobId` query — no matches without subject.

### 7.2 POST actions

| `action`        | Behavior                     |
| --------------- | ---------------------------- |
| `match`         | Subject → jobs               |
| `match_for_job` | Job → subjects               |
| `analyze`       | Org-level skill gap insights |
| `batch`         | Async recompute              |

### 7.3 Auth & tenancy

```text
withEnhancedAuth
  → tenantId from session
  → JobPosting/Requisition queries tenant-scoped
  → employee/candidate must belong to tenant
```

Add bilingual errors to current mock route.

### 7.4 Client wiring

```text
jobMatching.getMatches(employeeId)
  → GET /api/ai/job-matching?employeeId=

jobMatching.matchCandidates(jobId)
  → GET /api/ai/job-matching/job/[jobId]

jobMatching.matchJobs(candidateId)
  → GET /api/ai/job-matching/candidate/[id]
```

Update `page.tsx` to use `matchScore`, `role`, `strengths`, `gaps` from typed response.

---

## 8. UI composition

```text
JobMatchingPage
├── Subject selector (replaces Alex Johnson card)
├── Profile summary (skills, tenure, career goal from API)
└── Match cards
      ├── role, dept, matchScore%
      ├── strengths / gaps columns
      ├── Top Pick badge ← action Recommended
      └── Compare CTA
```

---

## 9. Security & compliance controls

| Control               | Implementation                           |
| --------------------- | ---------------------------------------- |
| RBAC                  | `ai-automation:read` / `:write`          |
| Tenant isolation      | All queries include tenant scope         |
| Fairness              | Bias flags from shared screening rules   |
| Manager view (future) | Direct-report only for employee subjects |
| Audit                 | Batch match logged                       |

---

## 10. Performance strategy

1. **Single subject**: Score jobs in memory; cap display at top 20.
2. **Batch**: Queue job; store progress on `AIRunRecord`.
3. **Cache**: Optional Redis `job-match:{tenantId}:{subjectId}` short TTL.

---

## 11. Failure modes

| Failure                   | Behavior                                         |
| ------------------------- | ------------------------------------------------ |
| Subject not found         | 404 bilingual                                    |
| No open jobs              | 200 + empty matches + message                    |
| Missing skills on subject | Score with partial data; `dataCompleteness` flag |
| Screening artifact stale  | Use rules-only with note                         |

---

## 12. Migration / convergence plan

| Step | Work                                                      |
| ---- | --------------------------------------------------------- |
| 1    | Add `job-matching-types.ts` with canonical contract       |
| 2    | Port orphan overlap logic into `job-matching-fallback.ts` |
| 3    | Harden `/api/ai/job-matching` GET to return `matches[]`   |
| 4    | Implement employee + candidate retrieval paths            |
| 5    | Wire screening blend + strengths/gaps                     |
| 6    | Replace page hardcoding; fix field names                  |
| 7    | Deprecate mock POST bodies / merge ai-automation route    |

---

## 13. Testing strategy

| Layer       | Cases                                                     |
| ----------- | --------------------------------------------------------- |
| Unit        | Score normalization, Recommended threshold, gap detection |
| Integration | Tenant isolation, AIRunRecord persist, screening blend    |
| Contract    | UI type matches API — no snake_case drift                 |
| UI          | No Alex Johnson; empty/error states                       |

---

## 14. Key files (today)

| Path                                          | Role                                          |
| --------------------------------------------- | --------------------------------------------- |
| `.../job-matching/page.tsx`                   | UI (hardcoded Alex; `match_score` snake_case) |
| `lib/services/ai-automation-client.ts`        | `jobMatching` client                          |
| `app/api/ai/job-matching/route.ts`            | Mock API (wrong shape)                        |
| `app/api/ai-automation/job-matching/route.ts` | Real overlap (incomplete shape)               |
| `lib/ai/resume-screening-*.ts`                | Reference scoring pattern                     |
| `dashboard/ai-automation/services.ts`         | Orphan `JobMatchingService`                   |

---

## 15. Decision log

| Decision        | Choice                            | Rationale                           |
| --------------- | --------------------------------- | ----------------------------------- |
| Primary scoring | Rules / skill overlap v1          | Orphan route + GUIDE; fast at scale |
| Contract        | `matchScore` 0–100, `role` string | Fixes UI/API drift                  |
| Screening       | Blend when available              | Avoid duplicate LLM work            |
| LLM             | Optional narrative only           | Scores must stay auditable          |
| API base        | `/api/ai/job-matching`            | Recruitment AI consistency          |

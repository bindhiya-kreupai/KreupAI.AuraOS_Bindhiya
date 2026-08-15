# L&D Recommendation — Architecture

**Feature URL**: `/dashboard/ai-automation/l-d-recommendation`  
**Module**: AI & Automation → AI Insights  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

L&D Recommendation is a **hybrid rules + optional LLM ranking feature**. Per the AI Automation guide (AI Insights / Phase 5):

1. Authenticate + resolve tenant + employee context
2. Retrieve skill gaps from competency/performance sources
3. Match gaps to catalog (`Course`, `LearningPath`) via deterministic rules
4. Optionally LLM re-rank and refine “why” explanations (structured JSON)
5. Return ranked recommendations; enroll via L&D domain APIs on user action

Not a predictive `Prediction` feature — outputs are actionable catalog links, not probability scores.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ Employee /   │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│ HR User      │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  l-d-recommendation                 │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/learning/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ L&D Recommendation API            │
                                │ (rules match + optional LLM rank)   │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ L&D + Competency │    │ Optional LLM    │
              │ Course, Path,  │    │ assessments, job │    │ via llm-client  │
              │ Enrollment,    │    │ roles, perf plans│    │ (rank + why)    │
              │ AIRunRecord    │    │                  │    │                 │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                                    | Responsibility                                  |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/l-d-recommendation/page.tsx`      | Hero, gaps, course grid, enroll                 |
| ESS variant   | `apps/web/src/app/dashboard/(modules)/ai-learning-recommendations/page.tsx` | `AILearningRecommendations` (consolidate later) |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `ldRecommendation`    | Fetch gaps, courses, enroll                     |
| API           | `apps/web/src/app/api/ai/learning/**`                                       | Auth, recommend, enroll orchestration           |
| L&D domain    | `lib/services/learningService.ts`, `/api/v1/learning/*`                     | Catalog, enrollments, progress                  |
| Competency    | Performance/competency gap modules                                          | Skill levels                                    |
| Target AI lib | `apps/web/src/lib/ai/ld-recommendation-*` (to introduce)                    | 4-layer pattern                                 |
| Shared auth   | `canReadAiAutomation` + `learning:enroll`                                   | Tenant + RBAC                                   |

### Target 4-layer layout (recommended)

| File                                    | Role                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `lib/ai/ld-recommendation-types.ts`     | DTOs: skill gap, course recommendation, enroll request/result           |
| `lib/ai/ld-recommendation-rules.ts`     | Skill→tag mapping weights, min relevance threshold, prompt for LLM rank |
| `lib/ai/ld-recommendation-retrieval.ts` | Employee gaps, catalog search, existing enrollments, role targets       |
| `lib/ai/ld-recommendation-ai.ts`        | Orchestration: rules match → optional LLM rank → format response        |
| `lib/ai/ld-recommendation-fallback.ts`  | Rules-only ranking + template reasons when LLM off/down                 |

---

## 4. Recommendation request lifecycle

```text
Client (page)
   │  GET /api/ai/learning?employeeId=self
   │  GET /api/ai/learning/skill-gaps
   ▼
Auth (session → tenantId, employeeId, permissions)
   │
   ├─ retrieval: skill gaps + role targets + catalog + enrollments
   ├─ rules: tag overlap scoring → candidate courses (top 20)
   ├─ optional LLM: re-rank top 10 + refine reason strings (JSON)
   ├─ persist: AIRunRecord (runType: ld_recommendation) [optional cache]
   └─ respond: gaps + courses[] + hero summary

Enroll path (POST enroll):
   ├─ authorize learning:enroll
   ├─ domain: CourseEnrollment / LearningPathEnrollment create
   ├─ audit event
   └─ respond: enrollmentId, status
```

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`Course`** / **`CourseEnrollment`** — primary enroll target.

**`LearningPath`** / **`LearningPathEnrollment`** — multi-course paths.

**`AIRunRecord`** (optional)

- `runType`: `ld_recommendation`
- `inputContext`: `{ employeeId, gapCount, catalogSize }`
- `output`: `{ gaps[], courseIds[], provider }`

### 5.2 Logical recommendation payload (API `output` / JSON)

```ts
type SkillGap = {
  skill: string;
  skillId?: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  source: 'ASSESSMENT' | 'ROLE' | 'PERFORMANCE' | 'MANAGER';
};

type CourseRecommendation = {
  id: string;
  courseId?: string;
  pathId?: string;
  type: 'COURSE' | 'CERTIFICATION' | 'WORKSHOP' | 'PATH';
  title: string;
  provider: string;
  duration: string;
  rating: number;
  image?: string;
  relevance: number; // 0-1
  skills: string[];
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

type LDRecommendationResult = {
  employeeId: string;
  skillGaps: SkillGap[];
  courses: CourseRecommendation[];
  hero: {
    topGap: string;
    promotionReadiness?: number;
    headline: string;
  };
  learningPath?: {
    totalCourses: number;
    estimatedDuration: string;
    nextMilestone: string;
  };
  provider: 'rules' | 'groq' | 'openai' | 'gemini';
  generatedAt: string;
};
```

Align UI course card fields (`image` as Tailwind class today → migrate to URL with fallback).

---

## 6. Matching architecture (v1)

### 6.1 Rules-first scoring (`ld-recommendation-rules.ts`)

For each published catalog item:

1. **Tag overlap**: intersection(catalog.skills, gap.skillNames)
2. **Gap weight**: sum(gap.gap × priority)
3. **Penalty**: already enrolled in-progress (−∞) or completed (−)
4. **Boost**: required for role, compliance mandatory, manager assigned

Normalize to `relevance` 0–1. Take top 20 for LLM input.

### 6.2 Optional LLM ranking (`ld-recommendation-ai.ts`)

When `isLLMConfigured()` and tenant flag enabled:

- Input: employee role, top gaps (no excessive PII), candidate course summaries
- Output JSON: ordered `courseIds[]` + `reason` per id
- Validate ids ⊆ candidate set; else fall back to rules order

LLM **must not** invent courses not in candidate list (enforce in prompt + validator).

### 6.3 Fallback (`ld-recommendation-fallback.ts`)

- Sort by rules score only
- Template reasons: `"Closes gap in {skill} (level {current}→{target})"`
- Popular courses for role when no gaps detected

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/learning?employeeId={id}`**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-uuid",
        "courseId": "course-uuid",
        "title": "Cloud Architecture Foundations",
        "provider": "Internal LMS",
        "duration": "6 hours",
        "rating": 4.7,
        "image": "/images/courses/cloud.jpg",
        "relevance": 0.92,
        "reason": "Closes gap in Cloud Architecture (2→4)",
        "priority": "HIGH"
      }
    ],
    "hero": {
      "topGap": "Cloud Architecture",
      "promotionReadiness": 0.72,
      "headline": "Upskill for your next promotion"
    }
  }
}
```

**GET `/api/ai/learning/skill-gaps?employeeId={id}`**

```json
{
  "success": true,
  "data": {
    "gaps": [{ "skill": "Cloud Architecture", "currentLevel": 2, "targetLevel": 4, "gap": 2 }]
  }
}
```

**POST `/api/ai/learning`**

| `action`    | Behavior                              |
| ----------- | ------------------------------------- |
| `recommend` | Full recompute; optional `employeeId` |
| `analyze`   | Skill profile only                    |
| `enroll`    | Create enrollment                     |
| `refresh`   | Invalidate cache / new `AIRunRecord`  |

**POST `/api/ai/learning/enroll`**

```json
{ "courseId": "uuid", "pathId": "optional-uuid" }
```

### 7.2 Auth & tenancy

```text
authenticateWithPermissions(request)
  → tenantId from session
  → employeeId: self or authorized report
  → canReadAiAutomation for GET
  → learning:enroll for enroll POST
```

Current `/api/ai/learning` has **no auth** and static body — must change.

### 7.3 Client wiring

```text
page.tsx
  → ldRecommendation.getRecommendations()
  → ldRecommendation.getSkillGaps()      // implement route
  → ldRecommendation.enrollCourse(id)    // implement route; bind UI
```

Fix GET vs POST mismatch: client uses GET for recommendations; static route returns stats on GET — **contract drift**.

---

## 8. UI composition

```text
LDRecommendationsPage
├── Hero (top gap, readiness, CTA → top course)
├── Skill Gaps panel (list / bars)          ← newly visible
└── Top Picks grid
       ├── course card (image, meta, reason)
       └── Enroll button → handleEnroll
```

Styling: retain card grid; add gaps section above grid.

---

## 9. Security & compliance controls

| Control          | Implementation                             |
| ---------------- | ------------------------------------------ |
| RBAC             | `ai-automation:read`, `learning:enroll`    |
| Tenant isolation | Catalog + employee scoped                  |
| Manager view     | Direct reports only                        |
| LLM grounding    | Candidate course list only; no fabrication |
| Audit            | Enrollment events                          |
| Secrets          | Server-side LLM only                       |

---

## 10. Performance strategy

1. **Rules-only path**: Target &lt; 1s for catalog ≤ 500 courses (indexed tag search).
2. **LLM path**: Cap candidates at 20; cache recommendation `AIRunRecord` 24h TTL.
3. **Pagination**: Course grid client-side slice if &gt; 12 results.
4. **Dedup**: Exclude enrolled courses in retrieval layer.

---

## 11. Failure modes

| Failure          | Behavior                            |
| ---------------- | ----------------------------------- |
| Unauthenticated  | 401 bilingual                       |
| Forbidden enroll | 403                                 |
| No skill data    | Baseline onboarding recommendations |
| Empty catalog    | Empty state + admin message         |
| LLM invalid JSON | Fall back to rules ranking          |
| Enroll conflict  | 409 if already enrolled             |

---

## 12. Migration / convergence plan

| Step | Work                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 1    | Introduce `lib/ai/ld-recommendation-*`                                         |
| 2    | Fix API contract: GET returns courses+gaps; implement `/skill-gaps`, `/enroll` |
| 3    | Wire retrieval to `Course` + competency gaps                                   |
| 4    | Replace static hero; render skill gaps panel                                   |
| 5    | Bind enroll buttons; proxy to L&D enrollment service                           |
| 6    | Add optional LLM ranking behind feature flag                                   |
| 7    | Consolidate with `AILearningRecommendations` ESS component                     |
| 8    | Align with `/api/v1/learning/paths/recommend` shared scoring util              |

---

## 13. Testing strategy

| Layer       | Cases                                                    |
| ----------- | -------------------------------------------------------- |
| Unit        | Tag overlap score, enrollment penalty, LLM id validation |
| Integration | Recommend → enroll → `CourseEnrollment` row              |
| Auth        | Self vs other employee; manager report scope             |
| UI          | Gaps visible; enroll updates state; no static hero       |
| Regression  | LLM off → same rules order every time                    |

---

## 14. Key files (today)

| Path                                                | Role                                    |
| --------------------------------------------------- | --------------------------------------- |
| `.../l-d-recommendation/page.tsx`                   | Dashboard UI (partial API, static hero) |
| `lib/services/ai-automation-client.ts`              | `ldRecommendation` client               |
| `app/api/ai/learning/route.ts`                      | Static mock API                         |
| `lib/services/learningService.ts`                   | Domain L&D service                      |
| `app/api/v1/learning/paths/recommend/route.ts`      | Existing recommend proxy                |
| `components/learning/AILearningRecommendations.tsx` | ESS variant (850+ lines)                |
| `services/externalContentService.ts`                | External catalog metadata               |
| `dashboard/ai-automation/types.ts`                  | Related learning types in module        |

---

## 15. Decision log

| Decision         | Choice                      | Rationale                                                        |
| ---------------- | --------------------------- | ---------------------------------------------------------------- |
| Primary matching | Rules-first                 | Deterministic, auditable, works offline                          |
| LLM role         | Optional rank + why text    | GUIDE allows LLM for insights; not required v1                   |
| Enroll           | Domain L&D APIs             | Single enrollment source of truth                                |
| API base         | `/api/ai/learning`          | Existing client prefix                                           |
| Not predictive   | No `Prediction` rows        | Recommendations ≠ probability forecasts                          |
| Naming           | `ld-recommendation-*` files | Folder is `l-d-recommendation`; lib uses kebab without ampersand |

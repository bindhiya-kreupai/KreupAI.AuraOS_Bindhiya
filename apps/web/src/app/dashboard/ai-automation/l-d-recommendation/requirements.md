# L&D Recommendation — Requirements

**Feature URL**: `/dashboard/ai-automation/l-d-recommendation`  
**Module**: AI & Automation → AI Insights  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; recommendations mostly static / partial API)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give employees and people managers **personalized learning recommendations** grounded in real skill-gap analysis and the tenant course catalog — matching courses to development needs, explaining why each course fits, and enabling one-click enrollment into the L&D module — with optional LLM ranking for tie-breaking and narrative “why” text.

---

## 2. Current State (as of this document)

| Area        | Reality                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI          | Hero banner (hardcoded “Cloud Architecture” gap), course card grid with ratings/duration/reason                                                                                                                   |
| Data        | Hero section static; courses from API when call succeeds                                                                                                                                                          |
| Client      | `ldRecommendation.getRecommendations()` → GET `/api/ai/learning`; `getSkillGaps()` → GET `/api/ai/learning/skill-gaps` (**route missing**); `enrollCourse()` → POST `/api/ai/learning/enroll` (**route missing**) |
| Primary API | `/api/ai/learning` — static JSON on POST `recommend`; GET returns activity stats not course cards                                                                                                                 |
| Skill gaps  | Fetched in page state but **never rendered**; hero ignores API skill gaps                                                                                                                                         |
| Enroll      | `handleEnroll` defined but **not bound** to course card UI                                                                                                                                                        |
| L&D module  | Rich platform exists: `Course`, `LearningPath`, `CourseEnrollment`, `/api/v1/learning/*`, `learningService`                                                                                                       |
| LLM         | Not wired; ranking and reasons are static strings                                                                                                                                                                 |
| Auth        | Target: `ai-automation:read` / `ai-automation:write` + `learning:enroll` on commit; primary API has **none**                                                                                                      |
| Duplication | Separate ESS route `/dashboard/ai-learning-recommendations` with `AILearningRecommendations` component                                                                                                            |

---

## 3. Personas & Goals

| Persona      | Goals                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Employee     | See courses aligned to my skill gaps and career path                   |
| Manager      | Recommend development for direct reports (phase 2)                     |
| L&D Admin    | Drive catalog utilization; measure gap closure                         |
| HRBP         | Connect performance/competency gaps to learning paths                  |
| System Admin | Toggle AI ranking, set max recommendations, external content providers |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                       | Acceptance criteria                                                                               |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped recommendations** | Courses and gaps from session tenant catalog + employee competency data only                      |
| M2  | **Skill gap analysis**            | Return ranked gaps: skill, currentLevel, targetLevel, gap, source (assessment, performance, role) |
| M3  | **Catalog match**                 | Each recommendation links to real `Course` or `LearningPath` id in tenant catalog                 |
| M4  | **Explainable reason**            | Each card shows why (gap closed, role requirement, manager flag) — not generic marketing copy     |
| M5  | **Enrollment action**             | Enroll creates `CourseEnrollment` or `LearningPathEnrollment` via L&D APIs                        |
| M6  | **Permission gates**              | `ai-automation:read` for view; `learning:enroll` (or `ai-automation:write`) for enroll            |
| M7  | **Target employee context**       | Default to logged-in employee; managers may pass `employeeId` for reports with authorization      |
| M8  | **Bilingual API errors**          | Error payloads include `error` + `errorAr`                                                        |
| M9  | **No fabricated courses**         | Recommendations only for published catalog items; never invent providers/titles                   |
| M10 | **Persist recommendation run**    | Optional `AIRunRecord` (`runType: ld_recommendation`) with gaps + ranked course ids               |
| M11 | **Human-in-the-loop**             | Enrollment requires explicit user click; no auto-enroll without consent setting                   |

### 4.2 Essential

| ID  | Requirement                  | Acceptance criteria                                                                       |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| E1  | **Skill gaps panel**         | Render gap list/chart in UI (currently fetched but hidden)                                |
| E2  | **Hero from live data**      | Top gap + promotion readiness from API, not hardcoded Cloud Architecture                  |
| E3  | **Course card fields**       | title, provider, duration, rating, image/thumbnail, reason, relevance score               |
| E4  | **Ranked list**              | Sort by relevance / gap closure potential; configurable limit (e.g. 6–12)                 |
| E5  | **Rules-first matching**     | Map gap skills → catalog tags/competencies deterministically before LLM                   |
| E6  | **Optional LLM ranking**     | When configured, LLM re-ranks top-N candidates and refines reason text (server-side JSON) |
| E7  | **Learning path suggestion** | Bundle courses into path when multiple gaps align                                         |
| E8  | **Refresh recommendations**  | Recompute after assessment completion or role change                                      |
| E9  | **Empty states**             | No gaps → suggest baseline/onboarding courses; no catalog → clear message                 |

### 4.3 Good-to-Have

| ID  | Requirement                    | Acceptance criteria                                                    |
| --- | ------------------------------ | ---------------------------------------------------------------------- |
| G1  | **External content**           | Include LinkedIn Learning / Udemy links via `externalContentService`   |
| G2  | **Peer popularity**            | Boost courses popular among similar roles                              |
| G3  | **Career path link**           | Tie to internal mobility next-role readiness                           |
| G4  | **Manager assign**             | Manager assigns course to report                                       |
| G5  | **Budget check**               | Warn if enrollment exceeds training budget                             |
| G6  | **Completion feedback**        | Update gap levels when course completed                                |
| G7  | **Consolidate ESS + admin UI** | Single recommendation engine serves `/l-d-recommendation` and ESS page |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                       |
| --- | ------------- | ----------------------------------------------------------------- |
| N1  | Performance   | Recommendations GET &lt; 3s (rules path); LLM rank adds &lt; 5s   |
| N2  | Scalability   | Batch recommend for team (async) in manager view                  |
| N3  | Security      | LLM prompts tenant-scoped; no cross-employee PII in manager batch |
| N4  | Privacy       | Minimize sensitive performance text in LLM prompts                |
| N5  | Reliability   | LLM failure → rules-only ranking; never empty with silent mocks   |
| N6  | Observability | Log runId, tenantId, employeeId, courseCount, provider            |
| N7  | Compliance    | Recommendations advisory; enrollment auditable                    |

---

## 6. Data Inputs (feature sources)

| Input             | Sources (examples)                                              |
| ----------------- | --------------------------------------------------------------- |
| Skill profile     | Competency assessments, `SkillAssessment`, gap analysis modules |
| Role requirements | Job library, proficiency frameworks, target competencies        |
| Performance       | Latest review ratings, development plan goals                   |
| Catalog           | `Course`, `LearningPath` (published, tagged skills)             |
| Enrollments       | Existing `CourseEnrollment` — exclude completed/in-progress     |
| Career            | Internal mobility readiness, succession development plans       |
| External          | Optional external catalog metadata                              |

Initial **v1** may use competency gap + catalog tag overlap; full assessment integration Phase 2.

---

## 7. API Surface (target)

| Method | Path                          | Purpose                                                  |
| ------ | ----------------------------- | -------------------------------------------------------- |
| GET    | `/api/ai/learning`            | Recommendations + summary for current/specified employee |
| GET    | `/api/ai/learning/skill-gaps` | Ranked skill gaps                                        |
| POST   | `/api/ai/learning`            | `action: recommend \| analyze \| enroll \| refresh`      |
| POST   | `/api/ai/learning/enroll`     | Enroll in course/path (or fold into POST action)         |

**Deprecation note**: Implement missing nested routes expected by `ai-automation-client.ts` or update client to query-param style on main route.

Coordinate with existing `/api/v1/learning/paths/recommend` — avoid duplicate ranking logic.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. Hero: top gap, promotion readiness, CTA to top course
2. Skill gaps section (new visible panel — data already fetched)
3. Course grid: provider, title, rating, duration, reason, enroll button
4. Loading / empty / error states

UX constraints (product):

- Bind `handleEnroll` to card actions
- Replace static hero metrics with API data
- Course `image` field: fallback gradient when no thumbnail URL
- Align card shape with `AILearningRecommendations` where possible (dedupe later)

---

## 9. Out of Scope

- Building full LMS (video player, quiz engine — existing L&D module)
- Scraping external provider catalogs without license integration
- Auto-enrolling entire teams without approval workflow
- Replacing competency library administration UI

---

## 10. Success Metrics

| Metric             | Target                                                               |
| ------------------ | -------------------------------------------------------------------- |
| Mock dependency    | 0 hardcoded hero gap text in production path                         |
| Catalog linkage    | 100% recommendations reference valid `courseId` or `pathId`          |
| Enrollment success | Enroll action creates real enrollment row                            |
| Gap visibility     | Skill gaps rendered when API returns data                            |
| Route parity       | Client `skill-gaps` and `enroll` paths implemented or client updated |

---

## 11. Traceability

| Product statement                                                         | Requirement IDs |
| ------------------------------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “L&D Recommendations — Personalized learning suggestions” | M2–M5, E4–E6    |
| GUIDE Phase 5 AI Insights                                                 | M1, E5, E9      |
| GUIDE: ground Learning Suggestions in real employee/skills data           | M2, E5, §6      |
| Marketing: 3× engagement via personalization                              | E4, E6, G2      |

---

## 12. Open Decisions

1. Canonical UI: keep `/l-d-recommendation` vs merge with `/dashboard/ai-learning-recommendations`.
2. Employee scope: ESS self-only vs HR admin pick employee.
3. LLM usage: ranking only vs also generate gap narratives.
4. Primary enroll API: `/api/ai/learning/enroll` vs proxy to `/api/v1/learning/paths/[id]/enroll`.
5. Store recommendations in `AIRunRecord` vs ephemeral compute on each GET.

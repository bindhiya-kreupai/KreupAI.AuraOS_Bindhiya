# NLP Insights — Requirements

**Feature URL**: `/dashboard/ai-automation/nlp-insights`  
**Module**: AI & Automation → AI Insights  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; analysis mostly mock / lexicon stub)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give HR and employee-experience teams a consolidated view of **employee sentiment, emerging themes, and feedback trends** extracted from continuous feedback and related text sources — so they can prioritize interventions before issues escalate, using real tenant feedback data rather than hardcoded topic bubbles and word clouds.

---

## 2. Current State (as of this document)

| Area            | Reality                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| UI              | KPI strip, sentiment trend line chart, topic scatter clusters, positive/negative keyword clouds                |
| Data            | Hardcoded `TOPIC_CLUSTERS`, `SENTIMENT_TREND`, `POSITIVE_WORDS`, `NEGATIVE_WORDS`; KPI numbers static          |
| Client          | `sentimentAnalysis.getSentiment()` / `getTrends()` → `/api/ai/sentiment*` (trends sub-route unimplemented)     |
| Mock API        | `/api/ai/sentiment` GET returns empty summary; requires query `tenantId`; POST uses `SentimentAnalysisService` |
| Real (orphaned) | `/api/ai-automation/nlp-insights` — lexicon POS/NEG over `continuousFeedback` (90 days) + `AIRunRecord`        |
| Persistence     | No dedicated sentiment store; `AIRunRecord` only on orphaned route                                             |
| Auth            | Target standard: `ai-automation:read` / `ai-automation:write` (not on mock `/api/ai/sentiment` GET)            |

---

## 3. Personas & Goals

| Persona          | Goals                                                      |
| ---------------- | ---------------------------------------------------------- |
| HR / EX Lead     | Org-wide sentiment pulse; emerging negative themes         |
| People Analytics | Trend over time; source volume breakdown                   |
| Department Head  | Team-scoped feedback themes (when permitted)               |
| CHRO             | Executive summary of morale drivers                        |
| System Admin     | Analysis run history, lexicon version, optional LLM toggle |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                | Acceptance criteria                                                                             |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped analysis** | Only tenant’s `continuousFeedback` (and configured sources) analyzed                            |
| M2  | **Overall sentiment KPI**  | Aggregate label (`positive` / `neutral` / `negative`) + score derived from real feedback volume |
| M3  | **Sources analyzed count** | Total feedback records in analysis window with breakdown by source type                         |
| M4  | **Sentiment trend**        | Time-bucketed positive/neutral/negative % (default last 30 days)                                |
| M5  | **Topic clusters**         | Named themes with sentiment, volume, and frequency/impact coordinates for scatter viz           |
| M6  | **Keyword highlights**     | Top positive and negative terms/phrases from corpus (word-cloud or ranked list)                 |
| M7  | **Permission gates**       | `ai-automation:read` for dashboard; `ai-automation:write` for recompute / single-text analyze   |
| M8  | **Lexicon v1 path**        | Deterministic scoring via `SentimentAnalysisService` lexicon — works without LLM                |
| M9  | **Bilingual API errors**   | Error payloads include `error` + `errorAr`                                                      |
| M10 | **No fabricated feedback** | Do not invent quotes, employees, or topics not grounded in retrieved text                       |
| M11 | **Human-in-the-loop**      | Insights advisory; no auto-actions on employees from sentiment alone                            |

### 4.2 Essential

| ID  | Requirement                 | Acceptance criteria                                                     |
| --- | --------------------------- | ----------------------------------------------------------------------- |
| E1  | **Emerging themes count**   | KPI for themes requiring attention (negative trend or high volume)      |
| E2  | **Single feedback analyze** | `analyzeFeedback(feedbackId)` returns sentiment + topics for one record |
| E3  | **Department filter**       | Scoped aggregates when employee dept known                              |
| E4  | **Recompute job**           | Refresh analysis over sliding window (90 days default)                  |
| E5  | **Run persistence**         | `AIRunRecord` with `runType: nlp_insights` storing summary output       |
| E6  | **Topic taxonomy**          | Map keywords to HR categories (compensation, WLB, management, etc.)     |
| E7  | **Action item extraction**  | Surface suggested HR actions from negative clusters (rules or LLM)      |
| E8  | **Empty state**             | Clear UX when feedback count = 0                                        |
| E9  | **Audit**                   | Recompute logged                                                        |

### 4.3 Good-to-Have

| ID  | Requirement                 | Acceptance criteria                                                                    |
| --- | --------------------------- | -------------------------------------------------------------------------------------- |
| G1  | **Optional LLM enrichment** | Topic labeling and executive summary when provider available; lexicon remains fallback |
| G2  | **Multi-source ingestion**  | Surveys, email snippets, Slack (with integration) beyond `continuousFeedback`          |
| G3  | **Anonymization mode**      | Aggregates only for sensitive deployments                                              |
| G4  | **Alerting**                | Notify EX lead when negative sentiment spikes                                          |
| G5  | **Export**                  | CSV/PDF of trends and top topics                                                       |
| G6  | **Multilingual**            | Arabic + English tokenization for MENA tenants                                         |
| G7  | **Link to coaching**        | Negative themes suggest HR Coaching Bot prompts                                        |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                      |
| --- | ------------- | -------------------------------------------------------------------------------- |
| N1  | Performance   | Dashboard GET &lt; 3s for ≤ 10k feedback records (pre-aggregated runs)           |
| N2  | Scalability   | Batch analyze large corpus async; paginate raw feedback drill-down               |
| N3  | Security      | LLM calls server-side only; minimize PII in prompts                              |
| N4  | Privacy       | Individual feedback text visible only to authorized roles; default aggregates    |
| N5  | Reliability   | Lexicon path always available when LLM down                                      |
| N6  | Observability | Log run id, tenantId, recordCount, durationMs; redact feedback content from logs |
| N7  | Compliance    | GDPR-style retention respect; no cross-tenant model training                     |

---

## 6. Data Inputs (feature sources)

| Source     | Prisma / module                                                      |
| ---------- | -------------------------------------------------------------------- |
| Primary    | `ContinuousFeedback` (`content`, `createdAt`, author/recipient refs) |
| Secondary  | Survey responses (when integrated)                                   |
| Context    | Employee department, location (for filters)                          |
| Historical | Prior `AIRunRecord` outputs for trend comparison                     |

Initial **v1** analyzes `continuousFeedback` only, using lexicon from `SentimentAnalysisService` and topic keywords from service constants; optional LLM for cluster naming in v2.

---

## 7. API Surface (target)

| Method | Path                                     | Purpose                                                              |
| ------ | ---------------------------------------- | -------------------------------------------------------------------- |
| GET    | `/api/ai/sentiment`                      | Dashboard summary: overall sentiment, sources count, emerging themes |
| GET    | `/api/ai/sentiment/trends`               | Time-bucketed positive/neutral/negative series                       |
| GET    | `/api/ai/sentiment/topics`               | Topic clusters for scatter chart                                     |
| GET    | `/api/ai/sentiment/keywords`             | Positive/negative keyword lists                                      |
| POST   | `/api/ai/sentiment/analyze/[feedbackId]` | Single record analysis                                               |
| POST   | `/api/ai/sentiment`                      | `action: analyze \| batch \| recompute \| extract-topics`            |
| GET    | `/api/ai/sentiment/runs/[runId]`         | Batch job status                                                     |

**Deprecation note**: Converge `/api/ai-automation/nlp-insights` into `/api/ai/sentiment`. Session tenant replaces query `tenantId`.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. **Overview KPIs** — overall sentiment, sources analyzed, emerging themes count
2. **Sentiment Trend (Last 30 Days)** — line chart from `/trends`
3. **Feedback Topic Clusters** — scatter from `/topics`
4. **Positive / Negative Keyword Clouds** — from `/keywords`

UX constraints:

- Use `trends` state (already partially wired) instead of static `SENTIMENT_TREND` in chart
- Loading skeletons; empty state when no feedback
- Error banner on failure; no fallback to hardcoded topics in production

---

## 9. Out of Scope

- Full enterprise NLP platform (custom model training)
- Real-time streaming analysis of chat systems (batch/scheduled v1)
- Automated disciplinary workflows triggered by sentiment
- Duplicating DEI module’s standalone sentiment panel (may share aggregates later)

---

## 10. Success Metrics

| Metric           | Target                                                       |
| ---------------- | ------------------------------------------------------------ |
| Mock dependency  | 0 hardcoded topic clusters / KPI numbers in production       |
| Coverage         | ≥ 80% of feedback records in window classified               |
| Lexicon fallback | 100% dashboard availability without LLM                      |
| Theme accuracy   | HR validates ≥ 70% of top topics as meaningful (qualitative) |

---

## 11. Traceability

| Product statement                                   | Requirement IDs |
| --------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “Sentiment Analysis / NLP Insights” | M1–M6, E1, E4   |
| GUIDE Phase 4 AI Insights (Sentiment)               | M8, E5, N5      |
| GUIDE: lexicon + optional LLM pattern               | M8, G1          |

---

## 12. Open Decisions

1. Unified naming: page “NLP Insights” vs API `/sentiment` vs client `sentimentAnalysis` — document mapping, avoid rename churn in v1.
2. Store aggregated results in `AIRunRecord.output` only vs new `SentimentSnapshot` table.
3. LLM topic clustering: on every recompute vs on-demand for drill-down.
4. Minimum feedback count before showing demographic-filtered views.

# NLP Insights — Architecture

**Feature URL**: `/dashboard/ai-automation/nlp-insights`  
**Module**: AI & Automation → AI Insights  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

NLP Insights is an **aggregative insight feature** (non-chat, non-predictive in the strict `Prediction` sense for v1). Per the AI Automation guide, insight features:

1. Authenticate + resolve tenant
2. Retrieve text corpus from domain tables (`continuousFeedback`)
3. Run analysis via **lexicon v1** (deterministic) with **optional LLM enrichment**
4. Persist run summary to `AIRunRecord` (and optionally snapshot aggregates)
5. Serve dashboards from persisted run output — not hardcoded topic arrays

Unlike attrition/leave/performance, v1 may defer per-record `Prediction` rows and store dashboard payloads on `AIRunRecord.output` until aggregate schema is finalized.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR / EX Lead │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  nlp-insights                       │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/sentiment/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Sentiment / NLP API + Analysis Engine │
                                │ (lexicon v1 + optional LLM)         │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Feedback module  │    │ Optional LLM    │
              │ AIRunRecord,   │    │ ContinuousFeedback│   │ topic labeling  │
              │ ContinuousFeedback│ │ Employee (dept)  │    │ via llm-client  │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                                  | Responsibility                    |
| ------------- | ------------------------------------------------------------------------- | --------------------------------- |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/nlp-insights/page.tsx`          | KPIs, trend, scatter, word clouds |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `sentimentAnalysis` | Fetch `/api/ai/sentiment*`        |
| API           | `apps/web/src/app/api/ai/sentiment/**`                                    | Auth, orchestration               |
| Legacy API    | `apps/web/src/app/api/ai-automation/nlp-insights/route.ts`                | Minimal POS/NEG lexicon + auth    |
| Domain AI     | `apps/web/src/lib/services/ai/sentiment-analysis.service.ts`              | Full lexicon, topics, surveys     |
| Target AI lib | `apps/web/src/lib/ai/nlp-insights-*` (to introduce)                       | 4-layer pattern (rename-aligned)  |
| Persistence   | `AIRunRecord`; optional future `SentimentSnapshot`                        | Run-level dashboard cache         |
| Shared auth   | `withEnhancedAuth` + `ai-automation:*`                                    | Tenant + RBAC                     |

### Target 4-layer layout (recommended)

| File                               | Role                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `lib/ai/nlp-insights-types.ts`     | DTOs: trend bucket, topic cluster, keyword, dashboard summary                |
| `lib/ai/nlp-insights-rules.ts`     | Lexicon v1, topic taxonomy, emerging-theme thresholds, negation handling     |
| `lib/ai/nlp-insights-retrieval.ts` | Tenant-scoped `continuousFeedback` window + dept joins                       |
| `lib/ai/nlp-insights-ai.ts`        | Orchestration: analyze corpus → aggregate → optional LLM label → persist run |
| `lib/ai/nlp-insights-fallback.ts`  | Thin lexicon path when LLM unavailable; empty corpus handling                |

Wrap/refactor `SentimentAnalysisService` into this layout; keep backward-compatible exports during migration.

---

## 4. Analysis request lifecycle

```text
Client (page)
   │  GET /api/ai/sentiment
   │  GET /api/ai/sentiment/trends
   ▼
Auth (session → tenantId, permissions)
   │
   ├── If fresh AIRunRecord (nlp_insights) within TTL → return cached output
   │
   └── Else / on recompute POST
         │
         ├─ retrieval: continuousFeedback last N days (default 90)
         ├─ per-record: lexicon score + topic keyword hits
         ├─ aggregate: overall sentiment, weekly trends, topic clusters
         ├─ keywords: top positive/negative terms by frequency × score
         ├─ optional LLM: cluster labels + executive insight (fallback skips)
         ├─ persist: AIRunRecord.output = full dashboard payload
         └─ respond: summary, trends, topics, keywords
```

**Single-record path** (`POST analyze/[feedbackId]`): retrieve one row → `analyzeSentiment` → return without full recompute.

---

## 5. Data model

### 5.1 Existing Prisma

**`ContinuousFeedback`**

- `tenantId`, `content`, `createdAt`
- Relations to author/recipient employees (for dept filter)

**`AIRunRecord`**

- `runType`: `nlp_insights`
- `output`: JSON dashboard snapshot
- `tenantId`, `completedAt`, `durationMs`

### 5.2 Logical payload (API)

```ts
type SentimentTrendBucket = {
  month: string; // display label e.g. 'Week 1'
  startDate: string; // ISO
  positive: number; // percent 0-100
  negative: number;
  neutral: number;
};

type TopicCluster = {
  id: string;
  name: string;
  sentiment: 'Positive' | 'Negative' | 'Mixed' | 'Neutral';
  x: number; // frequency axis for scatter
  y: number; // impact axis
  z: number; // volume (bubble size)
  fill: string; // chart color
  category: string; // COMPENSATION | WLB | MANAGEMENT | ...
  recordCount: number;
};

type KeywordCloudItem = {
  text: string;
  size: number;
  color: string;
  score: number;
};

type NLPInsightsDashboard = {
  summary: {
    overallSentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number; // -1 to 1
    sourcesAnalyzed: number;
    emergingThemes: number;
    periodDays: number;
    generatedAt: string;
    lexiconVersion: string;
    llmEnriched: boolean;
  };
  trends: SentimentTrendBucket[];
  topics: TopicCluster[];
  positiveKeywords: KeywordCloudItem[];
  negativeKeywords: KeywordCloudItem[];
};
```

Align with `SentimentAnalysis` in `dashboard/ai-automation/types.ts` where overlapping.

---

## 6. Analysis architecture (v1)

### 6.1 Lexicon v1 (primary path)

Two implementations exist today — **converge** on `SentimentAnalysisService.SENTIMENT_LEXICON`:

| Source                            | Approach                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `/api/ai-automation/nlp-insights` | Binary POS/NEG word sets; majority vote per record        |
| `SentimentAnalysisService`        | Weighted lexicon (-1..1), negation + intensifier handling |

Target: use service lexicon for all paths; orphan route becomes thin wrapper.

**Per-record algorithm**:

```text
tokens = tokenize(content)
score = sum(lexicon[token] * intensifier * (negator ? -1 : 1)) / max(1, sentimentWordCount)
label = score > 0.2 ? positive : score < -0.2 ? negative : neutral
```

### 6.2 Topic extraction (rules v1)

Use `TOPIC_KEYWORDS` map in service:

```text
for each feedback record:
  for category, keywords in TOPIC_KEYWORDS:
    if any keyword in content → increment category hits + attach record sentiment

aggregate categories → TopicCluster:
  x = frequency rank normalized
  y = avg abs(sentiment) * impact weight
  z = record count
  sentiment = dominant label among records
```

Optional **LLM v2**: batch sample texts per category → generate human-readable cluster name (never invent topics without supporting records).

### 6.3 Trend aggregation

```text
bucket feedback by week (last 4-5 weeks for 30-day view)
for each bucket:
  positive% = count(label=positive) / total * 100
  (same for negative, neutral)
```

### 6.4 Emerging themes

```text
emergingThemes = count topics where:
  sentiment in (Negative, Mixed) AND
  (week-over-week volume increase > THRESHOLD OR absolute volume > MIN_VOLUME)
```

### 6.5 Keyword clouds

```text
collect tokens from positive/negative labeled records
weight = frequency * abs(lexicon score)
top N → KeywordCloudItem { text, size, color }
```

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/sentiment?periodDays=30&departmentId=`**

```json
{
  "success": true,
  "data": {
    "summary": {
      "overallSentiment": "positive",
      "sentimentScore": 0.42,
      "sourcesAnalyzed": 1240,
      "emergingThemes": 3,
      "periodDays": 30,
      "generatedAt": "2026-07-16T11:00:00.000Z",
      "lexiconVersion": "1.0",
      "llmEnriched": false
    }
  }
}
```

**GET `/api/ai/sentiment/trends`**

Returns `{ trends: SentimentTrendBucket[] }`.

**GET `/api/ai/sentiment/topics`**

Returns `{ topics: TopicCluster[] }`.

**GET `/api/ai/sentiment/keywords`**

Returns `{ positiveKeywords[], negativeKeywords[] }`.

**POST `/api/ai/sentiment`**

| `action`         | Behavior                   |
| ---------------- | -------------------------- |
| `analyze`        | Single text (admin tool)   |
| `batch`          | Array of texts             |
| `recompute`      | Full tenant corpus refresh |
| `extract-topics` | Topic pass only            |

**POST `/api/ai/sentiment/analyze/[feedbackId]`**

Single `continuousFeedback` row analysis.

### 7.2 Auth & tenancy

```text
withEnhancedAuth(request)
  → tenantId from session
  → ai-automation:read | :write
```

Remove mandatory query/body `tenantId` from GET (currently breaks silent empty responses).

### 7.3 Client wiring

```text
page.tsx
  → sentimentAnalysis.getSentiment()   // summary KPIs
  → sentimentAnalysis.getTrends()      // line chart (partially wired)
  → (add) getTopics / getKeywords or expand GET to full dashboard
```

Consolidation option: single GET returns full `NLPInsightsDashboard` to reduce round trips; keep client methods as wrappers.

---

## 8. UI composition

```text
NLPInsightsPage
├── KPI strip (← summary)
├── Sentiment Trend LineChart (← trends[]; replace SENTIMENT_TREND default)
├── Topic Clusters ScatterChart (← topics[])
├── Positive Keyword Cloud (← positiveKeywords[])
└── Negative Keyword Cloud (← negativeKeywords[])
```

Charts: Recharts (`LineChart`, `ScatterChart`). Word clouds: sized `<span>` elements (current pattern) or dedicated component.

**Mock removal checklist**:

- Bind KPI cards to `sentimentData.summary`
- Line chart uses `trends` state not constant
- Scatter uses API `topics` not `TOPIC_CLUSTERS`
- Keyword sections from API arrays

---

## 9. Security & compliance controls

| Control           | Implementation                                                          |
| ----------------- | ----------------------------------------------------------------------- |
| RBAC              | `ai-automation:read` / `:write`                                         |
| Tenant isolation  | Feedback queries include `tenantId`                                     |
| PII in LLM        | Minimize; truncate/sample texts; no names in prompts unless role allows |
| Raw text exposure | Drill-down restricted; dashboard aggregates by default                  |
| Audit             | Recompute logged                                                        |
| Secrets           | LLM keys server-only                                                    |
| Retention         | Respect feedback retention policy                                       |

---

## 10. Performance strategy

1. **Read path**: Serve cached `AIRunRecord.output` (TTL e.g. 1–6 hours) unless `?fresh=true`.
2. **Write path**: Scheduled nightly recompute; manual refresh for HR.
3. **Batch size**: Process feedback in chunks of 500 for memory stability.
4. **Indexes**: `ContinuousFeedback(tenantId, createdAt)`.
5. **LLM**: Optional async enrichment job — do not block GET on provider latency.

---

## 11. Failure modes

| Failure               | Behavior                                           |
| --------------------- | -------------------------------------------------- |
| Unauthenticated       | 401 bilingual                                      |
| Zero feedback records | Empty trends/topics; KPI zeros + helpful message   |
| LLM unavailable       | `llmEnriched: false`; lexicon-only results         |
| DB down               | 503; no hardcoded cafeteria topics                 |
| Partial dept filter   | Return scoped aggregates; note reduced sample size |

---

## 12. Migration / convergence plan

| Step | Work                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 1    | Introduce `lib/ai/nlp-insights-*`; migrate lexicon from `SentimentAnalysisService` |
| 2    | Unify orphan `/api/ai-automation/nlp-insights` logic into `/api/ai/sentiment`      |
| 3    | Implement GET with session auth + real aggregates from `continuousFeedback`        |
| 4    | Add `/trends`, `/topics`, `/keywords` sub-routes (or monolithic GET)               |
| 5    | Persist `AIRunRecord` on each recompute                                            |
| 6    | Replace page mocks; wire KPI + charts                                              |
| 7    | Implement `analyze/[feedbackId]`                                                   |
| 8    | Optional LLM topic labeling behind feature flag                                    |

---

## 13. Testing strategy

| Layer       | Cases                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Unit        | Lexicon scoring, negation, topic keyword match, trend bucketing       |
| Integration | Tenant isolation, feedback retrieval, AIRunRecord persist/read        |
| UI          | Empty corpus UX; populated from API; no static TOPIC_CLUSTERS in prod |
| Regression  | 1k feedback recompute under time budget                               |
| LLM         | Fallback when provider down; structured output validation             |

---

## 14. Key files (today)

| Path                                            | Role                                |
| ----------------------------------------------- | ----------------------------------- |
| `.../nlp-insights/page.tsx`                     | Dashboard UI (mock-heavy)           |
| `lib/services/ai-automation-client.ts`          | `sentimentAnalysis` client          |
| `app/api/ai/sentiment/route.ts`                 | GET stub / POST via service         |
| `app/api/ai-automation/nlp-insights/route.ts`   | Real minimal lexicon + auth         |
| `lib/services/ai/sentiment-analysis.service.ts` | Full lexicon + topic extraction     |
| `dashboard/ai-automation/services.ts`           | Legacy `NLPInsightsService`         |
| `dashboard/ai-automation/types.ts`              | `SentimentAnalysis` interface       |
| `packages/@aura/database/prisma/schema.prisma`  | `ContinuousFeedback`, `AIRunRecord` |

---

## 15. Decision log

| Decision         | Choice                                  | Rationale                                                          |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Primary analysis | Lexicon v1 (`SentimentAnalysisService`) | GUIDE A4; deterministic + offline                                  |
| LLM              | Optional enrichment only                | Cost/latency; lexicon always available                             |
| Persistence v1   | `AIRunRecord.output`                    | No schema migration required immediately                           |
| API path         | `/api/ai/sentiment`                     | Matches existing client; page title “NLP Insights” is display name |
| Corpus v1        | `continuousFeedback` only               | Orphan route already uses it; expand sources later                 |
| Naming           | `nlp-insights-*` lib folder             | Aligns with dashboard route; wraps sentiment engine                |

/**
 * @module enterprise-search
 * @description Enterprise Search Service — full-text search, faceted filtering,
 *              autocomplete suggestions, index management, and search analytics
 *              across all core AuraOS indexes.
 * @project AuraOS Enterprise HCM Platform
 * @section 16 — Enterprise Backend Platform Services
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SearchIndex = 'employees' | 'documents' | 'policies' | 'jobs' | 'courses' | 'cases';

export interface SearchDocument {
  id: string;
  [key: string]: unknown;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: unknown;
}

export interface SearchFacetResult {
  field: string;
  buckets: Array<{ value: string; count: number }>;
}

export interface HighlightedField {
  field: string;
  fragments: string[];
}

export interface SearchHit<T = Record<string, unknown>> {
  id: string;
  index: SearchIndex;
  score: number;
  document: T;
  highlights: HighlightedField[];
}

export interface SearchOptions {
  indexes?: SearchIndex[];
  filters?: SearchFilter[];
  facets?: string[];
  from?: number;
  size?: number;
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>;
  highlight?: boolean;
  highlightFields?: string[];
  fuzzy?: boolean;
  minScore?: number;
}

export interface SearchResult<T = Record<string, unknown>> {
  query: string;
  total: number;
  took: number;
  hits: SearchHit<T>[];
  facets: SearchFacetResult[];
  suggestions?: string[];
}

export interface SuggestResult {
  prefix: string;
  index: SearchIndex;
  suggestions: Array<{ text: string; score: number; documentId: string }>;
}

export interface ReindexResult {
  index: SearchIndex;
  indexed: number;
  failed: number;
  durationMs: number;
  completedAt: string;
}

export interface SearchAnalytics {
  period: string;
  totalSearches: number;
  uniqueUsers: number;
  popularQueries: Array<{ query: string; count: number; avgResultCount: number }>;
  zeroResultQueries: Array<{ query: string; count: number; lastSeen: string }>;
  clickThroughRate: number;
  avgResultsPerQuery: number;
  searchesByIndex: Record<SearchIndex, number>;
  topClickedDocuments: Array<{ id: string; index: SearchIndex; clicks: number; title: string }>;
}

// ============================================================================
// IN-MEMORY SEARCH STORE (replace with Elasticsearch/OpenSearch in production)
// ============================================================================

const indexStore = new Map<SearchIndex, Map<string, SearchDocument>>();
const analyticsLog: Array<{
  query: string;
  index: SearchIndex;
  userId: string;
  resultCount: number;
  clickedId?: string;
  timestamp: string;
}> = [];

const ALL_INDEXES: SearchIndex[] = [
  'employees',
  'documents',
  'policies',
  'jobs',
  'courses',
  'cases',
];

function getIndex(index: SearchIndex): Map<string, SearchDocument> {
  if (!indexStore.has(index)) {
    indexStore.set(index, new Map());
  }
  return indexStore.get(index)!;
}

// Seed realistic mock data
(function seedMockData() {
  const employees = [
    {
      id: 'emp_001',
      name: 'Aisha Patel',
      title: 'Senior Engineer',
      department: 'Engineering',
      email: 'aisha@acme.com',
      status: 'active',
      location: 'Mumbai',
    },
    {
      id: 'emp_002',
      name: 'Carlos Mendez',
      title: 'HR Manager',
      department: 'Human Resources',
      email: 'carlos@acme.com',
      status: 'active',
      location: 'Delhi',
    },
    {
      id: 'emp_003',
      name: 'Priya Nair',
      title: 'Finance Analyst',
      department: 'Finance',
      email: 'priya@acme.com',
      status: 'active',
      location: 'Bangalore',
    },
  ];
  employees.forEach((e) => getIndex('employees').set(e.id, e));

  const policies = [
    {
      id: 'pol_001',
      title: 'Remote Work Policy',
      category: 'HR',
      content: 'Guidelines for remote work arrangements and eligibility criteria.',
      effectiveDate: '2024-01-01',
    },
    {
      id: 'pol_002',
      title: 'Leave Policy',
      category: 'HR',
      content: 'Annual leave, sick leave, and special leave entitlements.',
      effectiveDate: '2024-01-01',
    },
  ];
  policies.forEach((p) => getIndex('policies').set(p.id, p));
})();

// ============================================================================
// SIMPLE SCORING ENGINE
// ============================================================================

function scoreDocument(
  query: string,
  doc: SearchDocument,
  highlight: boolean
): { score: number; highlights: HighlightedField[] } {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  const highlights: HighlightedField[] = [];

  for (const [field, value] of Object.entries(doc)) {
    if (typeof value !== 'string') continue;
    const lower = value.toLowerCase();
    for (const term of terms) {
      if (lower === term) score += 3;
      else if (lower.startsWith(term)) score += 2;
      else if (lower.includes(term)) score += 1;
    }

    if (highlight) {
      const fragments = terms.reduce<string[]>((acc, term) => {
        const idx = lower.indexOf(term);
        if (idx >= 0) {
          const start = Math.max(0, idx - 20);
          const end = Math.min(value.length, idx + term.length + 20);
          acc.push(
            `...${value.slice(start, idx)}<em>${value.slice(idx, idx + term.length)}</em>${value.slice(idx + term.length, end)}...`
          );
        }
        return acc;
      }, []);
      if (fragments.length) highlights.push({ field, fragments });
    }
  }

  return { score, highlights };
}

function matchesFilters(doc: SearchDocument, filters: SearchFilter[]): boolean {
  return filters.every((f) => {
    const val = doc[f.field];
    switch (f.operator) {
      case 'eq':
        return val === f.value;
      case 'neq':
        return val !== f.value;
      case 'in':
        return Array.isArray(f.value) && f.value.includes(val);
      case 'contains':
        return typeof val === 'string' && val.toLowerCase().includes(String(f.value).toLowerCase());
      case 'gt':
        return typeof val === 'number' && val > (f.value as number);
      case 'lt':
        return typeof val === 'number' && val < (f.value as number);
      case 'gte':
        return typeof val === 'number' && val >= (f.value as number);
      case 'lte':
        return typeof val === 'number' && val <= (f.value as number);
      default:
        return true;
    }
  });
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * indexDocument — add or update a document in the specified search index.
 */
export async function indexDocument(
  index: SearchIndex,
  id: string,
  document: Record<string, unknown>
): Promise<{ indexed: boolean; id: string; index: SearchIndex }> {
  const store = getIndex(index);
  store.set(id, { id, ...document });
  return { indexed: true, id, index };
}

/**
 * search — full-text search with filters, facets, and highlighting.
 */
export async function search<T = Record<string, unknown>>(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult<T>> {
  const start = Date.now();
  const targetIndexes = options.indexes ?? ALL_INDEXES;
  const filters = options.filters ?? [];
  const from = options.from ?? 0;
  const size = options.size ?? 20;
  const minScore = options.minScore ?? 0.1;
  const highlight = options.highlight ?? true;

  const allHits: SearchHit<T>[] = [];

  for (const index of targetIndexes) {
    const store = getIndex(index);
    for (const [id, doc] of store.entries()) {
      if (!matchesFilters(doc, filters)) continue;
      const { score, highlights } = scoreDocument(query, doc, highlight);
      if (score >= minScore) {
        allHits.push({ id, index, score, document: doc as unknown as T, highlights });
      }
    }
  }

  // Sort by score desc, then by sort options
  allHits.sort((a, b) => b.score - a.score);

  if (options.sort) {
    options.sort.forEach(({ field, order }) => {
      allHits.sort((a, b) => {
        const av = (a.document as Record<string, unknown>)[field] ?? '';
        const bv = (b.document as Record<string, unknown>)[field] ?? '';
        return order === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    });
  }

  const paginated = allHits.slice(from, from + size);

  // Build facets
  const facets: SearchFacetResult[] = [];
  if (options.facets) {
    options.facets.forEach((facetField) => {
      const counts = new Map<string, number>();
      allHits.forEach((h) => {
        const val = String((h.document as Record<string, unknown>)[facetField] ?? '');
        counts.set(val, (counts.get(val) ?? 0) + 1);
      });
      facets.push({
        field: facetField,
        buckets: Array.from(counts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count),
      });
    });
  }

  // Record analytics
  analyticsLog.push({
    query,
    index: targetIndexes[0],
    userId: 'system',
    resultCount: allHits.length,
    timestamp: new Date().toISOString(),
  });

  return {
    query,
    total: allHits.length,
    took: Date.now() - start,
    hits: paginated,
    facets,
  };
}

/**
 * suggest — autocomplete suggestions for a given prefix and index.
 */
export async function suggest(prefix: string, index: SearchIndex): Promise<SuggestResult> {
  const store = getIndex(index);
  const lowerPrefix = prefix.toLowerCase();
  const suggestions: SuggestResult['suggestions'] = [];

  const TEXT_FIELDS: Record<SearchIndex, string[]> = {
    employees: ['name', 'title', 'email'],
    documents: ['title', 'fileName'],
    policies: ['title', 'category'],
    jobs: ['title', 'department'],
    courses: ['title', 'category'],
    cases: ['title', 'subject'],
  };

  const fields = TEXT_FIELDS[index] ?? ['title', 'name'];

  for (const [id, doc] of store.entries()) {
    for (const field of fields) {
      const val = doc[field];
      if (typeof val === 'string' && val.toLowerCase().startsWith(lowerPrefix)) {
        const score = val.toLowerCase() === lowerPrefix ? 1 : 0.5 + prefix.length / val.length;
        suggestions.push({ text: val, score, documentId: id });
      }
    }
  }

  return {
    prefix,
    index,
    suggestions: suggestions.sort((a, b) => b.score - a.score).slice(0, 10),
  };
}

/**
 * reindex — rebuild the entire index from source data.
 */
export async function reindex(index: SearchIndex): Promise<ReindexResult> {
  const start = Date.now();
  const store = getIndex(index);
  const existing = store.size;

  // In production: fetch all records from DB and index them
  // For now, the index is preserved (records are source-of-truth in mock)
  await new Promise((r) => setTimeout(r, 50)); // simulate I/O

  return {
    index,
    indexed: existing,
    failed: 0,
    durationMs: Date.now() - start,
    completedAt: new Date().toISOString(),
  };
}

/**
 * getSearchAnalytics — returns popular queries, zero-result queries, and CTR.
 */
export async function getSearchAnalytics(): Promise<SearchAnalytics> {
  const queryCounts = new Map<string, { count: number; totalResults: number }>();
  const indexCounts: Record<string, number> = {};

  analyticsLog.forEach((entry) => {
    const existing = queryCounts.get(entry.query) ?? { count: 0, totalResults: 0 };
    queryCounts.set(entry.query, {
      count: existing.count + 1,
      totalResults: existing.totalResults + entry.resultCount,
    });
    indexCounts[entry.index] = (indexCounts[entry.index] ?? 0) + 1;
  });

  const popularQueries = Array.from(queryCounts.entries())
    .filter(([, v]) => v.totalResults > 0)
    .map(([query, v]) => ({
      query,
      count: v.count,
      avgResultCount: Math.round(v.totalResults / v.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const zeroResultQueries = Array.from(queryCounts.entries())
    .filter(([, v]) => v.totalResults === 0)
    .map(([query, v]) => ({
      query,
      count: v.count,
      lastSeen: new Date().toISOString(),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const clickedLogs = analyticsLog.filter((l) => l.clickedId);
  const ctr = analyticsLog.length > 0 ? clickedLogs.length / analyticsLog.length : 0;

  return {
    period: 'last-30-days',
    totalSearches: analyticsLog.length,
    uniqueUsers: new Set(analyticsLog.map((l) => l.userId)).size,
    popularQueries,
    zeroResultQueries,
    clickThroughRate: Math.round(ctr * 100) / 100,
    avgResultsPerQuery:
      analyticsLog.length > 0
        ? Math.round(analyticsLog.reduce((s, l) => s + l.resultCount, 0) / analyticsLog.length)
        : 0,
    searchesByIndex: Object.fromEntries(
      ALL_INDEXES.map((idx) => [idx, indexCounts[idx] ?? 0])
    ) as Record<SearchIndex, number>,
    topClickedDocuments: [
      { id: 'emp_001', index: 'employees', clicks: 42, title: 'Aisha Patel - Senior Engineer' },
      { id: 'pol_001', index: 'policies', clicks: 37, title: 'Remote Work Policy' },
    ],
  };
}

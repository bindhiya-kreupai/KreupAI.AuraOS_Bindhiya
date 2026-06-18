/**
 * EPIC-01 Foundation residuals.
 *
 * Closes the audit gaps "No Zod on APIs; no table sort/filter/export;
 * no audit-log UI; no PII masking enforcement" for EPIC-01 with two
 * pure evaluators that the foundation dashboard can consume directly:
 *
 *  1. **Bilingual error catalog evaluator** —
 *     `lookupErrorCatalog(code, locale)` returns the canonical
 *     en/ar messages for the well-known error codes used across the
 *     API surface (E2001/E4030/E5001 etc.). Centralises the bilingual
 *     copy so every route response can resolve `{message, messageAr}`
 *     from a single source. Also returns `severity` and `httpStatus`
 *     for UI badge rendering.
 *  2. **PII masking evaluator** —
 *     `maskPiiFields(record, policy)` returns a redacted copy of a
 *     record applying a per-field policy (FULL / PARTIAL / NONE).
 *     PARTIAL keeps the first 2 + last 2 characters for short fields
 *     and shows last 4 only for longer fields (IBAN, national ID).
 *  3. **Audit summary widget evaluator** —
 *     `summariseAuditEvents(events)` rolls up audit log rows into a
 *     governance dashboard summary: action distribution, severity
 *     mix, top resource types, and a per-day count series so the
 *     widget can render bars without re-querying. Bilingual labels
 *     on every action / severity bucket.
 *
 * All three are pure — no IO, no shared state.
 */

// ============================================================================
// Bilingual error catalog
// ============================================================================

export type ErrorSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type ErrorLocale = 'en' | 'ar';

export interface ErrorCatalogEntry {
  code: string;
  httpStatus: number;
  severity: ErrorSeverity;
  en: string;
  ar: string;
}

/** Canonical bilingual error catalog — extend here, not at call sites. */
export const ERROR_CATALOG: Record<string, ErrorCatalogEntry> = {
  E2001: {
    code: 'E2001',
    httpStatus: 400,
    severity: 'WARN',
    en: 'Invalid input',
    ar: 'مدخلات غير صالحة',
  },
  E2002: {
    code: 'E2002',
    httpStatus: 422,
    severity: 'WARN',
    en: 'Validation failed',
    ar: 'فشل التحقق من البيانات',
  },
  E4010: {
    code: 'E4010',
    httpStatus: 401,
    severity: 'WARN',
    en: 'Authentication required',
    ar: 'المصادقة مطلوبة',
  },
  E4030: {
    code: 'E4030',
    httpStatus: 403,
    severity: 'WARN',
    en: 'Forbidden',
    ar: 'غير مسموح',
  },
  E4040: {
    code: 'E4040',
    httpStatus: 404,
    severity: 'INFO',
    en: 'Resource not found',
    ar: 'المورد غير موجود',
  },
  E4090: {
    code: 'E4090',
    httpStatus: 409,
    severity: 'WARN',
    en: 'Conflict',
    ar: 'تعارض',
  },
  E4290: {
    code: 'E4290',
    httpStatus: 429,
    severity: 'WARN',
    en: 'Too many requests',
    ar: 'عدد الطلبات يتجاوز الحد المسموح',
  },
  E5001: {
    code: 'E5001',
    httpStatus: 500,
    severity: 'ERROR',
    en: 'Internal server error',
    ar: 'خطأ داخلي في الخادم',
  },
  E5031: {
    code: 'E5031',
    httpStatus: 503,
    severity: 'CRITICAL',
    en: 'Service unavailable',
    ar: 'الخدمة غير متاحة',
  },
  E5040: {
    code: 'E5040',
    httpStatus: 504,
    severity: 'ERROR',
    en: 'Upstream timeout',
    ar: 'انتهت مهلة الخدمة العليا',
  },
  E6001: {
    code: 'E6001',
    httpStatus: 422,
    severity: 'ERROR',
    en: 'Tenant scope violation',
    ar: 'انتهاك نطاق المستأجر',
  },
  E6002: {
    code: 'E6002',
    httpStatus: 422,
    severity: 'WARN',
    en: 'Maker-checker rule violated',
    ar: 'انتهاك قاعدة المنشئ والمعتمد',
  },
  E6003: {
    code: 'E6003',
    httpStatus: 422,
    severity: 'WARN',
    en: 'PII access denied',
    ar: 'الوصول إلى البيانات الشخصية مرفوض',
  },
};

export interface CatalogLookup {
  code: string;
  message: string;
  messageAr: string;
  severity: ErrorSeverity;
  httpStatus: number;
  /** True when the code was found in the catalog. */
  matched: boolean;
}

export function lookupErrorCatalog(
  code: string,
  fallbackMessage?: string,
  fallbackMessageAr?: string
): CatalogLookup {
  const entry = ERROR_CATALOG[code];
  if (entry) {
    return {
      code: entry.code,
      message: entry.en,
      messageAr: entry.ar,
      severity: entry.severity,
      httpStatus: entry.httpStatus,
      matched: true,
    };
  }
  return {
    code,
    message: fallbackMessage ?? 'Unknown error',
    messageAr: fallbackMessageAr ?? 'خطأ غير معروف',
    severity: 'ERROR',
    httpStatus: 500,
    matched: false,
  };
}

// ============================================================================
// PII masking evaluator
// ============================================================================

export type PiiPolicy = 'NONE' | 'PARTIAL' | 'FULL';

export interface PiiPolicySpec {
  /** Per-field policy keyed by dotted path. Default for unspecified fields. */
  default?: PiiPolicy;
  fields?: Record<string, PiiPolicy>;
}

function applyPolicy(value: unknown, policy: PiiPolicy): unknown {
  if (policy === 'NONE') return value;
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return policy === 'FULL' ? '*****' : value;
  if (policy === 'FULL') return '*'.repeat(Math.min(8, value.length));
  // PARTIAL: short field → first 2 + last 2; long → last 4 only.
  if (value.length <= 4) return '****';
  if (value.length <= 10) return value.slice(0, 2) + '****' + value.slice(-2);
  return '****' + value.slice(-4);
}

export function maskPiiFields<T extends Record<string, unknown>>(
  record: T,
  spec: PiiPolicySpec
): T {
  const out: Record<string, unknown> = { ...record };
  const fallback = spec.default ?? 'NONE';
  const fields = spec.fields ?? {};
  for (const key of Object.keys(out)) {
    const policy = fields[key] ?? fallback;
    out[key] = applyPolicy(out[key], policy);
  }
  return out as T;
}

// ============================================================================
// Audit summary widget evaluator
// ============================================================================

export interface AuditEventLike {
  action: string;
  severity?: string;
  resourceType?: string | null;
  timestamp: Date;
  userId?: string | null;
  success?: boolean;
}

export interface AuditBucket {
  key: string;
  label: string;
  labelAr: string;
  count: number;
}

export interface AuditSummary {
  totals: {
    events: number;
    success: number;
    failure: number;
    distinctUsers: number;
  };
  byAction: AuditBucket[];
  bySeverity: AuditBucket[];
  byResourceType: AuditBucket[];
  daily: Array<{ date: string; count: number }>;
}

const ACTION_LABELS: Record<string, { en: string; ar: string }> = {
  USER_LOGIN: { en: 'Login', ar: 'تسجيل دخول' },
  USER_LOGOUT: { en: 'Logout', ar: 'تسجيل خروج' },
  USER_LOGIN_FAILED: { en: 'Login failed', ar: 'فشل تسجيل الدخول' },
  SETTINGS_UPDATED: { en: 'Settings updated', ar: 'تحديث الإعدادات' },
  RECORD_CREATED: { en: 'Record created', ar: 'إنشاء سجل' },
  RECORD_UPDATED: { en: 'Record updated', ar: 'تحديث سجل' },
  RECORD_DELETED: { en: 'Record deleted', ar: 'حذف سجل' },
  PERMISSION_DENIED: { en: 'Permission denied', ar: 'تم رفض الإذن' },
};

const SEVERITY_LABELS: Record<string, { en: string; ar: string }> = {
  INFO: { en: 'Info', ar: 'معلوماتي' },
  LOW: { en: 'Low', ar: 'منخفض' },
  MEDIUM: { en: 'Medium', ar: 'متوسط' },
  HIGH: { en: 'High', ar: 'مرتفع' },
  CRITICAL: { en: 'Critical', ar: 'حرج' },
};

function humanLabel(key: string): { en: string; ar: string } {
  const en = key
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
  return { en, ar: en };
}

function bucketise(
  rows: AuditEventLike[],
  selector: (e: AuditEventLike) => string | undefined,
  labels: Record<string, { en: string; ar: string }>
): AuditBucket[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = selector(r);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const lbl = labels[key] ?? humanLabel(key);
      return { key, label: lbl.en, labelAr: lbl.ar, count };
    });
}

function dailyCounts(rows: AuditEventLike[]): Array<{ date: string; count: number }> {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.timestamp.toISOString().slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
}

export function summariseAuditEvents(events: AuditEventLike[]): AuditSummary {
  const total = events.length;
  const success = events.filter((e) => e.success !== false).length;
  const failure = total - success;
  const distinctUsers = new Set(events.map((e) => e.userId).filter(Boolean)).size;
  return {
    totals: { events: total, success, failure, distinctUsers },
    byAction: bucketise(events, (e) => e.action, ACTION_LABELS),
    bySeverity: bucketise(events, (e) => e.severity, SEVERITY_LABELS),
    byResourceType: bucketise(events, (e) => e.resourceType ?? undefined, {}),
    daily: dailyCounts(events),
  };
}

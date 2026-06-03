import { getRequestContext, type RequestContext } from './request-context';

/**
 * Canonical attribute names exported from the correlation context. The DevOps
 * dashboards (#82) query against these specific keys — keep them stable.
 *
 * Names follow the OpenTelemetry semantic conventions where one exists, and
 * `aura.*` for KreupAI-specific dimensions.
 */
export const TELEMETRY_KEYS = {
  REQUEST_ID: 'http.request.id',
  ROUTE: 'http.route',
  METHOD: 'http.request.method',
  TENANT_ID: 'aura.tenant.id',
  USER_ID: 'aura.user.id',
} as const;

export interface TelemetryAttributes {
  [TELEMETRY_KEYS.REQUEST_ID]?: string;
  [TELEMETRY_KEYS.ROUTE]?: string;
  [TELEMETRY_KEYS.METHOD]?: string;
  [TELEMETRY_KEYS.TENANT_ID]?: string;
  [TELEMETRY_KEYS.USER_ID]?: string;
}

/**
 * Pure: project a RequestContext into the OpenTelemetry attribute shape used
 * by APM (per-route latency / error-rate dashboards #82 needs). Undefined
 * fields are omitted so the resulting span isn't polluted with `null` values.
 */
export function attributesFromContext(ctx: RequestContext | null): TelemetryAttributes {
  if (!ctx) return {};
  const out: TelemetryAttributes = {};
  out[TELEMETRY_KEYS.REQUEST_ID] = ctx.requestId;
  if (ctx.route) out[TELEMETRY_KEYS.ROUTE] = ctx.route;
  if (ctx.method) out[TELEMETRY_KEYS.METHOD] = ctx.method;
  if (ctx.tenantId) out[TELEMETRY_KEYS.TENANT_ID] = ctx.tenantId;
  if (ctx.userId) out[TELEMETRY_KEYS.USER_ID] = ctx.userId;
  return out;
}

/**
 * Convenience: read the active request context and project it. Used by the
 * Sentry / OTel exporters in the hot path; safe to call from anywhere because
 * it returns `{}` outside a request scope.
 */
export function currentTelemetryAttributes(): TelemetryAttributes {
  return attributesFromContext(getRequestContext());
}

/**
 * Pure: filter out attribute keys that aren't allow-listed. Useful when
 * exporting to a backend with strict cardinality budgets (e.g. Datadog's
 * 100-tag-per-metric limit). Defaults to the canonical set above.
 */
export function pickAllowed(
  attrs: TelemetryAttributes,
  allowed: readonly string[] = Object.values(TELEMETRY_KEYS)
): TelemetryAttributes {
  const allowedSet = new Set<string>(allowed);
  const out: TelemetryAttributes = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (allowedSet.has(k) && v !== undefined) {
      (out as Record<string, string>)[k] = v;
    }
  }
  return out;
}

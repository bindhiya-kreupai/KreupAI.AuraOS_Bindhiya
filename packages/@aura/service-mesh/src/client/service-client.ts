/**
 * ServiceClient
 *
 * Type-safe HTTP client for AuraOS inter-service communication.
 * Features:
 *   - Service registry: map service names to base URLs (env-driven)
 *   - Correlation ID & auth token propagation
 *   - Per-service timeout configuration
 *   - Retry with exponential back-off
 *   - Request/response interceptors
 *   - Integrated CircuitBreaker + LoadBalancer per service
 *
 * @module @aura/service-mesh
 */

import { CircuitBreaker, CircuitBreakerOptions } from './circuit-breaker';
import { LoadBalancer, LoadBalancingStrategy } from './load-balancer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ServiceRegistry {
  [serviceName: string]: string | string[];
}

export interface ServiceCallOptions {
  /** Override the timeout for this call (ms). */
  timeout?: number;
  /** Override retry count for this call. */
  retries?: number;
  /** Additional headers. */
  headers?: Record<string, string>;
  /** Skip circuit breaker for this call. */
  skipCircuitBreaker?: boolean;
}

export interface ServiceClientOptions {
  /** Service name → base URL(s) registry. Falls back to env vars. */
  registry?: ServiceRegistry;
  /** Default request timeout in ms. Default: 10000 */
  defaultTimeout?: number;
  /** Default retry count. Default: 3 */
  defaultRetries?: number;
  /** Load balancing strategy when multiple URLs are provided. Default: round-robin */
  loadBalancingStrategy?: LoadBalancingStrategy;
  /** Circuit breaker options applied to every service. */
  circuitBreakerOptions?: CircuitBreakerOptions;
  /** Auth token factory — called per request. */
  getAuthToken?: () => string | Promise<string>;
}

export interface ServiceResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  durationMs: number;
}

export type RequestInterceptor = (
  ctx: RequestContext
) => RequestContext | Promise<RequestContext>;

export type ResponseInterceptor = (
  ctx: ResponseContext
) => ResponseContext | Promise<ResponseContext>;

export interface RequestContext {
  service: string;
  method: HttpMethod;
  path: string;
  url: string;
  body?: unknown;
  headers: Record<string, string>;
  correlationId: string;
}

export interface ResponseContext {
  request: RequestContext;
  status: number;
  data: unknown;
  headers: Record<string, string>;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// ServiceClient
// ---------------------------------------------------------------------------

export class ServiceClient {
  private readonly registry: ServiceRegistry;
  private readonly defaultTimeout: number;
  private readonly defaultRetries: number;
  private readonly loadBalancingStrategy: LoadBalancingStrategy;
  private readonly circuitBreakerOptions: CircuitBreakerOptions;
  private readonly getAuthToken?: () => string | Promise<string>;

  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private readonly loadBalancers: Map<string, LoadBalancer> = new Map();
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(options: ServiceClientOptions = {}) {
    this.registry               = options.registry               ?? this.buildRegistryFromEnv();
    this.defaultTimeout         = options.defaultTimeout         ?? 10_000;
    this.defaultRetries         = options.defaultRetries         ?? 3;
    this.loadBalancingStrategy  = options.loadBalancingStrategy  ?? 'round-robin';
    this.circuitBreakerOptions  = options.circuitBreakerOptions  ?? {};
    this.getAuthToken           = options.getAuthToken;

    this.initLoadBalancers();
  }

  // -------------------------------------------------------------------------
  // Interceptors
  // -------------------------------------------------------------------------

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // -------------------------------------------------------------------------
  // Core call
  // -------------------------------------------------------------------------

  /**
   * Make a type-safe call to a registered service.
   *
   * @param service  Registered service name (e.g. 'payroll', 'notifications')
   * @param method   HTTP method
   * @param path     Path appended to the service base URL (e.g. '/employees/123')
   * @param data     Request body (for POST/PUT/PATCH)
   * @param options  Per-call overrides
   */
  async call<T = unknown>(
    service: string,
    method: HttpMethod,
    path: string,
    data?: unknown,
    options: ServiceCallOptions = {}
  ): Promise<ServiceResponse<T>> {
    const lb = this.getLoadBalancer(service);
    const baseUrl = lb.getNext();

    if (!baseUrl) {
      throw new Error(`[ServiceClient] No healthy instances for service "${service}"`);
    }

    const url = `${baseUrl.replace(/\/$/, '')}${path}`;
    const correlationId = this.generateCorrelationId();
    const timeout = options.timeout ?? this.defaultTimeout;
    const retries = options.retries ?? this.defaultRetries;

    // Build auth token header
    const authToken = this.getAuthToken ? await this.getAuthToken() : undefined;

    let reqCtx: RequestContext = {
      service,
      method,
      path,
      url,
      body: data,
      correlationId,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Correlation-Id': correlationId,
        'X-Source-Service': 'aura-client',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers ?? {}),
      },
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      reqCtx = await interceptor(reqCtx);
    }

    // Execute with circuit breaker + retries
    const cb = options.skipCircuitBreaker ? null : this.getCircuitBreaker(service);

    const executeCall = () => this.executeWithRetry<T>(reqCtx, lb, timeout, retries);

    const rawResult = cb
      ? await cb.execute(executeCall)
      : await executeCall();

    // Apply response interceptors
    let resCtx: ResponseContext = {
      request: reqCtx,
      status: rawResult.status,
      data: rawResult.data,
      headers: rawResult.headers,
      durationMs: rawResult.durationMs,
    };

    for (const interceptor of this.responseInterceptors) {
      resCtx = await interceptor(resCtx);
    }

    return {
      data: resCtx.data as T,
      status: resCtx.status,
      headers: resCtx.headers,
      durationMs: resCtx.durationMs,
    };
  }

  // -------------------------------------------------------------------------
  // Convenience wrappers
  // -------------------------------------------------------------------------

  get<T>(service: string, path: string, opts?: ServiceCallOptions): Promise<ServiceResponse<T>> {
    return this.call<T>(service, 'GET', path, undefined, opts);
  }

  post<T>(service: string, path: string, data?: unknown, opts?: ServiceCallOptions): Promise<ServiceResponse<T>> {
    return this.call<T>(service, 'POST', path, data, opts);
  }

  put<T>(service: string, path: string, data?: unknown, opts?: ServiceCallOptions): Promise<ServiceResponse<T>> {
    return this.call<T>(service, 'PUT', path, data, opts);
  }

  patch<T>(service: string, path: string, data?: unknown, opts?: ServiceCallOptions): Promise<ServiceResponse<T>> {
    return this.call<T>(service, 'PATCH', path, data, opts);
  }

  delete<T>(service: string, path: string, opts?: ServiceCallOptions): Promise<ServiceResponse<T>> {
    return this.call<T>(service, 'DELETE', path, undefined, opts);
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private async executeWithRetry<T>(
    ctx: RequestContext,
    lb: LoadBalancer,
    timeout: number,
    retries: number
  ): Promise<ServiceResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        const delayMs = Math.min(100 * Math.pow(2, attempt - 1), 8_000);
        await this.sleep(delayMs);
        console.debug(
          `[ServiceClient] Retry ${attempt}/${retries} for ${ctx.service}${ctx.path}`
        );
      }

      lb.incrementConnections(ctx.url);
      const start = Date.now();

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(ctx.url, {
          method: ctx.method,
          headers: ctx.headers,
          body: ctx.body !== undefined ? JSON.stringify(ctx.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);
        const durationMs = Date.now() - start;

        let data: unknown;
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          throw new ServiceCallError(
            `[ServiceClient] ${ctx.service} responded ${response.status}`,
            response.status,
            data
          );
        }

        const headers: Record<string, string> = {};
        response.headers.forEach((v, k) => { headers[k] = v; });

        return { data: data as T, status: response.status, headers, durationMs };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Don't retry 4xx errors
        if (err instanceof ServiceCallError && err.status >= 400 && err.status < 500) {
          lb.decrementConnections(ctx.url);
          throw err;
        }
      } finally {
        lb.decrementConnections(ctx.url);
      }
    }

    throw lastError ?? new Error(`[ServiceClient] Call to ${ctx.service} failed`);
  }

  private getCircuitBreaker(service: string): CircuitBreaker {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(
        service,
        new CircuitBreaker({ name: service, ...this.circuitBreakerOptions })
      );
    }
    return this.circuitBreakers.get(service)!;
  }

  private getLoadBalancer(service: string): LoadBalancer {
    if (!this.loadBalancers.has(service)) {
      // Lazily create LB for unknown services using env fallback
      const lb = new LoadBalancer({ strategy: this.loadBalancingStrategy });
      const urls = this.registry[service];
      if (urls) {
        const list = Array.isArray(urls) ? urls : [urls];
        list.forEach((u) => lb.addInstance(u));
      } else {
        throw new Error(`[ServiceClient] Service "${service}" not found in registry`);
      }
      this.loadBalancers.set(service, lb);
    }
    return this.loadBalancers.get(service)!;
  }

  private initLoadBalancers(): void {
    for (const [service, urls] of Object.entries(this.registry)) {
      const lb = new LoadBalancer({ strategy: this.loadBalancingStrategy });
      const list = Array.isArray(urls) ? urls : [urls];
      list.forEach((u) => lb.addInstance(u));
      this.loadBalancers.set(service, lb);
    }
  }

  private buildRegistryFromEnv(): ServiceRegistry {
    return {
      payroll:       process.env.PAYROLL_SERVICE_URL       ?? 'http://payroll-service:3001',
      notifications: process.env.NOTIFICATION_SERVICE_URL  ?? 'http://notification-service:3002',
      attendance:    process.env.ATTENDANCE_SERVICE_URL    ?? 'http://attendance-service:3003',
      recruitment:   process.env.RECRUITMENT_SERVICE_URL   ?? 'http://recruitment-service:3004',
      compliance:    process.env.COMPLIANCE_SERVICE_URL    ?? 'http://compliance-service:3005',
      analytics:     process.env.ANALYTICS_SERVICE_URL     ?? 'http://analytics-service:3006',
      learning:      process.env.LEARNING_SERVICE_URL      ?? 'http://learning-service:3007',
      performance:   process.env.PERFORMANCE_SERVICE_URL   ?? 'http://performance-service:3008',
    };
  }

  private generateCorrelationId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // -------------------------------------------------------------------------
  // Circuit breaker monitoring
  // -------------------------------------------------------------------------

  getCircuitBreakerStats(service: string) {
    return this.circuitBreakers.get(service)?.getStats() ?? null;
  }

  getAllCircuitBreakerStats() {
    const result: Record<string, ReturnType<CircuitBreaker['getStats']>> = {};
    for (const [name, cb] of this.circuitBreakers.entries()) {
      result[name] = cb.getStats();
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// ServiceCallError
// ---------------------------------------------------------------------------

export class ServiceCallError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ServiceCallError';
  }
}

// ---------------------------------------------------------------------------
// Singleton factory
// ---------------------------------------------------------------------------

let _instance: ServiceClient | null = null;

export function getServiceClient(options?: ServiceClientOptions): ServiceClient {
  if (!_instance) {
    _instance = new ServiceClient(options);
  }
  return _instance;
}

export function resetServiceClient(): void {
  _instance = null;
}

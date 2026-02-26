/**
 * @aura/service-mesh
 * AuraOS inter-service communication layer.
 *
 * Exports:
 *   - ServiceClient     — Type-safe HTTP client with service registry, retry, interceptors
 *   - CircuitBreaker    — CLOSED → OPEN → HALF_OPEN state machine
 *   - LoadBalancer      — Round-robin / random / least-connections strategies
 */

// Service client
export {
  ServiceClient,
  ServiceCallError,
  getServiceClient,
  resetServiceClient,
} from './client/service-client';

export type {
  HttpMethod,
  ServiceRegistry,
  ServiceCallOptions,
  ServiceClientOptions,
  ServiceResponse,
  RequestInterceptor,
  ResponseInterceptor,
  RequestContext,
  ResponseContext,
} from './client/service-client';

// Circuit breaker
export {
  CircuitBreaker,
  CircuitOpenError,
} from './client/circuit-breaker';

export type {
  CircuitState,
  CircuitBreakerOptions,
  CircuitStats,
  CircuitEventType,
  CircuitEventListener,
} from './client/circuit-breaker';

// Load balancer
export { LoadBalancer } from './client/load-balancer';

export type {
  LoadBalancingStrategy,
  ServiceInstance,
  LoadBalancerOptions,
} from './client/load-balancer';

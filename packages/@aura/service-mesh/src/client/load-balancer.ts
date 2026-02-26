/**
 * LoadBalancer
 *
 * Client-side load balancing with pluggable strategies.
 * Health-aware: unhealthy instances are skipped automatically.
 *
 * Strategies:
 *   round-robin       — Cycle through instances in order (default).
 *   random            — Pick a random healthy instance.
 *   least-connections — Pick the instance with the fewest active connections.
 *
 * @module @aura/service-mesh
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoadBalancingStrategy = 'round-robin' | 'random' | 'least-connections';

export interface ServiceInstance {
  url: string;
  healthy: boolean;
  activeConnections: number;
  weight: number;
  lastChecked: number;
  /** Total requests served by this instance since registration. */
  totalRequests: number;
}

export interface LoadBalancerOptions {
  strategy?: LoadBalancingStrategy;
  /** Milliseconds after which an unhealthy instance is retried. Default: 30000 */
  unhealthyRetryMs?: number;
}

// ---------------------------------------------------------------------------
// LoadBalancer
// ---------------------------------------------------------------------------

export class LoadBalancer {
  private instances: Map<string, ServiceInstance> = new Map();
  private rrIndex = 0;
  private readonly strategy: LoadBalancingStrategy;
  private readonly unhealthyRetryMs: number;

  constructor(options: LoadBalancerOptions = {}) {
    this.strategy          = options.strategy          ?? 'round-robin';
    this.unhealthyRetryMs  = options.unhealthyRetryMs  ?? 30_000;
  }

  // -------------------------------------------------------------------------
  // Instance management
  // -------------------------------------------------------------------------

  addInstance(url: string, weight = 1): void {
    if (this.instances.has(url)) return;

    this.instances.set(url, {
      url,
      healthy: true,
      activeConnections: 0,
      weight,
      lastChecked: Date.now(),
      totalRequests: 0,
    });

    console.debug(`[LoadBalancer] Added instance: ${url}`);
  }

  removeInstance(url: string): void {
    if (this.instances.delete(url)) {
      console.debug(`[LoadBalancer] Removed instance: ${url}`);
    }
  }

  markHealthy(url: string): void {
    const inst = this.instances.get(url);
    if (inst) {
      inst.healthy = true;
      inst.lastChecked = Date.now();
    }
  }

  markUnhealthy(url: string): void {
    const inst = this.instances.get(url);
    if (inst) {
      inst.healthy = false;
      inst.lastChecked = Date.now();
      console.warn(`[LoadBalancer] Instance marked unhealthy: ${url}`);
    }
  }

  // -------------------------------------------------------------------------
  // Connection tracking
  // -------------------------------------------------------------------------

  incrementConnections(url: string): void {
    const inst = this.instances.get(url);
    if (inst) {
      inst.activeConnections += 1;
      inst.totalRequests += 1;
    }
  }

  decrementConnections(url: string): void {
    const inst = this.instances.get(url);
    if (inst && inst.activeConnections > 0) {
      inst.activeConnections -= 1;
    }
  }

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------

  /**
   * Return the next instance URL based on the configured strategy.
   * Returns null if no healthy instances are available.
   */
  getNext(): string | null {
    const healthy = this.getHealthyInstances();

    if (healthy.length === 0) {
      console.warn('[LoadBalancer] No healthy instances available');
      return null;
    }

    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobin(healthy);
      case 'random':
        return this.random(healthy);
      case 'least-connections':
        return this.leastConnections(healthy);
      default:
        return this.roundRobin(healthy);
    }
  }

  // -------------------------------------------------------------------------
  // Strategies
  // -------------------------------------------------------------------------

  private roundRobin(healthy: ServiceInstance[]): string {
    this.rrIndex = this.rrIndex % healthy.length;
    const chosen = healthy[this.rrIndex];
    this.rrIndex = (this.rrIndex + 1) % healthy.length;
    return chosen.url;
  }

  private random(healthy: ServiceInstance[]): string {
    const idx = Math.floor(Math.random() * healthy.length);
    return healthy[idx].url;
  }

  private leastConnections(healthy: ServiceInstance[]): string {
    let min = Infinity;
    let chosen = healthy[0];

    for (const inst of healthy) {
      if (inst.activeConnections < min) {
        min = inst.activeConnections;
        chosen = inst;
      }
    }

    return chosen.url;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private getHealthyInstances(): ServiceInstance[] {
    const now = Date.now();
    const healthy: ServiceInstance[] = [];

    for (const inst of this.instances.values()) {
      // Re-check unhealthy instances after retry window
      if (!inst.healthy && now - inst.lastChecked < this.unhealthyRetryMs) {
        continue;
      }

      // Treat as healthy (either was healthy, or retry window expired)
      healthy.push(inst);
    }

    return healthy;
  }

  // -------------------------------------------------------------------------
  // Monitoring
  // -------------------------------------------------------------------------

  getAllInstances(): ServiceInstance[] {
    return Array.from(this.instances.values());
  }

  getHealthyCount(): number {
    return this.getHealthyInstances().length;
  }

  getTotalInstances(): number {
    return this.instances.size;
  }
}

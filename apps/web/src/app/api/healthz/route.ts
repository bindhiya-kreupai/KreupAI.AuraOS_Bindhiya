import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/healthz — Kubernetes liveness probe
 *
 * Answers ONE question: is this process alive and serving HTTP?
 * Returns 200 with the smallest possible body. Makes NO external
 * calls — no DB query, no Redis ping, nothing. A liveness probe
 * that depends on external systems would let a transient DB
 * outage trigger pod restarts and turn a recoverable problem
 * into a cascade failure.
 *
 * If you need to know whether the pod is ready to take traffic
 * (DB, Redis, etc. up), use /api/readyz instead.
 */
export function GET() {
  return NextResponse.json({ status: 'alive', uptime: process.uptime() }, { status: 200 });
}

/**
 * HEAD /api/healthz — same answer, no body
 * Some k8s configurations prefer HEAD for liveness probes.
 */
export function HEAD() {
  return new NextResponse(null, { status: 200 });
}

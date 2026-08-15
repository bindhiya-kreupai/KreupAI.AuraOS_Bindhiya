/**
 * Helper to check if the code is running during Next.js production build phase.
 * Used to prevent infrastructure (Redis, RabbitMQ, Sentry, OTel, Sockets)
 * from establishing TCP/WS connections or spawning worker threads during `next build`.
 */
export function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.IS_BUILD === 'true'
  );
}

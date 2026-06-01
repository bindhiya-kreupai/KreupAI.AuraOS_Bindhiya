/** @type {import('next').NextConfig} */
const nextConfig = {
  // #29 — Build-error ratchet.
  // Baseline 2026-06-01: 3,926 TS errors. Today (2026-06-02): 473 TS errors
  // remaining (~88% reduction). The rest are tracked under #29 sub-issues
  // (#29a–#29z) and concentrated in API routes / lib services with active
  // Prisma schema drift.
  //
  // We keep `ignoreBuildErrors: true` so the build doesn't gate on the
  // remaining 473, but `scripts/typecheck-ratchet.sh` (run in CI) enforces
  // a strict ceiling from `apps/web/.typecheck-baseline` — any PR that
  // INCREASES the count fails. Each fix wave should LOWER the baseline.
  //
  // To flip `ignoreBuildErrors: false`: drive the count to 0, then change
  // both flags here AND remove the ratchet script.
  //
  // DO NOT add code that depends on these staying true.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@elastic/elasticsearch',
      '@elastic/transport',
      'undici',
      '@aura/search',
      '@aura/events',
      '@aura/messaging',
      '@aura/monitoring',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@elastic/elasticsearch': 'commonjs @elastic/elasticsearch',
        '@elastic/transport': 'commonjs @elastic/transport',
        'undici': 'commonjs undici',
        '@aura/search': 'commonjs @aura/search',
        '@aura/events': 'commonjs @aura/events',
        '@aura/messaging': 'commonjs @aura/messaging',
        '@aura/monitoring': 'commonjs @aura/monitoring',
      });
    }
    return config;
  },
};

module.exports = nextConfig;

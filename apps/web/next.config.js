/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIXME(#29): both `ignoreDuringBuilds` and `ignoreBuildErrors` mask real errors.
  // Baseline as of 2026-06-01 in apps/web: 3,926 TypeScript errors + 644 ESLint errors.
  // Flipping these to `false` today blocks every build until the backlog is cleared.
  // Treat this as a multi-week initiative — see GitHub issue #29 for the rollout plan
  // and current error breakdown. DO NOT add code that depends on these staying true.
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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

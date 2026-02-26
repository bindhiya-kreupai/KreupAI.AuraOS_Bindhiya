/**
 * CDN Configuration Generator
 *
 * Generates provider-specific CDN configurations for AWS CloudFront and
 * Cloudflare, including cache policies, asset optimisation rules, and CORS
 * headers for AuraOS.
 *
 * @module @aura/cloud
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CDNProvider = 'cloudfront' | 'cloudflare';

export type AssetType =
  | 'static'    // JS, CSS, fonts, images
  | 'dynamic'   // API responses with short TTL
  | 'api'       // REST/GraphQL API responses (no cache or minimal)
  | 'media';    // Video, large file downloads

export interface CachePolicy {
  name: string;
  minTtlSeconds: number;
  defaultTtlSeconds: number;
  maxTtlSeconds: number;
  compressObjects: boolean;
  headerBehavior: 'none' | 'whitelist' | 'all';
  headers: string[];
  queryStringBehavior: 'none' | 'whitelist' | 'all';
  queryStrings: string[];
  cookieBehavior: 'none' | 'whitelist' | 'all';
  cookies: string[];
}

export interface CloudFrontOrigin {
  id: string;
  domainName: string;
  protocol: 'https-only' | 'http-only' | 'match-viewer';
  customHeaders?: Record<string, string>;
  originPath?: string;
}

export interface CloudFrontBehavior {
  pathPattern: string;
  originId: string;
  viewerProtocolPolicy: 'redirect-to-https' | 'https-only' | 'allow-all';
  cachePolicyId?: string;
  allowedMethods: string[];
  compress: boolean;
  functionAssociations?: Array<{
    functionArn: string;
    eventType: 'viewer-request' | 'viewer-response';
  }>;
}

export interface CloudFrontDistributionConfig {
  comment: string;
  enabled: boolean;
  httpVersion: 'http2' | 'http2and3';
  ipv6Enabled: boolean;
  priceClass: 'PriceClass_All' | 'PriceClass_200' | 'PriceClass_100';
  defaultRootObject: string;
  aliases: string[];
  origins: CloudFrontOrigin[];
  defaultCacheBehavior: CloudFrontBehavior;
  cacheBehaviors: CloudFrontBehavior[];
  customErrorResponses: Array<{
    errorCode: number;
    responseCode: number;
    responsePagePath: string;
    errorCachingMinTtl: number;
  }>;
  viewerCertificate: {
    acmCertificateArn?: string;
    sslSupportMethod: 'sni-only' | 'vip';
    minimumProtocolVersion: string;
  };
  webACLId?: string;
}

export interface CloudflarePageRule {
  url: string;
  actions: Record<string, unknown>;
}

export interface CloudflareConfig {
  zone: string;
  tieredCaching: boolean;
  minify: { js: boolean; css: boolean; html: boolean };
  cacheRules: Array<{
    description: string;
    expression: string;
    action: 'cache' | 'bypass' | 'set_cache_settings';
    cacheTtl?: number;
  }>;
  pageRules: CloudflarePageRule[];
  securityLevel: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack';
  sslMode: 'off' | 'flexible' | 'full' | 'strict';
}

export interface AssetOptimizationConfig {
  webpConversion: boolean;
  avifConversion: boolean;
  imageResizing: boolean;
  lazyLoading: boolean;
  responsiveBreakpoints: number[];
  qualityLevels: Record<string, number>;
  stripMetadata: boolean;
}

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAgeSecs: number;
  allowCredentials: boolean;
}

// ---------------------------------------------------------------------------
// CDN Configuration Generator
// ---------------------------------------------------------------------------

export class CDNConfigGenerator {

  /**
   * Get a provider-specific CDN configuration.
   */
  getCDNConfig(provider: CDNProvider): CloudFrontDistributionConfig | CloudflareConfig {
    if (provider === 'cloudfront') return this.generateCloudFrontDistribution();
    return this.generateCloudflareConfig();
  }

  /**
   * Generate a full AWS CloudFront distribution configuration for AuraOS.
   */
  generateCloudFrontDistribution(): CloudFrontDistributionConfig {
    const staticPolicy = this.generateCachePolicy('static');
    const dynamicPolicy = this.generateCachePolicy('dynamic');
    const apiPolicy = this.generateCachePolicy('api');

    return {
      comment: 'AuraOS HCM Platform CDN Distribution',
      enabled: true,
      httpVersion: 'http2and3',
      ipv6Enabled: true,
      priceClass: 'PriceClass_All',
      defaultRootObject: 'index.html',
      aliases: ['app.auraos.app', 'www.auraos.app'],
      origins: [
        {
          id: 'auraos-web-origin',
          domainName: 'alb.auraos.internal',
          protocol: 'https-only',
          customHeaders: {
            'X-Origin-Verify': 'REPLACE_WITH_SECRET',
          },
        },
        {
          id: 'auraos-api-origin',
          domainName: 'api-alb.auraos.internal',
          protocol: 'https-only',
          originPath: '/v1',
        },
        {
          id: 'auraos-assets-s3',
          domainName: 'auraos-assets.s3.amazonaws.com',
          protocol: 'https-only',
          originPath: '/static',
        },
      ],
      defaultCacheBehavior: {
        pathPattern: '*',
        originId: 'auraos-web-origin',
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
        compress: true,
      },
      cacheBehaviors: [
        // Static assets — long TTL
        {
          pathPattern: '/_next/static/*',
          originId: 'auraos-assets-s3',
          viewerProtocolPolicy: 'redirect-to-https',
          cachePolicyId: staticPolicy.name,
          allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          compress: true,
        },
        // Images and media
        {
          pathPattern: '/assets/*',
          originId: 'auraos-assets-s3',
          viewerProtocolPolicy: 'redirect-to-https',
          cachePolicyId: staticPolicy.name,
          allowedMethods: ['GET', 'HEAD'],
          compress: true,
        },
        // API — minimal caching
        {
          pathPattern: '/api/*',
          originId: 'auraos-api-origin',
          viewerProtocolPolicy: 'https-only',
          cachePolicyId: apiPolicy.name,
          allowedMethods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
          compress: false,
        },
      ],
      customErrorResponses: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: '/index.html',
          errorCachingMinTtl: 0,
        },
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html',
          errorCachingMinTtl: 0,
        },
      ],
      viewerCertificate: {
        acmCertificateArn: 'arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID',
        sslSupportMethod: 'sni-only',
        minimumProtocolVersion: 'TLSv1.2_2021',
      },
      webACLId: 'arn:aws:wafv2:us-east-1:ACCOUNT_ID:global/webacl/auraos-waf/WEBACL_ID',
    };
  }

  /**
   * Generate a Cloudflare CDN configuration.
   */
  generateCloudflareConfig(): CloudflareConfig {
    return {
      zone: 'auraos.app',
      tieredCaching: true,
      minify: { js: true, css: true, html: false },
      securityLevel: 'medium',
      sslMode: 'strict',
      cacheRules: [
        {
          description: 'Cache static assets for 1 year',
          expression: '(http.request.uri.path matches "^/_next/static/.*") or (http.request.uri.path matches "^/assets/.*")',
          action: 'set_cache_settings',
          cacheTtl: 31_536_000,
        },
        {
          description: 'Bypass cache for API routes',
          expression: 'http.request.uri.path matches "^/api/.*"',
          action: 'bypass',
        },
        {
          description: 'Short cache for dynamic pages',
          expression: 'http.request.uri.path matches "^/dashboard/.*"',
          action: 'set_cache_settings',
          cacheTtl: 60,
        },
      ],
      pageRules: [
        {
          url: 'auraos.app/api/*',
          actions: { cache_level: 'bypass', disable_performance: false },
        },
        {
          url: 'auraos.app/_next/static/*',
          actions: { cache_level: 'cache_everything', edge_cache_ttl: 31_536_000 },
        },
      ],
    };
  }

  /**
   * Generate a cache policy based on asset type.
   */
  generateCachePolicy(assetType: AssetType): CachePolicy {
    const policies: Record<AssetType, CachePolicy> = {
      static: {
        name: 'AuraOS-StaticAssets',
        minTtlSeconds: 0,
        defaultTtlSeconds: 86_400,      // 1 day
        maxTtlSeconds: 31_536_000,       // 1 year (immutable hashed assets)
        compressObjects: true,
        headerBehavior: 'none',
        headers: [],
        queryStringBehavior: 'none',
        queryStrings: [],
        cookieBehavior: 'none',
        cookies: [],
      },
      dynamic: {
        name: 'AuraOS-DynamicContent',
        minTtlSeconds: 0,
        defaultTtlSeconds: 60,
        maxTtlSeconds: 300,
        compressObjects: true,
        headerBehavior: 'whitelist',
        headers: ['Accept', 'Accept-Encoding', 'Accept-Language'],
        queryStringBehavior: 'all',
        queryStrings: [],
        cookieBehavior: 'none',
        cookies: [],
      },
      api: {
        name: 'AuraOS-APIRoutes',
        minTtlSeconds: 0,
        defaultTtlSeconds: 0,
        maxTtlSeconds: 0,
        compressObjects: false,
        headerBehavior: 'all',
        headers: [],
        queryStringBehavior: 'all',
        queryStrings: [],
        cookieBehavior: 'all',
        cookies: [],
      },
      media: {
        name: 'AuraOS-MediaFiles',
        minTtlSeconds: 3_600,
        defaultTtlSeconds: 604_800,     // 1 week
        maxTtlSeconds: 2_592_000,        // 30 days
        compressObjects: false,
        headerBehavior: 'none',
        headers: [],
        queryStringBehavior: 'none',
        queryStrings: [],
        cookieBehavior: 'none',
        cookies: [],
      },
    };

    return policies[assetType];
  }

  /**
   * Get WebP/AVIF conversion and responsive image configuration.
   */
  getAssetOptimizationConfig(): AssetOptimizationConfig {
    return {
      webpConversion: true,
      avifConversion: true,
      imageResizing: true,
      lazyLoading: true,
      responsiveBreakpoints: [320, 480, 768, 1024, 1280, 1920],
      qualityLevels: {
        webp: 80,
        avif: 70,
        jpeg: 85,
        png: 90,
      },
      stripMetadata: true,
    };
  }

  /**
   * Get CORS configuration for CDN-served assets.
   */
  getCORSConfig(): CORSConfig {
    return {
      allowedOrigins: [
        'https://app.auraos.app',
        'https://staging.auraos.app',
        'https://www.auraos.app',
      ],
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: [
        'Accept',
        'Accept-Encoding',
        'Accept-Language',
        'Authorization',
        'Content-Type',
        'Origin',
        'X-Requested-With',
      ],
      exposedHeaders: [
        'ETag',
        'Content-Length',
        'Content-Range',
        'X-Request-Id',
      ],
      maxAgeSecs: 86_400,
      allowCredentials: false,
    };
  }
}

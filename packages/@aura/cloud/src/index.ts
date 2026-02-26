/**
 * @aura/cloud
 * AuraOS Cloud & FinOps Package
 *
 * Exports:
 *   CDN:
 *     - CDNConfigGenerator — CloudFront & Cloudflare configuration generator
 *
 *   FinOps:
 *     - CostTracker        — Cost visibility, forecasting, anomalies, carbon
 */

// CDN Configuration
export { CDNConfigGenerator } from './cdn/cdn-config';

export type {
  CDNProvider,
  AssetType,
  CachePolicy,
  CloudFrontDistributionConfig,
  CloudFrontOrigin,
  CloudFrontBehavior,
  CloudflareConfig,
  CloudflarePageRule,
  AssetOptimizationConfig,
  CORSConfig,
} from './cdn/cdn-config';

// FinOps — Cost Tracking
export { CostTracker } from './finops/cost-tracker';

export type {
  CostPeriod,
  AWSService,
  ServiceCostEntry,
  ResourceCostSummary,
  TenantCostSummary,
  BudgetStatus,
  CostAnomaly,
  CostForecast,
  OptimizationType,
  OptimizationRecommendation,
  CarbonFootprint,
} from './finops/cost-tracker';

export type { AuthContext } from './types';
export { gccTenancyService, GccTenancyService } from './gcc-tenancy.service';
export type { EnableCountryInput, CreateLegalEntityInput } from './gcc-tenancy.service';
export { gccCountryProfileService, GccCountryProfileService } from './gcc-country-profile.service';
export {
  workforceClassificationService,
  WorkforceClassificationService,
} from './workforce-classification.service';
export type { ClassifyEmployeeInput } from './workforce-classification.service';
export {
  platformAlertService,
  PlatformAlertService,
  DEFAULT_THRESHOLD_LADDER,
} from './platform-alert.service';
export type {
  AlertThreshold,
  CreateAlertRuleInput,
  FireAlertInput,
} from './platform-alert.service';
export { gccRbacService, GccRbacService } from './gcc-rbac.service';
export type { GccPersona } from './gcc-rbac.service';
export {
  complianceRiskRegisterService,
  ComplianceRiskRegisterService,
  computeRating,
  RAG_BANDS,
} from './compliance-risk-register.service';
export type { RiskEntryInput } from './compliance-risk-register.service';
export { workforceKpiService, WorkforceKpiService, rag } from './workforce-kpi.service';
export type {
  LocalizationTargetInput,
  KpiSnapshotInput,
  KpiBucket,
  RagStatus,
} from './workforce-kpi.service';
export {
  gccLandscapeDashboardService,
  GccLandscapeDashboardService,
} from './gcc-landscape-dashboard.service';
export type { DashboardScopeFilter } from './gcc-landscape-dashboard.service';
export { digitalMaturityService, DigitalMaturityService } from './digital-maturity.service';
export type { MaturityInput } from './digital-maturity.service';
export {
  GCC_COUNTRY_CODES,
  GCC_COUNTRY_DEFAULTS,
  GCC_NATIONALITY_CODES,
  isGccCountry,
  deriveWorkforceClass,
} from './country-defaults';
export type { GccCountryCode, GccCountryDefaults, WorkforceClass } from './country-defaults';

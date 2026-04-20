/**
 * MENA & APAC Compliance Services
 * Centralized exports for all compliance-related services
 * Phase 2: GCC Social Security + Multi-Currency Support
 */

// ============================================================================
// CORE SERVICES
// ============================================================================

// UAE Services
export { WPSService } from './wps.service';

// KSA Services
export { GOSIService } from './gosi.service';
export { NitaqatService, NITAQAT_BAND_COLORS } from './nitaqat.service';
export { MudadService } from './mudad.service';

// Bahrain Services
export { BahrainSIOService, SIO_CONFIG } from './bahrain-sio.service';

// Qatar Services
export { QatarWPSService, QATAR_WPS_CONFIG, QATAR_BANKS } from './qatar-wps.service';

// Oman Services
export { OmanSPFService, SPF_CONFIG } from './oman-spf.service';

// Kuwait Services
export { KuwaitPIFSSService, PIFSS_CONFIG } from './kuwait-pifss.service';

// Common GCC Services
export { EOSBService } from './eosb.service';
export { LabourLawService } from './labour-law.service';

// India Services
export { IndiaStatutoryService } from './india-statutory.service';
export { Form16Service } from './india-form16.service';
export { ECRService, ECR_CONFIG } from './india-ecr.service';

// Multi-Currency Support
export { MultiCurrencyService, CURRENCIES, FIXED_USD_RATES } from './multi-currency.service';

// EX-01: UAE WPS Certification Readiness
export { WPSCertificationService } from './wps-certification.service';

// EX-02: KSA GOSI Law-Change Verification
export { GOSIVerificationService, GOSI_2025_RATES } from './gosi-verification.service';

// EX-03: India Filing Readiness
export { IndiaFilingReadinessService } from './india-filing-readiness.service';

// EX-04: Bahrain SIO Portal Readiness
export { BahrainSIOPortalService } from './bahrain-sio-portal.service';

// EX-05: KSA Qiwa Integration
export { QiwaService, QiwaAuthError, QiwaValidationError, QiwaAPIError } from './qiwa.service';

// EX-06: Kuwait AS'HAL Integration
export { KuwaitASHALService, ASHALValidationError } from './kuwait-ashal.service';

// EX-07: Compliance Observability
export { ComplianceObservabilityService } from './compliance-observability.service';

// ============================================================================
// TYPES
// ============================================================================

// Base Types
export * from './types';

// Mudad Types (KSA WPS)
export type {
  MudadConfiguration,
  MudadRecord,
  MudadSubmissionFile,
  MudadValidationResult,
  MudadValidationError,
  MudadValidationWarning,
} from './mudad.service';

// Bahrain SIO Types
export type {
  SIOConfiguration,
  SIOEmployeeData,
  SIOCalculationResult,
  SIOSubmissionRecord,
  SIOSubmissionFile,
  SIOValidationResult,
  SIOValidationError,
  SIOValidationWarning,
} from './bahrain-sio.service';

// Qatar WPS Types
export type {
  QatarWPSConfiguration,
  QatarEmployee,
  QatarWPSRecord,
  QatarWPSSubmissionFile,
  QatarWPSValidationResult,
  QatarWPSValidationError,
  QatarWPSValidationWarning,
  QatarMinimumWageCheck,
} from './qatar-wps.service';

// Oman SPF Types
export type {
  SPFConfiguration,
  SPFEmployeeData,
  SPFCalculationResult,
  SPFSubmissionRecord,
  SPFSubmissionFile,
  SPFValidationResult,
  SPFValidationError,
  SPFValidationWarning,
} from './oman-spf.service';

// Kuwait PIFSS Types
export type {
  PIFSSConfiguration,
  PIFSSEmployeeData,
  PIFSSCalculationResult,
  PIFSSSubmissionRecord,
  PIFSSSubmissionFile,
  PIFSSValidationResult,
  PIFSSValidationError,
  PIFSSValidationWarning,
} from './kuwait-pifss.service';

// India Statutory Types
export type {
  PFConfiguration,
  ESIConfiguration,
  ProfessionalTaxSlab,
  StateProfessionalTax,
  TaxSlab,
  IndiaEmployeeData,
  PFCalculationResult,
  ESICalculationResult,
  ProfessionalTaxResult,
  TDSCalculationResult,
  IndiaStatutoryResult,
} from './india-statutory.service';

// India Form 16 Types
export type {
  Form16EmployerDetails,
  Form16EmployeeDetails,
  Form16QuarterlyTDS,
  Form16SalaryDetails,
  Form16TaxComputation,
  Form16PartA,
  Form16PartB,
  Form16Complete,
} from './india-form16.service';

// India ECR Types
export type {
  ECREmployerDetails,
  ECRMemberDetails,
  ECRWageDetails,
  ECRContributionDetails,
  ECRRecord,
  ECRFile,
  ECRChallan,
  ECRValidationResult,
  ECRValidationError,
  ECRValidationWarning,
} from './india-ecr.service';

// Multi-Currency Types
export type {
  CurrencyCode,
  CurrencyConfiguration,
  ExchangeRate,
  CurrencyConversionResult,
  MultiCurrencyPayrollItem,
  CurrencyFormatOptions,
} from './multi-currency.service';

// ============================================================================
// CONSTANTS
// ============================================================================

// India Statutory Constants
export {
  PF_CONFIG,
  ESI_CONFIG,
  PROFESSIONAL_TAX_BY_STATE,
  OLD_TAX_REGIME_SLABS,
  NEW_TAX_REGIME_SLABS,
  CESS_RATE,
  STANDARD_DEDUCTION,
  SECTION_87A_THRESHOLD,
  SECTION_87A_MAX_REBATE,
} from './india-statutory.service';

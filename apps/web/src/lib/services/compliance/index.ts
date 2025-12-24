/**
 * MENA Compliance Services
 * Centralized exports for all compliance-related services
 */

// Services
export { WPSService } from './wps.service';
export { GOSIService } from './gosi.service';
export { EOSBService } from './eosb.service';
export { LabourLawService } from './labour-law.service';
export { NitaqatService, NITAQAT_BAND_COLORS } from './nitaqat.service';
export { MudadService } from './mudad.service';
export { IndiaStatutoryService } from './india-statutory.service';

// Types
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

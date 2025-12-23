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

export { WpsService, wpsService } from './wps-service';
export { GosiService, gosiService } from './gosi-service';
export { IndiaPFService, indiaPFService } from './india-pf-service';
export { IndiaESIService, indiaESIService } from './india-esi-service';
export { IndiaTDSService, indiaTDSService } from './india-tds-service';
export { FnFService, fnfService } from './fnf-service';

export type {
  WpsGenerateInput,
  WpsValidateInput,
  WpsSubmitInput,
  WpsResponseInput,
} from './wps-service';
export type {
  GosiCalculateInput,
  GosiGenerateFileInput,
  GosiContributionBreakdown,
  GosiFileGenerationResult,
} from './gosi-service';
export type {
  PFCalculateInput,
  PFGenerateECRInput,
  PFMonthlySummaryInput,
  PFContributionBreakdown,
  ECRGenerationResult,
  PFMonthlySummary,
} from './india-pf-service';
export type {
  ESICalculateInput,
  ESIEligibilityInput,
  ESIGenerateReturnInput,
  ESIEligibilityResult,
  ESIContributionBreakdown,
  ESIReturnGenerationResult,
} from './india-esi-service';
export type {
  TaxRegime,
  TDSCalculateInput,
  Form16Input,
  TDSQuarterlySummaryInput,
  TDSCalculationResult,
  Form16Data,
  TDSQuarterlySummary,
} from './india-tds-service';
export type {
  TerminationReason,
  Jurisdiction,
  FnFCalculateInput,
  FnFApproveInput,
  FnFStatement,
  FnFComponentBreakdown,
  GratuityCalculation,
} from './fnf-service';

/**
 * Theme B — Nationalisation overlays.
 *
 * Cross-program registry that emiratisation-, nitaqat-, bahrainization-
 * (and future omanisation- / qatarisation-) compliance services consume.
 *
 * Stories closed:
 *   EPIC-16-S06  Artificial Emiratisation detection (GPSSA × payroll × WPS)
 *   EPIC-16-S07  UAE-national recruitment pipeline overlay
 *   EPIC-16-S08  Eligible-role tagging on Job/JobProfile
 *   EPIC-16-S12  UAE-national retention metrics / early-attrition
 *   EPIC-16-S13  UAE-national training & development plan tracking
 *   EPIC-17-S09  Saudi profession-localisation code table
 *   EPIC-17-S11  Saudi-flag overlay on TA pipeline
 *   EPIC-17-S12  Saudi retention tracker tied to Nitaqat
 *   EPIC-17-S13  Artificial Saudization detection
 *   EPIC-18-S07  Bahraini-flag overlay on TA pipeline
 *   EPIC-18-S08  Job-design tagging for Bahrainization on positions
 *   EPIC-18-S14  Bahraini retention KPI tracker
 *   EPIC-18-S15  Bahraini learning/development plan tagging
 */

export type { AuthContext } from './types';
export {
  nationalisationRequisitionTagService,
  NationalisationRequisitionTagService,
} from './requisition-tag.service';
export { nationalisationJobTagService, NationalisationJobTagService } from './job-tag.service';
export {
  nationalisationRetentionService,
  NationalisationRetentionService,
} from './retention.service';
export type { RetentionEventInput, RetentionKpis } from './retention.service';
export {
  nationalisationDevelopmentPlanService,
  NationalisationDevelopmentPlanService,
} from './development-plan.service';
export {
  nationalisationArtificialRiskService,
  NationalisationArtificialRiskService,
  ARTIFICIAL_RISK_SIGNALS,
  riskBandFromSignals,
} from './artificial-risk.service';
export type { ArtificialRiskSignal, ArtificialRiskInput } from './artificial-risk.service';
export { saudiProfessionService, SaudiProfessionService } from './saudi-profession.service';

export const NATIONALISATION_PROGRAMS = [
  'EMIRATISATION',
  'NITAQAT',
  'BAHRAINIZATION',
  'OMANISATION',
  'QATARISATION',
] as const;

export type NationalisationProgram = (typeof NATIONALISATION_PROGRAMS)[number];

export const ELIGIBILITY_LEVELS = ['MANDATORY', 'PREFERRED', 'NEUTRAL', 'EXCLUDED'] as const;
export type EligibilityLevel = (typeof ELIGIBILITY_LEVELS)[number];

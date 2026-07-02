/**
 * Canonicalized route. Skill assessment is implemented once under
 * competency-library/skill-assessment and re-exported here so both URL
 * surfaces render the same AssessmentService-backed page.
 */
export { default } from '../../competency-library/skill-assessment/page';

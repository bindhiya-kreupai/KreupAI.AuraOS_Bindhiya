/**
 * Canonicalized route. The job-competency map is implemented once under
 * competency-library/job-competency-map and re-exported here so both URL
 * surfaces render the same JobRoleService-backed page.
 */
export { default } from '../../competency-library/job-competency-map/page';

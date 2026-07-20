/**
 * Canonicalized route. The competency catalog is implemented once under
 * competency-library/competency-catalog and re-exported here so both the
 * competency-assessment/* and competency-library/* URL surfaces render the
 * same service-backed page (single source of truth).
 */
export { default } from '../../competency-library/competency-catalog/page';

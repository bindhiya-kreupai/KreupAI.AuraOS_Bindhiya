import { describe, it, expect } from 'vitest';
import { routeEvent } from '../gosi-gpssa-consumers';
import type { ComplianceEvent } from '../index';

function evt<T extends ComplianceEvent['type']>(
  type: T,
  payload: any,
  tenantId = 't1'
): ComplianceEvent {
  return {
    eventId: 'e1',
    emittedAt: new Date(),
    type,
    tenantId,
    actorId: 'u1',
    payload,
  } as ComplianceEvent;
}

describe('routeEvent — EPIC-13 / EPIC-14 consumer routing', () => {
  it('routes SA payload to GOSI only', () => {
    expect(routeEvent(evt('employee.hired', { countryCode: 'SA' }))).toEqual(['GOSI']);
  });

  it('routes AE GCC-national payload to GPSSA only', () => {
    expect(routeEvent(evt('employee.hired', { countryCode: 'AE', isGccNational: true }))).toEqual([
      'GPSSA',
    ]);
  });

  it('does NOT route AE non-GCC-national to GPSSA', () => {
    expect(routeEvent(evt('employee.hired', { countryCode: 'AE', isGccNational: false }))).toEqual(
      []
    );
  });

  it('handles missing payload defensively', () => {
    expect(routeEvent(evt('employee.hired', undefined))).toEqual([]);
  });

  it('is case-insensitive on countryCode', () => {
    expect(routeEvent(evt('employee.hired', { countryCode: 'sa' }))).toEqual(['GOSI']);
    expect(routeEvent(evt('employee.hired', { countryCode: 'ae', isGccNational: true }))).toEqual([
      'GPSSA',
    ]);
  });

  it('routes both when a tenant is dual-scheme (no current case in defaults)', () => {
    // Today both schemes are mutually exclusive by country. This test
    // documents that an explicit dual-scheme payload (KSA national in
    // UAE establishment) does NOT trigger both — country is the routing
    // key, not nationality.
    expect(routeEvent(evt('employee.hired', { countryCode: 'SA', isGccNational: true }))).toEqual([
      'GOSI',
    ]);
  });
});

/**
 * EPIC-11-S01: per-country WPS scheme metadata.
 *
 * statutoryWindowDays = max number of days after period end that wages can be
 * paid / WPS file submitted without triggering a delay flag.
 */

export const WPS_SCHEME_SEEDS = [
  {
    countryCode: 'AE',
    name: 'UAE Wage Protection System',
    authority: 'MOHRE',
    channel: 'AGENT_BANK',
    fileFormat: 'SIF',
    statutoryWindowDays: 15,
    mandatoryScope: 'All MOHRE-registered private-sector employees.',
  },
  {
    countryCode: 'SA',
    name: 'Saudi Wage Protection Program (Mudad)',
    authority: 'MHRSD',
    channel: 'MUDAD_PORTAL',
    fileFormat: 'MUDAD',
    statutoryWindowDays: 7,
    mandatoryScope: 'All private-sector establishments registered on Mudad.',
  },
  {
    countryCode: 'QA',
    name: 'Qatar WPS',
    authority: 'MoL',
    channel: 'AGENT_BANK',
    fileFormat: 'QWPS',
    statutoryWindowDays: 7,
    mandatoryScope: 'All MoL-registered establishments.',
  },
  {
    countryCode: 'BH',
    name: 'Bahrain Wage Payment Controls',
    authority: 'LMRA',
    channel: 'BANK_TRANSFER',
    fileFormat: 'BWPS',
    statutoryWindowDays: 7,
    mandatoryScope: 'LMRA permit holders / private-sector establishments.',
  },
  {
    countryCode: 'OM',
    name: 'Oman Wage Payment Controls',
    authority: 'MoL',
    channel: 'BANK_TRANSFER',
    fileFormat: 'OWPS',
    statutoryWindowDays: 7,
    mandatoryScope: 'All private-sector employees.',
  },
  {
    countryCode: 'KW',
    name: 'Kuwait Wage Payment Controls',
    authority: 'MoSAL',
    channel: 'BANK_TRANSFER',
    fileFormat: 'KWPS',
    statutoryWindowDays: 7,
    mandatoryScope: 'All private-sector employees.',
  },
];

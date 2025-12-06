/**
 * @module GeoMastersSeed
 * @description Seed data for States and Cities (GCC + India)
 * @project AURA HCM Platform
 */

export const statesSeed = [
    { code: 'AE_DU', name: 'Dubai', countryCode: 'AE' },
    { code: 'AE_AB', name: 'Abu Dhabi', countryCode: 'AE' },
    { code: 'IN_KA', name: 'Karnataka', countryCode: 'IN' },
    { code: 'IN_MH', name: 'Maharashtra', countryCode: 'IN' },
    { code: 'SA_RI', name: 'Riyadh Region', countryCode: 'SA' },
    { code: 'QA_DA', name: 'Doha', countryCode: 'QA' },
    { code: 'BH_CA', name: 'Capital Governorate', countryCode: 'BH' },
    { code: 'OM_MU', name: 'Muscat Governorate', countryCode: 'OM' },
];

export const citiesSeed = [
    { name: 'Dubai', stateCode: 'AE_DU' },
    { name: 'Abu Dhabi', stateCode: 'AE_AB' },
    { name: 'Bangalore', stateCode: 'IN_KA' },
    { name: 'Mumbai', stateCode: 'IN_MH' },
    { name: 'Pune', stateCode: 'IN_MH' },
    { name: 'Riyadh', stateCode: 'SA_RI' },
    { name: 'Doha', stateCode: 'QA_DA' },
    { name: 'Manama', stateCode: 'BH_CA' },
    { name: 'Muscat', stateCode: 'OM_MU' },
];

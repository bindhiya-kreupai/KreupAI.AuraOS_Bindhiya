/**
 * @module GeographicDataSeed
 * @description Comprehensive geographic data covering:
 *   - UAE: 7 Emirates with codes and timezones
 *   - KSA: 13 Administrative Regions
 *   - India: 28 States + 8 Union Territories
 *   - US: All 50 States + DC
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 9
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface StateEntry {
  code: string;
  name: string;
  countryCode: string;
  capital?: string;
  timezone?: string;
  type?: string;
  iso3166Code?: string;
}

// ---------------------------------------------------------------------------
// UAE — 7 Emirates
// ---------------------------------------------------------------------------

export const uaeEmirates: StateEntry[] = [
  { code: 'AE-AZ', name: 'Abu Dhabi', countryCode: 'AE', capital: 'Abu Dhabi', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-AZ' },
  { code: 'AE-DU', name: 'Dubai', countryCode: 'AE', capital: 'Dubai', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-DU' },
  { code: 'AE-SH', name: 'Sharjah', countryCode: 'AE', capital: 'Sharjah', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-SH' },
  { code: 'AE-AJ', name: 'Ajman', countryCode: 'AE', capital: 'Ajman', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-AJ' },
  { code: 'AE-UQ', name: 'Umm Al Quwain', countryCode: 'AE', capital: 'Umm Al Quwain', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-UQ' },
  { code: 'AE-RK', name: 'Ras Al Khaimah', countryCode: 'AE', capital: 'Ras Al Khaimah', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-RK' },
  { code: 'AE-FU', name: 'Fujairah', countryCode: 'AE', capital: 'Fujairah', timezone: 'Asia/Dubai', type: 'Emirate', iso3166Code: 'AE-FU' },
];

// ---------------------------------------------------------------------------
// KSA — 13 Administrative Regions (Provinces)
// ---------------------------------------------------------------------------

export const ksaRegions: StateEntry[] = [
  { code: 'SA-01', name: 'Riyadh Region', countryCode: 'SA', capital: 'Riyadh', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-01' },
  { code: 'SA-02', name: 'Makkah Region', countryCode: 'SA', capital: 'Makkah', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-02' },
  { code: 'SA-03', name: 'Madinah Region', countryCode: 'SA', capital: 'Madinah', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-03' },
  { code: 'SA-04', name: 'Eastern Province', countryCode: 'SA', capital: 'Dammam', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-04' },
  { code: 'SA-05', name: 'Al-Qassim Region', countryCode: 'SA', capital: 'Buraidah', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-05' },
  { code: 'SA-06', name: 'Hail Region', countryCode: 'SA', capital: 'Hail', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-06' },
  { code: 'SA-07', name: 'Tabuk Region', countryCode: 'SA', capital: 'Tabuk', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-07' },
  { code: 'SA-08', name: 'Northern Borders Region', countryCode: 'SA', capital: 'Arar', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-08' },
  { code: 'SA-09', name: 'Jazan Region', countryCode: 'SA', capital: 'Jazan', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-09' },
  { code: 'SA-10', name: 'Najran Region', countryCode: 'SA', capital: 'Najran', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-10' },
  { code: 'SA-11', name: 'Al Bahah Region', countryCode: 'SA', capital: 'Albaha', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-11' },
  { code: 'SA-12', name: "Al Jawf Region", countryCode: 'SA', capital: 'Sakaka', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-12' },
  { code: 'SA-14', name: 'Asir Region', countryCode: 'SA', capital: 'Abha', timezone: 'Asia/Riyadh', type: 'Region', iso3166Code: 'SA-14' },
];

// ---------------------------------------------------------------------------
// India — 28 States + 8 Union Territories
// ---------------------------------------------------------------------------

export const indiaStates: StateEntry[] = [
  // 28 States
  { code: 'IN-AP', name: 'Andhra Pradesh', countryCode: 'IN', capital: 'Amaravati', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-AP' },
  { code: 'IN-AR', name: 'Arunachal Pradesh', countryCode: 'IN', capital: 'Itanagar', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-AR' },
  { code: 'IN-AS', name: 'Assam', countryCode: 'IN', capital: 'Dispur', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-AS' },
  { code: 'IN-BR', name: 'Bihar', countryCode: 'IN', capital: 'Patna', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-BR' },
  { code: 'IN-CT', name: 'Chhattisgarh', countryCode: 'IN', capital: 'Raipur', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-CT' },
  { code: 'IN-GA', name: 'Goa', countryCode: 'IN', capital: 'Panaji', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-GA' },
  { code: 'IN-GJ', name: 'Gujarat', countryCode: 'IN', capital: 'Gandhinagar', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-GJ' },
  { code: 'IN-HR', name: 'Haryana', countryCode: 'IN', capital: 'Chandigarh', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-HR' },
  { code: 'IN-HP', name: 'Himachal Pradesh', countryCode: 'IN', capital: 'Shimla', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-HP' },
  { code: 'IN-JH', name: 'Jharkhand', countryCode: 'IN', capital: 'Ranchi', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-JH' },
  { code: 'IN-KA', name: 'Karnataka', countryCode: 'IN', capital: 'Bengaluru', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-KA' },
  { code: 'IN-KL', name: 'Kerala', countryCode: 'IN', capital: 'Thiruvananthapuram', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-KL' },
  { code: 'IN-MP', name: 'Madhya Pradesh', countryCode: 'IN', capital: 'Bhopal', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-MP' },
  { code: 'IN-MH', name: 'Maharashtra', countryCode: 'IN', capital: 'Mumbai', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-MH' },
  { code: 'IN-MN', name: 'Manipur', countryCode: 'IN', capital: 'Imphal', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-MN' },
  { code: 'IN-ML', name: 'Meghalaya', countryCode: 'IN', capital: 'Shillong', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-ML' },
  { code: 'IN-MZ', name: 'Mizoram', countryCode: 'IN', capital: 'Aizawl', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-MZ' },
  { code: 'IN-NL', name: 'Nagaland', countryCode: 'IN', capital: 'Kohima', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-NL' },
  { code: 'IN-OR', name: 'Odisha', countryCode: 'IN', capital: 'Bhubaneswar', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-OR' },
  { code: 'IN-PB', name: 'Punjab', countryCode: 'IN', capital: 'Chandigarh', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-PB' },
  { code: 'IN-RJ', name: 'Rajasthan', countryCode: 'IN', capital: 'Jaipur', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-RJ' },
  { code: 'IN-SK', name: 'Sikkim', countryCode: 'IN', capital: 'Gangtok', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-SK' },
  { code: 'IN-TN', name: 'Tamil Nadu', countryCode: 'IN', capital: 'Chennai', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-TN' },
  { code: 'IN-TG', name: 'Telangana', countryCode: 'IN', capital: 'Hyderabad', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-TG' },
  { code: 'IN-TR', name: 'Tripura', countryCode: 'IN', capital: 'Agartala', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-TR' },
  { code: 'IN-UP', name: 'Uttar Pradesh', countryCode: 'IN', capital: 'Lucknow', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-UP' },
  { code: 'IN-UT', name: 'Uttarakhand', countryCode: 'IN', capital: 'Dehradun', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-UT' },
  { code: 'IN-WB', name: 'West Bengal', countryCode: 'IN', capital: 'Kolkata', timezone: 'Asia/Kolkata', type: 'State', iso3166Code: 'IN-WB' },

  // 8 Union Territories
  { code: 'IN-AN', name: 'Andaman and Nicobar Islands', countryCode: 'IN', capital: 'Port Blair', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-AN' },
  { code: 'IN-CH', name: 'Chandigarh', countryCode: 'IN', capital: 'Chandigarh', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-CH' },
  { code: 'IN-DH', name: 'Dadra and Nagar Haveli and Daman and Diu', countryCode: 'IN', capital: 'Daman', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-DH' },
  { code: 'IN-DL', name: 'Delhi', countryCode: 'IN', capital: 'New Delhi', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-DL' },
  { code: 'IN-JK', name: 'Jammu and Kashmir', countryCode: 'IN', capital: 'Srinagar / Jammu', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-JK' },
  { code: 'IN-LA', name: 'Ladakh', countryCode: 'IN', capital: 'Leh', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-LA' },
  { code: 'IN-LD', name: 'Lakshadweep', countryCode: 'IN', capital: 'Kavaratti', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-LD' },
  { code: 'IN-PY', name: 'Puducherry', countryCode: 'IN', capital: 'Puducherry', timezone: 'Asia/Kolkata', type: 'Union Territory', iso3166Code: 'IN-PY' },
];

// ---------------------------------------------------------------------------
// US — All 50 States + DC
// ---------------------------------------------------------------------------

export const usStates: StateEntry[] = [
  { code: 'US-AL', name: 'Alabama', countryCode: 'US', capital: 'Montgomery', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-AL' },
  { code: 'US-AK', name: 'Alaska', countryCode: 'US', capital: 'Juneau', timezone: 'America/Anchorage', type: 'State', iso3166Code: 'US-AK' },
  { code: 'US-AZ', name: 'Arizona', countryCode: 'US', capital: 'Phoenix', timezone: 'America/Phoenix', type: 'State', iso3166Code: 'US-AZ' },
  { code: 'US-AR', name: 'Arkansas', countryCode: 'US', capital: 'Little Rock', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-AR' },
  { code: 'US-CA', name: 'California', countryCode: 'US', capital: 'Sacramento', timezone: 'America/Los_Angeles', type: 'State', iso3166Code: 'US-CA' },
  { code: 'US-CO', name: 'Colorado', countryCode: 'US', capital: 'Denver', timezone: 'America/Denver', type: 'State', iso3166Code: 'US-CO' },
  { code: 'US-CT', name: 'Connecticut', countryCode: 'US', capital: 'Hartford', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-CT' },
  { code: 'US-DE', name: 'Delaware', countryCode: 'US', capital: 'Dover', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-DE' },
  { code: 'US-DC', name: 'District of Columbia', countryCode: 'US', capital: 'Washington', timezone: 'America/New_York', type: 'Federal District', iso3166Code: 'US-DC' },
  { code: 'US-FL', name: 'Florida', countryCode: 'US', capital: 'Tallahassee', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-FL' },
  { code: 'US-GA', name: 'Georgia', countryCode: 'US', capital: 'Atlanta', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-GA' },
  { code: 'US-HI', name: 'Hawaii', countryCode: 'US', capital: 'Honolulu', timezone: 'Pacific/Honolulu', type: 'State', iso3166Code: 'US-HI' },
  { code: 'US-ID', name: 'Idaho', countryCode: 'US', capital: 'Boise', timezone: 'America/Denver', type: 'State', iso3166Code: 'US-ID' },
  { code: 'US-IL', name: 'Illinois', countryCode: 'US', capital: 'Springfield', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-IL' },
  { code: 'US-IN', name: 'Indiana', countryCode: 'US', capital: 'Indianapolis', timezone: 'America/Indiana/Indianapolis', type: 'State', iso3166Code: 'US-IN' },
  { code: 'US-IA', name: 'Iowa', countryCode: 'US', capital: 'Des Moines', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-IA' },
  { code: 'US-KS', name: 'Kansas', countryCode: 'US', capital: 'Topeka', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-KS' },
  { code: 'US-KY', name: 'Kentucky', countryCode: 'US', capital: 'Frankfort', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-KY' },
  { code: 'US-LA', name: 'Louisiana', countryCode: 'US', capital: 'Baton Rouge', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-LA' },
  { code: 'US-ME', name: 'Maine', countryCode: 'US', capital: 'Augusta', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-ME' },
  { code: 'US-MD', name: 'Maryland', countryCode: 'US', capital: 'Annapolis', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-MD' },
  { code: 'US-MA', name: 'Massachusetts', countryCode: 'US', capital: 'Boston', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-MA' },
  { code: 'US-MI', name: 'Michigan', countryCode: 'US', capital: 'Lansing', timezone: 'America/Detroit', type: 'State', iso3166Code: 'US-MI' },
  { code: 'US-MN', name: 'Minnesota', countryCode: 'US', capital: 'Saint Paul', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-MN' },
  { code: 'US-MS', name: 'Mississippi', countryCode: 'US', capital: 'Jackson', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-MS' },
  { code: 'US-MO', name: 'Missouri', countryCode: 'US', capital: 'Jefferson City', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-MO' },
  { code: 'US-MT', name: 'Montana', countryCode: 'US', capital: 'Helena', timezone: 'America/Denver', type: 'State', iso3166Code: 'US-MT' },
  { code: 'US-NE', name: 'Nebraska', countryCode: 'US', capital: 'Lincoln', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-NE' },
  { code: 'US-NV', name: 'Nevada', countryCode: 'US', capital: 'Carson City', timezone: 'America/Los_Angeles', type: 'State', iso3166Code: 'US-NV' },
  { code: 'US-NH', name: 'New Hampshire', countryCode: 'US', capital: 'Concord', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-NH' },
  { code: 'US-NJ', name: 'New Jersey', countryCode: 'US', capital: 'Trenton', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-NJ' },
  { code: 'US-NM', name: 'New Mexico', countryCode: 'US', capital: 'Santa Fe', timezone: 'America/Denver', type: 'State', iso3166Code: 'US-NM' },
  { code: 'US-NY', name: 'New York', countryCode: 'US', capital: 'Albany', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-NY' },
  { code: 'US-NC', name: 'North Carolina', countryCode: 'US', capital: 'Raleigh', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-NC' },
  { code: 'US-ND', name: 'North Dakota', countryCode: 'US', capital: 'Bismarck', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-ND' },
  { code: 'US-OH', name: 'Ohio', countryCode: 'US', capital: 'Columbus', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-OH' },
  { code: 'US-OK', name: 'Oklahoma', countryCode: 'US', capital: 'Oklahoma City', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-OK' },
  { code: 'US-OR', name: 'Oregon', countryCode: 'US', capital: 'Salem', timezone: 'America/Los_Angeles', type: 'State', iso3166Code: 'US-OR' },
  { code: 'US-PA', name: 'Pennsylvania', countryCode: 'US', capital: 'Harrisburg', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-PA' },
  { code: 'US-RI', name: 'Rhode Island', countryCode: 'US', capital: 'Providence', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-RI' },
  { code: 'US-SC', name: 'South Carolina', countryCode: 'US', capital: 'Columbia', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-SC' },
  { code: 'US-SD', name: 'South Dakota', countryCode: 'US', capital: 'Pierre', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-SD' },
  { code: 'US-TN', name: 'Tennessee', countryCode: 'US', capital: 'Nashville', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-TN' },
  { code: 'US-TX', name: 'Texas', countryCode: 'US', capital: 'Austin', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-TX' },
  { code: 'US-UT', name: 'Utah', countryCode: 'US', capital: 'Salt Lake City', timezone: 'America/Denver', type: 'State', iso3166Code: 'US-UT' },
  { code: 'US-VT', name: 'Vermont', countryCode: 'US', capital: 'Montpelier', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-VT' },
  { code: 'US-VA', name: 'Virginia', countryCode: 'US', capital: 'Richmond', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-VA' },
  { code: 'US-WA', name: 'Washington', countryCode: 'US', capital: 'Olympia', timezone: 'America/Los_Angeles', type: 'State', iso3166Code: 'US-WA' },
  { code: 'US-WV', name: 'West Virginia', countryCode: 'US', capital: 'Charleston', timezone: 'America/New_York', type: 'State', iso3166Code: 'US-WV' },
  { code: 'US-WI', name: 'Wisconsin', countryCode: 'US', capital: 'Madison', timezone: 'America/Chicago', type: 'State', iso3166Code: 'US-WI' },
  { code: 'US-WY', name: 'Wyoming', countryCode: 'US', capital: 'Cheyenne', timezone: 'America/Denver', type: 'State', iso3166Code: 'US-WY' },
];

// ---------------------------------------------------------------------------
// Combined export
// ---------------------------------------------------------------------------

export const allStates: StateEntry[] = [
  ...uaeEmirates,
  ...ksaRegions,
  ...indiaStates,
  ...usStates,
];

/**
 * Seed geographic data (states/provinces/regions/territories) into the State model.
 * Also stores extended metadata (timezone, capital, type) as SystemSettings.
 * Idempotent — safe to run multiple times.
 */
export async function seedGeographicData(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding geographic data (states, regions, territories)...');

  const grouped = {
    UAE: uaeEmirates,
    KSA: ksaRegions,
    India: indiaStates,
    US: usStates,
  };

  let totalCount = 0;

  for (const [regionLabel, states] of Object.entries(grouped)) {
    let regionCount = 0;

    for (const st of states) {
      // Look up parent country
      const country = await prisma.country.findUnique({
        where: { isoCode: st.countryCode },
      });

      if (!country) {
        console.warn(`    [SKIP] Country not found for isoCode: ${st.countryCode} — state: ${st.name}`);
        continue;
      }

      // Upsert State model record
      const existingState = await prisma.state.findFirst({
        where: { code: st.code, countryId: country.id },
      });

      if (!existingState) {
        await prisma.state.create({
          data: {
            code: st.code,
            name: st.name,
            countryId: country.id,
          },
        });
      }

      // Store extended metadata as SystemSetting
      const metaKey = `geo_state.${st.code.toLowerCase().replace(/-/g, '_')}`;
      await prisma.systemSetting.upsert({
        where: { key: metaKey },
        update: { value: JSON.stringify(st), description: `${st.type || 'State'}: ${st.name}, ${st.countryCode}` },
        create: {
          key: metaKey,
          value: JSON.stringify(st),
          group: 'geographic_data',
          description: `${st.type || 'State'}: ${st.name} (${st.code}) — ${st.countryCode}${st.capital ? `, Capital: ${st.capital}` : ''}`,
        },
      });

      regionCount++;
      totalCount++;
    }

    console.log(`    - ${regionLabel}: ${regionCount} regions seeded`);
  }

  console.log(`  ✓ Geographic data: ${totalCount} state/region/territory records seeded across 4 countries`);
}

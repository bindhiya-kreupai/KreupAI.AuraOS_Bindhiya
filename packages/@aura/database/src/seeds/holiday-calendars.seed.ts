import { PrismaClient } from '@prisma/client';

export interface Holiday {
  name: string;
  date: string;
  country: string;
  type: 'fixed' | 'floating';
  calculation?: string;
}

/**
 * Helper: If a fixed holiday falls on Saturday, observe Friday;
 * if it falls on Sunday, observe Monday.
 */
export function weekendFallback(dateStr: string, year: number): string {
  const d = new Date(`${year}-${dateStr}`);
  const day = d.getDay();
  if (day === 6) {
    d.setDate(d.getDate() - 1);
  } else if (day === 0) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
}

/**
 * Helper: Calculate nth weekday of a given month.
 * weekday: 0=Sun,1=Mon,...6=Sat
 */
export function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): string {
  const firstDay = new Date(year, month - 1, 1);
  let dayOfWeek = firstDay.getDay();
  let diff = (weekday - dayOfWeek + 7) % 7;
  const day = 1 + diff + (n - 1) * 7;
  const result = new Date(year, month - 1, day);
  return result.toISOString().split('T')[0];
}

/**
 * Helper: Calculate last weekday of a given month.
 */
export function lastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  const lastDay = new Date(year, month, 0);
  let diff = (lastDay.getDay() - weekday + 7) % 7;
  lastDay.setDate(lastDay.getDate() - diff);
  return lastDay.toISOString().split('T')[0];
}

export const usHolidays: Holiday[] = [
  { name: "New Year's Day", date: '01-01', country: 'US', type: 'fixed' },
  { name: 'Martin Luther King Jr. Day', date: '01-third-monday', country: 'US', type: 'floating', calculation: 'Third Monday of January' },
  { name: "Presidents' Day", date: '02-third-monday', country: 'US', type: 'floating', calculation: 'Third Monday of February' },
  { name: 'Memorial Day', date: '05-last-monday', country: 'US', type: 'floating', calculation: 'Last Monday of May' },
  { name: 'Juneteenth National Independence Day', date: '06-19', country: 'US', type: 'fixed' },
  { name: 'Independence Day', date: '07-04', country: 'US', type: 'fixed' },
  { name: 'Labor Day', date: '09-first-monday', country: 'US', type: 'floating', calculation: 'First Monday of September' },
  { name: 'Columbus Day', date: '10-second-monday', country: 'US', type: 'floating', calculation: 'Second Monday of October' },
  { name: 'Veterans Day', date: '11-11', country: 'US', type: 'fixed' },
  { name: 'Thanksgiving Day', date: '11-fourth-thursday', country: 'US', type: 'floating', calculation: 'Fourth Thursday of November' },
  { name: 'Christmas Day', date: '12-25', country: 'US', type: 'fixed' },
];

export const ukHolidays: Holiday[] = [
  { name: "New Year's Day", date: '01-01', country: 'UK', type: 'fixed' },
  { name: 'Good Friday', date: 'easter-2', country: 'UK', type: 'floating', calculation: '2 days before Easter Sunday' },
  { name: 'Easter Monday', date: 'easter+1', country: 'UK', type: 'floating', calculation: '1 day after Easter Sunday' },
  { name: 'Early May Bank Holiday', date: '05-first-monday', country: 'UK', type: 'floating', calculation: 'First Monday of May' },
  { name: 'Spring Bank Holiday', date: '05-last-monday', country: 'UK', type: 'floating', calculation: 'Last Monday of May' },
  { name: 'Summer Bank Holiday', date: '08-last-monday', country: 'UK', type: 'floating', calculation: 'Last Monday of August' },
  { name: 'Christmas Day', date: '12-25', country: 'UK', type: 'fixed' },
  { name: 'Boxing Day', date: '12-26', country: 'UK', type: 'fixed' },
];

export const indiaHolidays: Holiday[] = [
  { name: 'Republic Day', date: '01-26', country: 'IN', type: 'fixed' },
  { name: 'Maha Shivaratri', date: '02-variable', country: 'IN', type: 'floating', calculation: 'Hindu calendar-based' },
  { name: 'Holi', date: '03-variable', country: 'IN', type: 'floating', calculation: 'Hindu calendar full moon of Phalguna' },
  { name: 'Good Friday', date: 'easter-2', country: 'IN', type: 'floating', calculation: '2 days before Easter Sunday' },
  { name: 'Dr. Ambedkar Jayanti', date: '04-14', country: 'IN', type: 'fixed' },
  { name: 'Eid ul-Fitr', date: 'islamic-variable', country: 'IN', type: 'floating', calculation: 'End of Ramadan, Islamic calendar' },
  { name: 'Buddha Purnima', date: '05-variable', country: 'IN', type: 'floating', calculation: 'Full moon of Vaishakha' },
  { name: 'Eid ul-Adha', date: 'islamic-variable', country: 'IN', type: 'floating', calculation: '10th Dhul Hijjah, Islamic calendar' },
  { name: 'Independence Day', date: '08-15', country: 'IN', type: 'fixed' },
  { name: 'Janmashtami', date: '08-variable', country: 'IN', type: 'floating', calculation: 'Hindu calendar, 8th day of Krishna Paksha' },
  { name: 'Mahatma Gandhi Jayanti', date: '10-02', country: 'IN', type: 'fixed' },
  { name: 'Dussehra', date: '10-variable', country: 'IN', type: 'floating', calculation: '10th day of Shukla Paksha in Ashvin' },
  { name: 'Diwali', date: '10-variable', country: 'IN', type: 'floating', calculation: 'New moon of Kartik month' },
  { name: 'Guru Nanak Jayanti', date: '11-variable', country: 'IN', type: 'floating', calculation: 'Full moon of Kartik month' },
  { name: 'Christmas Day', date: '12-25', country: 'IN', type: 'fixed' },
];

export const uaeHolidays: Holiday[] = [
  { name: "New Year's Day", date: '01-01', country: 'AE', type: 'fixed' },
  { name: 'Eid Al Fitr', date: 'islamic-variable', country: 'AE', type: 'floating', calculation: 'End of Ramadan, Islamic calendar (3 days)' },
  { name: 'Arafat Day', date: 'islamic-variable', country: 'AE', type: 'floating', calculation: '9th Dhul Hijjah, Islamic calendar' },
  { name: 'Eid Al Adha', date: 'islamic-variable', country: 'AE', type: 'floating', calculation: '10th Dhul Hijjah, Islamic calendar (3 days)' },
  { name: 'Islamic New Year', date: 'islamic-variable', country: 'AE', type: 'floating', calculation: '1st Muharram, Islamic calendar' },
  { name: 'Prophet Muhammad Birthday', date: 'islamic-variable', country: 'AE', type: 'floating', calculation: '12th Rabi al-Awwal, Islamic calendar' },
  { name: 'Commemoration Day', date: '11-30', country: 'AE', type: 'fixed' },
  { name: 'UAE National Day', date: '12-02', country: 'AE', type: 'fixed' },
];

export const usStateHolidays: Holiday[] = [
  // California
  { name: 'César Chávez Day', date: '03-31', country: 'US-CA', type: 'fixed' },
  { name: 'California Admission Day', date: '09-09', country: 'US-CA', type: 'fixed' },
  // New York
  { name: 'Lincoln\'s Birthday', date: '02-12', country: 'US-NY', type: 'fixed' },
  { name: 'Election Day', date: '11-first-tuesday', country: 'US-NY', type: 'floating', calculation: 'First Tuesday after first Monday in November' },
  // Texas
  { name: 'Texas Independence Day', date: '03-02', country: 'US-TX', type: 'fixed' },
  { name: 'San Jacinto Day', date: '04-21', country: 'US-TX', type: 'fixed' },
  { name: 'Emancipation Day (Juneteenth TX)', date: '06-19', country: 'US-TX', type: 'fixed' },
  { name: 'Lyndon B. Johnson Day', date: '08-27', country: 'US-TX', type: 'fixed' },
  // Illinois
  { name: 'Lincoln\'s Birthday', date: '02-12', country: 'US-IL', type: 'fixed' },
  { name: 'Casimir Pulaski Day', date: '03-first-monday', country: 'US-IL', type: 'floating', calculation: 'First Monday of March' },
  // Massachusetts
  { name: 'Patriots\' Day', date: '04-third-monday', country: 'US-MA', type: 'floating', calculation: 'Third Monday of April' },
  { name: 'Evacuation Day', date: '03-17', country: 'US-MA', type: 'fixed' },
];

export const canadaHolidays: Holiday[] = [
  // Federal
  { name: "New Year's Day", date: '01-01', country: 'CA', type: 'fixed' },
  { name: 'Good Friday', date: 'easter-2', country: 'CA', type: 'floating', calculation: '2 days before Easter Sunday' },
  { name: 'Easter Monday', date: 'easter+1', country: 'CA', type: 'floating', calculation: '1 day after Easter Sunday' },
  { name: 'Victoria Day', date: '05-last-monday-before-25', country: 'CA', type: 'floating', calculation: 'Monday on or before May 24' },
  { name: 'Canada Day', date: '07-01', country: 'CA', type: 'fixed' },
  { name: 'Labour Day', date: '09-first-monday', country: 'CA', type: 'floating', calculation: 'First Monday of September' },
  { name: 'National Day for Truth and Reconciliation', date: '09-30', country: 'CA', type: 'fixed' },
  { name: 'Thanksgiving', date: '10-second-monday', country: 'CA', type: 'floating', calculation: 'Second Monday of October' },
  { name: 'Remembrance Day', date: '11-11', country: 'CA', type: 'fixed' },
  { name: 'Christmas Day', date: '12-25', country: 'CA', type: 'fixed' },
  { name: 'Boxing Day', date: '12-26', country: 'CA', type: 'fixed' },
  // Provincial - Ontario
  { name: 'Family Day (ON)', date: '02-third-monday', country: 'CA-ON', type: 'floating', calculation: 'Third Monday of February' },
  { name: 'Civic Holiday (ON)', date: '08-first-monday', country: 'CA-ON', type: 'floating', calculation: 'First Monday of August' },
  // Provincial - Quebec
  { name: 'National Patriots Day (QC)', date: '05-last-monday-before-25', country: 'CA-QC', type: 'floating', calculation: 'Monday on or before May 24' },
  { name: 'Saint-Jean-Baptiste Day (QC)', date: '06-24', country: 'CA-QC', type: 'fixed' },
  // Provincial - British Columbia
  { name: 'Family Day (BC)', date: '02-third-monday', country: 'CA-BC', type: 'floating', calculation: 'Third Monday of February' },
  { name: 'British Columbia Day', date: '08-first-monday', country: 'CA-BC', type: 'floating', calculation: 'First Monday of August' },
];

export const australiaHolidays: Holiday[] = [
  // National
  { name: "New Year's Day", date: '01-01', country: 'AU', type: 'fixed' },
  { name: 'Australia Day', date: '01-26', country: 'AU', type: 'fixed' },
  { name: 'Good Friday', date: 'easter-2', country: 'AU', type: 'floating', calculation: '2 days before Easter Sunday' },
  { name: 'Saturday before Easter Sunday', date: 'easter-1', country: 'AU', type: 'floating', calculation: '1 day before Easter Sunday' },
  { name: 'Easter Monday', date: 'easter+1', country: 'AU', type: 'floating', calculation: '1 day after Easter Sunday' },
  { name: 'Anzac Day', date: '04-25', country: 'AU', type: 'fixed' },
  { name: "Queen's Birthday", date: '06-second-monday', country: 'AU', type: 'floating', calculation: 'Second Monday of June (varies by state)' },
  { name: 'Christmas Day', date: '12-25', country: 'AU', type: 'fixed' },
  { name: 'Boxing Day', date: '12-26', country: 'AU', type: 'fixed' },
  // State - New South Wales
  { name: 'Bank Holiday (NSW)', date: '08-first-monday', country: 'AU-NSW', type: 'floating', calculation: 'First Monday of August' },
  // State - Victoria
  { name: 'Melbourne Cup Day (VIC)', date: '11-first-tuesday', country: 'AU-VIC', type: 'floating', calculation: 'First Tuesday of November' },
  // State - Queensland
  { name: 'Royal Queensland Show (QLD)', date: '08-second-wednesday', country: 'AU-QLD', type: 'floating', calculation: 'Second Wednesday of August (Brisbane region)' },
  // State - Western Australia
  { name: 'Western Australia Day', date: '06-01', country: 'AU-WA', type: 'fixed' },
];

export const germanyHolidays: Holiday[] = [
  // National (federal)
  { name: 'Neujahr (New Year)', date: '01-01', country: 'DE', type: 'fixed' },
  { name: 'Karfreitag (Good Friday)', date: 'easter-2', country: 'DE', type: 'floating', calculation: '2 days before Easter Sunday' },
  { name: 'Ostermontag (Easter Monday)', date: 'easter+1', country: 'DE', type: 'floating', calculation: '1 day after Easter Sunday' },
  { name: 'Tag der Arbeit (Labour Day)', date: '05-01', country: 'DE', type: 'fixed' },
  { name: 'Christi Himmelfahrt (Ascension)', date: 'easter+39', country: 'DE', type: 'floating', calculation: '39 days after Easter Sunday' },
  { name: 'Pfingstmontag (Whit Monday)', date: 'easter+50', country: 'DE', type: 'floating', calculation: '50 days after Easter Sunday' },
  { name: 'Tag der Deutschen Einheit (German Unity Day)', date: '10-03', country: 'DE', type: 'fixed' },
  { name: 'Erster Weihnachtstag (Christmas Day)', date: '12-25', country: 'DE', type: 'fixed' },
  { name: 'Zweiter Weihnachtstag (St. Stephen\'s Day)', date: '12-26', country: 'DE', type: 'fixed' },
  // State - Bavaria
  { name: 'Heilige Drei Könige (Epiphany, BY)', date: '01-06', country: 'DE-BY', type: 'fixed' },
  { name: 'Fronleichnam (Corpus Christi, BY)', date: 'easter+60', country: 'DE-BY', type: 'floating', calculation: '60 days after Easter Sunday' },
  { name: 'Mariä Himmelfahrt (Assumption, BY)', date: '08-15', country: 'DE-BY', type: 'fixed' },
  { name: 'Allerheiligen (All Saints, BY)', date: '11-01', country: 'DE-BY', type: 'fixed' },
  // State - Saxony
  { name: 'Reformationstag (Reformation Day, SN)', date: '10-31', country: 'DE-SN', type: 'fixed' },
  { name: 'Buß- und Bettag (Repentance Day, SN)', date: '11-variable', country: 'DE-SN', type: 'floating', calculation: 'Wednesday before the last Sunday of the church year' },
];

export const franceHolidays: Holiday[] = [
  { name: 'Jour de l\'An (New Year)', date: '01-01', country: 'FR', type: 'fixed' },
  { name: 'Lundi de Pâques (Easter Monday)', date: 'easter+1', country: 'FR', type: 'floating', calculation: '1 day after Easter Sunday' },
  { name: 'Fête du Travail (Labour Day)', date: '05-01', country: 'FR', type: 'fixed' },
  { name: 'Victoire 1945 (Victory in Europe Day)', date: '05-08', country: 'FR', type: 'fixed' },
  { name: 'Ascension', date: 'easter+39', country: 'FR', type: 'floating', calculation: '39 days after Easter Sunday' },
  { name: 'Lundi de Pentecôte (Whit Monday)', date: 'easter+50', country: 'FR', type: 'floating', calculation: '50 days after Easter Sunday' },
  { name: 'Fête Nationale (Bastille Day)', date: '07-14', country: 'FR', type: 'fixed' },
  { name: 'Assomption (Assumption)', date: '08-15', country: 'FR', type: 'fixed' },
  { name: 'Toussaint (All Saints)', date: '11-01', country: 'FR', type: 'fixed' },
  { name: 'Armistice (Armistice Day)', date: '11-11', country: 'FR', type: 'fixed' },
  { name: 'Noël (Christmas)', date: '12-25', country: 'FR', type: 'fixed' },
];

export const singaporeHolidays: Holiday[] = [
  { name: "New Year's Day", date: '01-01', country: 'SG', type: 'fixed' },
  { name: 'Chinese New Year Day 1', date: '01-variable', country: 'SG', type: 'floating', calculation: 'Lunar calendar, 1st day of 1st month' },
  { name: 'Chinese New Year Day 2', date: '01-variable', country: 'SG', type: 'floating', calculation: 'Lunar calendar, 2nd day of 1st month' },
  { name: 'Good Friday', date: 'easter-2', country: 'SG', type: 'floating', calculation: '2 days before Easter Sunday' },
  { name: 'Labour Day', date: '05-01', country: 'SG', type: 'fixed' },
  { name: 'Hari Raya Puasa', date: 'islamic-variable', country: 'SG', type: 'floating', calculation: 'End of Ramadan, Islamic calendar' },
  { name: 'Vesak Day', date: '05-variable', country: 'SG', type: 'floating', calculation: 'Full moon of Vaishakha, Buddhist calendar' },
  { name: 'Hari Raya Haji', date: 'islamic-variable', country: 'SG', type: 'floating', calculation: '10th Dhul Hijjah, Islamic calendar' },
  { name: 'National Day', date: '08-09', country: 'SG', type: 'fixed' },
  { name: 'Deepavali', date: '10-variable', country: 'SG', type: 'floating', calculation: 'Hindu calendar, new moon of Kartik' },
  { name: 'Christmas Day', date: '12-25', country: 'SG', type: 'fixed' },
];

export const japanHolidays: Holiday[] = [
  { name: '元日 (New Year)', date: '01-01', country: 'JP', type: 'fixed' },
  { name: '成人の日 (Coming of Age Day)', date: '01-second-monday', country: 'JP', type: 'floating', calculation: 'Second Monday of January' },
  { name: '建国記念の日 (National Foundation Day)', date: '02-11', country: 'JP', type: 'fixed' },
  { name: '天皇誕生日 (Emperor\'s Birthday)', date: '02-23', country: 'JP', type: 'fixed' },
  { name: '春分の日 (Vernal Equinox Day)', date: '03-20', country: 'JP', type: 'floating', calculation: 'Around March 20-21, astronomical calculation' },
  { name: '昭和の日 (Showa Day)', date: '04-29', country: 'JP', type: 'fixed' },
  { name: '憲法記念日 (Constitution Memorial Day)', date: '05-03', country: 'JP', type: 'fixed' },
  { name: 'みどりの日 (Greenery Day)', date: '05-04', country: 'JP', type: 'fixed' },
  { name: 'こどもの日 (Children\'s Day)', date: '05-05', country: 'JP', type: 'fixed' },
  { name: '海の日 (Marine Day)', date: '07-third-monday', country: 'JP', type: 'floating', calculation: 'Third Monday of July' },
  { name: '山の日 (Mountain Day)', date: '08-11', country: 'JP', type: 'fixed' },
  { name: '敬老の日 (Respect for the Aged Day)', date: '09-third-monday', country: 'JP', type: 'floating', calculation: 'Third Monday of September' },
  { name: '秋分の日 (Autumnal Equinox Day)', date: '09-23', country: 'JP', type: 'floating', calculation: 'Around September 22-23, astronomical calculation' },
  { name: 'スポーツの日 (Sports Day)', date: '10-second-monday', country: 'JP', type: 'floating', calculation: 'Second Monday of October' },
  { name: '文化の日 (Culture Day)', date: '11-03', country: 'JP', type: 'fixed' },
  { name: '勤労感謝の日 (Labour Thanksgiving Day)', date: '11-23', country: 'JP', type: 'fixed' },
];

export const holidays: Holiday[] = [
  ...usHolidays,
  ...usStateHolidays,
  ...ukHolidays,
  ...indiaHolidays,
  ...uaeHolidays,
  ...canadaHolidays,
  ...australiaHolidays,
  ...germanyHolidays,
  ...franceHolidays,
  ...singaporeHolidays,
  ...japanHolidays,
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding holiday calendars...');

  for (const holiday of holidays) {
    await prisma.holidayCalendar.upsert({
      where: {
        name_country: { name: holiday.name, country: holiday.country },
      },
      update: {
        date: holiday.date,
        type: holiday.type,
        calculation: holiday.calculation ?? null,
      },
      create: {
        name: holiday.name,
        date: holiday.date,
        country: holiday.country,
        type: holiday.type,
        calculation: holiday.calculation ?? null,
      },
    });
  }

  console.log(`Seeded ${holidays.length} holidays across 11 countries/regions.`);
}

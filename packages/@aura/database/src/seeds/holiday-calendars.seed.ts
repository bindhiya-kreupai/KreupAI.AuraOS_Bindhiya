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

export const holidays: Holiday[] = [
  ...usHolidays,
  ...ukHolidays,
  ...indiaHolidays,
  ...uaeHolidays,
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

  console.log(`Seeded ${holidays.length} holidays across 4 countries.`);
}

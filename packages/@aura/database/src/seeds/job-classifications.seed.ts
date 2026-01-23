import { PrismaClient } from '@prisma/client';

export interface JobClassification {
  system: string;
  code: string;
  title: string;
  examples: string[];
}

export const onetSocGroups: JobClassification[] = [
  { system: 'SOC', code: '11-0000', title: 'Management Occupations', examples: ['Chief Executives', 'Marketing Managers', 'Financial Managers', 'HR Managers'] },
  { system: 'SOC', code: '13-0000', title: 'Business and Financial Operations Occupations', examples: ['Accountants', 'Financial Analysts', 'Management Analysts', 'HR Specialists'] },
  { system: 'SOC', code: '15-0000', title: 'Computer and Mathematical Occupations', examples: ['Software Developers', 'Data Scientists', 'Database Administrators', 'Systems Analysts'] },
  { system: 'SOC', code: '17-0000', title: 'Architecture and Engineering Occupations', examples: ['Civil Engineers', 'Electrical Engineers', 'Mechanical Engineers', 'Architects'] },
  { system: 'SOC', code: '19-0000', title: 'Life, Physical, and Social Science Occupations', examples: ['Biologists', 'Chemists', 'Psychologists', 'Economists'] },
  { system: 'SOC', code: '21-0000', title: 'Community and Social Service Occupations', examples: ['Social Workers', 'Counselors', 'Probation Officers', 'Community Health Workers'] },
  { system: 'SOC', code: '23-0000', title: 'Legal Occupations', examples: ['Lawyers', 'Paralegals', 'Judges', 'Legal Secretaries'] },
  { system: 'SOC', code: '25-0000', title: 'Educational Instruction and Library Occupations', examples: ['Teachers', 'Professors', 'Librarians', 'Instructional Coordinators'] },
  { system: 'SOC', code: '27-0000', title: 'Arts, Design, Entertainment, Sports, and Media Occupations', examples: ['Graphic Designers', 'Writers', 'Photographers', 'Animators'] },
  { system: 'SOC', code: '29-0000', title: 'Healthcare Practitioners and Technical Occupations', examples: ['Physicians', 'Nurses', 'Pharmacists', 'Physical Therapists'] },
  { system: 'SOC', code: '31-0000', title: 'Healthcare Support Occupations', examples: ['Medical Assistants', 'Home Health Aides', 'Pharmacy Technicians', 'Dental Assistants'] },
  { system: 'SOC', code: '33-0000', title: 'Protective Service Occupations', examples: ['Police Officers', 'Firefighters', 'Security Guards', 'Correctional Officers'] },
  { system: 'SOC', code: '35-0000', title: 'Food Preparation and Serving Related Occupations', examples: ['Chefs', 'Cooks', 'Bartenders', 'Food Service Managers'] },
  { system: 'SOC', code: '37-0000', title: 'Building and Grounds Cleaning and Maintenance Occupations', examples: ['Janitors', 'Landscapers', 'Pest Control Workers', 'Maids'] },
  { system: 'SOC', code: '39-0000', title: 'Personal Care and Service Occupations', examples: ['Hairdressers', 'Childcare Workers', 'Fitness Trainers', 'Funeral Attendants'] },
  { system: 'SOC', code: '41-0000', title: 'Sales and Related Occupations', examples: ['Retail Salespersons', 'Insurance Agents', 'Real Estate Agents', 'Sales Engineers'] },
  { system: 'SOC', code: '43-0000', title: 'Office and Administrative Support Occupations', examples: ['Secretaries', 'Bookkeepers', 'Customer Service Reps', 'Data Entry Keyers'] },
  { system: 'SOC', code: '45-0000', title: 'Farming, Fishing, and Forestry Occupations', examples: ['Farm Workers', 'Fishers', 'Logging Workers', 'Agricultural Inspectors'] },
  { system: 'SOC', code: '47-0000', title: 'Construction and Extraction Occupations', examples: ['Carpenters', 'Electricians', 'Plumbers', 'Construction Laborers'] },
  { system: 'SOC', code: '49-0000', title: 'Installation, Maintenance, and Repair Occupations', examples: ['HVAC Technicians', 'Auto Mechanics', 'Electricians', 'Millwrights'] },
  { system: 'SOC', code: '51-0000', title: 'Production Occupations', examples: ['Machinists', 'Welders', 'Assemblers', 'Quality Control Inspectors'] },
  { system: 'SOC', code: '53-0000', title: 'Transportation and Material Moving Occupations', examples: ['Truck Drivers', 'Bus Drivers', 'Pilots', 'Warehouse Workers'] },
  { system: 'SOC', code: '55-0000', title: 'Military Specific Occupations', examples: ['Infantry Officers', 'Military Enlisted', 'Special Forces', 'Military Officers'] },
];

export const iscoGroups: JobClassification[] = [
  { system: 'ISCO-08', code: '1', title: 'Managers', examples: ['Chief Executives', 'Administrative Managers', 'Sales Managers', 'ICT Managers'] },
  { system: 'ISCO-08', code: '2', title: 'Professionals', examples: ['Engineers', 'Health Professionals', 'Teachers', 'Business Professionals'] },
  { system: 'ISCO-08', code: '3', title: 'Technicians and Associate Professionals', examples: ['Science Technicians', 'Health Associates', 'Business Associates', 'Legal Associates'] },
  { system: 'ISCO-08', code: '4', title: 'Clerical Support Workers', examples: ['Office Clerks', 'Secretaries', 'Tellers', 'Customer Service Clerks'] },
  { system: 'ISCO-08', code: '5', title: 'Service and Sales Workers', examples: ['Travel Attendants', 'Cooks', 'Hairdressers', 'Sales Workers'] },
  { system: 'ISCO-08', code: '6', title: 'Skilled Agricultural, Forestry and Fishery Workers', examples: ['Crop Growers', 'Animal Producers', 'Forestry Workers', 'Fishery Workers'] },
  { system: 'ISCO-08', code: '7', title: 'Craft and Related Trades Workers', examples: ['Building Workers', 'Metal Workers', 'Printing Workers', 'Electrical Workers'] },
  { system: 'ISCO-08', code: '8', title: 'Plant and Machine Operators, and Assemblers', examples: ['Mining Operators', 'Processing Operators', 'Drivers', 'Assemblers'] },
  { system: 'ISCO-08', code: '9', title: 'Elementary Occupations', examples: ['Cleaners', 'Agricultural Laborers', 'Street Vendors', 'Refuse Workers'] },
  { system: 'ISCO-08', code: '0', title: 'Armed Forces Occupations', examples: ['Commissioned Officers', 'Non-commissioned Officers', 'Armed Forces Other Ranks'] },
];

export const jobClassifications: JobClassification[] = [
  ...onetSocGroups,
  ...iscoGroups,
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding job classifications...');

  for (const classification of jobClassifications) {
    const key = `${classification.system}_${classification.code}`;
    await prisma.jobClassification.upsert({
      where: { key },
      update: {
        system: classification.system,
        code: classification.code,
        title: classification.title,
        examples: JSON.stringify(classification.examples),
      },
      create: {
        key,
        system: classification.system,
        code: classification.code,
        title: classification.title,
        examples: JSON.stringify(classification.examples),
      },
    });
  }

  console.log(`Seeded ${jobClassifications.length} job classifications (${onetSocGroups.length} SOC, ${iscoGroups.length} ISCO-08).`);
}

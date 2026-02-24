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

export const socMinorGroups: JobClassification[] = [
  // Management
  { system: 'SOC', code: '11-1000', title: 'Top Executives', examples: ['Chief Executives', 'General and Operations Managers', 'Legislators'] },
  { system: 'SOC', code: '11-2000', title: 'Advertising, Marketing, Promotions, Public Relations, and Sales Managers', examples: ['Advertising Managers', 'Marketing Managers', 'Sales Managers', 'PR Managers'] },
  { system: 'SOC', code: '11-3000', title: 'Operations Specialties Managers', examples: ['Administrative Services Managers', 'Computer and IT Managers', 'Financial Managers', 'HR Managers'] },
  { system: 'SOC', code: '11-9000', title: 'Other Management Occupations', examples: ['Construction Managers', 'Education Administrators', 'Food Service Managers', 'Property Managers'] },
  // Business and Financial
  { system: 'SOC', code: '13-1000', title: 'Business Operations Specialists', examples: ['Buyers', 'Claims Adjusters', 'HR Specialists', 'Management Analysts'] },
  { system: 'SOC', code: '13-2000', title: 'Financial Specialists', examples: ['Accountants', 'Auditors', 'Budget Analysts', 'Financial Analysts'] },
  // Computer and Mathematical
  { system: 'SOC', code: '15-1200', title: 'Computer Occupations', examples: ['Computer Systems Analysts', 'Software Developers', 'Web Developers', 'Database Administrators'] },
  { system: 'SOC', code: '15-2000', title: 'Mathematical Science Occupations', examples: ['Actuaries', 'Mathematicians', 'Operations Research Analysts', 'Statisticians'] },
  // Architecture and Engineering
  { system: 'SOC', code: '17-1000', title: 'Architects, Surveyors, and Cartographers', examples: ['Architects', 'Landscape Architects', 'Surveyors', 'Cartographers'] },
  { system: 'SOC', code: '17-2000', title: 'Engineers', examples: ['Aerospace Engineers', 'Civil Engineers', 'Electrical Engineers', 'Software Engineers'] },
  { system: 'SOC', code: '17-3000', title: 'Drafters, Engineering Technicians, and Mapping Technicians', examples: ['Drafters', 'Engineering Technicians', 'Surveying Technicians'] },
  // Life, Physical, and Social Science
  { system: 'SOC', code: '19-1000', title: 'Life Scientists', examples: ['Biochemists', 'Microbiologists', 'Zoologists', 'Medical Scientists'] },
  { system: 'SOC', code: '19-2000', title: 'Physical Scientists', examples: ['Astronomers', 'Physicists', 'Chemists', 'Atmospheric Scientists'] },
  { system: 'SOC', code: '19-3000', title: 'Social Scientists and Related Workers', examples: ['Economists', 'Political Scientists', 'Psychologists', 'Sociologists'] },
  { system: 'SOC', code: '19-4000', title: 'Life, Physical, and Social Science Technicians', examples: ['Agricultural Technicians', 'Chemical Technicians', 'Environmental Technicians'] },
  // Community and Social Service
  { system: 'SOC', code: '21-1000', title: 'Counselors, Social Workers, and Other Community and Social Service Specialists', examples: ['Substance Abuse Counselors', 'Social Workers', 'Health Educators', 'Probation Officers'] },
  { system: 'SOC', code: '21-2000', title: 'Religious Workers', examples: ['Clergy', 'Directors of Religious Activities', 'Religious Workers'] },
  // Legal
  { system: 'SOC', code: '23-1000', title: 'Lawyers, Judges, and Related Workers', examples: ['Lawyers', 'Judges', 'Magistrates', 'Hearing Officers'] },
  { system: 'SOC', code: '23-2000', title: 'Legal Support Workers', examples: ['Paralegals', 'Legal Assistants', 'Court Reporters', 'Title Examiners'] },
  // Education
  { system: 'SOC', code: '25-1000', title: 'Postsecondary Teachers', examples: ['Business Professors', 'Computer Science Professors', 'Engineering Professors', 'Nursing Professors'] },
  { system: 'SOC', code: '25-2000', title: 'Preschool, Primary, Secondary, and Special Education Teachers', examples: ['Kindergarten Teachers', 'Elementary Teachers', 'Middle School Teachers', 'High School Teachers'] },
  { system: 'SOC', code: '25-3000', title: 'Other Teachers and Instructors', examples: ['Adult Literacy Teachers', 'Self-Enrichment Teachers', 'Substitute Teachers'] },
  { system: 'SOC', code: '25-4000', title: 'Librarians, Curators, and Archivists', examples: ['Librarians', 'Curators', 'Museum Technicians', 'Archivists'] },
  // Arts and Media
  { system: 'SOC', code: '27-1000', title: 'Art and Design Workers', examples: ['Art Directors', 'Graphic Designers', 'Interior Designers', 'Industrial Designers'] },
  { system: 'SOC', code: '27-2000', title: 'Entertainers and Performers, Sports and Related Workers', examples: ['Actors', 'Athletes', 'Dancers', 'Musicians'] },
  { system: 'SOC', code: '27-3000', title: 'Media and Communication Workers', examples: ['Broadcast Announcers', 'Editors', 'Reporters', 'Technical Writers'] },
  { system: 'SOC', code: '27-4000', title: 'Media and Communication Equipment Workers', examples: ['Audio and Video Technicians', 'Broadcast Technicians', 'Photographers', 'Camera Operators'] },
  // Healthcare Practitioners
  { system: 'SOC', code: '29-1000', title: 'Healthcare Diagnosing or Treating Practitioners', examples: ['Dentists', 'Optometrists', 'Physicians', 'Surgeons'] },
  { system: 'SOC', code: '29-2000', title: 'Health Technologists and Technicians', examples: ['Clinical Lab Technicians', 'Dental Hygienists', 'Radiologic Technicians', 'Surgical Technologists'] },
  { system: 'SOC', code: '29-9000', title: 'Other Healthcare Practitioners and Technical Occupations', examples: ['Dietitians', 'Opticians', 'Hearing Aid Specialists'] },
  // Healthcare Support
  { system: 'SOC', code: '31-1100', title: 'Home Health and Personal Care Aides; and Nursing Assistants', examples: ['Home Health Aides', 'Personal Care Aides', 'Nursing Assistants', 'Orderlies'] },
  { system: 'SOC', code: '31-9000', title: 'Other Healthcare Support Occupations', examples: ['Massage Therapists', 'Dental Assistants', 'Medical Assistants', 'Pharmacy Aides'] },
  // Protective Service
  { system: 'SOC', code: '33-1000', title: 'Supervisors of Protective Service Workers', examples: ['First-Line Supervisors of Police', 'First-Line Supervisors of Firefighters'] },
  { system: 'SOC', code: '33-2000', title: 'Firefighting and Prevention Workers', examples: ['Firefighters', 'Fire Inspectors', 'Forest Fire Prevention Workers'] },
  { system: 'SOC', code: '33-3000', title: 'Law Enforcement Workers', examples: ['Detectives', 'Police Officers', 'Sheriff Officers', 'Transit Police'] },
  { system: 'SOC', code: '33-9000', title: 'Other Protective Service Workers', examples: ['Crossing Guards', 'Lifeguards', 'Security Guards', 'TSA Agents'] },
  // Food Preparation
  { system: 'SOC', code: '35-1000', title: 'Supervisors of Food Preparation and Serving Workers', examples: ['Chefs and Head Cooks', 'First-Line Supervisors of Food Workers'] },
  { system: 'SOC', code: '35-2000', title: 'Cooks and Food Preparation Workers', examples: ['Cooks (Restaurant)', 'Cooks (Fast Food)', 'Food Preparation Workers'] },
  { system: 'SOC', code: '35-3000', title: 'Food and Beverage Serving Workers', examples: ['Bartenders', 'Waiters', 'Food Servers', 'Hosts and Hostesses'] },
  // Building and Grounds
  { system: 'SOC', code: '37-1000', title: 'Supervisors of Building and Grounds Cleaning and Maintenance Workers', examples: ['First-Line Supervisors of Housekeeping', 'First-Line Supervisors of Janitorial'] },
  { system: 'SOC', code: '37-2000', title: 'Building Cleaning and Pest Control Workers', examples: ['Janitors', 'Maids', 'Pest Control Workers'] },
  { system: 'SOC', code: '37-3000', title: 'Grounds Maintenance Workers', examples: ['Landscapers', 'Groundskeepers', 'Tree Trimmers', 'Pesticide Applicators'] },
  // Sales
  { system: 'SOC', code: '41-1000', title: 'Supervisors of Sales Workers', examples: ['First-Line Supervisors of Retail', 'First-Line Supervisors of Non-Retail Sales'] },
  { system: 'SOC', code: '41-2000', title: 'Retail Sales Workers', examples: ['Cashiers', 'Retail Salespersons', 'Parts Salespersons'] },
  { system: 'SOC', code: '41-3000', title: 'Sales Representatives, Services', examples: ['Advertising Sales Agents', 'Insurance Sales Agents', 'Travel Agents'] },
  { system: 'SOC', code: '41-4000', title: 'Sales Representatives, Wholesale and Manufacturing', examples: ['Sales Engineers', 'Wholesale Sales Reps (Technical)', 'Wholesale Sales Reps (Non-Technical)'] },
  { system: 'SOC', code: '41-9000', title: 'Other Sales and Related Workers', examples: ['Door-to-Door Sales', 'Telemarketers', 'Real Estate Brokers', 'Real Estate Sales Agents'] },
  // Office and Administrative
  { system: 'SOC', code: '43-1000', title: 'Supervisors of Office and Administrative Support Workers', examples: ['First-Line Supervisors of Office Workers'] },
  { system: 'SOC', code: '43-2000', title: 'Communications Equipment Operators', examples: ['Telephone Operators', 'Switchboard Operators'] },
  { system: 'SOC', code: '43-3000', title: 'Financial Clerks', examples: ['Billing Clerks', 'Bookkeeping Clerks', 'Payroll Clerks', 'Tellers'] },
  { system: 'SOC', code: '43-4000', title: 'Information and Record Clerks', examples: ['Customer Service Reps', 'File Clerks', 'Receptionists', 'Library Assistants'] },
  { system: 'SOC', code: '43-5000', title: 'Material Recording, Scheduling, Dispatching, and Distributing Workers', examples: ['Dispatchers', 'Postal Service Workers', 'Shipping Clerks', 'Stock Clerks'] },
  { system: 'SOC', code: '43-6000', title: 'Secretaries and Administrative Assistants', examples: ['Executive Secretaries', 'Legal Secretaries', 'Medical Secretaries'] },
  { system: 'SOC', code: '43-9000', title: 'Other Office and Administrative Support Workers', examples: ['Data Entry Keyers', 'Office Clerks', 'Proofreaders', 'Statistical Assistants'] },
  // Construction
  { system: 'SOC', code: '47-1000', title: 'Supervisors of Construction and Extraction Workers', examples: ['First-Line Supervisors of Construction Trades', 'First-Line Supervisors of Extraction Workers'] },
  { system: 'SOC', code: '47-2000', title: 'Construction Trades Workers', examples: ['Boilermakers', 'Carpenters', 'Electricians', 'Plumbers'] },
  { system: 'SOC', code: '47-3000', title: 'Helpers, Construction Trades', examples: ['Helpers-Brickmasons', 'Helpers-Carpenters', 'Helpers-Electricians', 'Helpers-Plumbers'] },
  { system: 'SOC', code: '47-4000', title: 'Other Construction and Related Workers', examples: ['Fence Erectors', 'Hazardous Materials Removal Workers', 'Rail-Track Workers'] },
  { system: 'SOC', code: '47-5000', title: 'Extraction Workers', examples: ['Derrick Operators', 'Mining Machine Operators', 'Roustabouts'] },
  // Installation, Maintenance, and Repair
  { system: 'SOC', code: '49-1000', title: 'Supervisors of Installation, Maintenance, and Repair Workers', examples: ['First-Line Supervisors of Mechanics'] },
  { system: 'SOC', code: '49-2000', title: 'Electrical and Electronic Equipment Mechanics, Installers, and Repairers', examples: ['Avionics Technicians', 'Computer Repairers', 'Telecom Equipment Installers'] },
  { system: 'SOC', code: '49-3000', title: 'Vehicle and Mobile Equipment Mechanics, Installers, and Repairers', examples: ['Aircraft Mechanics', 'Automotive Technicians', 'Bus Mechanics', 'Diesel Mechanics'] },
  { system: 'SOC', code: '49-9000', title: 'Other Installation, Maintenance, and Repair Occupations', examples: ['Locksmiths', 'Riggers', 'Signal Repairers', 'Coin Machine Servicers'] },
  // Production
  { system: 'SOC', code: '51-1000', title: 'Supervisors of Production Workers', examples: ['First-Line Supervisors of Production Workers'] },
  { system: 'SOC', code: '51-2000', title: 'Assemblers and Fabricators', examples: ['Aircraft Assemblers', 'Electrical Assemblers', 'Engine Assemblers', 'Team Assemblers'] },
  { system: 'SOC', code: '51-4000', title: 'Metal Workers and Plastic Workers', examples: ['CNC Operators', 'Machinists', 'Tool and Die Makers', 'Welders'] },
  { system: 'SOC', code: '51-6000', title: 'Textile, Apparel, and Furnishings Workers', examples: ['Laundry Workers', 'Sewers', 'Tailors', 'Upholsterers'] },
  { system: 'SOC', code: '51-9000', title: 'Other Production Occupations', examples: ['Chemical Plant Operators', 'Inspectors', 'Jewelers', 'Painting Workers'] },
  // Transportation
  { system: 'SOC', code: '53-1000', title: 'Supervisors of Transportation and Material Moving Workers', examples: ['Aircraft Cargo Supervisors', 'First-Line Supervisors of Transportation'] },
  { system: 'SOC', code: '53-2000', title: 'Air Transportation Workers', examples: ['Airline Pilots', 'Commercial Pilots', 'Flight Engineers', 'Air Traffic Controllers'] },
  { system: 'SOC', code: '53-3000', title: 'Motor Vehicle Operators', examples: ['Bus Drivers', 'Taxi Drivers', 'Light Truck Drivers', 'Heavy Truck Drivers'] },
  { system: 'SOC', code: '53-4000', title: 'Rail Transportation Workers', examples: ['Locomotive Engineers', 'Railroad Conductors', 'Subway Operators'] },
  { system: 'SOC', code: '53-5000', title: 'Water Transportation Workers', examples: ['Captains', 'Mates', 'Sailors', 'Ship Engineers'] },
  { system: 'SOC', code: '53-7000', title: 'Material Moving Workers', examples: ['Crane Operators', 'Excavating Operators', 'Industrial Truck Operators', 'Laborers'] },
];

export const socDetailedCodes: JobClassification[] = [
  { system: 'SOC', code: '11-1011', title: 'Chief Executives', examples: ['CEO', 'COO', 'Executive Director'] },
  { system: 'SOC', code: '11-1021', title: 'General and Operations Managers', examples: ['Operations Manager', 'Branch Manager', 'Store Manager'] },
  { system: 'SOC', code: '11-2021', title: 'Marketing Managers', examples: ['Marketing Director', 'Brand Manager', 'Digital Marketing Manager'] },
  { system: 'SOC', code: '11-3021', title: 'Computer and Information Systems Managers', examples: ['IT Director', 'CTO', 'IT Manager'] },
  { system: 'SOC', code: '11-3031', title: 'Financial Managers', examples: ['CFO', 'Finance Director', 'Controller'] },
  { system: 'SOC', code: '11-3121', title: 'Human Resources Managers', examples: ['HR Director', 'CHRO', 'VP of People'] },
  { system: 'SOC', code: '13-1111', title: 'Management Analysts', examples: ['Management Consultant', 'Business Analyst', 'Strategy Consultant'] },
  { system: 'SOC', code: '13-1151', title: 'Training and Development Specialists', examples: ['Corporate Trainer', 'Learning Specialist', 'Instructional Designer'] },
  { system: 'SOC', code: '13-1161', title: 'Market Research Analysts and Marketing Specialists', examples: ['Market Researcher', 'Marketing Analyst', 'Consumer Insights Analyst'] },
  { system: 'SOC', code: '13-2011', title: 'Accountants and Auditors', examples: ['CPA', 'Internal Auditor', 'Tax Accountant', 'Forensic Accountant'] },
  { system: 'SOC', code: '13-2051', title: 'Financial and Investment Analysts', examples: ['Financial Analyst', 'Investment Analyst', 'Equity Analyst', 'Risk Analyst'] },
  { system: 'SOC', code: '13-2072', title: 'Loan Officers', examples: ['Mortgage Loan Officer', 'Commercial Loan Officer', 'Consumer Loan Officer'] },
  { system: 'SOC', code: '15-1211', title: 'Computer Systems Analysts', examples: ['Systems Analyst', 'Business Systems Analyst', 'IT Analyst'] },
  { system: 'SOC', code: '15-1232', title: 'Computer User Support Specialists', examples: ['Help Desk Technician', 'Desktop Support', 'IT Support Specialist'] },
  { system: 'SOC', code: '15-1252', title: 'Software Developers', examples: ['Full-Stack Developer', 'Backend Developer', 'Mobile Developer', 'Software Engineer'] },
  { system: 'SOC', code: '15-1253', title: 'Software Quality Assurance Analysts and Testers', examples: ['QA Engineer', 'Test Engineer', 'SDET', 'QA Analyst'] },
  { system: 'SOC', code: '15-1255', title: 'Web and Digital Interface Designers', examples: ['UX Designer', 'UI Designer', 'Web Designer', 'Product Designer'] },
  { system: 'SOC', code: '15-1299', title: 'Computer Occupations, All Other', examples: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer'] },
  { system: 'SOC', code: '15-2051', title: 'Data Scientists', examples: ['Data Scientist', 'Machine Learning Engineer', 'AI Researcher'] },
  { system: 'SOC', code: '17-2051', title: 'Civil Engineers', examples: ['Structural Engineer', 'Transportation Engineer', 'Geotechnical Engineer'] },
  { system: 'SOC', code: '17-2071', title: 'Electrical Engineers', examples: ['Power Systems Engineer', 'Electronics Engineer', 'Control Systems Engineer'] },
  { system: 'SOC', code: '17-2112', title: 'Industrial Engineers', examples: ['Process Engineer', 'Manufacturing Engineer', 'Quality Engineer'] },
  { system: 'SOC', code: '17-2141', title: 'Mechanical Engineers', examples: ['Design Engineer', 'HVAC Engineer', 'Automotive Engineer'] },
  { system: 'SOC', code: '29-1141', title: 'Registered Nurses', examples: ['Staff Nurse', 'Charge Nurse', 'Clinical Nurse', 'Nurse Practitioner'] },
  { system: 'SOC', code: '29-1215', title: 'Family Medicine Physicians', examples: ['Family Doctor', 'Primary Care Physician', 'General Practitioner'] },
  { system: 'SOC', code: '41-2031', title: 'Retail Salespersons', examples: ['Sales Associate', 'Store Clerk', 'Floor Sales'] },
  { system: 'SOC', code: '43-3031', title: 'Bookkeeping, Accounting, and Auditing Clerks', examples: ['Bookkeeper', 'Accounts Payable Clerk', 'Accounts Receivable Clerk'] },
  { system: 'SOC', code: '43-4051', title: 'Customer Service Representatives', examples: ['Customer Support Agent', 'Call Center Representative', 'Client Service Rep'] },
  { system: 'SOC', code: '43-6014', title: 'Secretaries and Administrative Assistants, Except Legal, Medical, and Executive', examples: ['Administrative Assistant', 'Office Assistant', 'Department Secretary'] },
  { system: 'SOC', code: '47-2111', title: 'Electricians', examples: ['Journeyman Electrician', 'Master Electrician', 'Industrial Electrician'] },
  { system: 'SOC', code: '49-3023', title: 'Automotive Service Technicians and Mechanics', examples: ['Auto Mechanic', 'Automotive Technician', 'Brake Specialist'] },
  { system: 'SOC', code: '53-3032', title: 'Heavy and Tractor-Trailer Truck Drivers', examples: ['Long-Haul Trucker', 'OTR Driver', 'CDL Driver'] },
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
  ...socMinorGroups,
  ...socDetailedCodes,
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

  console.log(`Seeded ${jobClassifications.length} job classifications (${onetSocGroups.length} SOC major groups, ${socMinorGroups.length} SOC minor groups, ${socDetailedCodes.length} SOC detailed, ${iscoGroups.length} ISCO-08).`);
}

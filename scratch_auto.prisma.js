const fs = require('fs');
const schemaPath = 'd:/KreupAI.AuraOS/packages/@aura/database/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
model AviationFlightAssignment {
  id              String    @id @default(uuid())
  tenantId        String
  assignmentId    String    @unique
  flightNumber    String
  departureAirport String
  arrivalAirport   String
  scheduledDeparture DateTime
  scheduledArrival   DateTime
  status          String
  aircraftType    String
  aircraftRegistration String?
  position        String
  reportTime      DateTime
  clearTime       DateTime
  flightTimeMinutes Int
  dutyTimeMinutes   Int
  briefingInfo    Json?
  crewComplement  Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@index([flightNumber])
  @@map("aura_av_flight_assignment")
}

model AviationDutyTime {
  id              String    @id @default(uuid())
  tenantId        String
  dutyId          String    @unique
  crewId          String
  dutyType        String
  startTime       DateTime
  endTime         DateTime
  baseAirport     String
  status          String
  totalMinutes    Int
  flightMinutes   Int
  fatigueAssessment Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@index([crewId])
  @@map("aura_av_duty_time")
}

model AviationRestPeriod {
  id              String    @id @default(uuid())
  tenantId        String
  restId          String    @unique
  crewId          String
  restType        String
  startTime       DateTime
  endTime         DateTime
  location        String
  status          String
  durationMinutes Int
  accommodation   Json?
  isCompliant     Boolean   @default(true)
  complianceNotes String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@index([crewId])
  @@map("aura_av_rest_period")
}

model AviationPilotProfile {
  id              String    @id @default(uuid())
  tenantId        String
  pilotId         String    @unique
  employeeId      String    @unique
  personalInfo    Json
  pilotType       String
  rank            String
  baseAirport     String
  status          String
  licenses        Json?
  typeRatings     Json?
  medicalStatus   Json?
  flightHours     Json?
  performanceRating Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@index([employeeId])
  @@map("aura_av_pilot_profile")
}

model AviationSimulatorSession {
  id              String    @id @default(uuid())
  tenantId        String
  sessionId       String    @unique
  pilotId         String
  sessionType     String
  simulatorId     String
  aircraftType    String
  date            DateTime
  durationMinutes Int
  location        String
  instructor      Json?
  scenarios       Json?
  performance     Json?
  overallGrade    String?
  status          String
  notes           String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@index([pilotId])
  @@map("aura_av_simulator_session")
}

model AviationProficiencyCheck {
  id              String    @id @default(uuid())
  tenantId        String
  checkId         String    @unique
  pilotId         String
  checkType       String
  aircraftType    String
  date            DateTime
  location        String
  examiner        Json?
  checklist       Json?
  result          String
  validUntil      DateTime
  restrictions    String[]
  notes           String?
  status          String
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@index([pilotId])
  @@map("aura_av_proficiency_check")
}

model AviationRampProcedure {
  id              String    @id @default(uuid())
  tenantId        String
  procedureId     String    @unique
  title           String
  aircraftType    String
  category        String
  version         String
  lastUpdated     DateTime
  author          String
  status          String
  steps           Json?
  requiredEquipment String[]
  safetyWarnings  String[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@map("aura_av_ramp_procedure")
}

model AviationSafetyCompliance {
  id              String    @id @default(uuid())
  tenantId        String
  recordId        String    @unique
  auditType       String
  date            DateTime
  location        String
  department      String
  auditor         Json?
  areas           Json?
  overallScore    Float
  status          String
  nextAuditDate   DateTime?
  findings        Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
  isDeleted       Boolean   @default(false)

  @@index([tenantId])
  @@map("aura_av_safety_compliance")
}
`;

const newCabinCrew = `model AviationCabinCrewMember {
  id            String    @id @default(uuid())
  tenantId      String
  crewId        String    @unique
  employeeId    String    @unique
  personalInfo  Json
  crewType      String
  seniority     Json?
  qualifications Json?
  languages     Json?
  certifications Json?
  medicalStatus Json?
  dutyStatus    String
  preferences   Json?
  performanceRating Json?
  status        String    @default("active")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String?
  updatedBy     String?
  deletedAt     DateTime?
  isDeleted     Boolean   @default(false)

  @@index([tenantId])
  @@map("aura_av_cabin_crew")
}`;

schema = schema.replace(/model AviationCabinCrewMember \{[\s\S]*?\n\}/, newCabinCrew);

const newGroundStaff = `model AviationGroundStaff {
  id             String    @id @default(uuid())
  tenantId       String
  staffId        String    @unique
  employeeId     String    @unique
  personalInfo   Json
  jobRole        String
  department     String
  baseStation    String
  shiftInfo      Json?
  qualifications Json?
  certifications Json?
  equipmentQualifications Json?
  safetyRecord   Json?
  performanceMetrics Json?
  status         String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  createdBy      String?
  updatedBy      String?
  deletedAt      DateTime?
  isDeleted      Boolean   @default(false)

  @@index([tenantId])
  @@map("aura_av_ground_staff")
}`;

schema = schema.replace(/model AviationGroundStaff \{[\s\S]*?\n\}/, newGroundStaff);

const newPilotTraining = `model AviationPilotTraining {
  id                String    @id @default(uuid())
  tenantId          String
  recordId          String    @unique
  pilotId           String
  programName       String
  programType       String
  startDate         DateTime
  endDate           DateTime?
  status            String
  syllabus          Json?
  progress          Json?
  instructor        Json?
  certification     Json?
  notes             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         String?
  updatedBy         String?
  deletedAt         DateTime?
  isDeleted         Boolean   @default(false)

  @@index([tenantId])
  @@index([pilotId])
  @@map("aura_av_pilot_training")
}`;

schema = schema.replace(/model AviationPilotTraining \{[\s\S]*?\n\}/, newPilotTraining);

if (!schema.includes('model AviationFlightAssignment')) {
    schema = schema + '\n\n' + newModels;
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully.');

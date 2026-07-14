const fs = require('fs');
const path = require('path');

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to generate random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Formatting dates for PostgreSQL
const pgDate = (d) => d.toISOString().replace('T', ' ').replace('Z', '');

// Target volumes
const SITES_COUNT = 40;
const ASSIGNMENTS_COUNT = 350;
const INSPECTIONS_COUNT = 220;
const COMPLAINTS_COUNT = 240;

const countries = ['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'];
const siteTypes = ['DORMITORY', 'HOTEL', 'APARTMENT', 'LABOUR_CAMP', 'VILLA', 'STAFF_HOUSING'];
const inspectionCategories = ['HYGIENE', 'FIRE_SAFETY', 'ELECTRICAL', 'KITCHEN', 'MEDICAL', 'WELFARE', 'SECURITY', 'GENERAL'];
const complaintCategories = ['HYGIENE', 'MAINTENANCE', 'OVERCROWDING', 'KITCHEN', 'TRANSPORT', 'SECURITY', 'NOISE', 'BEHAVIOUR', 'OTHER'];
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const managers = ['John Smith', 'Ahmed Al-Mansoori', 'Rajesh Kumar', 'Fatima Al-Sayed', 'David Miller'];
const contractors = ['Al Naboodah Group', 'Arabian Construction Co', 'Drake & Scull', 'Habtoor Leighton', 'Shapoorji Pallonji'];

// Begin generation
console.log('Generating seed datasets with dynamic variables...');

// 1. Generate Sites
const sites = [];
for (let i = 1; i <= SITES_COUNT; i++) {
  const country = countries[Math.floor(Math.random() * countries.length)];
  const siteType = siteTypes[Math.floor(Math.random() * siteTypes.length)];
  const capacity = 10 + Math.floor(Math.random() * 14) * 10; // 10 to 140
  const isFemale = Math.random() < 0.15;
  const isFamily = !isFemale && Math.random() < 0.25;

  sites.push({
    id: uuidv4(),
    name: `Kreup Compliance Housing ${siteType.replace('_', ' ')} ${String.fromCharCode(64 + (i % 26))}${i > 26 ? Math.floor(i/26) : ''}`,
    siteType,
    country,
    address: `${100 + i} Road, Industry Area ${i % 5 + 1}, ${country}`,
    totalCapacity: capacity,
    currentOccupancy: 0, // Computed later
    managerId: managers[i % managers.length],
    contractorId: contractors[i % contractors.length],
    femaleOnly: isFemale,
    familyAllowed: isFamily,
    lastInspectionAt: null, // Set from inspection dates later
    nextInspectionAt: null, // Set later
    status: i === SITES_COUNT ? 'ARCHIVED' : 'ACTIVE',
  });
}

// 2. Generate Assignments
const assignments = [];
const activeAssignmentsBySite = {};
sites.forEach(s => activeAssignmentsBySite[s.id] = 0);

// Force overcapacity on first 3 sites
const forceOvercapacitySites = [sites[0], sites[1], sites[2]];

for (let i = 0; i < ASSIGNMENTS_COUNT; i++) {
  let site;
  if (i < 80) {
    site = forceOvercapacitySites[i % 3];
  } else {
    site = sites[Math.floor(Math.random() * sites.length)];
  }

  const checkIn = randomDate(new Date('2026-05-01'), new Date('2026-07-01'));
  const isCheckedOut = i >= 80 && Math.random() < 0.3;
  let checkOut = null;
  let status = 'ACTIVE';

  if (isCheckedOut) {
    checkOut = randomDate(checkIn, new Date('2026-07-04'));
    status = 'CHECKED_OUT';
  } else {
    if (site.status === 'ACTIVE') {
      activeAssignmentsBySite[site.id]++;
    }
  }

  assignments.push({
    id: uuidv4(),
    siteId: site.id,
    employeeId: `EMP-${10000 + i}`,
    roomNumber: `RM-${200 + (i % 30)}`,
    bedNumber: `BED-${(i % 4) + 1}`,
    checkInAt: checkIn,
    checkOutAt: checkOut,
    status,
    monthlyAllowance: 500 + Math.floor(Math.random() * 15) * 100,
    currency: 'AED',
  });
}

// Update site occupancy counts
sites.forEach(s => {
  s.currentOccupancy = activeAssignmentsBySite[s.id] || 0;
});

// 3. Generate Inspections
const inspections = [];
const siteInspectionDates = {};

// Force overdue inspections on site 3 and 4
const overdueSites = [sites[3], sites[4]];
const overdueDate = new Date('2026-03-10'); // overdue

for (let i = 0; i < INSPECTIONS_COUNT; i++) {
  let site;
  let inspectionDate;
  
  if (i < 2) {
    site = overdueSites[i];
    inspectionDate = overdueDate;
  } else {
    site = sites[Math.floor(Math.random() * sites.length)];
    inspectionDate = randomDate(new Date('2026-04-01'), new Date('2026-07-04'));
  }

  const score = 60 + Math.floor(Math.random() * 41); // 60 to 100
  let crit = 0;
  let maj = 0;
  let min = 0;
  const findings = [];

  if (score < 75) {
    crit = Math.floor(Math.random() * 2);
    maj = 1 + Math.floor(Math.random() * 3);
    min = 2 + Math.floor(Math.random() * 4);
  } else if (score < 90) {
    maj = Math.floor(Math.random() * 2);
    min = 1 + Math.floor(Math.random() * 3);
  } else {
    min = Math.floor(Math.random() * 2);
  }

  for (let c = 0; c < crit; c++) {
    findings.push({ finding: 'Evacuation route blocked by materials or structural repairs required', severity: 'CRITICAL' });
  }
  for (let m = 0; m < maj; m++) {
    findings.push({ finding: 'Emergency lighting system batteries depleted', severity: 'MAJOR' });
  }
  for (let mi = 0; mi < min; mi++) {
    findings.push({ finding: 'Pest control log missing recent inspection details', severity: 'MINOR' });
  }

  const isOpen = crit > 0 && Math.random() < 0.8;
  const status = isOpen ? 'OPEN' : 'CLOSED';
  const closedAt = isOpen ? null : randomDate(inspectionDate, new Date('2026-07-04'));

  inspections.push({
    id: uuidv4(),
    siteId: site.id,
    inspectionDate,
    category: inspectionCategories[i % inspectionCategories.length],
    score,
    criticalFindings: crit,
    majorFindings: maj,
    minorFindings: min,
    findingsJson: JSON.stringify(findings),
    status,
    closedAt,
  });

  if (!siteInspectionDates[site.id] || siteInspectionDates[site.id].date < inspectionDate) {
    siteInspectionDates[site.id] = {
      date: inspectionDate,
      next: new Date(inspectionDate.getTime() + 90 * 24 * 60 * 60 * 1000), // +90 days
    };
  }
}

// Update sites inspection dates
sites.forEach(s => {
  const dates = siteInspectionDates[s.id];
  if (dates) {
    s.lastInspectionAt = dates.date;
    s.nextInspectionAt = dates.next;
  }
});

// 4. Generate Complaints
const complaints = [];
for (let i = 0; i < COMPLAINTS_COUNT; i++) {
  const site = sites[Math.floor(Math.random() * sites.length)];
  const raised = randomDate(new Date('2026-05-01'), new Date('2026-07-04'));
  const severity = severities[i % severities.length];
  
  const forceSlaBreach = i < 5;
  const actualRaised = forceSlaBreach ? randomDate(new Date('2026-06-01'), new Date('2026-06-10')) : raised;
  const status = forceSlaBreach ? 'OPEN' : (i < 100 ? 'OPEN' : (i < 160 ? 'IN_PROGRESS' : 'RESOLVED'));
  const resolvedAt = status === 'RESOLVED' ? randomDate(actualRaised, new Date('2026-07-04')) : null;

  complaints.push({
    id: uuidv4(),
    siteId: site.id,
    employeeId: `EMP-${10000 + i}`,
    category: complaintCategories[i % complaintCategories.length],
    severity,
    subject: `Issue regarding camp ${complaintCategories[i % complaintCategories.length].toLowerCase()} conditions`,
    description: `Detailed report on maintenance work needed: ${complaintCategories[i % complaintCategories.length].toLowerCase()} check in Block ${i%3 + 1}.`,
    raisedAt: actualRaised,
    assigneeId: status !== 'OPEN' ? `user_assignee_${i % 5}` : null,
    slaHours: 48,
    status,
    resolvedAt,
    resolutionNotes: status === 'RESOLVED' ? 'Repairs completed and inspected by safety lead.' : null,
  });
}

// 5. Generate Certificate Records
const juneSitesTotal = sites.length;
const certs = [
  {
    id: uuidv4(),
    period: '2026-05',
    status: 'SIGNED',
    sitesTotal: juneSitesTotal,
    sitesOvercapacity: 0,
    inspectionsDue: 0,
    openCriticalFindings: 0,
    openComplaints: 0,
    complaintsSlaBreached: 0,
    averageInspectionScore: 88.5,
    gatingReason: null,
    attestationsJson: JSON.stringify([
      { field: 'safetyChecked', value: 'CONFIRMED' },
      { field: 'hygieneChecked', value: 'CONFIRMED' },
      { field: 'capacityChecked', value: 'CONFIRMED' },
      { field: 'auditConfirmed', value: 'CONFIRMED' },
    ]),
    generatedAt: new Date('2026-06-01T08:00:00Z'),
    signedAt: new Date('2026-06-02T10:30:00Z'),
  },
  {
    id: uuidv4(),
    period: '2026-06',
    status: 'SIGNED',
    sitesTotal: juneSitesTotal,
    sitesOvercapacity: 0,
    inspectionsDue: 0,
    openCriticalFindings: 0,
    openComplaints: 0,
    complaintsSlaBreached: 0,
    averageInspectionScore: 84.2,
    gatingReason: null,
    attestationsJson: JSON.stringify([
      { field: 'safetyChecked', value: 'CONFIRMED' },
      { field: 'hygieneChecked', value: 'CONFIRMED' },
      { field: 'capacityChecked', value: 'CONFIRMED' },
      { field: 'auditConfirmed', value: 'CONFIRMED' },
    ]),
    generatedAt: new Date('2026-07-01T08:00:00Z'),
    signedAt: new Date('2026-07-02T11:00:00Z'),
  },
  {
    id: uuidv4(),
    period: '2026-07',
    status: 'DRAFT',
    sitesTotal: juneSitesTotal,
    sitesOvercapacity: 3,
    inspectionsDue: 2,
    openCriticalFindings: 2,
    openComplaints: 12,
    complaintsSlaBreached: 5,
    averageInspectionScore: 78.4,
    gatingReason: 'Blocked: 3 site(s) over capacity; 2 open CRITICAL finding(s); 5 SLA-breached complaint(s); 2 overdue inspection(s)',
    attestationsJson: '[]',
    generatedAt: new Date('2026-07-04T09:00:00Z'),
    signedAt: null,
  }
];

// Write SQL file content
let sql = '';
sql += `-- ===========================================================================\n`;
sql += `-- DYNAMIC SEED DATA: ACCOMMODATION COMPLIANCE MODULE\n`;
sql += `-- TENANT RESOLVED DYNAMICALLY FROM: KREUP_AI\n`;
sql += `-- DATE RANGE: Previous Month (June 2026), Current Month (July 2026), Next Month (August 2026)\n`;
sql += `-- ===========================================================================\n\n`;

sql += `BEGIN;\n\n`;
sql += `SET search_path TO auraos, public;\n\n`;

sql += `-- 1. RESOLVE DYNAMIC VARIABLES (TENANT & COMPANY & AUDIT USER)\n`;
sql += `CREATE TEMP TABLE vars AS\n`;
sql += `SELECT \n`;
sql += `  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,\n`;
sql += `  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%kreup%' LIMIT 1), 'system_manager') AS user_id;\n\n`;

// Clear existing records for cleanup (dynamic tenantId)
sql += `-- 2. CREATE DYNAMIC EMPLOYEE LOOKUP TABLE\n`;
sql += `CREATE TEMP TABLE temp_employees AS\n`;
sql += `SELECT ROW_NUMBER() OVER (ORDER BY e.id) AS row_num, e.id\n`;
sql += `FROM aura_employee e\n`;
sql += `JOIN aura_company c ON e."companyId" = c.id\n`;
sql += `WHERE c."tenantId" = (SELECT tenant_id FROM vars) AND e."isDeleted" = false;\n\n`;

sql += `-- 3. CLEANUP PREVIOUS DATA FOR TENANT\n`;
sql += `DELETE FROM aura_accommodation_certificate WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `DELETE FROM aura_accommodation_complaint WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `DELETE FROM aura_accommodation_inspection WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `DELETE FROM aura_accommodation_assignment WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `DELETE FROM aura_accommodation_site WHERE "tenantId" = (SELECT tenant_id FROM vars);\n\n`;

// Insert Sites
sql += `-- 4. SEED ACCOMMODATION SITES\n`;
sites.forEach(s => {
  const lastInsp = s.lastInspectionAt ? `'${pgDate(s.lastInspectionAt)}'` : 'NULL';
  const nextInsp = s.nextInspectionAt ? `'${pgDate(s.nextInspectionAt)}'` : 'NULL';
  sql += `INSERT INTO aura_accommodation_site (id, "tenantId", name, "siteType", country, address, "totalCapacity", "currentOccupancy", "managerId", "contractorId", "femaleOnly", "familyAllowed", "lastInspectionAt", "nextInspectionAt", status, "createdAt", "updatedAt", "isDeleted", "createdBy", "updatedBy")\n`;
  sql += `SELECT '${s.id}', tenant_id, '${s.name.replace(/'/g, "''")}', '${s.siteType}', '${s.country}', '${s.address.replace(/'/g, "''")}', ${s.totalCapacity}, ${s.currentOccupancy}, '${s.managerId}', '${s.contractorId}', ${s.femaleOnly}, ${s.familyAllowed}, ${lastInsp}, ${nextInsp}, '${s.status}', NOW(), NOW(), false, user_id, user_id FROM vars;\n`;
});
sql += `\n`;

// Insert Assignments
sql += `-- 5. SEED ACCOMMODATION ASSIGNMENTS\n`;
assignments.forEach((a, i) => {
  const checkOutStr = a.checkOutAt ? `'${pgDate(a.checkOutAt)}'` : 'NULL';
  sql += `INSERT INTO aura_accommodation_assignment (id, "tenantId", "siteId", "employeeId", "roomNumber", "bedNumber", "checkInAt", "checkOutAt", status, "monthlyAllowance", currency, "createdAt", "updatedAt", "isDeleted", "createdBy", "updatedBy")\n`;
  sql += `SELECT '${a.id}', tenant_id, '${a.siteId}', COALESCE((SELECT id FROM temp_employees WHERE row_num = (((${i}) % (SELECT COALESCE(NULLIF(COUNT(*), 0), 1) FROM temp_employees)) + 1) LIMIT 1), '${a.employeeId}'), '${a.roomNumber}', '${a.bedNumber}', '${pgDate(a.checkInAt)}', ${checkOutStr}, '${a.status}', ${a.monthlyAllowance}, '${a.currency}', NOW(), NOW(), false, user_id, user_id FROM vars;\n`;
});
sql += `\n`;

// Insert Inspections
sql += `-- 6. SEED ACCOMMODATION INSPECTIONS\n`;
inspections.forEach(i => {
  const closedStr = i.closedAt ? `'${pgDate(i.closedAt)}'` : 'NULL';
  const inspId = i.inspectorId ? `'${i.inspectorId}'` : 'NULL';
  sql += `INSERT INTO aura_accommodation_inspection (id, "tenantId", "siteId", "inspectionDate", "inspectorId", category, score, "criticalFindings", "majorFindings", "minorFindings", "findingsJson", status, "closedAt", "createdAt", "updatedAt", "isDeleted", "createdBy", "updatedBy")\n`;
  sql += `SELECT '${i.id}', tenant_id, '${i.siteId}', '${pgDate(i.inspectionDate)}', ${inspId}, '${i.category}', ${i.score}, ${i.criticalFindings}, ${i.majorFindings}, ${i.minorFindings}, '${i.findingsJson.replace(/'/g, "''")}', '${i.status}', ${closedStr}, NOW(), NOW(), false, user_id, user_id FROM vars;\n`;
});
sql += `\n`;

// Insert Complaints
sql += `-- 7. SEED ACCOMMODATION COMPLAINTS\n`;
complaints.forEach((c, idx) => {
  const resolvedStr = c.resolvedAt ? `'${pgDate(c.resolvedAt)}'` : 'NULL';
  const assigneeStr = c.assigneeId ? `'${c.assigneeId}'` : 'NULL';
  const resolvedByStr = c.resolvedAt ? 'user_id' : 'NULL';
  const resNotesStr = c.resolutionNotes ? `'${c.resolutionNotes.replace(/'/g, "''")}'` : 'NULL';
  sql += `INSERT INTO aura_accommodation_complaint (id, "tenantId", "siteId", "employeeId", category, severity, subject, description, "raisedAt", "raisedBy", "assigneeId", "slaHours", status, "resolvedAt", "resolvedBy", "resolutionNotes", "createdAt", "updatedAt", "isDeleted", "createdBy", "updatedBy")\n`;
  sql += `SELECT '${c.id}', tenant_id, '${c.siteId}', COALESCE((SELECT id FROM temp_employees WHERE row_num = (((${idx + 50}) % (SELECT COALESCE(NULLIF(COUNT(*), 0), 1) FROM temp_employees)) + 1) LIMIT 1), '${c.employeeId}'), '${c.category}', '${c.severity}', '${c.subject.replace(/'/g, "''")}', '${c.description.replace(/'/g, "''")}', '${pgDate(c.raisedAt)}', COALESCE((SELECT id FROM temp_employees WHERE row_num = (((${idx + 50}) % (SELECT COALESCE(NULLIF(COUNT(*), 0), 1) FROM temp_employees)) + 1) LIMIT 1), '${c.employeeId}'), ${assigneeStr}, ${c.slaHours}, '${c.status}', ${resolvedStr}, ${resolvedByStr}, ${resNotesStr}, NOW(), NOW(), false, user_id, user_id FROM vars;\n`;
});
sql += `\n`;

// Insert Certificates
sql += `-- 8. SEED ACCOMMODATION COMPLIANCE MONTHLY CERTIFICATES\n`;
certs.forEach(cert => {
  const signedStr = cert.signedAt ? `'${pgDate(cert.signedAt)}'` : 'NULL';
  const signedByStr = cert.signedAt ? 'user_id' : 'NULL';
  const gateStr = cert.gatingReason ? `'${cert.gatingReason.replace(/'/g, "''")}'` : 'NULL';
  sql += `INSERT INTO aura_accommodation_certificate (id, "tenantId", period, status, "sitesTotal", "sitesOvercapacity", "inspectionsDue", "openCriticalFindings", "openComplaints", "complaintsSlaBreached", "averageInspectionScore", "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt", "isDeleted", "createdBy", "updatedBy")\n`;
  sql += `SELECT '${cert.id}', tenant_id, '${cert.period}', '${cert.status}', ${cert.sitesTotal}, ${cert.sitesOvercapacity}, ${cert.inspectionsDue}, ${cert.openCriticalFindings}, ${cert.openComplaints}, ${cert.complaintsSlaBreached}, ${cert.averageInspectionScore}, ${gateStr}, '${cert.attestationsJson}', '${pgDate(cert.generatedAt)}', ${signedStr}, ${signedByStr}, NOW(), NOW(), false, user_id, user_id FROM vars;\n`;
});
sql += `\n`;

// Verification queries
sql += `-- ===========================================================================\n`;
sql += `-- 9. VERIFICATION QUERIES\n`;
sql += `-- ===========================================================================\n`;
sql += `SELECT 'Sites count verified' AS check_name, COUNT(*) = ${SITES_COUNT} AS passed FROM aura_accommodation_site WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `SELECT 'Assignments count verified' AS check_name, COUNT(*) = ${ASSIGNMENTS_COUNT} AS passed FROM aura_accommodation_assignment WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `SELECT 'Inspections count verified' AS check_name, COUNT(*) = ${INSPECTIONS_COUNT} AS passed FROM aura_accommodation_inspection WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `SELECT 'Complaints count verified' AS check_name, COUNT(*) = ${COMPLAINTS_COUNT} AS passed FROM aura_accommodation_complaint WHERE "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `SELECT 'Overcapacity sites exist (> 0)' AS check_name, COUNT(*) > 0 AS passed FROM aura_accommodation_site WHERE "currentOccupancy" > "totalCapacity" AND "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `SELECT 'SLA breached complaints exist' AS check_name, COUNT(*) > 0 AS passed FROM aura_accommodation_complaint WHERE status = 'OPEN' AND "raisedAt" < NOW() - INTERVAL '48 hours' AND "tenantId" = (SELECT tenant_id FROM vars);\n`;
sql += `SELECT 'Gated certificates exist' AS check_name, COUNT(*) > 0 AS passed FROM aura_accommodation_certificate WHERE "gatingReason" IS NOT NULL AND "tenantId" = (SELECT tenant_id FROM vars);\n\n`;

sql += `DROP TABLE temp_employees;\n`;
sql += `DROP TABLE vars;\n`;
sql += `COMMIT;\n`;

const outPath = path.join(__dirname, 'seed_accommodation.sql');
fs.writeFileSync(outPath, sql);
console.log(`Successfully generated SQL file: ${outPath}`);

/**
 * @module AssetDocumentMiscSeed
 * @description Seed data for Asset Management, Employee Documents, Geofencing,
 *   Expense Claims, Recognition, One-on-One meetings (notes & action items),
 *   Training Sessions & Attendees, Learning Progress, Inter-Company Transfers,
 *   Shared Service Requests, and Project Time Entries.
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@prisma/client';

const pick = <T>(arr: T[], idx: number): T => arr[idx % arr.length];

export async function seedAssetDocumentMisc(prisma: PrismaClient, tenantId: string) {
  console.log('  Seeding Asset, Document & Miscellaneous data...');

  // ── Fetch prerequisites ──
  const employees = await prisma.employee.findMany({ take: 10 });
  const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });
  const companies = await prisma.company.findMany({ take: 5 });
  const locations = await prisma.location.findMany({ take: 3 });

  if (employees.length === 0) {
    console.warn('  No employees found. Skipping asset-document-misc seed.');
    return;
  }
  if (!company) {
    console.warn('  No KREUP_GLOBAL company found. Using first company as fallback.');
  }

  const primaryCompany = company ?? companies[0];
  if (!primaryCompany) {
    console.warn('  No companies found. Skipping asset-document-misc seed.');
    return;
  }

  // ============================================================================
  // 1. ASSET CATEGORIES (6 records)
  // ============================================================================
  console.log('    - Creating asset categories...');

  const assetCategoryDefs = [
    { code: 'COMPUTER', name: 'Computer Equipment', description: 'Desktop computers, laptops, servers, and workstations', depreciationRate: 33.33 },
    { code: 'FURNITURE', name: 'Office Furniture', description: 'Desks, chairs, cabinets, and other office furniture', depreciationRate: 10.0 },
    { code: 'VEHICLE', name: 'Vehicles', description: 'Company cars, trucks, and other transportation vehicles', depreciationRate: 20.0 },
    { code: 'MOBILE', name: 'Mobile Devices', description: 'Smartphones, tablets, and mobile accessories', depreciationRate: 25.0 },
    { code: 'EQUIPMENT', name: 'Equipment & Machinery', description: 'Specialized equipment, tools, and machinery', depreciationRate: 15.0 },
    { code: 'OTHER', name: 'Other Assets', description: 'Miscellaneous assets not categorized elsewhere', depreciationRate: 20.0 },
  ];

  for (const def of assetCategoryDefs) {
    const existing = await prisma.assetCategory.findUnique({ where: { code: def.code } });
    if (!existing) {
      await prisma.assetCategory.create({ data: def });
    }
  }

  // ============================================================================
  // 2. ASSETS (8 records)
  // ============================================================================
  console.log('    - Creating assets...');

  const assetDefs = [
    {
      assetCode: 'AST-001',
      assetName: 'MacBook Pro 16" M3 Max',
      description: 'High-performance laptop for engineering team',
      category: 'COMPUTER',
      assetType: 'Laptop',
      serialNumber: 'FVFHJ3KLQ6LR',
      modelNumber: 'MRW23LL/A',
      manufacturer: 'Apple',
      brand: 'Apple',
      purchaseDate: new Date('2024-03-15'),
      purchasePrice: 12500.00,
      currentValue: 9375.00,
      depreciationRate: 33.33,
      status: 'ASSIGNED',
      condition: 'EXCELLENT',
    },
    {
      assetCode: 'AST-002',
      assetName: 'Dell OptiPlex 7090',
      description: 'Standard desktop for finance department',
      category: 'COMPUTER',
      assetType: 'Desktop',
      serialNumber: 'D7090-XK9P2',
      modelNumber: 'OptiPlex-7090',
      manufacturer: 'Dell',
      brand: 'Dell',
      purchaseDate: new Date('2024-01-10'),
      purchasePrice: 4800.00,
      currentValue: 3600.00,
      depreciationRate: 33.33,
      status: 'ASSIGNED',
      condition: 'GOOD',
    },
    {
      assetCode: 'AST-003',
      assetName: 'ThinkPad X1 Carbon Gen 11',
      description: 'Ultrabook for HR leadership',
      category: 'COMPUTER',
      assetType: 'Laptop',
      serialNumber: 'PF4JNRKS',
      modelNumber: '21HM004TUS',
      manufacturer: 'Lenovo',
      brand: 'Lenovo',
      purchaseDate: new Date('2024-06-01'),
      purchasePrice: 7200.00,
      currentValue: 5400.00,
      depreciationRate: 33.33,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
    },
    {
      assetCode: 'AST-004',
      assetName: 'Herman Miller Aeron Chair',
      description: 'Ergonomic office chair - Size B',
      category: 'FURNITURE',
      assetType: 'Chair',
      serialNumber: 'HM-AER-2024-0451',
      manufacturer: 'Herman Miller',
      brand: 'Herman Miller',
      purchaseDate: new Date('2024-02-20'),
      purchasePrice: 5500.00,
      currentValue: 4950.00,
      depreciationRate: 10.0,
      status: 'ASSIGNED',
      condition: 'EXCELLENT',
    },
    {
      assetCode: 'AST-005',
      assetName: 'Steelcase Leap V2',
      description: 'Ergonomic task chair for open-plan office',
      category: 'FURNITURE',
      assetType: 'Chair',
      serialNumber: 'SC-LEAP-2024-0822',
      manufacturer: 'Steelcase',
      brand: 'Steelcase',
      purchaseDate: new Date('2024-04-10'),
      purchasePrice: 4200.00,
      currentValue: 3780.00,
      depreciationRate: 10.0,
      status: 'ASSIGNED',
      condition: 'GOOD',
    },
    {
      assetCode: 'AST-006',
      assetName: 'Toyota Camry 2024',
      description: 'Company pool car - Dubai office',
      category: 'VEHICLE',
      assetType: 'Car',
      serialNumber: 'JTDKN3DU5R0123456',
      modelNumber: 'Camry-SE-2024',
      manufacturer: 'Toyota',
      brand: 'Toyota',
      purchaseDate: new Date('2024-01-05'),
      purchasePrice: 95000.00,
      currentValue: 76000.00,
      depreciationRate: 20.0,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
    },
    {
      assetCode: 'AST-007',
      assetName: 'iPhone 15 Pro',
      description: 'Company mobile for on-call engineers',
      category: 'MOBILE',
      assetType: 'Phone',
      serialNumber: 'DNQXKC2JMV',
      modelNumber: 'MU6A3LL/A',
      manufacturer: 'Apple',
      brand: 'Apple',
      purchaseDate: new Date('2024-09-20'),
      purchasePrice: 4500.00,
      currentValue: 3375.00,
      depreciationRate: 25.0,
      status: 'ASSIGNED',
      condition: 'EXCELLENT',
    },
    {
      assetCode: 'AST-008',
      assetName: 'Epson WorkForce Pro WF-C5790',
      description: 'Network multifunction printer for shared office area',
      category: 'EQUIPMENT',
      assetType: 'Printer',
      serialNumber: 'X3YJ012345',
      modelNumber: 'WF-C5790',
      manufacturer: 'Epson',
      brand: 'Epson',
      purchaseDate: new Date('2024-05-15'),
      purchasePrice: 2800.00,
      currentValue: 2380.00,
      depreciationRate: 15.0,
      status: 'IN_REPAIR',
      condition: 'FAIR',
    },
  ];

  const createdAssets: { id: string; assetCode: string }[] = [];
  for (const def of assetDefs) {
    const existing = await prisma.asset.findFirst({
      where: { tenantId, assetCode: def.assetCode },
    });
    if (existing) {
      createdAssets.push({ id: existing.id, assetCode: existing.assetCode });
      continue;
    }
    const asset = await prisma.asset.create({
      data: {
        tenantId,
        assetCode: def.assetCode,
        assetName: def.assetName,
        description: def.description,
        category: def.category,
        assetType: def.assetType,
        serialNumber: def.serialNumber,
        modelNumber: def.modelNumber,
        manufacturer: def.manufacturer,
        brand: def.brand,
        purchaseDate: def.purchaseDate,
        purchasePrice: def.purchasePrice,
        currentValue: def.currentValue,
        depreciationRate: def.depreciationRate,
        status: def.status,
        condition: def.condition,
        locationId: locations.length > 0 ? pick(locations, assetDefs.indexOf(def)).id : undefined,
      },
    });
    createdAssets.push({ id: asset.id, assetCode: asset.assetCode });
  }

  // ============================================================================
  // 3. ASSET ASSIGNMENTS (5 records)
  // ============================================================================
  console.log('    - Creating asset assignments...');

  const assignmentDefs = [
    { assetIdx: 0, empIdx: 0, status: 'ACTIVE', conditionAtAssignment: 'EXCELLENT', notes: 'Primary work laptop for engineering lead' },
    { assetIdx: 1, empIdx: 1, status: 'ACTIVE', conditionAtAssignment: 'GOOD', notes: 'Finance department standard desktop' },
    { assetIdx: 3, empIdx: 2, status: 'ACTIVE', conditionAtAssignment: 'EXCELLENT', notes: 'Ergonomic chair - approved by facilities' },
    { assetIdx: 6, empIdx: 3, status: 'ACTIVE', conditionAtAssignment: 'EXCELLENT', notes: 'On-call mobile device for DevOps rotation' },
    { assetIdx: 4, empIdx: 4, status: 'RETURNED', conditionAtAssignment: 'GOOD', conditionAtReturn: 'GOOD', notes: 'Returned upon team relocation' },
  ];

  for (const def of assignmentDefs) {
    if (createdAssets.length <= def.assetIdx || employees.length <= def.empIdx) continue;

    const existing = await prisma.assetAssignment.findFirst({
      where: {
        tenantId,
        assetId: createdAssets[def.assetIdx].id,
        employeeId: pick(employees, def.empIdx).id,
        status: def.status,
      },
    });
    if (!existing) {
      await prisma.assetAssignment.create({
        data: {
          tenantId,
          assetId: createdAssets[def.assetIdx].id,
          employeeId: pick(employees, def.empIdx).id,
          assignedDate: new Date('2024-03-01'),
          returnedDate: def.status === 'RETURNED' ? new Date('2025-01-15') : undefined,
          expectedReturnDate: def.status === 'ACTIVE' ? new Date('2026-03-01') : undefined,
          conditionAtAssignment: def.conditionAtAssignment,
          conditionAtReturn: def.conditionAtReturn ?? undefined,
          assignedBy: pick(employees, 0).id,
          assignmentNotes: def.notes,
          returnNotes: def.status === 'RETURNED' ? 'Asset returned in good condition' : undefined,
          status: def.status,
        },
      });
    }
  }

  // ============================================================================
  // 4. ASSET MAINTENANCE (3 records)
  // ============================================================================
  console.log('    - Creating asset maintenance records...');

  const maintenanceDefs = [
    {
      assetIdx: 7,
      maintenanceType: 'CORRECTIVE',
      description: 'Paper jam mechanism repair and roller replacement',
      scheduledDate: new Date('2025-03-10'),
      completedDate: undefined as Date | undefined,
      serviceProvider: 'Epson Authorized Service Center',
      cost: 450.00,
      status: 'IN_PROGRESS',
      performedBy: 'Epson Service Technician',
    },
    {
      assetIdx: 5,
      maintenanceType: 'PREVENTIVE',
      description: 'Annual vehicle service - oil change, brake inspection, tire rotation',
      scheduledDate: new Date('2025-01-15'),
      completedDate: new Date('2025-01-15'),
      serviceProvider: 'Al Futtaim Toyota Service',
      cost: 1200.00,
      status: 'COMPLETED',
      performedBy: 'Authorized Toyota Technician',
    },
    {
      assetIdx: 0,
      maintenanceType: 'INSPECTION',
      description: 'Battery health check and thermal paste replacement',
      scheduledDate: new Date('2025-06-01'),
      completedDate: undefined as Date | undefined,
      serviceProvider: 'Apple Authorized Service Provider',
      cost: undefined as number | undefined,
      status: 'SCHEDULED',
      performedBy: undefined as string | undefined,
    },
  ];

  for (const def of maintenanceDefs) {
    if (createdAssets.length <= def.assetIdx) continue;

    const existing = await prisma.assetMaintenance.findFirst({
      where: {
        tenantId,
        assetId: createdAssets[def.assetIdx].id,
        maintenanceType: def.maintenanceType,
        scheduledDate: def.scheduledDate,
      },
    });
    if (!existing) {
      await prisma.assetMaintenance.create({
        data: {
          tenantId,
          assetId: createdAssets[def.assetIdx].id,
          maintenanceType: def.maintenanceType,
          description: def.description,
          scheduledDate: def.scheduledDate,
          completedDate: def.completedDate,
          serviceProvider: def.serviceProvider,
          cost: def.cost,
          status: def.status,
          performedBy: def.performedBy,
        },
      });
    }
  }

  // ============================================================================
  // 5. EMPLOYEE DOCUMENTS (6 records)
  // ============================================================================
  console.log('    - Creating employee documents...');

  const documentDefs = [
    {
      docTypeCode: 'PASSPORT',
      documentName: 'Passport',
      documentNumber: 'Z1234567',
      category: 'IDENTITY',
      fileName: 'passport_scan.pdf',
      fileSize: 524288,
      fileType: 'application/pdf',
      fileUrl: '/documents/emp-001/passport_scan.pdf',
      issueDate: new Date('2022-05-10'),
      expiryDate: new Date('2032-05-09'),
      isVerified: true,
      isConfidential: true,
      empIdx: 0,
    },
    {
      docTypeCode: 'EMIRATES_ID',
      documentName: 'Emirates ID',
      documentNumber: '784-1990-1234567-1',
      category: 'IDENTITY',
      fileName: 'emirates_id_front_back.pdf',
      fileSize: 312456,
      fileType: 'application/pdf',
      fileUrl: '/documents/emp-001/emirates_id.pdf',
      issueDate: new Date('2023-01-15'),
      expiryDate: new Date('2026-01-14'),
      isVerified: true,
      isConfidential: true,
      empIdx: 0,
    },
    {
      docTypeCode: 'VISA',
      documentName: 'Employment Visa',
      documentNumber: 'VISA-UAE-2023-98765',
      category: 'IMMIGRATION',
      fileName: 'employment_visa.pdf',
      fileSize: 245760,
      fileType: 'application/pdf',
      fileUrl: '/documents/emp-002/employment_visa.pdf',
      issueDate: new Date('2023-06-01'),
      expiryDate: new Date('2025-05-31'),
      isVerified: true,
      isConfidential: false,
      empIdx: 1,
    },
    {
      docTypeCode: 'OFFER_LETTER',
      documentName: 'Offer Letter',
      documentNumber: 'OL-2024-00345',
      category: 'EMPLOYMENT',
      fileName: 'offer_letter_signed.pdf',
      fileSize: 189432,
      fileType: 'application/pdf',
      fileUrl: '/documents/emp-002/offer_letter.pdf',
      issueDate: new Date('2024-01-05'),
      expiryDate: undefined as Date | undefined,
      isVerified: true,
      isConfidential: false,
      empIdx: 1,
    },
    {
      docTypeCode: 'EMPLOYMENT_CONTRACT',
      documentName: 'Employment Contract',
      documentNumber: 'EC-2024-00345',
      category: 'EMPLOYMENT',
      fileName: 'employment_contract_signed.pdf',
      fileSize: 456789,
      fileType: 'application/pdf',
      fileUrl: '/documents/emp-003/employment_contract.pdf',
      issueDate: new Date('2024-02-01'),
      expiryDate: undefined as Date | undefined,
      isVerified: true,
      isConfidential: true,
      empIdx: 2,
    },
    {
      docTypeCode: 'SALARY_CERTIFICATE',
      documentName: 'Salary Certificate',
      documentNumber: 'SC-2025-00112',
      category: 'FINANCIAL',
      fileName: 'salary_certificate_2025.pdf',
      fileSize: 98304,
      fileType: 'application/pdf',
      fileUrl: '/documents/emp-003/salary_certificate.pdf',
      issueDate: new Date('2025-02-01'),
      expiryDate: new Date('2025-08-01'),
      isVerified: false,
      isConfidential: true,
      empIdx: 2,
    },
  ];

  for (const def of documentDefs) {
    if (employees.length <= def.empIdx) continue;

    // Look up DocumentType by code; fall back to first available
    let docType = await prisma.documentType.findFirst({ where: { code: def.docTypeCode } });
    if (!docType) {
      docType = await prisma.documentType.findFirst();
    }
    if (!docType) {
      console.warn(`    Skipping document "${def.documentName}" - no DocumentType found.`);
      continue;
    }

    const existing = await prisma.employeeDocument.findFirst({
      where: {
        tenantId,
        employeeId: pick(employees, def.empIdx).id,
        documentName: def.documentName,
        documentTypeId: docType.id,
      },
    });
    if (!existing) {
      await prisma.employeeDocument.create({
        data: {
          tenantId,
          employeeId: pick(employees, def.empIdx).id,
          documentTypeId: docType.id,
          documentName: def.documentName,
          documentNumber: def.documentNumber,
          category: def.category,
          fileName: def.fileName,
          fileSize: def.fileSize,
          fileType: def.fileType,
          fileUrl: def.fileUrl,
          issueDate: def.issueDate,
          expiryDate: def.expiryDate,
          isVerified: def.isVerified,
          verifiedBy: def.isVerified ? pick(employees, 0).id : undefined,
          verifiedAt: def.isVerified ? new Date() : undefined,
          isConfidential: def.isConfidential,
          accessLevel: def.isConfidential ? 'HR_ONLY' : 'EMPLOYEE',
          uploadedBy: pick(employees, def.empIdx).id,
          status: 'ACTIVE',
        },
      });
    }
  }

  // ============================================================================
  // 6. GEOFENCE LOCATIONS (3 records)
  // ============================================================================
  console.log('    - Creating geofence locations...');

  const geofenceDefs = [
    { name: 'Dubai HQ', latitude: 25.2048, longitude: 55.2708, radius: 200, address: 'Business Bay, Dubai, UAE' },
    { name: 'Abu Dhabi Office', latitude: 24.4539, longitude: 54.3773, radius: 150, address: 'Al Maryah Island, Abu Dhabi, UAE' },
    { name: 'Bangalore Office', latitude: 12.9716, longitude: 77.5946, radius: 250, address: 'Koramangala, Bangalore, India' },
  ];

  for (const def of geofenceDefs) {
    const existing = await prisma.geofenceLocation.findFirst({
      where: { tenantId, name: def.name },
    });
    if (!existing) {
      await prisma.geofenceLocation.create({
        data: {
          tenantId,
          name: def.name,
          latitude: def.latitude,
          longitude: def.longitude,
          radius: def.radius,
          address: def.address,
          isActive: true,
        },
      });
    }
  }

  // ============================================================================
  // 7. EXPENSE CLAIMS (4 records)
  // ============================================================================
  console.log('    - Creating expense claims...');

  const expenseDefs = [
    {
      empIdx: 0,
      title: 'Team lunch - Q1 planning offsite',
      amount: 680.00,
      currency: 'AED',
      category: 'MEALS',
      date: new Date('2025-01-18'),
      receiptUrl: '/receipts/exp-001-lunch.jpg',
      description: 'Team lunch at The Maine Oyster Bar for 8 team members during Q1 planning.',
      status: 'APPROVED',
      approvedByIdx: 1,
    },
    {
      empIdx: 1,
      title: 'Airport transfer - client meeting',
      amount: 350.00,
      currency: 'AED',
      category: 'TRANSPORT',
      date: new Date('2025-02-05'),
      receiptUrl: '/receipts/exp-002-taxi.jpg',
      description: 'Round-trip car service DXB airport to client office in Jebel Ali.',
      status: 'PAID',
      approvedByIdx: 0,
    },
    {
      empIdx: 2,
      title: 'AWS Solutions Architect certification exam',
      amount: 1500.00,
      currency: 'AED',
      category: 'TRAINING',
      date: new Date('2025-02-20'),
      receiptUrl: '/receipts/exp-003-cert.pdf',
      description: 'AWS SAP-C02 certification exam fee and practice test bundle.',
      status: 'REJECTED',
      rejectionReason: 'Certification budget exceeded for Q1. Please resubmit in Q2.',
    },
    {
      empIdx: 3,
      title: 'Office supplies - stationery restock',
      amount: 220.00,
      currency: 'AED',
      category: 'SUPPLIES',
      date: new Date('2025-03-01'),
      receiptUrl: '/receipts/exp-004-supplies.jpg',
      description: 'Notebooks, pens, sticky notes, and whiteboard markers for team area.',
      status: 'PENDING',
    },
  ];

  for (const def of expenseDefs) {
    if (employees.length <= def.empIdx) continue;

    const existing = await prisma.expenseClaim.findFirst({
      where: {
        tenantId,
        employeeId: pick(employees, def.empIdx).id,
        title: def.title,
      },
    });
    if (!existing) {
      await prisma.expenseClaim.create({
        data: {
          tenantId,
          employeeId: pick(employees, def.empIdx).id,
          title: def.title,
          amount: def.amount,
          currency: def.currency,
          category: def.category,
          date: def.date,
          receiptUrl: def.receiptUrl,
          description: def.description,
          status: def.status,
          approvedBy: def.approvedByIdx !== undefined && employees.length > def.approvedByIdx
            ? pick(employees, def.approvedByIdx).id
            : undefined,
          approvedAt: def.status === 'APPROVED' || def.status === 'PAID' ? new Date('2025-02-10') : undefined,
          paidAt: def.status === 'PAID' ? new Date('2025-02-28') : undefined,
          rejectionReason: def.rejectionReason,
        },
      });
    }
  }

  // ============================================================================
  // 8. RECOGNITION (5 records)
  // ============================================================================
  console.log('    - Creating recognition records...');

  const recognitionDefs = [
    {
      giverIdx: 0,
      receiverIdx: 1,
      message: 'Outstanding work on the payroll migration project. Your attention to detail caught several edge cases that would have impacted hundreds of employees.',
      coreValue: 'INNOVATION',
      badgeType: 'INNOVATOR',
      points: 50,
      visibility: 'PUBLIC',
      reactions: { thumbsUp: 12, heart: 5, clap: 8 },
    },
    {
      giverIdx: 1,
      receiverIdx: 2,
      message: 'Thank you for stepping up during the system outage and coordinating the incident response across three time zones.',
      coreValue: 'TEAMWORK',
      badgeType: 'TEAM_PLAYER',
      points: 40,
      visibility: 'PUBLIC',
      reactions: { thumbsUp: 8, heart: 3, fire: 4 },
    },
    {
      giverIdx: 2,
      receiverIdx: 3,
      message: 'Your client presentation for the Q4 review was incredibly well-prepared. The client specifically mentioned how helpful it was.',
      coreValue: 'CUSTOMER_FIRST',
      badgeType: undefined as string | undefined,
      points: 30,
      visibility: 'PUBLIC',
      reactions: { thumbsUp: 6, star: 2 },
    },
    {
      giverIdx: 3,
      receiverIdx: 0,
      message: 'Great job mentoring the new joiners this quarter. Your patience and clear explanations made their onboarding experience seamless.',
      coreValue: 'TEAMWORK',
      badgeType: 'TEAM_PLAYER',
      points: 35,
      visibility: 'PUBLIC',
      reactions: { thumbsUp: 10, heart: 7 },
    },
    {
      giverIdx: 4,
      receiverIdx: 1,
      message: 'The automated testing pipeline you built has already saved us 15 hours per sprint. True engineering excellence!',
      coreValue: 'INNOVATION',
      badgeType: 'INNOVATOR',
      points: 45,
      visibility: 'PUBLIC',
      reactions: { thumbsUp: 14, fire: 6, rocket: 3 },
    },
  ];

  for (const def of recognitionDefs) {
    if (employees.length <= Math.max(def.giverIdx, def.receiverIdx)) continue;

    const existing = await prisma.recognition.findFirst({
      where: {
        tenantId,
        giverId: pick(employees, def.giverIdx).id,
        receiverId: pick(employees, def.receiverIdx).id,
        coreValue: def.coreValue,
      },
    });
    if (!existing) {
      await prisma.recognition.create({
        data: {
          tenantId,
          giverId: pick(employees, def.giverIdx).id,
          receiverId: pick(employees, def.receiverIdx).id,
          message: def.message,
          coreValue: def.coreValue,
          badgeType: def.badgeType,
          points: def.points,
          visibility: def.visibility,
          reactions: def.reactions,
        },
      });
    }
  }

  // ============================================================================
  // 9. ONE-ON-ONE NOTES (4 records)
  // ============================================================================
  console.log('    - Creating one-on-one notes...');

  const meetings = await prisma.oneOnOneMeeting.findMany({ where: { tenantId }, take: 4 });

  if (meetings.length > 0) {
    const noteDefs = [
      {
        meetingIdx: 0,
        authorIdx: 0,
        content: 'Discussed Q1 goals and career development path. Employee expressed interest in moving to a tech lead role within 12 months. Agreed on a development plan focused on system design and team leadership.',
        isPrivate: false,
      },
      {
        meetingIdx: 0,
        authorIdx: 0,
        content: 'Private note: Need to check with HR about promotion timeline and budget availability for next cycle.',
        isPrivate: true,
      },
      {
        meetingIdx: Math.min(1, meetings.length - 1),
        authorIdx: 1,
        content: 'Reviewed sprint performance metrics. Team velocity is up 15% from last quarter. Discussed potential bottleneck in code review turnaround time - agreed to implement pair programming for critical PRs.',
        isPrivate: false,
      },
      {
        meetingIdx: Math.min(2, meetings.length - 1),
        authorIdx: 2,
        content: 'Follow-up on work-life balance concerns. Employee requested flexible hours on Tuesdays and Thursdays for childcare. Approved provisional arrangement for 3 months, to be reviewed.',
        isPrivate: false,
      },
    ];

    for (const def of noteDefs) {
      if (employees.length <= def.authorIdx) continue;

      const meeting = meetings[def.meetingIdx];
      const existing = await prisma.oneOnOneNote.findFirst({
        where: {
          meetingId: meeting.id,
          authorId: pick(employees, def.authorIdx).id,
          isPrivate: def.isPrivate,
        },
      });
      if (!existing) {
        await prisma.oneOnOneNote.create({
          data: {
            meetingId: meeting.id,
            authorId: pick(employees, def.authorIdx).id,
            content: def.content,
            isPrivate: def.isPrivate,
          },
        });
      }
    }

    // ============================================================================
    // 10. ONE-ON-ONE ACTION ITEMS (4 records)
    // ============================================================================
    console.log('    - Creating one-on-one action items...');

    const actionItemDefs = [
      {
        meetingIdx: 0,
        assigneeIdx: 0,
        title: 'Complete system design course on Udemy',
        status: 'IN_PROGRESS',
        dueDate: new Date('2025-04-30'),
      },
      {
        meetingIdx: 0,
        assigneeIdx: 1,
        title: 'Schedule skip-level meeting with VP Engineering',
        status: 'DONE',
        dueDate: new Date('2025-03-15'),
        completedAt: new Date('2025-03-12'),
      },
      {
        meetingIdx: Math.min(1, meetings.length - 1),
        assigneeIdx: 2,
        title: 'Draft pair programming guidelines for the team',
        status: 'PENDING',
        dueDate: new Date('2025-04-01'),
      },
      {
        meetingIdx: Math.min(2, meetings.length - 1),
        assigneeIdx: 3,
        title: 'Submit flexible hours request through HR portal',
        status: 'DONE',
        dueDate: new Date('2025-03-20'),
        completedAt: new Date('2025-03-18'),
      },
    ];

    for (const def of actionItemDefs) {
      if (employees.length <= def.assigneeIdx) continue;

      const meeting = meetings[def.meetingIdx];
      const existing = await prisma.oneOnOneActionItem.findFirst({
        where: {
          meetingId: meeting.id,
          assigneeId: pick(employees, def.assigneeIdx).id,
          title: def.title,
        },
      });
      if (!existing) {
        await prisma.oneOnOneActionItem.create({
          data: {
            meetingId: meeting.id,
            assigneeId: pick(employees, def.assigneeIdx).id,
            title: def.title,
            status: def.status,
            dueDate: def.dueDate,
            completedAt: def.completedAt,
          },
        });
      }
    }
  } else {
    console.warn('    No OneOnOneMeeting records found. Skipping notes & action items.');
  }

  // ============================================================================
  // 11. TRAINING SESSIONS (3 records)
  // ============================================================================
  console.log('    - Creating training sessions...');

  const sessionDefs = [
    {
      title: 'Advanced TypeScript Patterns - Classroom Workshop',
      description: 'Deep dive into advanced TypeScript patterns including conditional types, template literal types, and mapped type utilities.',
      type: 'classroom',
      instructor: 'Dr. Sarah Mitchell',
      location: 'Dubai HQ - Training Room A',
      startDate: new Date('2025-04-10T09:00:00Z'),
      endDate: new Date('2025-04-10T17:00:00Z'),
      maxCapacity: 20,
      status: 'scheduled',
    },
    {
      title: 'Cloud Security Fundamentals - Virtual Training',
      description: 'Comprehensive overview of cloud security best practices, IAM, network security, and compliance frameworks.',
      type: 'virtual',
      instructor: 'Alex Chen, CISSP',
      meetingUrl: 'https://meet.kreupai.com/cloud-security-training',
      startDate: new Date('2025-04-15T10:00:00Z'),
      endDate: new Date('2025-04-15T13:00:00Z'),
      maxCapacity: 50,
      status: 'scheduled',
    },
    {
      title: 'Leadership Essentials - Interactive Workshop',
      description: 'Interactive workshop covering situational leadership, effective delegation, and building high-performing teams.',
      type: 'workshop',
      instructor: 'Maria Rodriguez, PCC',
      location: 'Abu Dhabi Office - Conference Hall',
      startDate: new Date('2025-03-20T09:00:00Z'),
      endDate: new Date('2025-03-21T16:00:00Z'),
      maxCapacity: 15,
      status: 'completed',
    },
  ];

  const createdSessions: string[] = [];
  for (const def of sessionDefs) {
    const existing = await prisma.trainingSession.findFirst({
      where: { tenantId, title: def.title },
    });
    if (existing) {
      createdSessions.push(existing.id);
      continue;
    }
    const session = await prisma.trainingSession.create({
      data: {
        tenantId,
        title: def.title,
        description: def.description,
        type: def.type,
        instructor: def.instructor,
        location: def.location,
        meetingUrl: def.meetingUrl,
        startDate: def.startDate,
        endDate: def.endDate,
        maxCapacity: def.maxCapacity,
        status: def.status,
        createdBy: pick(employees, 0).id,
      },
    });
    createdSessions.push(session.id);
  }

  // ============================================================================
  // 12. SESSION ATTENDEES (6 records)
  // ============================================================================
  console.log('    - Creating session attendees...');

  if (createdSessions.length > 0) {
    const attendeeDefs = [
      { sessionIdx: 0, empIdx: 0, status: 'registered' },
      { sessionIdx: 0, empIdx: 1, status: 'registered' },
      { sessionIdx: 1, empIdx: 2, status: 'registered' },
      { sessionIdx: 1, empIdx: 3, status: 'registered' },
      { sessionIdx: 2, empIdx: 4, status: 'attended', rating: 5, feedback: 'Excellent workshop! Very practical leadership frameworks.' },
      { sessionIdx: 2, empIdx: 0, status: 'attended', rating: 4, feedback: 'Good content. Would have appreciated more role-play exercises.' },
    ];

    for (const def of attendeeDefs) {
      if (createdSessions.length <= def.sessionIdx || employees.length <= def.empIdx) continue;

      const existing = await prisma.sessionAttendee.findFirst({
        where: {
          sessionId: createdSessions[def.sessionIdx],
          employeeId: pick(employees, def.empIdx).id,
        },
      });
      if (!existing) {
        await prisma.sessionAttendee.create({
          data: {
            sessionId: createdSessions[def.sessionIdx],
            employeeId: pick(employees, def.empIdx).id,
            status: def.status,
            checkedInAt: def.status === 'attended' ? new Date('2025-03-20T09:05:00Z') : undefined,
            feedback: def.feedback,
            rating: def.rating,
          },
        });
      }
    }
  }

  // ============================================================================
  // 13. LEARNING PROGRESS (5 records)
  // ============================================================================
  console.log('    - Creating learning progress records...');

  const progressDefs = [
    { empIdx: 0, contentId: 'vid-ts-advanced-001', contentType: 'VIDEO', progress: 85.0, lastPosition: 2340.5, timeSpent: 7200 },
    { empIdx: 1, contentId: 'art-cloud-sec-101', contentType: 'ARTICLE', progress: 100.0, lastPosition: undefined as number | undefined, timeSpent: 1800, completedAt: new Date('2025-03-01') },
    { empIdx: 2, contentId: 'quiz-ts-patterns-01', contentType: 'QUIZ', progress: 100.0, lastPosition: undefined as number | undefined, timeSpent: 900, completedAt: new Date('2025-02-28') },
    { empIdx: 3, contentId: 'vid-leadership-mod1', contentType: 'VIDEO', progress: 45.0, lastPosition: 1200.0, timeSpent: 3600 },
    { empIdx: 4, contentId: 'art-agile-manifesto', contentType: 'ARTICLE', progress: 60.0, lastPosition: 15.0, timeSpent: 1200 },
  ];

  for (const def of progressDefs) {
    if (employees.length <= def.empIdx) continue;

    const existing = await prisma.learningProgress.findFirst({
      where: {
        employeeId: pick(employees, def.empIdx).id,
        contentId: def.contentId,
      },
    });
    if (!existing) {
      await prisma.learningProgress.create({
        data: {
          tenantId,
          employeeId: pick(employees, def.empIdx).id,
          contentId: def.contentId,
          contentType: def.contentType,
          progress: def.progress,
          lastPosition: def.lastPosition,
          timeSpent: def.timeSpent,
          completedAt: def.completedAt,
        },
      });
    }
  }

  // ============================================================================
  // 14. INTER-COMPANY TRANSFERS (2 records)
  // ============================================================================
  console.log('    - Creating inter-company transfers...');

  if (companies.length >= 2) {
    const transferDefs = [
      {
        empIdx: 3,
        fromCompanyIdx: 0,
        toCompanyIdx: 1,
        transferType: 'PERMANENT',
        effectiveDate: new Date('2025-06-01'),
        status: 'APPROVED',
        requestedByIdx: 0,
        approvedByIdx: 1,
      },
      {
        empIdx: 5,
        fromCompanyIdx: 0,
        toCompanyIdx: companies.length > 2 ? 2 : 1,
        transferType: 'SECONDMENT',
        effectiveDate: new Date('2025-04-15'),
        status: 'PENDING',
        requestedByIdx: 2,
      },
    ];

    for (const def of transferDefs) {
      if (employees.length <= def.empIdx) continue;

      const existing = await prisma.interCompanyTransfer.findFirst({
        where: {
          tenantId,
          employeeId: pick(employees, def.empIdx).id,
          transferType: def.transferType,
        },
      });
      if (!existing) {
        await prisma.interCompanyTransfer.create({
          data: {
            tenantId,
            employeeId: pick(employees, def.empIdx).id,
            fromCompanyId: companies[def.fromCompanyIdx].id,
            toCompanyId: companies[def.toCompanyIdx].id,
            transferType: def.transferType,
            effectiveDate: def.effectiveDate,
            status: def.status,
            requestedBy: pick(employees, def.requestedByIdx).id,
            approvedBy: def.approvedByIdx !== undefined && employees.length > def.approvedByIdx
              ? pick(employees, def.approvedByIdx).id
              : undefined,
            approvedAt: def.status === 'APPROVED' ? new Date('2025-03-10') : undefined,
          },
        });
      }
    }
  } else {
    console.warn('    Fewer than 2 companies found. Skipping inter-company transfers.');
  }

  // ============================================================================
  // 15. SHARED SERVICE REQUESTS (3 records)
  // ============================================================================
  console.log('    - Creating shared service requests...');

  const serviceRequestDefs = [
    {
      requestorIdx: 0,
      category: 'HR_LETTER',
      subject: 'Salary Certificate for Bank Loan',
      details: 'Need an official salary certificate addressed to Emirates NBD for personal loan application. Must include base salary, allowances, and total package.',
      priority: 'HIGH',
      status: 'COMPLETED',
      assignedToIdx: 1,
    },
    {
      requestorIdx: 2,
      category: 'IT_ACCESS',
      subject: 'VPN Access for Remote Work',
      details: 'Requesting VPN credentials and configuration for secure remote access to internal development servers during WFH arrangement.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedToIdx: 3,
    },
    {
      requestorIdx: 4,
      category: 'EQUIPMENT',
      subject: 'Dual Monitor Setup Request',
      details: 'Requesting a second 27-inch monitor for productivity improvement. Currently working with a single laptop screen.',
      priority: 'LOW',
      status: 'OPEN',
    },
  ];

  for (const def of serviceRequestDefs) {
    if (employees.length <= def.requestorIdx) continue;

    const existing = await prisma.sharedServiceRequest.findFirst({
      where: {
        tenantId,
        requestorId: pick(employees, def.requestorIdx).id,
        subject: def.subject,
      },
    });
    if (!existing) {
      await prisma.sharedServiceRequest.create({
        data: {
          tenantId,
          requestorId: pick(employees, def.requestorIdx).id,
          category: def.category,
          subject: def.subject,
          details: def.details,
          priority: def.priority,
          status: def.status,
          assignedToId: def.assignedToIdx !== undefined && employees.length > def.assignedToIdx
            ? pick(employees, def.assignedToIdx).id
            : undefined,
        },
      });
    }
  }

  // ============================================================================
  // 16. PROJECT TIME ENTRIES (5 records)
  // ============================================================================
  console.log('    - Creating project time entries...');

  const timeEntryDefs = [
    { empIdx: 0, projectId: 'proj-aura-hcm', taskId: 'task-api-dev', date: new Date('2025-03-17'), hours: 7.5, notes: 'API route implementation for payroll module', billable: true, status: 'APPROVED' },
    { empIdx: 0, projectId: 'proj-aura-hcm', taskId: 'task-code-review', date: new Date('2025-03-18'), hours: 6.0, notes: 'Code review and PR approvals for attendance module', billable: true, status: 'APPROVED' },
    { empIdx: 1, projectId: 'proj-client-portal', taskId: 'task-ui-design', date: new Date('2025-03-17'), hours: 8.0, notes: 'Client portal dashboard wireframes and component library', billable: true, status: 'SUBMITTED' },
    { empIdx: 2, projectId: 'proj-aura-hcm', taskId: 'task-testing', date: new Date('2025-03-17'), hours: 5.5, notes: 'Integration testing for leave management workflows', billable: true, status: 'DRAFT' },
    { empIdx: 3, projectId: 'proj-infra', taskId: 'task-devops', date: new Date('2025-03-17'), hours: 4.0, notes: 'CI/CD pipeline optimization and Docker image caching', billable: false, status: 'SUBMITTED' },
  ];

  for (const def of timeEntryDefs) {
    if (employees.length <= def.empIdx) continue;

    const existing = await prisma.projectTimeEntry.findFirst({
      where: {
        employeeId: pick(employees, def.empIdx).id,
        projectId: def.projectId,
        date: def.date,
      },
    });
    if (!existing) {
      await prisma.projectTimeEntry.create({
        data: {
          tenantId,
          employeeId: pick(employees, def.empIdx).id,
          projectId: def.projectId,
          taskId: def.taskId,
          date: def.date,
          hours: def.hours,
          notes: def.notes,
          billable: def.billable,
          status: def.status,
          approvedBy: def.status === 'APPROVED' ? pick(employees, 1).id : undefined,
        },
      });
    }
  }

  console.log('  Asset, Document & Miscellaneous data seeded successfully');
}

// Run if executed directly
if (require.main === module) {
  const _prisma = new PrismaClient();
  const tenantId = process.argv[2] || 'default-tenant';
  seedAssetDocumentMisc(_prisma, tenantId)
    .catch((e) => {
      console.error('Error seeding asset-document-misc:', e);
      process.exit(1);
    })
    .finally(async () => {
      await _prisma.$disconnect();
    });
}

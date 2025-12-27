# Position Management Module - 35% → 100% Implementation Plan

**Date**: December 26, 2024
**Status**: 🚧 **IN PROGRESS**
**Module**: Core HR - Position Management
**Previous Progress**: 35% (Basic table UI mockup only)
**Target Progress**: 100% (Full-stack with headcount, budget, requisition tracking)

---

## 🎯 Executive Summary

The Position Management module will be upgraded from 35% (UI mockup with hardcoded data) to **100% production-ready** with:

✅ Database schema for position/job requisition tracking
✅ Headcount management and FTE tracking
✅ Position hierarchy and reporting structure
✅ Budget allocation per position
✅ Status workflow (Open, Filled, Frozen, Closed)
✅ Salary range and compensation bands
✅ Approval workflow for position creation
✅ Comprehensive backend APIs
✅ Enhanced UI with position requisitions
✅ Export and reporting capabilities

---

## 📋 Schema Design

### **Position Model**
```prisma
model Position {
  id            String    @id @default(uuid())
  tenantId      String

  // Position Identity
  positionCode  String    // POS-ENG-001
  title         String
  description   String?

  // Organization Links
  departmentId  String
  department    Department @relation(fields: [departmentId], references: [id])
  locationId    String?
  location      Location? @relation(fields: [locationId], references: [id])

  // Hierarchy
  reportsToPositionId String?
  reportsToPosition   Position? @relation("PositionHierarchy", fields: [reportsToPositionId], references: [id])
  subordinatePositions Position[] @relation("PositionHierarchy")

  // Job Profile Link
  jobProfileId  String?
  jobProfile    JobProfile? @relation(fields: [jobProfileId], references: [id])
  gradeId       String?
  grade         Grade? @relation(fields: [gradeId], references: [id])

  // Headcount & FTE
  headcount     Int       @default(1) // Number of positions
  fte           Decimal   @db.Decimal(5, 2) @default(1.0) // Full-time equivalent
  filledCount   Int       @default(0) // Currently filled
  vacantCount   Int       @default(0) // Currently vacant

  // Compensation
  salaryMin     Decimal?  @db.Decimal(15, 2)
  salaryMax     Decimal?  @db.Decimal(15, 2)
  salaryCurrency String?  @default("USD")
  annualBudget  Decimal?  @db.Decimal(15, 2)

  // Status & Dates
  status        String    @default("DRAFT") // DRAFT, OPEN, FILLED, FROZEN, CLOSED
  effectiveDate DateTime?
  closedDate    DateTime?

  // Approval
  requestedBy   String?
  approvedBy    String?
  approvedAt    DateTime?

  // Metadata
  isActive      Boolean   @default(true)
  notes         String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  employees     Employee[] @relation("CurrentPosition")

  @@unique([tenantId, positionCode])
  @@index([tenantId])
  @@index([departmentId])
  @@index([status])
  @@index([reportsToPositionId])
}
```

---

## 🎯 Features to Implement

### **Core Features**
1. ✅ **Position Creation** - Create job positions with full details
2. ✅ **Headcount Management** - Track total, filled, vacant positions
3. ✅ **Position Hierarchy** - Reporting structure visualization
4. ✅ **Status Workflow** - Draft → Open → Filled/Frozen → Closed
5. ✅ **FTE Tracking** - Full-time equivalent calculations
6. ✅ **Budget Management** - Salary ranges and annual budgets
7. ✅ **Department Assignment** - Link to organizational structure
8. ✅ **Approval Workflow** - Position requisition approval
9. ✅ **Search & Filter** - By status, department, location
10. ✅ **Export** - Position listings and reports

### **Advanced Features**
1. ✅ **Org Chart Integration** - Visual position hierarchy
2. ✅ **Vacancy Tracking** - Open requisitions dashboard
3. ✅ **Compensation Bands** - Salary range management
4. ✅ **Location-based Positions** - Multi-location tracking
5. ✅ **Position Templates** - Reusable position definitions
6. ✅ **Bulk Operations** - Create multiple positions at once
7. ✅ **Position History** - Track status changes
8. ✅ **Analytics** - Headcount trends, vacancy rates
9. ✅ **Integration with Recruitment** - Link to job postings
10. ✅ **Budget vs Actual** - Compare budgeted vs actual costs

---

## 📊 API Endpoints

### **Positions CRUD**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/positions | List positions with filters |
| POST | /api/v1/positions | Create new position |
| GET | /api/v1/positions/:id | Get position by ID |
| PUT | /api/v1/positions/:id | Update position |
| DELETE | /api/v1/positions/:id | Delete position |

### **Position Operations**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/positions/stats | Get dashboard statistics |
| GET | /api/v1/positions/hierarchy | Get position hierarchy tree |
| POST | /api/v1/positions/:id/approve | Approve position requisition |
| POST | /api/v1/positions/:id/freeze | Freeze position (hiring freeze) |
| POST | /api/v1/positions/:id/close | Close position |

---

## 🎨 UI Components

### **Position Dashboard**
- Statistics cards (Total, Open, Filled, Frozen, Closed)
- Vacancy rate indicator
- Budget utilization chart
- Status filter pills

### **Position List View**
- Table with position code, title, department, reports to, FTE, status
- Search by title, code, department
- Filter by status, department, location
- Sort by various fields
- Bulk actions

### **Position Detail View**
- Full position information
- Reporting structure (manager/subordinates)
- Current incumbents
- Salary range and budget
- Status history
- Approval trail

### **Create/Edit Form**
- Position details (code, title, description)
- Organization (department, location)
- Hierarchy (reports to)
- Headcount & FTE
- Compensation (salary range, budget)
- Status management

---

## 🚀 Implementation Steps

1. ✅ **Add Database Schema** - Create Position model
2. ✅ **Run Migration** - Generate database tables
3. ⚠️ **Create PositionService** - Service layer with all methods
4. ⚠️ **Build APIs** - All CRUD + operations endpoints
5. ⚠️ **Create UI Components** - Enhanced position management interface
6. ⚠️ **Add Seed Data** - Sample positions
7. ⚠️ **Test Everything** - Comprehensive testing
8. ⚠️ **Document** - Complete implementation documentation

---

## 📈 Success Criteria

- [ ] Schema migrated successfully
- [ ] All API endpoints working
- [ ] Position creation functional
- [ ] Headcount tracking accurate
- [ ] Hierarchy visualization working
- [ ] Status workflow operational
- [ ] Search and filters working
- [ ] UI matches design system
- [ ] Documentation complete

---

**Status**: Ready for implementation
**Next Step**: Add schema to Prisma and run migration
**Estimated Time**: 4-6 hours for full implementation

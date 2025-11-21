# Master Data Management Module

This module provides centralized management of all common master data used across the AURA HCM platform.

## Features (24 Total)

### Geographic Master Data
- **Countries** - Manage country master data with currency, timezone, and regional information
- **States** - Manage state/province data linked to countries
- **Cities** - Manage city data with geolocation support

### Currency & Language
- **Currencies** - Manage currency codes, symbols, and exchange rates
- **Languages** - Manage supported languages with localization settings

### Organization Master Data
- **Departments** - Organizational department structure and hierarchy
- **Designations** - Job designations with levels and reporting structure
- **Grades** - Salary grades and compensation bands
- **Cost Centers** - Budget tracking and allocation
- **Business Units** - Business unit hierarchy and management
- **Locations** - Physical locations with address and working hours

### Employment Master Data
- **Employment Types** - Full-time, part-time, contract, etc.
- **Employment Statuses** - Active, probation, notice period, terminated, etc.
- **Job Families** - Job family categorization and competency mapping

### Document Management
- **Document Types** - Document categories with validation rules and expiry tracking

### Skills & Competencies
- **Skills** - Technical and soft skills with proficiency levels
- **Competencies** - Core and functional competencies with assessment criteria

### Leave & Attendance
- **Leave Types** - Leave categories with accrual and encashment rules
- **Shift Types** - Shift patterns with timing and break configurations
- **Holidays** - National, regional, and optional holidays calendar

### Tax & Payroll
- **Tax Regimes** - Country-specific tax rules, slabs, and deductions
- **Pay Components** - Earnings, deductions, and reimbursement components

### Security & Access
- **Roles & Permissions** - Role-based access control configuration
- **System Settings** - Application-wide configuration settings

## Data Relationships

Master data in this module is referenced across all 43 modules:

- **Core HR** → Departments, Designations, Locations, Employment Types
- **Payroll** → Pay Components, Tax Regimes, Currencies
- **Leave** → Leave Types, Holidays
- **Attendance** → Shift Types, Locations, Holidays
- **Performance** → Competencies, Skills
- **Recruitment** → Designations, Locations, Job Families
- **L&D** → Skills, Competencies
- **Compensation** → Grades, Pay Components, Currencies
- **Benefits** → Document Types
- **Travel** → Locations, Countries, Currencies

## Access Control

This module is accessible to:
- **Super Admin** - Full access to all master data
- **HR Admin** - Limited access to HR-specific master data
- **Department Heads** - Read-only access to relevant master data

## Data Seeding

Initial seed data is available for:
- 13 major countries
- 15 global currencies
- 12 languages
- 8 common leave types
- 7 employment types
- 6 shift types

## API Endpoints

All master data tables expose standard CRUD operations:
- `GET /api/master-data/{entity}` - List all records
- `GET /api/master-data/{entity}/{id}` - Get single record
- `POST /api/master-data/{entity}` - Create new record
- `PUT /api/master-data/{entity}/{id}` - Update record
- `DELETE /api/master-data/{entity}/{id}` - Soft delete record

## Import/Export

Most master data supports:
- CSV import/export
- Excel import/export
- JSON export
- Bulk operations

## Audit Trail

All master data changes are tracked with:
- Created by/Created at
- Updated by/Updated at
- Deleted by/Deleted at (soft delete)

## Validation Rules

Master data enforces:
- Unique codes and names
- Required field validation
- Data type validation
- Referential integrity
- Business rule validation

## Reference

For detailed schemas and types, see:
- `/packages/@aura/types/src/common.types.ts` - TypeScript types
- `/packages/@aura/database/src/schemas/master-data.schema.prisma` - Database schemas
- `/packages/@aura/database/src/seeds/` - Seed data
- `/packages/@aura/config/src/constants.ts` - Constants and enums

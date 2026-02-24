# Payroll Service Implementation Guide

**Document Version**: 1.0
**Last Updated**: January 22, 2026
**Owner**: Platform Engineering Team
**Status**: Implementation Ready
**Estimated Timeline**: 4 weeks
**Impact**: 1% of platform completion (99% → 100%)

---

## Table of Contents

1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Prerequisites](#prerequisites)
4. [Week 1: Core Salary Calculation](#week-1-core-salary-calculation)
5. [Week 2: Statutory Compliance](#week-2-statutory-compliance)
6. [Week 3: Multi-Country Support](#week-3-multi-country-support)
7. [Week 4: Testing & Deployment](#week-4-testing--deployment)
8. [API Specification](#api-specification)
9. [Database Schema](#database-schema)
10. [Calculation Engines](#calculation-engines)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Procedures](#deployment-procedures)

---

## Overview

### Objective
Implement the Payroll Service microservice to handle all payroll processing, salary calculations, statutory compliance, and multi-country payroll management for the AuraOS platform.

### Service Characteristics
- **Technology Stack**: NestJS + TypeScript
- **Communication**: REST API + gRPC
- **Database**: PostgreSQL (primary)
- **Port**: 3005
- **Replicas**: 3 (production)

### Key Features
- Salary calculation with components (basic, allowances, deductions)
- Statutory compliance (GOSI, PF, ESI, PT, Tax)
- Multi-country payroll (7 countries)
- Payslip generation
- Tax calculations (progressive, flat)
- Year-end tax forms (W-2, Form 16)
- Payroll reports and analytics
- Audit logging for all calculations

### Performance Targets
- **Calculation (per employee)**: < 100ms (p95)
- **Bulk Processing**: 1,000 employees/minute
- **Report Generation**: < 5 seconds for 500 employees (p95)
- **Availability**: 99.99% (critical financial service)
- **Error Rate**: < 0.01%
- **Calculation Accuracy**: 100%

---

## Service Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Kong API Gateway                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Payroll Service    │
    │   (NestJS)         │
    │   Port: 3005       │
    └────┬───────┬───────┬────┘
         │       │       │
         ▼       ▼       ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │Salary  │ │Tax     │ │Statutory│
    │Engine  │ │Engine  │ │Engine  │
    └────────┘ └────────┘ └────────┘
         │
         ▼
    ┌────────────────────┐       ┌────────────────────┐
    │   PostgreSQL       │       │   Redis Cache      │
    │ (Payroll Data)     │       │ (Tax Slabs)        │
    └────────────────────┘       └────────────────────┘
```

### Technology Stack

**Backend Framework**: NestJS 10.x
- Modular architecture
- Dependency injection
- Built-in validation
- Transaction support

**Database**: PostgreSQL 15
- ACID compliance (critical for payroll)
- Transaction support
- Decimal precision for currency
- Audit logging

**Cache**: Redis 7.x
- Tax slab caching
- Country configuration caching
- Rate limiting

**Message Queue**: RabbitMQ
- Async payroll processing
- Payslip generation queue
- Report generation queue

---

## Prerequisites

### Development Environment Setup

**1. Install Dependencies**:
```bash
cd services/payroll-service/

pnpm install
```

**2. Set Up PostgreSQL**:
```bash
docker run --name payroll-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=payroll_dev \
  -p 5436:5432 \
  -d postgres:15
```

**3. Set Up Redis**:
```bash
docker run --name payroll-redis \
  -p 6383:6379 \
  -d redis:7-alpine
```

**4. Configure Environment Variables**:
```bash
# services/payroll-service/.env.development

# Database
DATABASE_URL="postgresql://admin:admin123@localhost:5436/payroll_dev"
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6383

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Service
PORT=3005
NODE_ENV=development
LOG_LEVEL=debug

# Employee Service (for employee data)
EMPLOYEE_SERVICE_URL="http://localhost:3002"

# Document Service (for payslip generation)
DOCUMENT_SERVICE_URL="http://localhost:3004"

# Security
JWT_SECRET="your-jwt-secret-dev"

# Default Country
DEFAULT_COUNTRY="IN"  # India
DEFAULT_CURRENCY="INR"
```

**5. Initialize Database**:
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

---

## Week 1: Core Salary Calculation

### Day 1-2: Project Structure & Salary Components

**1. Create Project Structure**:
```
services/payroll-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── rabbitmq.config.ts
│   ├── modules/
│   │   ├── payroll/
│   │   │   ├── dto/
│   │   │   │   ├── create-payroll.dto.ts
│   │   │   │   ├── calculate-salary.dto.ts
│   │   │   │   └── payslip.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── payroll.entity.ts
│   │   │   │   ├── salary-component.entity.ts
│   │   │   │   └── payslip.entity.ts
│   │   │   ├── services/
│   │   │   │   ├── payroll.service.ts
│   │   │   │   ├── salary-engine.service.ts
│   │   │   │   ├── tax-engine.service.ts
│   │   │   │   └── statutory-engine.service.ts
│   │   │   ├── controllers/
│   │   │   │   ├── payroll.controller.ts
│   │   │   │   └── payslip.controller.ts
│   │   │   └── payroll.module.ts
│   │   ├── country/
│   │   │   ├── engines/
│   │   │   │   ├── india.engine.ts
│   │   │   │   ├── uae.engine.ts
│   │   │   │   ├── usa.engine.ts
│   │   │   │   ├── uk.engine.ts
│   │   │   │   ├── saudi.engine.ts
│   │   │   │   ├── singapore.engine.ts
│   │   │   │   └── australia.engine.ts
│   │   │   ├── services/
│   │   │   │   └── country.service.ts
│   │   │   └── country.module.ts
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.module.ts
│   └── common/
│       ├── types/
│       │   ├── salary.types.ts
│       │   └── tax.types.ts
│       └── utils/
│           ├── decimal.utils.ts
│           └── date.utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── tsconfig.json
```

**2. Implement Salary Component Entity**:

**File**: `src/modules/payroll/entities/salary-component.entity.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';

export enum ComponentType {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION',
  BENEFIT = 'BENEFIT',
}

export enum CalculationType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
  FORMULA = 'FORMULA',
}

export class SalaryComponent {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ComponentType })
  type: ComponentType;

  @ApiProperty({ enum: CalculationType })
  calculationType: CalculationType;

  @ApiProperty()
  value: number;

  @ApiProperty({ required: false })
  formula?: string;

  @ApiProperty()
  isTaxable: boolean;

  @ApiProperty()
  isStatutory: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

**3. Implement Payroll Entity**:

**File**: `src/modules/payroll/entities/payroll.entity.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export class Payroll {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  payPeriodStart: Date;

  @ApiProperty()
  payPeriodEnd: Date;

  @ApiProperty()
  payDate: Date;

  @ApiProperty({ type: 'number' })
  basicSalary: Decimal;

  @ApiProperty({ type: 'number' })
  grossSalary: Decimal;

  @ApiProperty({ type: 'number' })
  totalEarnings: Decimal;

  @ApiProperty({ type: 'number' })
  totalDeductions: Decimal;

  @ApiProperty({ type: 'number' })
  netSalary: Decimal;

  @ApiProperty({ type: 'number' })
  taxAmount: Decimal;

  @ApiProperty({ required: false })
  breakdown: Record<string, any>;

  @ApiProperty({ enum: PayrollStatus })
  status: PayrollStatus;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  calculatedBy: string;

  @ApiProperty({ required: false })
  approvedBy?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

**4. Implement Salary Calculation Engine**:

**File**: `src/modules/payroll/services/salary-engine.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface SalaryCalculationInput {
  employeeId: string;
  tenantId: string;
  basicSalary: number;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  workingDays: number;
  actualDays: number;
}

export interface SalaryCalculationResult {
  basicSalary: Decimal;
  earnings: Record<string, Decimal>;
  deductions: Record<string, Decimal>;
  grossSalary: Decimal;
  totalEarnings: Decimal;
  totalDeductions: Decimal;
  netSalary: Decimal;
  taxableIncome: Decimal;
  breakdown: any;
}

@Injectable()
export class SalaryEngineService {
  private readonly logger = new Logger(SalaryEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate salary for an employee
   */
  async calculate(input: SalaryCalculationInput): Promise<SalaryCalculationResult> {
    const { employeeId, tenantId, basicSalary, workingDays, actualDays } = input;

    this.logger.log(`Calculating salary for employee ${employeeId}`);

    // Fetch salary components for employee
    const components = await this.prisma.salaryComponent.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    // Calculate pro-rated basic salary
    const daysRatio = actualDays / workingDays;
    const proratedBasic = new Decimal(basicSalary).mul(daysRatio);

    // Calculate earnings
    const earnings: Record<string, Decimal> = {
      BASIC: proratedBasic,
    };

    let grossSalary = proratedBasic;
    let taxableIncome = new Decimal(0);

    for (const component of components) {
      if (component.type === 'EARNING') {
        const amount = this.calculateComponentAmount(
          component,
          proratedBasic,
          grossSalary,
        );

        earnings[component.code] = amount;
        grossSalary = grossSalary.add(amount);

        if (component.isTaxable) {
          taxableIncome = taxableIncome.add(amount);
        }
      }
    }

    // Add basic to taxable income if it's taxable
    taxableIncome = taxableIncome.add(proratedBasic);

    // Calculate deductions
    const deductions: Record<string, Decimal> = {};

    for (const component of components) {
      if (component.type === 'DEDUCTION') {
        const amount = this.calculateComponentAmount(
          component,
          proratedBasic,
          grossSalary,
        );

        deductions[component.code] = amount;
      }
    }

    // Calculate totals
    const totalEarnings = Object.values(earnings).reduce(
      (sum, val) => sum.add(val),
      new Decimal(0),
    );

    const totalDeductions = Object.values(deductions).reduce(
      (sum, val) => sum.add(val),
      new Decimal(0),
    );

    const netSalary = grossSalary.sub(totalDeductions);

    return {
      basicSalary: proratedBasic,
      earnings,
      deductions,
      grossSalary,
      totalEarnings,
      totalDeductions,
      netSalary,
      taxableIncome,
      breakdown: {
        workingDays,
        actualDays,
        daysRatio,
        components: components.map((c) => ({
          code: c.code,
          name: c.name,
          type: c.type,
          amount:
            c.type === 'EARNING'
              ? earnings[c.code]?.toString()
              : deductions[c.code]?.toString(),
        })),
      },
    };
  }

  /**
   * Calculate component amount based on calculation type
   */
  private calculateComponentAmount(
    component: any,
    basicSalary: Decimal,
    grossSalary: Decimal,
  ): Decimal {
    switch (component.calculationType) {
      case 'FIXED':
        return new Decimal(component.value);

      case 'PERCENTAGE':
        // Percentage of basic or gross
        const base = component.formula?.includes('GROSS') ? grossSalary : basicSalary;
        return base.mul(component.value).div(100);

      case 'FORMULA':
        // Evaluate formula (simplified)
        return this.evaluateFormula(component.formula, basicSalary, grossSalary);

      default:
        return new Decimal(0);
    }
  }

  /**
   * Evaluate salary formula
   */
  private evaluateFormula(
    formula: string,
    basicSalary: Decimal,
    grossSalary: Decimal,
  ): Decimal {
    try {
      // Replace variables
      let evalFormula = formula
        .replace(/BASIC/g, basicSalary.toString())
        .replace(/GROSS/g, grossSalary.toString());

      // Evaluate (use a safe eval library in production)
      const result = eval(evalFormula);
      return new Decimal(result);
    } catch (error) {
      this.logger.error(`Formula evaluation error: ${error.message}`);
      return new Decimal(0);
    }
  }
}
```

### Day 3-4: Payroll Controller & Service

**File**: `src/modules/payroll/services/payroll.service.ts`
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { SalaryEngineService } from './salary-engine.service';
import { TaxEngineService } from './tax-engine.service';
import { StatutoryEngineService } from './statutory-engine.service';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { Payroll } from '../entities/payroll.entity';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private salaryEngine: SalaryEngineService,
    private taxEngine: TaxEngineService,
    private statutoryEngine: StatutoryEngineService,
  ) {}

  /**
   * Create and calculate payroll for an employee
   */
  async create(tenantId: string, dto: CreatePayrollDto, userId: string): Promise<Payroll> {
    const { employeeId, payPeriodStart, payPeriodEnd, payDate, basicSalary } = dto;

    // Fetch employee details
    const employee = await this.fetchEmployeeDetails(employeeId);

    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    // Check for duplicate payroll
    const existing = await this.prisma.payroll.findFirst({
      where: {
        tenantId,
        employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
      },
    });

    if (existing) {
      throw new BadRequestException('Payroll already exists for this period');
    }

    // Calculate working days and actual days
    const workingDays = this.calculateWorkingDays(payPeriodStart, payPeriodEnd);
    const actualDays = workingDays; // Simplified, should account for leaves

    // Calculate salary
    const salaryResult = await this.salaryEngine.calculate({
      employeeId,
      tenantId,
      basicSalary,
      payPeriodStart: new Date(payPeriodStart),
      payPeriodEnd: new Date(payPeriodEnd),
      workingDays,
      actualDays,
    });

    // Calculate tax
    const taxResult = await this.taxEngine.calculate({
      tenantId,
      employeeId,
      taxableIncome: salaryResult.taxableIncome.toNumber(),
      country: employee.country,
      financialYear: new Date(payPeriodStart).getFullYear(),
    });

    // Calculate statutory deductions
    const statutoryResult = await this.statutoryEngine.calculate({
      tenantId,
      employeeId,
      basicSalary: salaryResult.basicSalary.toNumber(),
      grossSalary: salaryResult.grossSalary.toNumber(),
      country: employee.country,
    });

    // Combine all deductions
    const totalDeductions = salaryResult.totalDeductions
      .add(taxResult.totalTax)
      .add(statutoryResult.totalStatutory);

    const netSalary = salaryResult.grossSalary.sub(totalDeductions);

    // Create payroll record
    const payroll = await this.prisma.payroll.create({
      data: {
        tenantId,
        employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        payDate: new Date(payDate),
        basicSalary: salaryResult.basicSalary,
        grossSalary: salaryResult.grossSalary,
        totalEarnings: salaryResult.totalEarnings,
        totalDeductions,
        netSalary,
        taxAmount: taxResult.totalTax,
        breakdown: {
          salary: salaryResult.breakdown,
          tax: taxResult.breakdown,
          statutory: statutoryResult.breakdown,
        },
        status: 'CALCULATED',
        currency: employee.currency || 'INR',
        country: employee.country || 'IN',
        calculatedBy: userId,
      },
    });

    return payroll;
  }

  /**
   * Calculate working days between dates
   */
  private calculateWorkingDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);

    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Fetch employee details from Employee Service
   */
  private async fetchEmployeeDetails(employeeId: string): Promise<any> {
    // Call Employee Service API
    // Simplified for this example
    return {
      id: employeeId,
      country: 'IN',
      currency: 'INR',
    };
  }

  /**
   * Approve payroll
   */
  async approve(tenantId: string, id: string, userId: string): Promise<Payroll> {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, tenantId },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll ${id} not found`);
    }

    if (payroll.status !== 'CALCULATED') {
      throw new BadRequestException('Only calculated payrolls can be approved');
    }

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Process approved payroll (mark as processed)
   */
  async process(tenantId: string, id: string): Promise<Payroll> {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, tenantId },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll ${id} not found`);
    }

    if (payroll.status !== 'APPROVED') {
      throw new BadRequestException('Only approved payrolls can be processed');
    }

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'PROCESSED',
      },
    });
  }

  /**
   * Get payroll by ID
   */
  async findOne(tenantId: string, id: string): Promise<Payroll> {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, tenantId },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll ${id} not found`);
    }

    return payroll;
  }

  /**
   * List payrolls with filters
   */
  async findAll(tenantId: string, filters: any) {
    const { employeeId, status, payPeriodStart, payPeriodEnd, page = 1, limit = 20 } = filters;

    const where: any = { tenantId };

    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (payPeriodStart) where.payPeriodStart = { gte: new Date(payPeriodStart) };
    if (payPeriodEnd) where.payPeriodEnd = { lte: new Date(payPeriodEnd) };

    const [payrolls, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return {
      data: payrolls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

**File**: `src/modules/payroll/controllers/payroll.controller.ts`
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from '../services/payroll.service';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @ApiOperation({ summary: 'Create and calculate payroll' })
  async create(@Req() req: any, @Body() dto: CreatePayrollDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    return this.payrollService.create(tenantId, dto, userId);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve payroll' })
  async approve(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    return this.payrollService.approve(tenantId, id, userId);
  }

  @Put(':id/process')
  @ApiOperation({ summary: 'Process payroll' })
  async process(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.payrollService.process(tenantId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll by ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.payrollService.findOne(tenantId, id);
  }

  @Get()
  @ApiOperation({ summary: 'List payrolls' })
  async findAll(@Req() req: any, @Query() filters: any) {
    const tenantId = req.user.tenantId;
    return this.payrollService.findAll(tenantId, filters);
  }
}
```

---

## Week 2: Statutory Compliance

### Day 5-7: Tax Engine Implementation

**File**: `src/modules/payroll/services/tax-engine.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

export interface TaxCalculationInput {
  tenantId: string;
  employeeId: string;
  taxableIncome: number;
  country: string;
  financialYear: number;
}

export interface TaxCalculationResult {
  totalTax: Decimal;
  breakdown: any;
}

@Injectable()
export class TaxEngineService {
  private readonly logger = new Logger(TaxEngineService.name);

  /**
   * Calculate tax based on country
   */
  async calculate(input: TaxCalculationInput): Promise<TaxCalculationResult> {
    const { country, taxableIncome, financialYear } = input;

    this.logger.log(`Calculating tax for country ${country}`);

    switch (country) {
      case 'IN':
        return this.calculateIndiaTax(taxableIncome, financialYear);

      case 'AE':
        return this.calculateUAETax(taxableIncome);

      case 'US':
        return this.calculateUSATax(taxableIncome);

      case 'GB':
        return this.calculateUKTax(taxableIncome);

      case 'SA':
        return this.calculateSaudiTax(taxableIncome);

      case 'SG':
        return this.calculateSingaporeTax(taxableIncome);

      case 'AU':
        return this.calculateAustraliaTax(taxableIncome);

      default:
        // Default: No tax
        return {
          totalTax: new Decimal(0),
          breakdown: { message: 'No tax configuration for this country' },
        };
    }
  }

  /**
   * India Income Tax (FY 2024-25 - New Regime)
   */
  private calculateIndiaTax(annualIncome: number, financialYear: number): TaxCalculationResult {
    // Tax slabs for FY 2024-25 (New Regime)
    const slabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 },
    ];

    let totalTax = new Decimal(0);
    const breakdown = { slabs: [] as any[] };

    for (const slab of slabs) {
      if (annualIncome > slab.min) {
        const taxableInSlab = Math.min(annualIncome, slab.max) - slab.min;
        const taxInSlab = (taxableInSlab * slab.rate) / 100;

        if (taxInSlab > 0) {
          totalTax = totalTax.add(taxInSlab);
          breakdown.slabs.push({
            range: `₹${slab.min} - ₹${slab.max === Infinity ? 'Above' : slab.max}`,
            rate: `${slab.rate}%`,
            taxableAmount: taxableInSlab,
            tax: taxInSlab,
          });
        }
      }
    }

    // Monthly tax
    const monthlyTax = totalTax.div(12);

    return {
      totalTax: monthlyTax,
      breakdown: {
        ...breakdown,
        annualIncome,
        annualTax: totalTax.toNumber(),
        monthlyTax: monthlyTax.toNumber(),
        regime: 'New Regime',
      },
    };
  }

  /**
   * UAE - No income tax
   */
  private calculateUAETax(annualIncome: number): TaxCalculationResult {
    return {
      totalTax: new Decimal(0),
      breakdown: {
        message: 'UAE has no personal income tax',
        annualIncome,
      },
    };
  }

  /**
   * USA Federal Tax (Simplified)
   */
  private calculateUSATax(annualIncome: number): TaxCalculationResult {
    // Federal tax brackets 2024 (Single filer)
    const slabs = [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 578125, rate: 35 },
      { min: 578125, max: Infinity, rate: 37 },
    ];

    let totalTax = new Decimal(0);

    for (const slab of slabs) {
      if (annualIncome > slab.min) {
        const taxableInSlab = Math.min(annualIncome, slab.max) - slab.min;
        const taxInSlab = (taxableInSlab * slab.rate) / 100;
        totalTax = totalTax.add(taxInSlab);
      }
    }

    const monthlyTax = totalTax.div(12);

    return {
      totalTax: monthlyTax,
      breakdown: {
        annualIncome,
        annualTax: totalTax.toNumber(),
        monthlyTax: monthlyTax.toNumber(),
      },
    };
  }

  /**
   * UK Income Tax
   */
  private calculateUKTax(annualIncome: number): TaxCalculationResult {
    const personalAllowance = 12570;
    const taxableIncome = Math.max(0, annualIncome - personalAllowance);

    const slabs = [
      { min: 0, max: 37700, rate: 20 },
      { min: 37700, max: 125140, rate: 40 },
      { min: 125140, max: Infinity, rate: 45 },
    ];

    let totalTax = new Decimal(0);

    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        const taxInSlab = (taxableInSlab * slab.rate) / 100;
        totalTax = totalTax.add(taxInSlab);
      }
    }

    const monthlyTax = totalTax.div(12);

    return {
      totalTax: monthlyTax,
      breakdown: {
        annualIncome,
        personalAllowance,
        taxableIncome,
        annualTax: totalTax.toNumber(),
        monthlyTax: monthlyTax.toNumber(),
      },
    };
  }

  /**
   * Saudi Arabia - No income tax for individuals
   */
  private calculateSaudiTax(annualIncome: number): TaxCalculationResult {
    return {
      totalTax: new Decimal(0),
      breakdown: {
        message: 'Saudi Arabia has no personal income tax',
        annualIncome,
      },
    };
  }

  /**
   * Singapore Income Tax
   */
  private calculateSingaporeTax(annualIncome: number): TaxCalculationResult {
    const slabs = [
      { min: 0, max: 20000, rate: 0 },
      { min: 20000, max: 30000, rate: 2 },
      { min: 30000, max: 40000, rate: 3.5 },
      { min: 40000, max: 80000, rate: 7 },
      { min: 80000, max: 120000, rate: 11.5 },
      { min: 120000, max: 160000, rate: 15 },
      { min: 160000, max: 200000, rate: 18 },
      { min: 200000, max: 240000, rate: 19 },
      { min: 240000, max: 280000, rate: 19.5 },
      { min: 280000, max: 320000, rate: 20 },
      { min: 320000, max: Infinity, rate: 22 },
    ];

    let totalTax = new Decimal(0);

    for (const slab of slabs) {
      if (annualIncome > slab.min) {
        const taxableInSlab = Math.min(annualIncome, slab.max) - slab.min;
        const taxInSlab = (taxableInSlab * slab.rate) / 100;
        totalTax = totalTax.add(taxInSlab);
      }
    }

    const monthlyTax = totalTax.div(12);

    return {
      totalTax: monthlyTax,
      breakdown: {
        annualIncome,
        annualTax: totalTax.toNumber(),
        monthlyTax: monthlyTax.toNumber(),
      },
    };
  }

  /**
   * Australia Income Tax
   */
  private calculateAustraliaTax(annualIncome: number): TaxCalculationResult {
    const slabs = [
      { min: 0, max: 18200, rate: 0 },
      { min: 18200, max: 45000, rate: 19 },
      { min: 45000, max: 120000, rate: 32.5 },
      { min: 120000, max: 180000, rate: 37 },
      { min: 180000, max: Infinity, rate: 45 },
    ];

    let totalTax = new Decimal(0);

    for (const slab of slabs) {
      if (annualIncome > slab.min) {
        const taxableInSlab = Math.min(annualIncome, slab.max) - slab.min;
        const taxInSlab = (taxableInSlab * slab.rate) / 100;
        totalTax = totalTax.add(taxInSlab);
      }
    }

    const monthlyTax = totalTax.div(12);

    return {
      totalTax: monthlyTax,
      breakdown: {
        annualIncome,
        annualTax: totalTax.toNumber(),
        monthlyTax: monthlyTax.toNumber(),
      },
    };
  }
}
```

### Day 8-9: Statutory Engine (PF, ESI, GOSI, etc.)

**File**: `src/modules/payroll/services/statutory-engine.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

export interface StatutoryCalculationInput {
  tenantId: string;
  employeeId: string;
  basicSalary: number;
  grossSalary: number;
  country: string;
}

export interface StatutoryCalculationResult {
  totalStatutory: Decimal;
  breakdown: any;
}

@Injectable()
export class StatutoryEngineService {
  private readonly logger = new Logger(StatutoryEngineService.name);

  /**
   * Calculate statutory deductions based on country
   */
  async calculate(input: StatutoryCalculationInput): Promise<StatutoryCalculationResult> {
    const { country, basicSalary, grossSalary } = input;

    this.logger.log(`Calculating statutory for country ${country}`);

    switch (country) {
      case 'IN':
        return this.calculateIndiaStatutory(basicSalary, grossSalary);

      case 'AE':
      case 'SA':
        return this.calculateGCCStatutory(basicSalary, country);

      default:
        return {
          totalStatutory: new Decimal(0),
          breakdown: {},
        };
    }
  }

  /**
   * India: PF (Provident Fund) + ESI (Employee State Insurance)
   */
  private calculateIndiaStatutory(basicSalary: number, grossSalary: number): StatutoryCalculationResult {
    const breakdown: any = {};
    let totalStatutory = new Decimal(0);

    // EPF (Employee Provident Fund) - 12% of basic (capped at ₹15,000)
    const pfBase = Math.min(basicSalary, 15000);
    const epf = new Decimal(pfBase).mul(0.12);
    breakdown.EPF = {
      base: pfBase,
      rate: '12%',
      employee: epf.toNumber(),
      employer: epf.toNumber(), // Employer also contributes 12%
    };
    totalStatutory = totalStatutory.add(epf);

    // ESI (Employee State Insurance) - 0.75% of gross (if gross < ₹21,000)
    if (grossSalary < 21000) {
      const esi = new Decimal(grossSalary).mul(0.0075);
      breakdown.ESI = {
        base: grossSalary,
        rate: '0.75%',
        employee: esi.toNumber(),
        employer: new Decimal(grossSalary).mul(0.0325).toNumber(), // Employer: 3.25%
      };
      totalStatutory = totalStatutory.add(esi);
    }

    // Professional Tax (varies by state, example: Maharashtra)
    let pt = new Decimal(0);
    if (grossSalary >= 7500 && grossSalary < 10000) {
      pt = new Decimal(175);
    } else if (grossSalary >= 10000) {
      pt = new Decimal(200);
    }

    if (pt.greaterThan(0)) {
      breakdown.PT = {
        amount: pt.toNumber(),
        state: 'Maharashtra',
      };
      totalStatutory = totalStatutory.add(pt);
    }

    return {
      totalStatutory,
      breakdown,
    };
  }

  /**
   * GCC Countries: GOSI (General Organization for Social Insurance)
   */
  private calculateGCCStatutory(basicSalary: number, country: string): StatutoryCalculationResult {
    const breakdown: any = {};
    let totalStatutory = new Decimal(0);

    if (country === 'SA') {
      // Saudi GOSI - 10% for Saudi nationals (employee contribution)
      // For simplicity, assuming Saudi national
      const gosi = new Decimal(basicSalary).mul(0.10);
      breakdown.GOSI = {
        base: basicSalary,
        rate: '10%',
        employee: gosi.toNumber(),
        employer: new Decimal(basicSalary).mul(0.12).toNumber(), // Employer: 12%
      };
      totalStatutory = totalStatutory.add(gosi);
    }

    return {
      totalStatutory,
      breakdown,
    };
  }
}
```

---

## Week 3: Multi-Country Support

### Day 10-12: Country-Specific Engines

Create separate engine files for each country with detailed tax and statutory rules:

**File structure**:
```
src/modules/country/engines/
├── india.engine.ts       # Complete India tax + PF/ESI/PT
├── uae.engine.ts         # UAE (no tax, EOSB)
├── usa.engine.ts         # US Federal + State tax + 401k
├── uk.engine.ts          # UK PAYE + NI contributions
├── saudi.engine.ts       # Saudi GOSI + EOSB
├── singapore.engine.ts   # Singapore CPF + tax
└── australia.engine.ts   # Australia superannuation
```

### Day 13-14: Payslip Generation

**File**: `src/modules/payroll/services/payslip.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class PayslipService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate payslip PDF
   */
  async generatePayslip(payrollId: string): Promise<Buffer> {
    // Fetch payroll
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new Error('Payroll not found');
    }

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('PAYSLIP', { align: 'center' });
    doc.moveDown();

    // Employee details
    doc.fontSize(12);
    doc.text(`Employee: ${payroll.employee.firstName} ${payroll.employee.lastName}`);
    doc.text(`Employee Code: ${payroll.employee.employeeCode}`);
    doc.text(`Pay Period: ${payroll.payPeriodStart.toDateString()} - ${payroll.payPeriodEnd.toDateString()}`);
    doc.text(`Pay Date: ${payroll.payDate.toDateString()}`);
    doc.moveDown();

    // Earnings table
    doc.fontSize(14).text('EARNINGS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    const breakdown = payroll.breakdown as any;

    if (breakdown?.salary?.components) {
      for (const component of breakdown.salary.components) {
        if (component.type === 'EARNING') {
          doc.text(
            `${component.name.padEnd(40)}${component.amount}`,
            { continued: false }
          );
        }
      }
    }

    doc.moveDown();
    doc.fontSize(12).text(`Gross Salary: ${payroll.grossSalary.toString()}`, { bold: true });
    doc.moveDown();

    // Deductions table
    doc.fontSize(14).text('DEDUCTIONS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    if (breakdown?.salary?.components) {
      for (const component of breakdown.salary.components) {
        if (component.type === 'DEDUCTION') {
          doc.text(
            `${component.name.padEnd(40)}${component.amount}`,
            { continued: false }
          );
        }
      }
    }

    if (breakdown?.tax) {
      doc.text(`Income Tax${' '.repeat(32)}${breakdown.tax.monthlyTax || 0}`);
    }

    doc.moveDown();
    doc.fontSize(12).text(`Total Deductions: ${payroll.totalDeductions.toString()}`, { bold: true });
    doc.moveDown();

    // Net salary
    doc.fontSize(16).text(`NET SALARY: ${payroll.currency} ${payroll.netSalary.toString()}`, {
      bold: true,
      underline: true,
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}
```

---

## Week 4: Testing & Deployment

### Day 15-18: Comprehensive Testing

Create tests following [TESTING-STANDARDS.md](d:\KreupAI\KreupAI.AuraOS\docs\testing\TESTING-STANDARDS.md):

**Unit Tests**: `src/modules/payroll/__tests__/`
**Integration Tests**: `test/integration/payroll.integration.spec.ts`
**E2E Tests**: `test/e2e/payroll.e2e.spec.ts`

**Target Coverage**: 95% (Critical financial module)

**Key Test Cases**:
- Salary calculation accuracy (10+ scenarios)
- Tax calculation for all countries (50+ test cases)
- Statutory compliance (20+ test cases)
- Rounding and decimal precision
- Edge cases (zero salary, negative values)
- Multi-currency support
- Concurrent payroll processing

### Day 19-21: Deployment

**1. Build Docker Image**:
```bash
cd services/payroll-service/

docker build -t payroll-service:1.0.0 .
docker tag payroll-service:1.0.0 your-registry/payroll-service:1.0.0
docker push your-registry/payroll-service:1.0.0
```

**2. Deploy to Kubernetes**:
```bash
kubectl apply -f k8s/payroll-service-deployment.yaml
kubectl apply -f k8s/payroll-service-service.yaml
kubectl apply -f k8s/payroll-service-hpa.yaml
```

**3. Traffic Migration** (Strangler Fig pattern):
- Week 1: 10% traffic (monitor carefully)
- Week 2: 30% traffic
- Week 3: 70% traffic
- Week 4: 100% traffic

**IMPORTANT**: Payroll is a critical financial service - migration must be extremely careful with thorough validation at each stage.

---

## API Specification

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/payroll | Create and calculate payroll |
| GET | /api/v1/payroll/:id | Get payroll by ID |
| GET | /api/v1/payroll | List payrolls |
| PUT | /api/v1/payroll/:id/approve | Approve payroll |
| PUT | /api/v1/payroll/:id/process | Process payroll |
| PUT | /api/v1/payroll/:id/cancel | Cancel payroll |
| GET | /api/v1/payroll/:id/payslip | Get payslip PDF |
| POST | /api/v1/payroll/bulk | Bulk payroll processing |

---

## Database Schema

**Prisma Schema**: `prisma/schema.prisma`

```prisma
model Payroll {
  id              String        @id @default(uuid())
  tenantId        String        @map("tenant_id")
  employeeId      String        @map("employee_id")
  payPeriodStart  DateTime      @map("pay_period_start")
  payPeriodEnd    DateTime      @map("pay_period_end")
  payDate         DateTime      @map("pay_date")
  basicSalary     Decimal       @map("basic_salary") @db.Decimal(15, 2)
  grossSalary     Decimal       @map("gross_salary") @db.Decimal(15, 2)
  totalEarnings   Decimal       @map("total_earnings") @db.Decimal(15, 2)
  totalDeductions Decimal       @map("total_deductions") @db.Decimal(15, 2)
  netSalary       Decimal       @map("net_salary") @db.Decimal(15, 2)
  taxAmount       Decimal       @map("tax_amount") @db.Decimal(15, 2)
  breakdown       Json?
  status          PayrollStatus
  currency        String        @default("INR")
  country         String        @default("IN")
  calculatedBy    String        @map("calculated_by")
  approvedBy      String?       @map("approved_by")
  approvedAt      DateTime?     @map("approved_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@unique([tenantId, employeeId, payPeriodStart, payPeriodEnd])
  @@index([tenantId, employeeId])
  @@index([status])
  @@map("payrolls")
}

model SalaryComponent {
  id               String          @id @default(uuid())
  tenantId         String          @map("tenant_id")
  code             String
  name             String
  type             ComponentType
  calculationType  CalculationType @map("calculation_type")
  value            Decimal         @db.Decimal(15, 2)
  formula          String?
  isTaxable        Boolean         @default(true) @map("is_taxable")
  isStatutory      Boolean         @default(false) @map("is_statutory")
  displayOrder     Int             @default(0) @map("display_order")
  isActive         Boolean         @default(true) @map("is_active")
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")

  @@unique([tenantId, code])
  @@map("salary_components")
}

enum PayrollStatus {
  DRAFT
  CALCULATED
  APPROVED
  PROCESSED
  PAID
  CANCELLED
}

enum ComponentType {
  EARNING
  DEDUCTION
  BENEFIT
}

enum CalculationType {
  FIXED
  PERCENTAGE
  FORMULA
}
```

---

## Success Criteria

**Completion Checklist**:
- [ ] All 8 API endpoints implemented and tested
- [ ] Salary calculation engine operational
- [ ] Tax engine with 7 countries implemented
- [ ] Statutory engine (PF, ESI, GOSI) operational
- [ ] Payslip generation working (PDF)
- [ ] Multi-currency support implemented
- [ ] Decimal precision validated
- [ ] Unit tests: 95% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Calculation accuracy: 100% validation
- [ ] Security audit passed
- [ ] Performance tests: <100ms per calculation
- [ ] Docker image built
- [ ] Deployed to Kubernetes
- [ ] Kong routing configured
- [ ] Datadog monitoring active
- [ ] Audit logging complete
- [ ] Documentation complete

---

**Platform Progress**: 99% → 100% ✅

**🎉 MICROSERVICES EXTRACTION COMPLETE! 🎉**

**Next Steps**: Proceed to [Monolith Cleanup Guide](./GUIDE-MONOLITH-CLEANUP.md)

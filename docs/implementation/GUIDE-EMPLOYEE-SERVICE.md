# Employee Service Implementation Guide

**Document Version**: 1.0
**Last Updated**: January 22, 2026
**Owner**: Platform Engineering Team
**Status**: Implementation Ready
**Estimated Timeline**: 3 weeks
**Impact**: 1% of platform completion (96% → 97%)

---

## Table of Contents

1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Prerequisites](#prerequisites)
4. [Week 1: Core Implementation](#week-1-core-implementation)
5. [Week 2: Advanced Features](#week-2-advanced-features)
6. [Week 3: Testing & Deployment](#week-3-testing--deployment)
7. [API Specification](#api-specification)
8. [Database Schema](#database-schema)
9. [Elasticsearch Integration](#elasticsearch-integration)
10. [GraphQL & gRPC Implementation](#graphql--grpc-implementation)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Procedures](#deployment-procedures)

---

## Overview

### Objective
Implement the Employee Service microservice to handle all employee-related operations, replacing the monolith's employee management functionality.

### Service Characteristics
- **Technology Stack**: NestJS + TypeScript
- **Communication**: REST API + GraphQL + gRPC
- **Database**: PostgreSQL (primary) + Elasticsearch (search)
- **Port**: 3002
- **Replicas**: 3 (production)

### Key Features
- Employee CRUD operations (8 endpoints)
- Full-text search with Elasticsearch
- Bulk operations (import/export)
- GraphQL query interface
- gRPC for inter-service communication
- Real-time employee updates via WebSockets

### Performance Targets
- **Response Time (p95)**: < 50ms
- **Search Latency (p95)**: < 100ms
- **Bulk Import**: 1,000 employees/minute
- **Availability**: 99.95%
- **Error Rate**: < 0.1%

---

## Service Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Kong API Gateway                       │
│              (Traffic Routing & Rate Limiting)           │
└────────────┬────────────────────────┬────────────────────┘
             │                        │
             ▼                        ▼
    ┌────────────────┐       ┌────────────────┐
    │  REST API      │       │  GraphQL API   │
    │  (Fastify)     │       │  (Apollo)      │
    └────────┬───────┘       └───────┬────────┘
             │                       │
             └───────────┬───────────┘
                         │
             ┌───────────▼────────────┐
             │   Employee Service     │
             │      (NestJS)          │
             │   Port: 3002           │
             └───┬──────────┬─────┬───┘
                 │          │     │
        ┌────────▼──┐  ┌────▼─────▼────┐  ┌──────────────┐
        │ PostgreSQL│  │ Elasticsearch  │  │ Redis Cache  │
        │  (Primary)│  │   (Search)     │  │              │
        └───────────┘  └────────────────┘  └──────────────┘
```

### Technology Stack

**Backend Framework**: NestJS 10.x
- Modular architecture
- Dependency injection
- Built-in validation (class-validator)
- Swagger/OpenAPI support
- GraphQL support (Apollo)

**Database**: PostgreSQL 15
- JSONB for flexible schemas
- Full-text search (tsvector)
- Partitioning for large datasets

**Search Engine**: Elasticsearch 8.x
- Full-text search
- Fuzzy matching
- Aggregations for analytics
- Autocomplete support

**Cache**: Redis 7.x
- Employee profile caching
- Session management
- Real-time updates pub/sub

**Message Queue**: RabbitMQ
- Async bulk operations
- Elasticsearch indexing
- Event publishing

---

## Prerequisites

### Development Environment Setup

**1. Install Dependencies**:
```bash
# Node.js 20+ LTS
node --version  # Should be v20+

# Install pnpm
npm install -g pnpm

# Install NestJS CLI
pnpm add -g @nestjs/cli
```

**2. Clone Service Repository**:
```bash
cd services/

# Service skeleton should already exist
cd employee-service/

# Install dependencies
pnpm install
```

**3. Set Up Local Databases**:

**PostgreSQL**:
```bash
# Using Docker
docker run --name employee-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=employee_dev \
  -p 5433:5432 \
  -d postgres:15

# Verify connection
psql -h localhost -p 5433 -U admin -d employee_dev -c "SELECT version();"
```

**Elasticsearch**:
```bash
# Using Docker
docker run --name employee-elasticsearch \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -p 9201:9200 \
  -d elasticsearch:8.11.0

# Verify connection
curl http://localhost:9201
```

**Redis**:
```bash
# Using Docker
docker run --name employee-redis \
  -p 6380:6379 \
  -d redis:7-alpine

# Verify connection
redis-cli -p 6380 PING
```

**4. Configure Environment Variables**:
```bash
# services/employee-service/.env.development

# Database
DATABASE_URL="postgresql://admin:admin123@localhost:5433/employee_dev"
DB_POOL_MIN=2
DB_POOL_MAX=10

# Elasticsearch
ELASTICSEARCH_NODE="http://localhost:9201"
ELASTICSEARCH_INDEX="employees"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6380
REDIS_TTL=3600

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Service
PORT=3002
NODE_ENV=development

# Auth Service (for JWT validation)
AUTH_SERVICE_URL="http://localhost:3001"
JWT_SECRET="your-jwt-secret-dev"

# Observability
DATADOG_ENABLED=false
LOG_LEVEL=debug
```

**5. Initialize Database Schema**:
```bash
cd services/employee-service/

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed development data (optional)
pnpm prisma db seed
```

---

## Week 1: Core Implementation

### Day 1-2: Project Structure & Basic CRUD

**1. Create Project Structure**:
```bash
cd services/employee-service/

# Create directory structure
mkdir -p src/{modules/{employee,health},common/{filters,interceptors,guards},config,database}
mkdir -p src/modules/employee/{dto,entities,repositories,services,controllers}
```

**Project Structure**:
```
services/employee-service/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── config/
│   │   ├── database.config.ts       # Database configuration
│   │   ├── elasticsearch.config.ts  # Elasticsearch configuration
│   │   └── redis.config.ts          # Redis configuration
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   ├── modules/
│   │   ├── employee/
│   │   │   ├── dto/
│   │   │   │   ├── create-employee.dto.ts
│   │   │   │   ├── update-employee.dto.ts
│   │   │   │   ├── search-employee.dto.ts
│   │   │   │   └── bulk-employee.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── employee.entity.ts
│   │   │   ├── repositories/
│   │   │   │   └── employee.repository.ts
│   │   │   ├── services/
│   │   │   │   ├── employee.service.ts
│   │   │   │   ├── employee-search.service.ts
│   │   │   │   └── employee-bulk.service.ts
│   │   │   ├── controllers/
│   │   │   │   ├── employee.controller.ts
│   │   │   │   └── employee-bulk.controller.ts
│   │   │   └── employee.module.ts
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.module.ts
│   └── database/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── seeds/
│           └── employee.seed.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.development
```

**2. Implement Main Application**:

**File**: `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Employee Service API')
    .setDescription('Employee management microservice for AuraOS HCM')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('employees')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 Employee Service running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
```

**3. Create Employee Entity**:

**File**: `src/modules/employee/entities/employee.entity.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export class Employee {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  employeeCode: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ enum: EmploymentStatus })
  status: EmploymentStatus;

  @ApiProperty({ enum: EmploymentType })
  employmentType: EmploymentType;

  @ApiProperty()
  departmentId: string;

  @ApiProperty({ required: false })
  positionId?: string;

  @ApiProperty({ required: false })
  managerId?: string;

  @ApiProperty()
  joinDate: Date;

  @ApiProperty({ required: false })
  exitDate?: Date;

  @ApiProperty({ required: false })
  personalInfo?: Record<string, any>;

  @ApiProperty({ required: false })
  emergencyContact?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

**4. Create DTOs**:

**File**: `src/modules/employee/dto/create-employee.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { EmploymentStatus, EmploymentType } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: EmploymentStatus, default: EmploymentStatus.ACTIVE })
  @IsEnum(EmploymentStatus)
  status: EmploymentStatus = EmploymentStatus.ACTIVE;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty()
  @IsUUID()
  departmentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty()
  @IsDateString()
  joinDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  personalInfo?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, any>;
}
```

**File**: `src/modules/employee/dto/update-employee.dto.ts`
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
```

**File**: `src/modules/employee/dto/search-employee.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus, EmploymentType } from '../entities/employee.entity';

export class SearchEmployeeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

**5. Implement Employee Service**:

**File**: `src/modules/employee/services/employee.service.ts`
```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { SearchEmployeeDto } from '../dto/search-employee.dto';
import { Employee } from '../entities/employee.entity';
import { EmployeeSearchService } from './employee-search.service';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private searchService: EmployeeSearchService,
  ) {}

  /**
   * Create a new employee
   */
  async create(tenantId: string, dto: CreateEmployeeDto): Promise<Employee> {
    // Check for duplicate email
    const existing = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Employee with this email already exists');
    }

    // Generate employee code
    const employeeCode = await this.generateEmployeeCode(tenantId);

    // Create employee
    const employee = await this.prisma.employee.create({
      data: {
        ...dto,
        tenantId,
        employeeCode,
        joinDate: new Date(dto.joinDate),
      },
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Index in Elasticsearch (async)
    this.searchService.indexEmployee(employee).catch((error) => {
      console.error('Failed to index employee in Elasticsearch:', error);
    });

    return employee;
  }

  /**
   * Find employee by ID
   */
  async findOne(tenantId: string, id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  /**
   * Search employees with filters
   */
  async search(tenantId: string, dto: SearchEmployeeDto) {
    const { query, status, employmentType, departmentId, page, limit } = dto;

    // If there's a text query, use Elasticsearch
    if (query) {
      return this.searchService.search(tenantId, dto);
    }

    // Otherwise, use database query
    const where: any = { tenantId };

    if (status) where.status = status;
    if (employmentType) where.employmentType = employmentType;
    if (departmentId) where.departmentId = departmentId;

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true },
          },
          position: {
            select: { id: true, title: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update employee
   */
  async update(
    tenantId: string,
    id: string,
    dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    // Check if employee exists
    await this.findOne(tenantId, id);

    // Check for duplicate email if email is being updated
    if (dto.email) {
      const existing = await this.prisma.employee.findFirst({
        where: {
          tenantId,
          email: dto.email,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Employee with this email already exists');
      }
    }

    // Update employee
    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
      },
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update in Elasticsearch (async)
    this.searchService.indexEmployee(employee).catch((error) => {
      console.error('Failed to update employee in Elasticsearch:', error);
    });

    return employee;
  }

  /**
   * Delete employee (soft delete)
   */
  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);

    await this.prisma.employee.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        exitDate: new Date(),
      },
    });

    // Remove from Elasticsearch (async)
    this.searchService.removeEmployee(id).catch((error) => {
      console.error('Failed to remove employee from Elasticsearch:', error);
    });
  }

  /**
   * Generate unique employee code
   */
  private async generateEmployeeCode(tenantId: string): Promise<string> {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const code = `EMP${(count + 1).toString().padStart(6, '0')}`;
    return code;
  }
}
```

**6. Implement Employee Controller**:

**File**: `src/modules/employee/controllers/employee.controller.ts`
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { SearchEmployeeDto } from '../dto/search-employee.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Employee already exists' })
  async create(@Req() req: any, @Body() dto: CreateEmployeeDto) {
    const tenantId = req.user.tenantId;
    return this.employeeService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  async search(@Req() req: any, @Query() dto: SearchEmployeeDto) {
    const tenantId = req.user.tenantId;
    return this.employeeService.search(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.employeeService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.employeeService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    await this.employeeService.remove(tenantId, id);
  }
}
```

### Day 3-4: Elasticsearch Integration

**1. Implement Elasticsearch Service**:

**File**: `src/modules/employee/services/employee-search.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchEmployeeDto } from '../dto/search-employee.dto';

const EMPLOYEE_INDEX = 'employees';

@Injectable()
export class EmployeeSearchService {
  private readonly logger = new Logger(EmployeeSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Initialize Elasticsearch index
   */
  async createIndex() {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: EMPLOYEE_INDEX,
    });

    if (!indexExists) {
      await this.elasticsearchService.indices.create({
        index: EMPLOYEE_INDEX,
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete: {
                  tokenizer: 'autocomplete',
                  filter: ['lowercase'],
                },
                autocomplete_search: {
                  tokenizer: 'lowercase',
                },
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: ['letter', 'digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              tenantId: { type: 'keyword' },
              employeeCode: { type: 'keyword' },
              firstName: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
              },
              lastName: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
              },
              email: { type: 'keyword' },
              phone: { type: 'keyword' },
              status: { type: 'keyword' },
              employmentType: { type: 'keyword' },
              departmentId: { type: 'keyword' },
              departmentName: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
              },
              positionId: { type: 'keyword' },
              positionTitle: { type: 'text' },
              joinDate: { type: 'date' },
              createdAt: { type: 'date' },
            },
          },
        },
      });

      this.logger.log('Elasticsearch index created');
    }
  }

  /**
   * Index employee document
   */
  async indexEmployee(employee: any) {
    try {
      await this.elasticsearchService.index({
        index: EMPLOYEE_INDEX,
        id: employee.id,
        document: {
          id: employee.id,
          tenantId: employee.tenantId,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          status: employee.status,
          employmentType: employee.employmentType,
          departmentId: employee.departmentId,
          departmentName: employee.department?.name,
          positionId: employee.positionId,
          positionTitle: employee.position?.title,
          joinDate: employee.joinDate,
          createdAt: employee.createdAt,
        },
      });

      this.logger.log(`Employee ${employee.id} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index employee: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search employees
   */
  async search(tenantId: string, dto: SearchEmployeeDto) {
    const { query, status, employmentType, departmentId, page = 1, limit = 20 } = dto;

    const must: any[] = [{ term: { tenantId } }];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: [
            'firstName^3',
            'lastName^3',
            'email^2',
            'employeeCode^2',
            'departmentName',
          ],
          fuzziness: 'AUTO',
        },
      });
    }

    if (status) must.push({ term: { status } });
    if (employmentType) must.push({ term: { employmentType } });
    if (departmentId) must.push({ term: { departmentId } });

    const from = (page - 1) * limit;

    const result = await this.elasticsearchService.search({
      index: EMPLOYEE_INDEX,
      body: {
        query: {
          bool: { must },
        },
        from,
        size: limit,
        sort: [{ createdAt: 'desc' }],
      },
    });

    const hits = result.hits.hits;
    const total = result.hits.total['value'];

    return {
      data: hits.map((hit: any) => hit._source),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Remove employee from index
   */
  async removeEmployee(id: string) {
    try {
      await this.elasticsearchService.delete({
        index: EMPLOYEE_INDEX,
        id,
      });

      this.logger.log(`Employee ${id} removed from index`);
    } catch (error) {
      if (error.meta?.body?.result !== 'not_found') {
        this.logger.error(`Failed to remove employee from index: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Bulk index employees
   */
  async bulkIndex(employees: any[]) {
    const operations = employees.flatMap((employee) => [
      { index: { _index: EMPLOYEE_INDEX, _id: employee.id } },
      {
        id: employee.id,
        tenantId: employee.tenantId,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        status: employee.status,
        employmentType: employee.employmentType,
        departmentId: employee.departmentId,
        departmentName: employee.department?.name,
        positionId: employee.positionId,
        positionTitle: employee.position?.title,
        joinDate: employee.joinDate,
        createdAt: employee.createdAt,
      },
    ]);

    if (operations.length > 0) {
      const result = await this.elasticsearchService.bulk({
        operations,
      });

      this.logger.log(`Bulk indexed ${employees.length} employees`);
      return result;
    }
  }
}
```

**2. Configure Elasticsearch Module**:

**File**: `src/modules/employee/employee.module.ts`
```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { PrismaService } from '@/database/prisma.service';
import { EmployeeController } from './controllers/employee.controller';
import { EmployeeService } from './services/employee.service';
import { EmployeeSearchService } from './services/employee-search.service';
import { EmployeeBulkService } from './services/employee-bulk.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    }),
  ],
  controllers: [EmployeeController],
  providers: [
    PrismaService,
    EmployeeService,
    EmployeeSearchService,
    EmployeeBulkService,
  ],
  exports: [EmployeeService],
})
export class EmployeeModule implements OnModuleInit {
  constructor(private readonly searchService: EmployeeSearchService) {}

  async onModuleInit() {
    await this.searchService.createIndex();
  }
}
```

### Day 5: Bulk Operations

**Implement Bulk Import/Export Service**:

**File**: `src/modules/employee/services/employee-bulk.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { EmployeeSearchService } from './employee-search.service';
import * as XLSX from 'xlsx';

@Injectable()
export class EmployeeBulkService {
  private readonly logger = new Logger(EmployeeBulkService.name);

  constructor(
    private prisma: PrismaService,
    private searchService: EmployeeSearchService,
  ) {}

  /**
   * Bulk import employees from CSV/Excel
   */
  async bulkImport(tenantId: string, file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const row of data) {
      try {
        // Validate and transform row data
        const employeeData = this.transformRowToEmployee(row);

        // Create employee
        const employee = await this.prisma.employee.create({
          data: {
            ...employeeData,
            tenantId,
            employeeCode: await this.generateEmployeeCode(tenantId),
          },
        });

        // Index in Elasticsearch
        await this.searchService.indexEmployee(employee);

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: results.success + results.failed,
          error: error.message,
          data: row,
        });
      }
    }

    this.logger.log(
      `Bulk import completed: ${results.success} success, ${results.failed} failed`,
    );

    return results;
  }

  /**
   * Bulk export employees to Excel
   */
  async bulkExport(tenantId: string, filters: any = {}) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, ...filters },
      include: {
        department: true,
        position: true,
      },
    });

    const data = employees.map((emp) => ({
      'Employee Code': emp.employeeCode,
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      Email: emp.email,
      Phone: emp.phone,
      Status: emp.status,
      'Employment Type': emp.employmentType,
      Department: emp.department?.name,
      Position: emp.position?.title,
      'Join Date': emp.joinDate.toISOString().split('T')[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }

  /**
   * Transform row data to employee object
   */
  private transformRowToEmployee(row: any): any {
    return {
      firstName: row['First Name'] || row.firstName,
      lastName: row['Last Name'] || row.lastName,
      email: row['Email'] || row.email,
      phone: row['Phone'] || row.phone,
      status: row['Status'] || 'ACTIVE',
      employmentType: row['Employment Type'] || row.employmentType,
      departmentId: row['Department ID'] || row.departmentId,
      positionId: row['Position ID'] || row.positionId,
      joinDate: new Date(row['Join Date'] || row.joinDate),
    };
  }

  /**
   * Generate employee code
   */
  private async generateEmployeeCode(tenantId: string): Promise<string> {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    return `EMP${(count + 1).toString().padStart(6, '0')}`;
  }
}
```

---

## Week 2: Advanced Features

### Day 6-7: GraphQL Implementation

**File**: `src/modules/employee/employee.resolver.ts`
```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { EmployeeService } from './services/employee.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Resolver(() => Employee)
@UseGuards(GqlAuthGuard)
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @Query(() => Employee)
  async employee(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<Employee> {
    return this.employeeService.findOne(user.tenantId, id);
  }

  @Query(() => [Employee])
  async employees(
    @CurrentUser() user: any,
    @Args('status', { nullable: true }) status?: string,
  ): Promise<Employee[]> {
    const result = await this.employeeService.search(user.tenantId, { status });
    return result.data;
  }

  @Mutation(() => Employee)
  async createEmployee(
    @CurrentUser() user: any,
    @Args('input') input: CreateEmployeeDto,
  ): Promise<Employee> {
    return this.employeeService.create(user.tenantId, input);
  }

  @Mutation(() => Employee)
  async updateEmployee(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('input') input: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeeService.update(user.tenantId, id, input);
  }

  @Mutation(() => Boolean)
  async deleteEmployee(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.employeeService.remove(user.tenantId, id);
    return true;
  }
}
```

### Day 8-9: gRPC Implementation

**File**: `protos/employee.proto`
```protobuf
syntax = "proto3";

package employee;

service EmployeeService {
  rpc GetEmployee (GetEmployeeRequest) returns (EmployeeResponse);
  rpc ListEmployees (ListEmployeesRequest) returns (ListEmployeesResponse);
  rpc CreateEmployee (CreateEmployeeRequest) returns (EmployeeResponse);
  rpc UpdateEmployee (UpdateEmployeeRequest) returns (EmployeeResponse);
  rpc DeleteEmployee (DeleteEmployeeRequest) returns (DeleteEmployeeResponse);
}

message GetEmployeeRequest {
  string tenant_id = 1;
  string id = 2;
}

message ListEmployeesRequest {
  string tenant_id = 1;
  string status = 2;
  string department_id = 3;
  int32 page = 4;
  int32 limit = 5;
}

message CreateEmployeeRequest {
  string tenant_id = 1;
  string first_name = 2;
  string last_name = 3;
  string email = 4;
  string phone = 5;
  string status = 6;
  string employment_type = 7;
  string department_id = 8;
  string position_id = 9;
  string join_date = 10;
}

message UpdateEmployeeRequest {
  string tenant_id = 1;
  string id = 2;
  string first_name = 3;
  string last_name = 4;
  string email = 5;
  string phone = 6;
  string status = 7;
}

message DeleteEmployeeRequest {
  string tenant_id = 1;
  string id = 2;
}

message EmployeeResponse {
  string id = 1;
  string tenant_id = 2;
  string employee_code = 3;
  string first_name = 4;
  string last_name = 5;
  string email = 6;
  string phone = 7;
  string status = 8;
  string employment_type = 9;
  string department_id = 10;
  string position_id = 11;
  string join_date = 12;
}

message ListEmployeesResponse {
  repeated EmployeeResponse employees = 1;
  int32 total = 2;
}

message DeleteEmployeeResponse {
  bool success = 1;
}
```

**File**: `src/modules/employee/employee.grpc.controller.ts`
```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmployeeService } from './services/employee.service';

@Controller()
export class EmployeeGrpcController {
  constructor(private readonly employeeService: EmployeeService) {}

  @GrpcMethod('EmployeeService', 'GetEmployee')
  async getEmployee(data: { tenant_id: string; id: string }) {
    const employee = await this.employeeService.findOne(data.tenant_id, data.id);
    return this.transformEmployeeToGrpc(employee);
  }

  @GrpcMethod('EmployeeService', 'ListEmployees')
  async listEmployees(data: {
    tenant_id: string;
    status?: string;
    department_id?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.employeeService.search(data.tenant_id, {
      status: data.status as any,
      departmentId: data.department_id,
      page: data.page || 1,
      limit: data.limit || 20,
    });

    return {
      employees: result.data.map(this.transformEmployeeToGrpc),
      total: result.meta.total,
    };
  }

  @GrpcMethod('EmployeeService', 'CreateEmployee')
  async createEmployee(data: any) {
    const employee = await this.employeeService.create(data.tenant_id, {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      employmentType: data.employment_type,
      departmentId: data.department_id,
      positionId: data.position_id,
      joinDate: data.join_date,
    });

    return this.transformEmployeeToGrpc(employee);
  }

  private transformEmployeeToGrpc(employee: any) {
    return {
      id: employee.id,
      tenant_id: employee.tenantId,
      employee_code: employee.employeeCode,
      first_name: employee.firstName,
      last_name: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      status: employee.status,
      employment_type: employee.employmentType,
      department_id: employee.departmentId,
      position_id: employee.positionId || '',
      join_date: employee.joinDate.toISOString(),
    };
  }
}
```

### Day 10: Caching Implementation

**File**: `src/modules/employee/services/employee-cache.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'employee:';

@Injectable()
export class EmployeeCacheService {
  private readonly logger = new Logger(EmployeeCacheService.name);

  constructor(private readonly redis: RedisService) {}

  async get(tenantId: string, id: string): Promise<any | null> {
    const key = `${CACHE_PREFIX}${tenantId}:${id}`;
    const cached = await this.redis.get(key);

    if (cached) {
      this.logger.debug(`Cache hit: ${key}`);
      return JSON.parse(cached);
    }

    this.logger.debug(`Cache miss: ${key}`);
    return null;
  }

  async set(tenantId: string, id: string, data: any): Promise<void> {
    const key = `${CACHE_PREFIX}${tenantId}:${id}`;
    await this.redis.setex(key, CACHE_TTL, JSON.stringify(data));
    this.logger.debug(`Cache set: ${key}`);
  }

  async invalidate(tenantId: string, id: string): Promise<void> {
    const key = `${CACHE_PREFIX}${tenantId}:${id}`;
    await this.redis.del(key);
    this.logger.debug(`Cache invalidated: ${key}`);
  }

  async invalidateAll(tenantId: string): Promise<void> {
    const pattern = `${CACHE_PREFIX}${tenantId}:*`;
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.debug(`Cache invalidated: ${keys.length} keys`);
    }
  }
}
```

---

## Week 3: Testing & Deployment

### Day 11-13: Comprehensive Testing

Create tests following [TESTING-STANDARDS.md](d:\KreupAI\KreupAI.AuraOS\docs\testing\TESTING-STANDARDS.md):

**Unit Tests**: `src/modules/employee/__tests__/employee.service.spec.ts`
**Integration Tests**: `test/integration/employee.integration.spec.ts`
**E2E Tests**: `test/e2e/employee.e2e.spec.ts`

**Target Coverage**: 85% (High priority module)

Run tests:
```bash
pnpm test                    # Unit tests
pnpm test:integration        # Integration tests
pnpm test:e2e               # E2E tests
pnpm test:coverage          # Coverage report
```

### Day 14-15: Deployment

**1. Build Docker Image**:
```bash
cd services/employee-service/

docker build -t employee-service:1.0.0 -f Dockerfile .
docker tag employee-service:1.0.0 your-registry/employee-service:1.0.0
docker push your-registry/employee-service:1.0.0
```

**2. Deploy to Kubernetes**:
```bash
kubectl apply -f k8s/employee-service-deployment.yaml
kubectl apply -f k8s/employee-service-service.yaml
kubectl apply -f k8s/employee-service-hpa.yaml
```

**3. Configure Kong Routing**:
```bash
kubectl apply -f kong/routes/employee-service.yaml
```

**4. Start Traffic Migration** (following Strangler Fig pattern):
- Week 1: 10% traffic
- Week 2: 50% traffic
- Week 3: 100% traffic

---

## API Specification

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/employees | Create employee |
| GET | /api/v1/employees | Search/list employees |
| GET | /api/v1/employees/:id | Get employee by ID |
| PUT | /api/v1/employees/:id | Update employee |
| DELETE | /api/v1/employees/:id | Delete employee |
| POST | /api/v1/employees/bulk/import | Bulk import |
| GET | /api/v1/employees/bulk/export | Bulk export |
| GET | /api/v1/employees/search/autocomplete | Autocomplete search |

---

## Database Schema

**Prisma Schema**: `prisma/schema.prisma`

```prisma
model Employee {
  id              String            @id @default(uuid())
  tenantId        String            @map("tenant_id")
  employeeCode    String            @unique @map("employee_code")
  firstName       String            @map("first_name")
  lastName        String            @map("last_name")
  email           String
  phone           String?
  avatar          String?
  status          EmploymentStatus  @default(ACTIVE)
  employmentType  EmploymentType    @map("employment_type")
  departmentId    String            @map("department_id")
  positionId      String?           @map("position_id")
  managerId       String?           @map("manager_id")
  joinDate        DateTime          @map("join_date")
  exitDate        DateTime?         @map("exit_date")
  personalInfo    Json?             @map("personal_info")
  emergencyContact Json?            @map("emergency_contact")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  tenant          Tenant            @relation(fields: [tenantId], references: [id])
  department      Department        @relation(fields: [departmentId], references: [id])
  position        Position?         @relation(fields: [positionId], references: [id])
  manager         Employee?         @relation("EmployeeManager", fields: [managerId], references: [id])
  subordinates    Employee[]        @relation("EmployeeManager")

  @@unique([tenantId, email])
  @@index([tenantId, status])
  @@index([departmentId])
  @@map("employees")
}

enum EmploymentStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
}
```

---

## Success Criteria

**Completion Checklist**:
- [ ] All 8 API endpoints implemented and tested
- [ ] Elasticsearch integration with autocomplete
- [ ] GraphQL API functional
- [ ] gRPC service operational
- [ ] Bulk import/export working
- [ ] Redis caching implemented
- [ ] Unit tests: 85% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Security tests passing
- [ ] Performance tests: p95 < 50ms
- [ ] Docker image built
- [ ] Deployed to Kubernetes
- [ ] Kong routing configured
- [ ] Datadog monitoring active
- [ ] Documentation complete

---

**Platform Progress**: 96% → 97% ✅

**Next Steps**: Proceed to [Notification Service Implementation Guide](./GUIDE-NOTIFICATION-SERVICE.md)

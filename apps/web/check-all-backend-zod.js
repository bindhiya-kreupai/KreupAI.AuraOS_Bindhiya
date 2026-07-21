const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

// Schema from apps/web/src/app/api/v1/employees/[id]/route.ts
const v1UpdateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  companyId: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  jobProfileId: z.string().optional(),
  gradeId: z.string().optional(),
  statusId: z.string().optional(),
  typeId: z.string().optional(),
  managerId: z.string().optional().nullable(),
  addressId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  joiningDate: z.string().or(z.date()).optional(),
  salaryStructureId: z.string().optional().nullable(),
});

// Schema from apps/web/src/app/api/core-hr/employees/[employeeId]/route.ts
const coreHrUpdateEmployeeSchema = z.object({
  employeeCode: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  companyId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  jobProfileId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  joiningDate: z.string().or(z.date()).optional(),
  managerId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  addressId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
});

// Schema from apps/web/src/app/api/core-hr/employees/route.ts
const coreHrEmployeesRouteUpdateSchema = z.object({
  id: z.string().uuid('Valid employee ID is required'),
  employeeCode: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  companyId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  jobProfileId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  joiningDate: z.string().or(z.date()).optional(),
  managerId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  addressId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
});

async function main() {
  const employees = await prisma.employee.findMany();
  for (const emp of employees) {
    const payload = {
      ...emp,
      joiningDate: emp.joiningDate ? emp.joiningDate.toISOString() : null,
    };
    
    // Test v1 update schema
    const v1Res = v1UpdateEmployeeSchema.safeParse(payload);
    if (!v1Res.success) {
      console.log(`v1 schema FAILED for ${emp.employeeCode}:`, JSON.stringify(v1Res.error.errors, null, 2));
    } else {
      console.log(`v1 schema PASSED for ${emp.employeeCode}`);
    }

    // Test core-hr employeeId update schema
    const coreHrIdRes = coreHrUpdateEmployeeSchema.safeParse(payload);
    if (!coreHrIdRes.success) {
      console.log(`core-hr [employeeId] schema FAILED for ${emp.employeeCode}:`, JSON.stringify(coreHrIdRes.error.errors, null, 2));
    } else {
      console.log(`core-hr [employeeId] schema PASSED for ${emp.employeeCode}`);
    }

    // Test core-hr route update schema
    const coreHrRouteRes = coreHrEmployeesRouteUpdateSchema.safeParse(payload);
    if (!coreHrRouteRes.success) {
      console.log(`core-hr employees route update schema FAILED for ${emp.employeeCode}:`, JSON.stringify(coreHrRouteRes.error.errors, null, 2));
    } else {
      console.log(`core-hr employees route update schema PASSED for ${emp.employeeCode}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

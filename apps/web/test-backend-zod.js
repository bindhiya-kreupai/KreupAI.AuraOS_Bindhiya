const { z } = require('zod');

// The updateEmployeeSchema from apps/web/src/app/api/v1/employees/[id]/route.ts
const updateEmployeeSchema = z.object({
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

const data = {
  id: "039b7454-3823-4821-bb74-1f96c9c7ab53",
  userId: null,
  employeeCode: "emp009",
  firstName: "Jane",
  lastName: "Smith",
  email: "jane.smith@auraos-temp.com",
  companyId: "dc556827-c709-4e56-a04e-d9256e9f1f32",
  departmentId: "24ff2eb5-d6f5-4397-bace-ce136663b691",
  locationId: "6cc03cca-316b-41ee-bea1-9f7690abadc4",
  jobProfileId: "d0e1e314-f228-4af2-a063-40095c546a2d",
  gradeId: "39fd366d-367a-4b2b-8e00-74fcadff8b0a",
  managerId: null,
  positionId: null,
  statusId: "520d4311-dd32-43b7-b0d4-29a41ae5c2c3",
  typeId: "0496c2ee-c71e-4c5e-bf27-2f3f1274d2b0",
  joiningDate: "2026-06-19T03:05:57.449Z",
  addressId: null,
  salaryStructureId: null
};

const result = updateEmployeeSchema.safeParse(data);
if (result.success) {
  console.log('Backend v1 updateEmployeeSchema Success!');
} else {
  console.log('Backend v1 updateEmployeeSchema Error:');
  console.log(JSON.stringify(result.error.errors, null, 2));
}

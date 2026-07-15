const { z } = require('zod');

const employeeFormSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required').max(20, 'Employee code too long'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Valid email is required'),
  companyId: z.string().min(1, 'Company is required'),
  departmentId: z.string().min(1, 'Department is required'),
  locationId: z.string().min(1, 'Location is required'),
  jobProfileId: z.string().min(1, 'Job profile is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  statusId: z.string().min(1, 'Status is required'),
  typeId: z.string().min(1, 'Employment type is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  managerId: z.string().optional().nullable(),
  addressId: z.string().optional().nullable(),
});

const data = {
  id: '039b7454-3823-4821-bb74-1f96c9c7ab53',
  userId: null,
  employeeCode: 'emp009',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@auraos-temp.com',
  companyId: 'dc556827-c709-4e56-a04e-d9256e9f1f32',
  departmentId: '24ff2eb5-d6f5-4397-bace-ce136663b691',
  locationId: '6cc03cca-316b-41ee-bea1-9f7690abadc4',
  jobProfileId: 'd0e1e314-f228-4af2-a063-40095c546a2d',
  gradeId: '39fd366d-367a-4b2b-8e00-74fcadff8b0a',
  managerId: null,
  positionId: null,
  statusId: '520d4311-dd32-43b7-b0d4-29a41ae5c2c3',
  typeId: '0496c2ee-c71e-4c5e-bf27-2f3f1274d2b0',
  joiningDate: '2026-06-19T03:05:57.449Z',
  addressId: null,
  salaryStructureId: null
};

try {
  employeeFormSchema.partial().parse(data);
  console.log('Validation success!');
} catch (e) {
  console.log(JSON.stringify(e.errors || e, null, 2));
}

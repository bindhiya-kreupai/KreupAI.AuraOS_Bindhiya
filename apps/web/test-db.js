const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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

prisma.employee.findMany().then(employees => {
  employees.forEach(emp => {
    try {
      // Normalize joiningDate as string since it's DateTime in DB
      const testData = {
        ...emp,
        joiningDate: emp.joiningDate ? emp.joiningDate.toISOString() : null
      };
      employeeFormSchema.partial().parse(testData);
      console.log('Employee:', emp.employeeCode, 'Validation success!');
    } catch (e) {
      console.log('Employee:', emp.employeeCode, 'Validation error:');
      console.log(JSON.stringify(e.errors || e, null, 2));
    }
  });
}).catch(console.error).finally(() => prisma.$disconnect());

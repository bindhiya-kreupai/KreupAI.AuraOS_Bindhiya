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

async function main() {
  const response = await fetch('http://localhost:3006/api/dev/employees');
  const json = await response.json();
  const employees = json.data;
  console.log(`Fetched ${employees.length} employees from API.`);
  for (const emp of employees) {
    const res = employeeFormSchema.partial().safeParse(emp);
    if (!res.success) {
      console.log(`FAIL for ${emp.employeeCode}:`, JSON.stringify(res.error.errors, null, 2));
    } else {
      console.log(`PASS for ${emp.employeeCode}`);
    }
  }
}

main().catch(console.error);

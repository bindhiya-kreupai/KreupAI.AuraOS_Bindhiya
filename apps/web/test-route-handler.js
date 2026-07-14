const { NextRequest } = require('next/server');
const { PUT } = require('./src/app/api/v1/employees/[id]/route');

// The exact payload from page.tsx handleSave
const payload = {
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

// Mock authentication context for withEnhancedAuth
const mockUser = {
  userId: 'test-user-id',
  email: 'test@example.com',
  tenantId: '2c28a58a-65b5-499e-a427-4516a3939be7',
};

async function run() {
  try {
    const request = new NextRequest('http://localhost:3006/api/v1/employees/039b7454-3823-4821-bb74-1f96c9c7ab53', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // We can call PUT directly by mocking the context
    // Since withEnhancedAuth wraps it, we can't easily mock the context directly without bypassing auth,
    // but we can test the updateEmployeeSchema validation directly using Zod.
    console.log('Skipping direct route handler invocation due to auth wrapper complexity.');
  } catch (err) {
    console.error(err);
  }
}

run();

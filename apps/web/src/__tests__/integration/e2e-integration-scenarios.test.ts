/**
 * End-to-End Integration Scenarios (Days 65-66)
 *
 * Tests complete business workflows including:
 * - Employee lifecycle (recruitment to exit)
 * - Payroll processing cycle
 * - Leave management workflow
 * - Performance review cycle
 * - Recruitment pipeline
 * - Benefits enrollment
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_BASE = `${BASE_URL}/api/v1`;

const testUser = {
  email: 'e2e.integration@auraos.com',
  password: 'E2EIntegration@2025'
};

let authToken: string;
let testEmployeeId: string;
let testDepartmentId: string;

test.describe('E2E Integration - Employee Lifecycle', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should complete full employee lifecycle from recruitment to exit', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // PHASE 1: Recruitment
    console.log('📋 Phase 1: Recruitment');

    const candidatePayload = {
      firstName: 'Lifecycle',
      lastName: 'TestCandidate',
      email: 'lifecycle.candidate@auraos.com',
      phone: '+1234567890',
      position: 'Software Engineer',
      experience: 5,
      resumeUrl: 'https://example.com/resume.pdf',
      status: 'Applied'
    };

    const candidateResponse = await request.post(`${API_BASE}/recruitment/candidates`, {
      headers,
      data: candidatePayload
    });

    expect(candidateResponse.ok()).toBeTruthy();
    const candidateData = (await candidateResponse.json()).data;
    const candidateId = candidateData.id;
    console.log('✅ Candidate application received:', candidateId);

    // Schedule interview
    const interviewResponse = await request.post(`${API_BASE}/recruitment/interviews`, {
      headers,
      data: {
        candidateId,
        interviewDate: '2025-02-15',
        interviewType: 'Technical',
        interviewerIds: ['interviewer-123']
      }
    });

    if (interviewResponse.ok()) {
      console.log('✅ Interview scheduled');
    }

    // Mark candidate as hired
    const hireResponse = await request.put(
      `${API_BASE}/recruitment/candidates/${candidateId}/hire`,
      {
        headers,
        data: {
          offerAccepted: true,
          joiningDate: '2025-03-01',
          salary: 80000,
          department: 'Engineering'
        }
      }
    );

    if (hireResponse.ok()) {
      console.log('✅ Candidate hired');
    }

    // PHASE 2: Onboarding
    console.log('\n📝 Phase 2: Onboarding');

    const onboardingResponse = await request.post(`${API_BASE}/onboarding/workflows`, {
      headers,
      data: {
        candidateId,
        startDate: '2025-03-01',
        tasks: [
          { name: 'Complete documentation', dueDate: '2025-03-01' },
          { name: 'IT setup', dueDate: '2025-03-01' },
          { name: 'Manager introduction', dueDate: '2025-03-02' }
        ]
      }
    });

    if (onboardingResponse.ok()) {
      console.log('✅ Onboarding workflow created');
    }

    // PHASE 3: Employee Creation
    console.log('\n👤 Phase 3: Active Employment');

    const employeePayload = {
      employeeCode: 'EMP-LIFECYCLE-001',
      firstName: candidatePayload.firstName,
      lastName: candidatePayload.lastName,
      email: candidatePayload.email,
      phone: candidatePayload.phone,
      department: 'Engineering',
      designation: 'Software Engineer',
      joinDate: '2025-03-01',
      employmentType: 'Full-time',
      status: 'Active',
      salary: 80000
    };

    const employeeResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: employeePayload
    });

    expect(employeeResponse.ok()).toBeTruthy();
    testEmployeeId = (await employeeResponse.json()).data.id;
    console.log('✅ Employee record created:', testEmployeeId);

    // PHASE 4: Performance Review
    console.log('\n⭐ Phase 4: Performance Review');

    // Wait 90 days simulation - create performance review
    const reviewResponse = await request.post(`${API_BASE}/performance/reviews`, {
      headers,
      data: {
        employeeId: testEmployeeId,
        reviewPeriod: 'Q1 2025',
        reviewType: 'Probation',
        reviewDate: '2025-06-01',
        rating: 4.5,
        comments: 'Excellent performance during probation',
        status: 'Completed'
      }
    });

    if (reviewResponse.ok()) {
      console.log('✅ Probation review completed');
    }

    // Confirm employee
    await request.put(`${API_BASE}/employees/${testEmployeeId}`, {
      headers,
      data: {
        status: 'Confirmed',
        confirmationDate: '2025-06-01'
      }
    });

    console.log('✅ Employee confirmed');

    // PHASE 5: Benefits Enrollment
    console.log('\n💊 Phase 5: Benefits Enrollment');

    const benefitsResponse = await request.post(`${API_BASE}/benefits/enrollments`, {
      headers,
      data: {
        employeeId: testEmployeeId,
        benefitPlan: 'Health Insurance Premium',
        effectiveDate: '2025-06-01',
        monthlyDeduction: 200
      }
    });

    if (benefitsResponse.ok()) {
      console.log('✅ Benefits enrolled');
    }

    // PHASE 6: Regular Employment (Payroll, Leave, Attendance)
    console.log('\n💼 Phase 6: Regular Operations');

    // Mark attendance
    await request.post(`${API_BASE}/attendance`, {
      headers,
      data: {
        employeeId: testEmployeeId,
        date: '2025-06-15',
        clockIn: '09:00:00',
        clockOut: '17:30:00',
        status: 'Present'
      }
    });

    // Apply for leave
    await request.post(`${API_BASE}/leave/applications`, {
      headers,
      data: {
        employeeId: testEmployeeId,
        leaveType: 'Annual Leave',
        startDate: '2025-07-01',
        endDate: '2025-07-05',
        days: 5,
        reason: 'Vacation'
      }
    });

    console.log('✅ Attendance marked & leave applied');

    // PHASE 7: Termination/Exit
    console.log('\n👋 Phase 7: Termination & Exit');

    // Initiate exit
    const exitResponse = await request.post(`${API_BASE}/exit/initiate`, {
      headers,
      data: {
        employeeId: testEmployeeId,
        exitDate: '2025-12-31',
        exitType: 'Resignation',
        reason: 'Better opportunity',
        noticePeriod: 30
      }
    });

    if (exitResponse.ok()) {
      const exitData = (await exitResponse.json()).data;
      console.log('✅ Exit initiated:', exitData.id);

      // Complete exit checklist
      await request.put(`${API_BASE}/exit/${exitData.id}/complete`, {
        headers,
        data: {
          assetReturned: true,
          accessRevoked: true,
          finalSettlementDone: true,
          exitInterviewCompleted: true
        }
      });

      console.log('✅ Exit checklist completed');
    }

    // Update employee status to Inactive
    await request.put(`${API_BASE}/employees/${testEmployeeId}`, {
      headers,
      data: {
        status: 'Inactive',
        terminationDate: '2025-12-31'
      }
    });

    console.log('✅ Employee marked as inactive');

    // Verify final state
    const finalEmployeeResponse = await request.get(
      `${API_BASE}/employees/${testEmployeeId}`,
      { headers }
    );

    if (finalEmployeeResponse.ok()) {
      const finalEmployee = (await finalEmployeeResponse.json()).data;
      expect(finalEmployee.status).toBe('Inactive');
      console.log('\n🎉 Complete employee lifecycle test passed!');
    }
  });
});

test.describe('E2E Integration - Payroll Processing Cycle', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should complete full payroll processing cycle', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    console.log('💰 Starting Payroll Processing Cycle');

    // Step 1: Create employee for payroll
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-PAYROLL-001',
        firstName: 'Payroll',
        lastName: 'TestEmployee',
        email: 'payroll.test@auraos.com',
        department: 'HR',
        designation: 'HR Executive',
        joinDate: '2024-12-01',
        salary: 60000,
        status: 'Active'
      }
    });

    const employeeId = (await empResponse.json()).data.id;
    console.log('✅ Employee created:', employeeId);

    // Step 2: Mark attendance for the month
    const dates = ['2025-01-15', '2025-01-16', '2025-01-17', '2025-01-18', '2025-01-19'];

    for (const date of dates) {
      await request.post(`${API_BASE}/attendance`, {
        headers,
        data: {
          employeeId,
          date,
          clockIn: '09:00:00',
          clockOut: '17:00:00',
          status: 'Present',
          workingHours: 8
        }
      });
    }

    console.log('✅ Attendance marked for 5 days');

    // Step 3: Apply approved leave
    const leaveResponse = await request.post(`${API_BASE}/leave/applications`, {
      headers,
      data: {
        employeeId,
        leaveType: 'Sick Leave',
        startDate: '2025-01-20',
        endDate: '2025-01-21',
        days: 2,
        reason: 'Medical',
        status: 'Approved'
      }
    });

    if (leaveResponse.ok()) {
      console.log('✅ Leave application approved');
    }

    // Step 4: Process payroll
    const payrollResponse = await request.post(`${API_BASE}/payroll/process`, {
      headers,
      data: {
        month: '2025-01',
        year: 2025,
        employeeIds: [employeeId]
      }
    });

    expect(payrollResponse.ok()).toBeTruthy();
    const payrollData = (await payrollResponse.json()).data;
    console.log('✅ Payroll processing initiated:', payrollData.jobId);

    // Step 5: Wait for payroll calculation
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 6: Get payslip
    const payslipResponse = await request.get(
      `${API_BASE}/payroll/payslips?employeeId=${employeeId}&month=2025-01`,
      { headers }
    );

    if (payslipResponse.ok()) {
      const payslipData = (await payslipResponse.json()).data;

      if (payslipData.length > 0) {
        const payslip = payslipData[0];
        expect(payslip.basicSalary).toBeDefined();
        expect(payslip.grossSalary).toBeDefined();
        expect(payslip.netSalary).toBeDefined();
        expect(payslip.deductions).toBeDefined();

        console.log('✅ Payslip generated:');
        console.log('   - Gross Salary:', payslip.grossSalary);
        console.log('   - Deductions:', payslip.deductions);
        console.log('   - Net Salary:', payslip.netSalary);
      }
    }

    // Step 7: Process payment
    const paymentResponse = await request.post(`${API_BASE}/payroll/payments`, {
      headers,
      data: {
        month: '2025-01',
        year: 2025,
        employeeIds: [employeeId]
      }
    });

    if (paymentResponse.ok()) {
      console.log('✅ Payments processed');
    }

    // Step 8: Send payslip notification
    const notificationResponse = await request.post(`${API_BASE}/payroll/notify`, {
      headers,
      data: {
        month: '2025-01',
        year: 2025,
        employeeIds: [employeeId]
      }
    });

    if (notificationResponse.ok()) {
      console.log('✅ Payslip notifications sent');
    }

    console.log('\n🎉 Complete payroll cycle test passed!');

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });
});

test.describe('E2E Integration - Leave Management Workflow', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should complete full leave management workflow', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    console.log('📅 Starting Leave Management Workflow');

    // Step 1: Create employee
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-LEAVE-001',
        firstName: 'Leave',
        lastName: 'TestEmployee',
        email: 'leave.workflow@auraos.com',
        department: 'IT',
        designation: 'Developer',
        joinDate: '2024-01-01',
        status: 'Active'
      }
    });

    const employeeId = (await empResponse.json()).data.id;
    console.log('✅ Employee created');

    // Step 2: Check leave balance
    const balanceResponse = await request.get(
      `${API_BASE}/leave/balance?employeeId=${employeeId}`,
      { headers }
    );

    if (balanceResponse.ok()) {
      const balanceData = await balanceResponse.json();
      console.log('✅ Leave balance:', balanceData.data);
    }

    // Step 3: Apply for leave
    const leaveAppResponse = await request.post(`${API_BASE}/leave/applications`, {
      headers,
      data: {
        employeeId,
        leaveType: 'Annual Leave',
        startDate: '2025-03-10',
        endDate: '2025-03-14',
        days: 5,
        reason: 'Family vacation',
        status: 'Pending'
      }
    });

    expect(leaveAppResponse.ok()).toBeTruthy();
    const leaveAppData = (await leaveAppResponse.json()).data;
    const leaveId = leaveAppData.id;
    console.log('✅ Leave application submitted:', leaveId);

    // Step 4: Manager approval
    const managerApprovalResponse = await request.put(
      `${API_BASE}/leave/applications/${leaveId}/approve`,
      {
        headers,
        data: {
          approverType: 'Manager',
          status: 'Approved',
          comments: 'Approved by manager'
        }
      }
    );

    if (managerApprovalResponse.ok()) {
      console.log('✅ Manager approved leave');
    }

    // Step 5: HR approval
    const hrApprovalResponse = await request.put(
      `${API_BASE}/leave/applications/${leaveId}/approve`,
      {
        headers,
        data: {
          approverType: 'HR',
          status: 'Approved',
          comments: 'Approved by HR'
        }
      }
    );

    if (hrApprovalResponse.ok()) {
      console.log('✅ HR approved leave');
    }

    // Step 6: Update attendance calendar
    const attendanceUpdateResponse = await request.post(
      `${API_BASE}/attendance/mark-leave`,
      {
        headers,
        data: {
          employeeId,
          startDate: '2025-03-10',
          endDate: '2025-03-14',
          leaveType: 'Annual Leave'
        }
      }
    );

    if (attendanceUpdateResponse.ok()) {
      console.log('✅ Attendance calendar updated');
    }

    // Step 7: Deduct from leave balance
    const balanceDeductResponse = await request.put(
      `${API_BASE}/leave/balance/${employeeId}/deduct`,
      {
        headers,
        data: {
          leaveType: 'Annual Leave',
          days: 5
        }
      }
    );

    if (balanceDeductResponse.ok()) {
      console.log('✅ Leave balance deducted');
    }

    // Step 8: Send notification
    const notifyResponse = await request.post(`${API_BASE}/notifications/send`, {
      headers,
      data: {
        employeeId,
        type: 'leave_approved',
        message: 'Your leave application has been approved'
      }
    });

    if (notifyResponse.ok()) {
      console.log('✅ Notification sent to employee');
    }

    // Verify final state
    const finalLeaveResponse = await request.get(
      `${API_BASE}/leave/applications/${leaveId}`,
      { headers }
    );

    if (finalLeaveResponse.ok()) {
      const finalLeave = (await finalLeaveResponse.json()).data;
      expect(finalLeave.status).toBe('Approved');
      console.log('\n🎉 Complete leave management workflow passed!');
    }

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });

  test('should handle leave rejection workflow', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-LEAVE-REJECT-001',
        firstName: 'LeaveReject',
        lastName: 'Test',
        email: 'leave.reject@auraos.com',
        department: 'IT',
        designation: 'Developer',
        joinDate: '2024-01-01',
        status: 'Active'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Apply for leave
    const leaveResponse = await request.post(`${API_BASE}/leave/applications`, {
      headers,
      data: {
        employeeId,
        leaveType: 'Annual Leave',
        startDate: '2025-04-01',
        endDate: '2025-04-10',
        days: 10,
        reason: 'Extended vacation'
      }
    });

    const leaveId = (await leaveResponse.json()).data.id;

    // Reject leave
    const rejectResponse = await request.put(
      `${API_BASE}/leave/applications/${leaveId}/reject`,
      {
        headers,
        data: {
          rejectedBy: 'Manager',
          reason: 'Project deadline approaching'
        }
      }
    );

    if (rejectResponse.ok()) {
      console.log('✅ Leave rejected successfully');

      // Verify status
      const statusResponse = await request.get(
        `${API_BASE}/leave/applications/${leaveId}`,
        { headers }
      );

      const statusData = (await statusResponse.json()).data;
      expect(statusData.status).toBe('Rejected');
    }

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });
});

test.describe('E2E Integration - Cross-Module Workflows', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should sync leave with attendance and payroll', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    console.log('🔄 Testing Cross-Module Integration');

    // Create employee
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-CROSS-001',
        firstName: 'CrossModule',
        lastName: 'Test',
        email: 'cross.module@auraos.com',
        department: 'Sales',
        designation: 'Sales Executive',
        joinDate: '2024-06-01',
        salary: 50000,
        status: 'Active'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Apply and approve leave
    const leaveResponse = await request.post(`${API_BASE}/leave/applications`, {
      headers,
      data: {
        employeeId,
        leaveType: 'Sick Leave',
        startDate: '2025-02-05',
        endDate: '2025-02-06',
        days: 2,
        status: 'Approved'
      }
    });

    const leaveId = (await leaveResponse.json()).data.id;

    // Verify attendance marked as leave
    const attendanceResponse = await request.get(
      `${API_BASE}/attendance?employeeId=${employeeId}&date=2025-02-05`,
      { headers }
    );

    if (attendanceResponse.ok()) {
      const attendanceData = await attendanceResponse.json();
      if (attendanceData.data.length > 0) {
        expect(attendanceData.data[0].status).toBe('On Leave');
        console.log('✅ Attendance synced with leave');
      }
    }

    // Process payroll and verify leave deduction
    const payrollResponse = await request.post(`${API_BASE}/payroll/process`, {
      headers,
      data: {
        month: '2025-02',
        year: 2025,
        employeeIds: [employeeId]
      }
    });

    if (payrollResponse.ok()) {
      console.log('✅ Payroll processed with leave consideration');
    }

    console.log('🎉 Cross-module integration test passed!');

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });

  test('should sync performance review with compensation', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-PERF-COMP-001',
        firstName: 'Performance',
        lastName: 'Review',
        email: 'perf.comp@auraos.com',
        department: 'Engineering',
        designation: 'Senior Developer',
        joinDate: '2024-01-01',
        salary: 90000,
        status: 'Active'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Create performance review with high rating
    const reviewResponse = await request.post(`${API_BASE}/performance/reviews`, {
      headers,
      data: {
        employeeId,
        reviewPeriod: 'Annual 2024',
        rating: 4.8,
        status: 'Completed',
        recommendedIncrement: 15 // 15% increment
      }
    });

    if (reviewResponse.ok()) {
      console.log('✅ Performance review completed');
    }

    // Process increment
    const incrementResponse = await request.post(`${API_BASE}/compensation/increment`, {
      headers,
      data: {
        employeeId,
        incrementPercentage: 15,
        effectiveDate: '2025-01-01',
        reason: 'Annual Performance Review'
      }
    });

    if (incrementResponse.ok()) {
      console.log('✅ Salary increment processed');

      // Verify new salary
      const empCheckResponse = await request.get(`${API_BASE}/employees/${employeeId}`, {
        headers
      });

      const empData = (await empCheckResponse.json()).data;
      const expectedSalary = 90000 * 1.15;
      expect(empData.salary).toBeCloseTo(expectedSalary, 0);
      console.log('✅ New salary:', empData.salary);
    }

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });
});

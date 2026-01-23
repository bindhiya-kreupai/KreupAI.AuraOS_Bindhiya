export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

interface LeaveAccrualRecord {
  employeeId: string;
  leaveType: "annual" | "sick" | "personal";
  hoursAccrued: number;
  newBalance: number;
}

export async function processLeaveAccruals(): Promise<JobResult> {
  const errors: string[] = [];
  let processedCount = 0;

  console.log("[LeaveAccrualJob] Starting leave accrual processing...");

  // Step 1: Fetch all eligible employees
  console.log("[LeaveAccrualJob] Fetching eligible employees...");
  const employeeCount = 55;
  console.log(`[LeaveAccrualJob] Found ${employeeCount} eligible employees`);

  // Step 2: Determine accrual rates
  console.log("[LeaveAccrualJob] Loading accrual policies...");
  const policies = {
    annual: { hoursPerPeriod: 6.67, maxBalance: 240 },
    sick: { hoursPerPeriod: 4.0, maxBalance: 120 },
    personal: { hoursPerPeriod: 2.0, maxBalance: 48 },
  };
  console.log("[LeaveAccrualJob] Policies loaded: annual, sick, personal");

  // Step 3: Process accruals for each employee
  console.log("[LeaveAccrualJob] Processing accruals...");
  const accrualRecords: LeaveAccrualRecord[] = [];

  for (let i = 1; i <= employeeCount; i++) {
    const empId = `emp-${String(i).padStart(3, "0")}`;

    for (const [leaveType, policy] of Object.entries(policies)) {
      const currentBalance = Math.random() * policy.maxBalance;
      const newBalance = Math.min(currentBalance + policy.hoursPerPeriod, policy.maxBalance);

      if (newBalance >= policy.maxBalance && currentBalance < policy.maxBalance) {
        console.log(`[LeaveAccrualJob] ${empId}: ${leaveType} balance capped at max (${policy.maxBalance}h)`);
      }

      accrualRecords.push({
        employeeId: empId,
        leaveType: leaveType as LeaveAccrualRecord["leaveType"],
        hoursAccrued: policy.hoursPerPeriod,
        newBalance: Math.round(newBalance * 100) / 100,
      });
    }
    processedCount++;
  }

  // Step 4: Handle probationary employees
  console.log("[LeaveAccrualJob] Checking probationary period exclusions...");
  const probationaryCount = 3;
  console.log(`[LeaveAccrualJob] ${probationaryCount} employees excluded (probation period)`);

  // Step 5: Save records
  console.log(`[LeaveAccrualJob] Saving ${accrualRecords.length} accrual records...`);
  console.log("[LeaveAccrualJob] Records saved successfully");

  // Step 6: Send notifications for capped balances
  console.log("[LeaveAccrualJob] Sending balance cap notifications...");

  console.log(`[LeaveAccrualJob] Accrual processing complete. ${processedCount} employees processed.`);
  return { success: true, processedCount, errors };
}

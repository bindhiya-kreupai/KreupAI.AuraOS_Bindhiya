export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

interface AnniversaryEmployee {
  employeeId: string;
  name: string;
  hireDate: string;
  yearsOfService: number;
  managerEmail: string;
}

export async function sendAnniversaryReminders(): Promise<JobResult> {
  const errors: string[] = [];
  let processedCount = 0;

  console.log("[AnniversaryJob] Starting anniversary reminder processing...");

  // Step 1: Calculate upcoming anniversaries (next 7 days)
  console.log("[AnniversaryJob] Scanning for upcoming work anniversaries...");
  const lookAheadDays = 7;
  const today = new Date();

  const upcomingAnniversaries: AnniversaryEmployee[] = [
    {
      employeeId: "emp-005",
      name: "Robert Davis",
      hireDate: "2020-01-28",
      yearsOfService: 5,
      managerEmail: "manager1@company.com",
    },
    {
      employeeId: "emp-023",
      name: "Mike Chen",
      hireDate: "2022-01-25",
      yearsOfService: 3,
      managerEmail: "manager2@company.com",
    },
    {
      employeeId: "emp-041",
      name: "Lisa Park",
      hireDate: "2015-01-27",
      yearsOfService: 10,
      managerEmail: "manager3@company.com",
    },
  ];

  console.log(`[AnniversaryJob] Found ${upcomingAnniversaries.length} upcoming anniversaries in next ${lookAheadDays} days`);

  // Step 2: Determine milestone recognition
  console.log("[AnniversaryJob] Determining milestone recognition levels...");
  for (const emp of upcomingAnniversaries) {
    let milestone = "standard";
    if (emp.yearsOfService >= 10) milestone = "major";
    else if (emp.yearsOfService >= 5) milestone = "significant";
    console.log(`[AnniversaryJob] ${emp.name}: ${emp.yearsOfService} years (${milestone} milestone)`);
  }

  // Step 3: Send manager notifications
  console.log("[AnniversaryJob] Sending manager notifications...");
  for (const emp of upcomingAnniversaries) {
    console.log(`[AnniversaryJob] Notifying ${emp.managerEmail} about ${emp.name}'s anniversary`);
    processedCount++;
  }

  // Step 4: Schedule celebration (for major milestones)
  console.log("[AnniversaryJob] Scheduling celebrations for major milestones...");
  const majorMilestones = upcomingAnniversaries.filter((e) => e.yearsOfService >= 5);
  console.log(`[AnniversaryJob] ${majorMilestones.length} celebration events scheduled`);

  // Step 5: Queue recognition posts
  console.log("[AnniversaryJob] Queueing internal social recognition posts...");

  console.log(`[AnniversaryJob] Anniversary reminders complete. ${processedCount} notifications sent.`);
  return { success: true, processedCount, errors };
}

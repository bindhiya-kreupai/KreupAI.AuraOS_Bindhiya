import { prisma } from '@aura/database';

export type MatchEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string;
  skills: string[];
};

export type MatchJob = {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  location?: string | null;
};

/** Tenant-scoped: employees via company + open JobRequisition rows. */
export async function retrieveTenantMatchInputs(tenantId: string) {
  const [employees, jobs, runs] = await Promise.all([
    prisma.employee.findMany({
      where: { isDeleted: false, company: { tenantId, isDeleted: false } },
      take: 100,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
      },
    }),
    prisma.jobRequisition.findMany({
      where: {
        tenantId,
        isDeleted: false,
        NOT: { status: { in: ['Closed', 'Cancelled', 'Rejected'] } },
      },
      take: 50,
      select: {
        id: true,
        jobTitle: true,
        department: true,
        requiredSkills: true,
        location: true,
      },
    }),
    prisma.aIRunRecord
      .findMany({
        where: { tenantId, runType: 'job_matching', isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
      .catch(() => []),
  ]);

  const employeeIds = employees.map((e) => e.id);
  const certifications =
    employeeIds.length > 0
      ? await prisma.certification.findMany({
          where: {
            tenantId,
            employeeId: { in: employeeIds },
            isDeleted: false,
          },
          select: { employeeId: true, skills: true },
        })
      : [];

  const skillsByEmployee = new Map<string, Set<string>>();
  for (const cert of certifications) {
    const set = skillsByEmployee.get(cert.employeeId) || new Set<string>();
    for (const skill of cert.skills) set.add(skill);
    skillsByEmployee.set(cert.employeeId, set);
  }

  const matchEmployees: MatchEmployee[] = employees.map((e) => ({
    id: e.id,
    firstName: e.firstName,
    lastName: e.lastName,
    department: e.department?.name,
    skills: Array.from(skillsByEmployee.get(e.id) || []),
  }));

  const matchJobs: MatchJob[] = jobs.map((j) => ({
    id: j.id,
    title: j.jobTitle,
    department: j.department,
    requiredSkills: j.requiredSkills || [],
    location: j.location,
  }));

  return { employees: matchEmployees, jobs: matchJobs, runs };
}

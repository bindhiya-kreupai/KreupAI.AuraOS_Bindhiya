import { prisma } from '@aura/database';
import { emptyMatchDashboard } from './job-matching-fallback';
import { retrieveTenantMatchInputs } from './job-matching-retrieval';
import { scoreSkillOverlap } from './job-matching-rules';
import type { MatchDashboard, JobMatchRow } from './job-matching-types';

function toMatchRow(partial: {
  candidateId?: string;
  jobId?: string;
  name?: string;
  role: string;
  department?: string;
  matchScore: number;
  skillsMatched?: string[];
  skillsMissing?: string[];
}): JobMatchRow {
  return {
    candidateId: partial.candidateId,
    jobId: partial.jobId,
    name: partial.name,
    role: partial.role,
    jobTitle: partial.role,
    department: partial.department,
    matchScore: partial.matchScore,
    match_score: partial.matchScore,
    skillsMatched: partial.skillsMatched,
    skillsMissing: partial.skillsMissing,
    action: partial.matchScore >= 80 ? 'Recommended' : undefined,
  };
}

export async function getJobMatches(
  tenantId: string,
  options: {
    view?: string | null;
    jobId?: string | null;
    candidateId?: string | null;
    userId?: string;
  }
): Promise<MatchDashboard> {
  try {
    const data = await retrieveTenantMatchInputs(tenantId);
    const matches: JobMatchRow[] = [];

    const jobs = options.jobId ? data.jobs.filter((j) => j.id === options.jobId) : data.jobs;
    const employees = options.candidateId
      ? data.employees.filter((e) => e.id === options.candidateId)
      : data.employees;

    if (options.view === 'candidate' && options.candidateId) {
      const employee = employees[0];
      if (employee) {
        for (const job of jobs) {
          const overlap = scoreSkillOverlap(employee.skills, job.requiredSkills);
          matches.push(
            toMatchRow({
              candidateId: employee.id,
              jobId: job.id,
              name: `${employee.firstName} ${employee.lastName}`,
              role: job.title,
              department: job.department,
              matchScore: overlap.score,
              skillsMatched: overlap.skillsMatched,
              skillsMissing: overlap.skillsMissing,
            })
          );
        }
      }
    } else if (options.view === 'job' && options.jobId) {
      const job = jobs[0];
      if (job) {
        for (const employee of employees) {
          const overlap = scoreSkillOverlap(employee.skills, job.requiredSkills);
          if (overlap.score <= 0 && job.requiredSkills.length > 0) continue;
          matches.push(
            toMatchRow({
              candidateId: employee.id,
              jobId: job.id,
              name: `${employee.firstName} ${employee.lastName}`,
              role: job.title,
              department: job.department,
              matchScore: overlap.score,
              skillsMatched: overlap.skillsMatched,
              skillsMissing: overlap.skillsMissing,
            })
          );
        }
      }
    } else {
      // Internal mobility: top employee×job pairs (cap for dashboard)
      for (const employee of employees.slice(0, 20)) {
        for (const job of jobs.slice(0, 10)) {
          const overlap = scoreSkillOverlap(employee.skills, job.requiredSkills);
          if (job.requiredSkills.length && overlap.score < 30) continue;
          matches.push(
            toMatchRow({
              candidateId: employee.id,
              jobId: job.id,
              name: `${employee.firstName} ${employee.lastName}`,
              role: job.title,
              department: job.department,
              matchScore: overlap.score,
              skillsMatched: overlap.skillsMatched,
              skillsMissing: overlap.skillsMissing,
            })
          );
        }
      }
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);
    const top = matches.slice(0, 25);

    return {
      matches: top,
      summary: {
        activeJobs: data.jobs.length,
        totalCandidates: data.employees.length,
        matchesFound: top.length,
        avgMatchScore: top.length
          ? Math.round(top.reduce((sum, m) => sum + m.matchScore, 0) / top.length)
          : 0,
      },
    };
  } catch {
    return emptyMatchDashboard();
  }
}

export async function persistJobMatches(
  tenantId: string,
  userId: string,
  dashboard: MatchDashboard
) {
  return prisma.aIRunRecord
    .create({
      data: {
        tenantId,
        runType: 'job_matching',
        output: dashboard as object,
        completedAt: new Date(),
        createdBy: userId,
      },
    })
    .catch(() => null);
}

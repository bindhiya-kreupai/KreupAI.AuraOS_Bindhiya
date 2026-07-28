/**
 * HR Coaching retrieval — policy RAG + live employee/workforce grounding
 * Campus SubjectChatbot pattern: retrieve context before LLM generation
 */

import { prisma } from '@aura/database';
import { policyDocumentHref } from './coaching-references';

export type PolicyCitation = {
  index: number;
  policyId: string;
  title: string;
  category: string;
  version: string;
  snippet: string;
  similarity: number;
  source: string;
};

export type EmployeeGrounding = {
  employeeId: string;
  employeeCode: string;
  name: string;
  department?: string;
  jobTitle?: string;
  managerName?: string;
  tenureMonths?: number;
  pendingLeaveRequests: number;
  approvedLeaveDaysYtd: number;
  latestPerformanceRating?: number;
  performanceReviewStatus?: string;
  directReports: number;
};

export type WorkforceSnapshot = {
  pendingLeaveApprovals: number;
  employeesOnLeaveNow: number;
  openPerformanceReviews: number;
  publishedPoliciesCount: number;
};

export type HRRetrievalContext = {
  policies: PolicyCitation[];
  employee?: EmployeeGrounding;
  workforce?: WorkforceSnapshot;
  retrievalNote?: string;
};

export type RetrieveOptions = {
  tenantId: string;
  query: string;
  employeeId?: string;
  employeeSearch?: string;
  canReadEmployees?: boolean;
  topK?: number;
};

function tokenize(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function extractSnippet(content: string, terms: string[], maxLen = 420): string {
  const text = String(content || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';

  const lower = text.toLowerCase();
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx >= 0) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(text.length, idx + maxLen - 80);
      return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
    }
  }
  return text.slice(0, maxLen) + (text.length > maxLen ? '...' : '');
}

function scorePolicy(
  terms: string[],
  policy: {
    title: string;
    category: string;
    summary?: string | null;
    contentMarkdown?: string | null;
  }
): number {
  if (!terms.length) return 0;

  const title = policy.title.toLowerCase();
  const category = policy.category.toLowerCase();
  const summary = String(policy.summary || '').toLowerCase();
  const body = String(policy.contentMarkdown || '').toLowerCase();

  let hits = 0;
  for (const term of terms) {
    if (title.includes(term)) hits += 3;
    if (category.includes(term)) hits += 2;
    if (summary.includes(term)) hits += 2;
    if (body.includes(term)) hits += 1;
  }
  return hits / (terms.length * 3);
}

function inferEmployeeSearch(query: string): string | null {
  const q = String(query || '').trim();
  const explicit = q.match(
    /(?:employee|staff|worker|about|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  if (explicit?.[1]) return explicit[1].trim();

  const quoted = q.match(/"([^"]{2,60})"/);
  if (quoted?.[1]) return quoted[1].trim();

  const words = q.split(/\s+/).filter((w) => /^[A-Z][a-z]+$/.test(w));
  if (words.length >= 2) return words.slice(0, 2).join(' ');

  return null;
}

export async function searchPublishedPolicies(
  tenantId: string,
  query: string,
  topK = 4
): Promise<PolicyCitation[]> {
  const terms = tokenize(query);
  const policies = await (prisma as any).policyDocument.findMany({
    where: {
      tenantId,
      status: 'PUBLISHED',
      isDeleted: false,
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      category: true,
      version: true,
      summary: true,
      contentMarkdown: true,
    },
  });

  const ranked = (policies as any[])
    .map((policy) => ({
      policy,
      score: scorePolicy(terms, policy),
    }))
    .filter((r) => r.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // If no keyword hits, return top policies by category relevance or recent
  const selected =
    ranked.length > 0
      ? ranked
      : (policies as any[]).slice(0, Math.min(topK, 2)).map((policy) => ({ policy, score: 0.15 }));

  return selected.map(({ policy, score }, i) => {
    const snippet = extractSnippet(policy.contentMarkdown || policy.summary || policy.title, terms);
    return {
      index: i + 1,
      policyId: policy.id,
      title: policy.title,
      category: policy.category,
      version: policy.version,
      snippet,
      similarity: Math.round(Math.min(score, 1) * 100) / 100,
      source: `${policy.category} · v${policy.version}`,
    };
  });
}

async function findEmployeeForTenant(
  tenantId: string,
  opts: { employeeId?: string; search?: string }
) {
  const baseWhere: Record<string, unknown> = {
    isDeleted: false,
    company: { tenantId },
  };

  if (opts.employeeId) {
    return prisma.employee.findFirst({
      where: { ...baseWhere, id: opts.employeeId },
      include: {
        department: { select: { name: true } },
        jobProfile: { select: { title: true } },
        manager: { select: { firstName: true, lastName: true } },
        _count: { select: { reports: true } },
      },
    });
  }

  const search = String(opts.search || '').trim();
  if (!search) return null;

  return prisma.employee.findFirst({
    where: {
      ...baseWhere,
      OR: [
        { firstName: { contains: search.split(' ')[0], mode: 'insensitive' } },
        { lastName: { contains: search.split(' ').slice(-1)[0], mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    },
    include: {
      department: { select: { name: true } },
      jobProfile: { select: { title: true } },
      manager: { select: { firstName: true, lastName: true } },
      _count: { select: { reports: true } },
    },
  });
}

async function buildEmployeeGrounding(
  tenantId: string,
  employeeId: string
): Promise<EmployeeGrounding | undefined> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, isDeleted: false, company: { tenantId } },
    include: {
      department: { select: { name: true } },
      jobProfile: { select: { title: true } },
      manager: { select: { firstName: true, lastName: true } },
      _count: { select: { reports: true } },
    },
  });

  if (!employee) return undefined;

  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [pendingLeave, leaveAgg, latestReview] = await Promise.all([
    prisma.leaveRequest.count({
      where: { tenantId, employeeId, status: 'PENDING', isDeleted: false },
    }),
    prisma.leaveRequest.aggregate({
      where: {
        tenantId,
        employeeId,
        status: 'APPROVED',
        isDeleted: false,
        startDate: { gte: yearStart },
      },
      _sum: { totalDays: true },
    }),
    prisma.performanceReview.findFirst({
      where: { tenantId, employeeId, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      select: {
        finalRating: true,
        managerRating: true,
        selfRating: true,
        status: true,
      },
    }),
  ]);

  const tenureMonths = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(employee.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )
  );

  const rating =
    latestReview?.finalRating ??
    latestReview?.managerRating ??
    latestReview?.selfRating ??
    undefined;

  return {
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    name: `${employee.firstName} ${employee.lastName}`,
    department: employee.department?.name,
    jobTitle: employee.jobProfile?.title,
    managerName: employee.manager
      ? `${employee.manager.firstName} ${employee.manager.lastName}`
      : undefined,
    tenureMonths,
    pendingLeaveRequests: pendingLeave,
    approvedLeaveDaysYtd: Number(leaveAgg._sum.totalDays || 0),
    latestPerformanceRating: rating,
    performanceReviewStatus: latestReview?.status,
    directReports: employee._count?.reports ?? 0,
  };
}

export async function getWorkforceSnapshot(tenantId: string): Promise<WorkforceSnapshot> {
  const now = new Date();
  const [
    pendingLeaveApprovals,
    employeesOnLeaveNow,
    openPerformanceReviews,
    publishedPoliciesCount,
  ] = await Promise.all([
    prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING', isDeleted: false },
    }),
    prisma.leaveRequest.count({
      where: {
        tenantId,
        status: 'APPROVED',
        isDeleted: false,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    }),
    prisma.performanceReview.count({
      where: {
        tenantId,
        isDeleted: false,
        status: { in: ['draft', 'in_progress', 'pending', 'submitted'] },
      },
    }),
    (prisma as any).policyDocument.count({
      where: { tenantId, status: 'PUBLISHED', isDeleted: false },
    }),
  ]);

  return {
    pendingLeaveApprovals,
    employeesOnLeaveNow,
    openPerformanceReviews,
    publishedPoliciesCount,
  };
}

export async function retrieveHRContext(options: RetrieveOptions): Promise<HRRetrievalContext> {
  const {
    tenantId,
    query,
    employeeId,
    employeeSearch,
    canReadEmployees = false,
    topK = 4,
  } = options;

  const policies = await searchPublishedPolicies(tenantId, query, topK);
  const workforce = await getWorkforceSnapshot(tenantId);

  let employee: EmployeeGrounding | undefined;
  if (canReadEmployees) {
    const searchTerm = employeeSearch || inferEmployeeSearch(query);
    const match = await findEmployeeForTenant(tenantId, {
      employeeId,
      search: searchTerm || undefined,
    });
    if (match) {
      employee = await buildEmployeeGrounding(tenantId, match.id);
    }
  }

  const parts: string[] = [];
  if (policies.length) parts.push(`${policies.length} policy excerpt(s)`);
  if (employee) parts.push(`employee context for ${employee.name}`);
  if (workforce.pendingLeaveApprovals) {
    parts.push(`${workforce.pendingLeaveApprovals} pending leave approval(s)`);
  }

  return {
    policies,
    employee,
    workforce,
    retrievalNote: parts.length
      ? `Grounded with ${parts.join(', ')}`
      : 'No tenant-specific matches',
  };
}

export function retrievalToPromptBlock(ctx: HRRetrievalContext): string {
  const blocks: string[] = [];

  if (ctx.policies.length) {
    blocks.push(
      '--- RETRIEVED HR POLICIES (cite these by title + version when used) ---',
      JSON.stringify(
        ctx.policies.map((p) => ({
          index: p.index,
          title: p.title,
          version: p.version,
          category: p.category,
          excerpt: p.snippet,
          relevance: p.similarity,
        })),
        null,
        2
      )
    );
  }

  if (ctx.employee) {
    blocks.push(
      '--- EMPLOYEE CONTEXT (tenant data — use for decisions, protect privacy) ---',
      JSON.stringify(ctx.employee, null, 2)
    );
  }

  if (ctx.workforce) {
    blocks.push('--- WORKFORCE SNAPSHOT ---', JSON.stringify(ctx.workforce, null, 2));
  }

  return blocks.join('\n\n');
}

export function retrievalToCitations(ctx: HRRetrievalContext) {
  return ctx.policies.map((p) => ({
    title: p.title,
    source: `${p.source} · ${Math.round(p.similarity * 100)}% match`,
    policyId: p.policyId,
    href: p.policyId ? policyDocumentHref(p.policyId) : undefined,
    index: p.index,
    snippet: p.snippet,
    similarity: p.similarity,
  }));
}

export async function getLiveRecommendations(tenantId: string) {
  const workforce = await getWorkforceSnapshot(tenantId);
  const recommendations: {
    type: string;
    title: string;
    action: string;
    relevance: number;
  }[] = [];

  if (workforce.pendingLeaveApprovals > 0) {
    recommendations.push({
      type: 'AUTOMATION',
      title: 'Auto-approve eligible leave requests',
      action: `${workforce.pendingLeaveApprovals} pending approval(s)`,
      relevance: 0.94,
    });
  }

  if (workforce.openPerformanceReviews > 0) {
    recommendations.push({
      type: 'DECISION',
      title: 'Performance reviews in progress',
      action: `${workforce.openPerformanceReviews} open review(s)`,
      relevance: 0.89,
    });
  }

  if (workforce.employeesOnLeaveNow > 0) {
    recommendations.push({
      type: 'ALERT',
      title: 'Team coverage check',
      action: `${workforce.employeesOnLeaveNow} employee(s) on leave today`,
      relevance: 0.86,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'GUIDANCE',
      title: 'Review published HR policies',
      action: `${workforce.publishedPoliciesCount} published policy document(s)`,
      relevance: 0.8,
    });
  }

  return recommendations;
}

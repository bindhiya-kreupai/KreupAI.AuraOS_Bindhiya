/**
 * Job Library Module — shared client types.
 */

export interface JobFamilyRef {
  id: string;
  name: string;
}

export interface JobGradeRef {
  id: string;
  code: string;
}

export interface JobCatalogRow {
  id: string;
  code: string;
  title: string;
  status: string;
  updatedAt: string;
  family: JobFamilyRef | null;
  grade: JobGradeRef | null;
}

export interface JobFamily {
  id: string;
  code: string;
  name: string;
  functionId: string;
  functionName: string | null;
  roleCount: number;
}

export interface JobFunction {
  id: string;
  code: string;
  name: string;
}

export interface JobEvaluation {
  id: string;
  jobTitle: string;
  familyName: string | null;
  method: string;
  status: string;
  score: number | null;
  assignedGrade: string | null;
  evaluatorName: string | null;
  submittedAt: string;
  completedAt: string | null;
}

export interface GradeDistributionBucket {
  grade: string;
  count: number;
}

export interface EvaluationBoard {
  pending: JobEvaluation[];
  completed: JobEvaluation[];
  distribution: GradeDistributionBucket[];
  total: number;
}

export interface JobPostingTemplate {
  id: string;
  name: string;
  category: string;
  sections: string[];
  body: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  updatedAt: string;
}

export interface MarketPricingRow {
  id: string;
  jobTitle: string;
  gradeLabel: string | null;
  region: string;
  industry: string;
  companySize: string | null;
  currency: string;
  marketMin: number | null;
  marketMid: number | null;
  marketMax: number | null;
  internalMedian: number | null;
  marketTrend: string;
  diffPercent: number | null;
}

export interface CompensationStrategy {
  id: string;
  targetPercentile: number;
  scope: string;
  description: string | null;
}

export interface MarketPricingBoard {
  items: MarketPricingRow[];
  strategy: CompensationStrategy | null;
  filters: { regions: string[]; industries: string[] };
}

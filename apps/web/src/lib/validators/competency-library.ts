import { z } from 'zod';

// Common schemas
const StatusEnum = z.enum(['Active', 'Inactive']);
const AssessmentTypeEnum = z.enum(['Self', 'Manager', 'Peer', 'ThreeSixty']);
const GapAnalysisTypeEnum = z.enum(['Individual', 'Team', 'Department', 'Organization']);

// Competency Category Schemas
export const CreateCompetencyCategorySchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be at most 50 characters'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const UpdateCompetencyCategorySchema = CreateCompetencyCategorySchema.partial();

// Competency Catalog Schemas
export const CreateCompetencySchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  subcategoryId: z.string().uuid('Invalid subcategory ID').optional(),
  level: z.string().max(50).optional(),
  keywords: z.array(z.string()).optional(),
  behavioralIndicators: z.array(z.string()).optional(),
});

export const UpdateCompetencySchema = CreateCompetencySchema.partial();

// Proficiency Framework Schemas
export const CreateProficiencyFrameworkSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  levels: z.array(z.object({
    level: z.number().int().min(1),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    behavioralIndicators: z.array(z.string()).optional(),
  })).min(1, 'At least one level is required'),
});

export const UpdateProficiencyFrameworkSchema = CreateProficiencyFrameworkSchema.partial();

// Job Role Schemas
export const CreateJobRoleSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  level: z.string().max(50).optional(),
  competencies: z.array(z.object({
    competencyId: z.string().uuid(),
    requiredLevel: z.number().int().min(1),
    importance: z.enum(['Critical', 'Important', 'Desirable']).optional(),
  })).optional(),
});

export const UpdateJobRoleSchema = CreateJobRoleSchema.partial();

// Skill Assessment Schemas
export const CreateSkillAssessmentSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  assessorId: z.string().uuid('Invalid assessor ID').optional(),
  type: AssessmentTypeEnum,
  assessmentDate: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().or(z.date()).optional(),
  status: z.enum(['Draft', 'InProgress', 'Completed', 'Cancelled']).optional().default('Draft'),
  competencies: z.array(z.object({
    competencyId: z.string().uuid(),
    targetLevel: z.number().int().min(1),
  })).optional(),
});

export const UpdateSkillAssessmentSchema = CreateSkillAssessmentSchema.partial();

export const SubmitAssessmentResultsSchema = z.object({
  results: z.array(z.object({
    competencyId: z.string().uuid(),
    currentLevel: z.number().int().min(0),
    targetLevel: z.number().int().min(1),
    gap: z.number().int(),
    comments: z.string().optional(),
    evidence: z.string().optional(),
  })).min(1, 'At least one result is required'),
  overallComments: z.string().optional(),
  completedDate: z.string().datetime().or(z.date()).optional(),
});

// Gap Analysis Schemas
export const CreateGapAnalysisSchema = z.object({
  type: GapAnalysisTypeEnum,
  entityId: z.string().uuid('Invalid entity ID'),
  analysisDate: z.string().datetime().or(z.date()),
  assessmentId: z.string().uuid().optional(),
  status: z.enum(['Draft', 'InProgress', 'Completed']).optional().default('Draft'),
  items: z.array(z.object({
    competencyId: z.string().uuid(),
    currentLevel: z.number().int().min(0),
    targetLevel: z.number().int().min(1),
    gap: z.number().int(),
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    recommendations: z.string().optional(),
  })).optional(),
});

export const UpdateGapAnalysisSchema = CreateGapAnalysisSchema.partial();

// Development Plan Schemas
export const CreateDevelopmentPlanSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  gapAnalysisId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  status: z.enum(['Draft', 'Active', 'OnHold', 'Completed', 'Cancelled']).optional().default('Draft'),
  activities: z.array(z.object({
    type: z.enum(['Training', 'Mentoring', 'OnTheJobTraining', 'SelfStudy', 'Project', 'Other']),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    competencyId: z.string().uuid().optional(),
    targetCompletionDate: z.string().datetime().or(z.date()).optional(),
    cost: z.number().min(0).optional(),
  })).optional(),
  milestones: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    targetDate: z.string().datetime().or(z.date()),
    competencyId: z.string().uuid().optional(),
  })).optional(),
});

export const UpdateDevelopmentPlanSchema = CreateDevelopmentPlanSchema.partial();

// Query Parameter Schemas
export const CompetencyQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  level: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: StatusEnum.optional(),
});

export const JobRoleQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  level: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const AssessmentQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  assessorId: z.string().uuid().optional(),
  type: AssessmentTypeEnum.optional(),
  status: z.enum(['Draft', 'InProgress', 'Completed', 'Cancelled']).optional(),
  fromDate: z.string().datetime().or(z.date()).optional(),
  toDate: z.string().datetime().or(z.date()).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const GapAnalysisQuerySchema = z.object({
  type: GapAnalysisTypeEnum.optional(),
  entityId: z.string().uuid().optional(),
  status: z.enum(['Draft', 'InProgress', 'Completed']).optional(),
  fromDate: z.string().datetime().or(z.date()).optional(),
  toDate: z.string().datetime().or(z.date()).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const DevelopmentPlanQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(['Draft', 'Active', 'OnHold', 'Completed', 'Cancelled']).optional(),
  fromDate: z.string().datetime().or(z.date()).optional(),
  toDate: z.string().datetime().or(z.date()).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Type exports
export type CreateCompetencyCategoryInput = z.infer<typeof CreateCompetencyCategorySchema>;
export type UpdateCompetencyCategoryInput = z.infer<typeof UpdateCompetencyCategorySchema>;
export type CreateCompetencyInput = z.infer<typeof CreateCompetencySchema>;
export type UpdateCompetencyInput = z.infer<typeof UpdateCompetencySchema>;
export type CreateProficiencyFrameworkInput = z.infer<typeof CreateProficiencyFrameworkSchema>;
export type UpdateProficiencyFrameworkInput = z.infer<typeof UpdateProficiencyFrameworkSchema>;
export type CreateJobRoleInput = z.infer<typeof CreateJobRoleSchema>;
export type UpdateJobRoleInput = z.infer<typeof UpdateJobRoleSchema>;
export type CreateSkillAssessmentInput = z.infer<typeof CreateSkillAssessmentSchema>;
export type UpdateSkillAssessmentInput = z.infer<typeof UpdateSkillAssessmentSchema>;
export type SubmitAssessmentResultsInput = z.infer<typeof SubmitAssessmentResultsSchema>;
export type CreateGapAnalysisInput = z.infer<typeof CreateGapAnalysisSchema>;
export type UpdateGapAnalysisInput = z.infer<typeof UpdateGapAnalysisSchema>;
export type CreateDevelopmentPlanInput = z.infer<typeof CreateDevelopmentPlanSchema>;
export type UpdateDevelopmentPlanInput = z.infer<typeof UpdateDevelopmentPlanSchema>;

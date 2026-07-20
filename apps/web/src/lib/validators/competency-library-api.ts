/**
 * Zod schemas + bilingual validation helper matching the ACTUAL
 * /api/competency-library/* route contracts (prisma.competencyCatalog,
 * proficiencyFramework, jobRole, skillAssessment, gapAnalysis,
 * developmentPlan). Kept separate from the aspirational validators in
 * ./competency-library.ts so the API layer validates against the real shapes.
 *
 * IDs are validated as non-empty strings (not strict UUIDs) because this is a
 * global reference catalog seeded with human-readable identifiers in some
 * environments; requiring `.uuid()` would reject valid existing data.
 */
import { z } from 'zod';
import { NextResponse } from 'next/server';

const nonEmpty = (field: string) => z.string().min(1, `${field} is required`);

// ---------------------------------------------------------------------------
// Competency Catalog
// ---------------------------------------------------------------------------
export const CreateCompetencySchema = z.object({
  code: z.string().max(50).optional(),
  name: nonEmpty('Name').max(200),
  categoryId: nonEmpty('Category'),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  version: z.string().optional(),
  owner: z.string().optional().nullable(),
  applicableRoles: z.array(z.string()).optional(),
  proficiencyDescriptors: z.array(z.any()).optional(),
  developmentResources: z.array(z.any()).optional(),
  assessmentCriteria: z.array(z.any()).optional(),
});
export const UpdateCompetencySchema = CreateCompetencySchema.partial();

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------
export const CreateCategorySchema = z.object({
  code: nonEmpty('Code').max(50),
  name: nonEmpty('Name').max(200),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

// ---------------------------------------------------------------------------
// Proficiency Framework
// ---------------------------------------------------------------------------
export const CreateFrameworkSchema = z.object({
  code: z.string().max(50).optional(),
  name: nonEmpty('Name').max(200),
  description: z.string().optional().nullable(),
  type: z.string().optional(),
  levels: z
    .array(
      z.object({
        code: z.string().optional(),
        name: nonEmpty('Level name'),
        levelNumber: z.number().int().min(1).optional(),
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
      })
    )
    .min(1, 'At least one level is required'),
});
export const UpdateFrameworkSchema = CreateFrameworkSchema.partial();

// ---------------------------------------------------------------------------
// Job Role
// ---------------------------------------------------------------------------
export const CreateJobRoleSchema = z.object({
  code: z.string().max(50).optional(),
  name: nonEmpty('Name').max(200),
  departmentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  competencyMappings: z
    .array(
      z.object({
        competencyId: nonEmpty('Competency'),
        requiredLevelId: z.string().optional().nullable(),
        weight: z.number().optional(),
        isRequired: z.boolean().optional(),
      })
    )
    .optional(),
});
export const UpdateJobRoleSchema = CreateJobRoleSchema.partial();

// ---------------------------------------------------------------------------
// Skill Assessment
// ---------------------------------------------------------------------------
export const CreateAssessmentSchema = z.object({
  name: nonEmpty('Name').max(200),
  description: z.string().optional().nullable(),
  type: nonEmpty('Type'),
  employeeId: z.string().optional().nullable(),
  jobRoleId: z.string().optional().nullable(),
  cycleId: z.string().optional().nullable(),
  assessorIds: z.any().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  competencyIds: z.array(z.string()).optional(),
});
export const UpdateAssessmentSchema = CreateAssessmentSchema.partial();

export const SubmitResultsSchema = z.object({
  results: z
    .array(
      z.object({
        competencyId: nonEmpty('Competency'),
        ratingLevelId: nonEmpty('Rating level'),
        comments: z.string().optional().nullable(),
        evidence: z.string().optional().nullable(),
      })
    )
    .min(1, 'At least one result is required'),
  assessorId: z.string().optional().nullable(),
  assessorType: z.string().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Gap Analysis
// ---------------------------------------------------------------------------
export const CreateGapAnalysisSchema = z.object({
  name: nonEmpty('Name').max(200),
  type: nonEmpty('Type'),
  targetType: z.string().optional().nullable(),
  targetId: z.string().optional().nullable(),
  items: z.array(z.any()).optional(),
});
export const UpdateGapAnalysisSchema = CreateGapAnalysisSchema.partial();

// ---------------------------------------------------------------------------
// Development Plan
// ---------------------------------------------------------------------------
export const CreateDevelopmentPlanSchema = z.object({
  name: nonEmpty('Name').max(200),
  description: z.string().optional().nullable(),
  type: nonEmpty('Type'),
  targetType: z.string().optional().nullable(),
  targetId: z.string().optional().nullable(),
  gapAnalysisId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  activities: z.array(z.any()).optional(),
  milestones: z.array(z.any()).optional(),
});
export const UpdateDevelopmentPlanSchema = CreateDevelopmentPlanSchema.partial();

// ---------------------------------------------------------------------------
// Shared bilingual validation helper
// ---------------------------------------------------------------------------

/**
 * Validate `body` against `schema`. On success returns `{ data }`.
 * On failure returns `{ response }` — a 400 JSON response with bilingual
 * `message` / `messageAr` fields plus per-field `details`.
 */
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown
): { data: z.infer<T>; response?: never } | { data?: never; response: NextResponse } {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    return { data: parsed.data };
  }
  const details = parsed.error.issues.map((i) => ({
    field: i.path.join('.'),
    message: i.message,
  }));
  return {
    response: NextResponse.json(
      {
        success: false,
        message: 'Validation failed',
        messageAr: 'فشل التحقق من صحة البيانات',
        error: details.map((d) => `${d.field}: ${d.message}`).join('; '),
        details,
      },
      { status: 400 }
    ),
  };
}

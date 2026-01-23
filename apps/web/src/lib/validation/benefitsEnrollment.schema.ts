import { z } from 'zod';

export const benefitsEnrollmentSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  coverageLevel: z.enum(['employee', 'employee_spouse', 'employee_children', 'family'], {
    required_error: 'Coverage level is required',
  }),
  dependentIds: z.array(z.string()).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  acknowledgeTerms: z.boolean().refine(val => val === true, 'You must acknowledge the terms'),
});

export type BenefitsEnrollmentFormData = z.infer<typeof benefitsEnrollmentSchema>;

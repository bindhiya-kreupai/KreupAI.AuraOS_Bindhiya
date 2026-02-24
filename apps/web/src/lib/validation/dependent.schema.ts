import { z } from 'zod';

export const dependentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  relationship: z.enum(['spouse', 'child', 'parent', 'domestic_partner'], {
    required_error: 'Relationship is required',
  }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export type DependentFormData = z.infer<typeof dependentSchema>;

import { z } from 'zod';

export const lifeEventSchema = z.object({
  type: z.enum(['marriage', 'divorce', 'birth', 'adoption', 'death', 'address_change', 'loss_of_coverage'], {
    required_error: 'Event type is required',
  }),
  date: z.string().min(1, 'Event date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  documentIds: z.array(z.string()).optional(),
});

export type LifeEventFormData = z.infer<typeof lifeEventSchema>;

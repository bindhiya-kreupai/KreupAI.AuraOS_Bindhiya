import { z } from 'zod';

export const recognitionSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(500),
  badgeId: z.string().optional(),
  points: z.number().min(1).max(100).optional(),
  values: z.array(z.string()).min(1, 'Select at least one company value'),
});

export type RecognitionFormData = z.infer<typeof recognitionSchema>;

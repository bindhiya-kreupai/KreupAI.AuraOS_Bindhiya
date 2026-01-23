import { z } from 'zod';

export const feedbackSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  type: z.enum(['praise', 'constructive', 'suggestion'], {
    required_error: 'Feedback type is required',
  }),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  isAnonymous: z.boolean().default(false),
  values: z.array(z.string()).optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

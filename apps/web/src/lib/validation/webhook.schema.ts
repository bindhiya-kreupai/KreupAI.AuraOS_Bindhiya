import { z } from 'zod';

export const webhookSchema = z.object({
  name: z.string().min(1, 'Webhook name is required').max(100),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
  secret: z.string().min(16, 'Secret must be at least 16 characters').optional().or(z.literal('')),
});

export type WebhookFormData = z.infer<typeof webhookSchema>;

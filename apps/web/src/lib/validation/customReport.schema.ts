import { z } from 'zod';

const reportFilterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'contains', 'in']),
  value: z.unknown(),
});

export const customReportSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(100),
  description: z.string().max(500).optional(),
  dataSource: z.string().min(1, 'Data source is required'),
  columns: z.array(z.string()).min(1, 'Select at least one column'),
  filters: z.array(reportFilterSchema).optional(),
  chartType: z.enum(['table', 'bar', 'line', 'pie']).optional(),
});

export type CustomReportFormData = z.infer<typeof customReportSchema>;

import { z } from 'zod'

export const hourEntrySchema = z.object({
  employee_id: z.string().uuid('Invalid employee'),
  business_id: z.string().uuid('Invalid business'),
  pay_period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  pay_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  regular_hours: z.number().min(0).max(168, 'Cannot exceed 168 hours per week'),
  overtime_hours: z.number().min(0).max(168),
  source: z.enum(['email', 'manual', 'file_upload', 'n8n_webhook']).default('manual'),
})

export const bulkHourEntrySchema = z.object({
  business_id: z.string().uuid(),
  pay_period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pay_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z.array(z.object({
    employee_id: z.string().uuid(),
    regular_hours: z.number().min(0).max(168),
    overtime_hours: z.number().min(0).max(168),
  })).min(1).max(500),
})

export const n8nWebhookSchema = z.object({
  business_id: z.string().uuid(),
  pay_period_start: z.string(),
  pay_period_end: z.string(),
  entries: z.array(z.object({
    employee_id: z.string().uuid(),
    regular_hours: z.number(),
    overtime_hours: z.number().default(0),
  })),
  source_email: z.string().email().optional(),
})

export type HourEntryInput = z.infer<typeof hourEntrySchema>
export type BulkHourEntryInput = z.infer<typeof bulkHourEntrySchema>
export type N8nWebhookInput = z.infer<typeof n8nWebhookSchema>

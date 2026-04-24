import { z } from 'zod'

export const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  industry: z.string().max(100).default(''),
  pay_period: z.enum(['weekly', 'bi-weekly', 'semi-monthly', 'monthly']),
  employee_count: z.number().int().min(0).max(100000),
  default_rate: z.number().min(0).max(9999.99),
  intake_method: z.enum(['email_attachment', 'manual_entry', 'file_upload']),
  status: z.enum(['ready', 'pending', 'blocked', 'under_review']).default('pending'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color').default('#6366f1'),
})

export const updateBusinessSchema = businessSchema.partial()

export type BusinessInput = z.infer<typeof businessSchema>
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>

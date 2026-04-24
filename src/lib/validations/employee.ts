import { z } from 'zod'

export const employeeSchema = z.object({
  business_id: z.string().uuid('Invalid business'),
  full_name: z.string().min(2, 'Full name required').max(100),
  pay_type: z.enum(['hourly', 'salaried', 'part-time']),
  rate: z.number().min(0).max(999999.99),
  filing_status: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const updateEmployeeSchema = employeeSchema.partial()

export const csvEmployeeRowSchema = z.object({
  full_name: z.string().min(1),
  pay_type: z.enum(['hourly', 'salaried', 'part-time']),
  rate: z.coerce.number().min(0),
  filing_status: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household']).default('single'),
  start_date: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type EmployeeInput = z.infer<typeof employeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

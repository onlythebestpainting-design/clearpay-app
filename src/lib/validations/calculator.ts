import { z } from 'zod'

export const calculatorSchema = z.object({
  employee_id: z.string().uuid().optional(),
  business_id: z.string().uuid().optional(),
  full_name: z.string().min(1, 'Name is required').max(100),
  regular_hours: z.number().min(0).max(168),
  overtime_hours: z.number().min(0).max(168),
  hourly_rate: z.number().min(0.01, 'Rate must be greater than 0').max(99999),
  filing_status: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household']),
  bonus: z.number().min(0).max(9999999).optional(),
  health_insurance: z.number().min(0).max(99999).optional(),
  retirement_401k_pct: z.number().min(0).max(100).optional(),
  other_deductions: z.number().min(0).max(99999).optional(),
})

export type CalculatorInput = z.infer<typeof calculatorSchema>

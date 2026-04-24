import { NextRequest, NextResponse } from 'next/server'
import { calculatorSchema } from '@/lib/validations/calculator'
import { calculatePayroll } from '@/lib/payroll'
import { getAuthContext } from '@/lib/security'

export async function POST(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = calculatorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const result = calculatePayroll({
    regularHours: parsed.data.regular_hours,
    overtimeHours: parsed.data.overtime_hours,
    hourlyRate: parsed.data.hourly_rate,
    bonus: parsed.data.bonus ?? 0,
    filingStatus: parsed.data.filing_status,
    healthInsurance: parsed.data.health_insurance ?? 0,
    retirement401kPct: parsed.data.retirement_401k_pct ?? 0,
    otherDeductions: parsed.data.other_deductions ?? 0,
  })

  return NextResponse.json({ result, inputs: parsed.data })
}

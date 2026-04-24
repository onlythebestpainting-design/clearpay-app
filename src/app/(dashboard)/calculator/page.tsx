'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { calculatorSchema, type CalculatorInput } from '@/lib/validations/calculator'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PayrollCalculation } from '@/types'

const FILING_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Filing Jointly' },
  { value: 'married_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
]

export default function CalculatorPage() {
  const [result, setResult] = useState<PayrollCalculation | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CalculatorInput>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      full_name: '', regular_hours: 40, overtime_hours: 0, hourly_rate: 0,
      filing_status: 'single', bonus: 0, health_insurance: 0, retirement_401k_pct: 0, other_deductions: 0,
    },
  })

  async function onSubmit(data: CalculatorInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Calculation failed'); return }
      setResult(json.result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pay Calculator</h1>
        <p className="text-sm text-slate-500">Calculate gross and net pay with live deduction preview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-4 w-4 text-indigo-500" /> Payroll Inputs</CardTitle></CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Employee name" error={errors.full_name?.message} {...register('full_name')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Regular hours" type="number" step="0.5" min={0} error={errors.regular_hours?.message} {...register('regular_hours', { valueAsNumber: true })} />
              <Input label="OT hours" type="number" step="0.5" min={0} error={errors.overtime_hours?.message} {...register('overtime_hours', { valueAsNumber: true })} />
              <Input label="Hourly rate ($)" type="number" step="0.01" min={0.01} error={errors.hourly_rate?.message} {...register('hourly_rate', { valueAsNumber: true })} />
              <Input label="Bonus ($)" type="number" step="0.01" min={0} error={errors.bonus?.message} {...register('bonus', { valueAsNumber: true })} />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tax & Deductions</p>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Filing status" options={FILING_OPTIONS} {...register('filing_status')} />
                <Input label="Health insurance ($)" type="number" step="0.01" min={0} {...register('health_insurance', { valueAsNumber: true })} />
                <Input label="401k (%)" type="number" step="0.1" min={0} max={100} {...register('retirement_401k_pct', { valueAsNumber: true })} />
                <Input label="Other deductions ($)" type="number" step="0.01" min={0} {...register('other_deductions', { valueAsNumber: true })} />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Calculate Pay
            </Button>
          </form>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" /> Pay Breakdown</CardTitle>
          </CardHeader>

          {!result ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              Fill out the form to see pay breakdown
            </div>
          ) : (
            <div className="space-y-3">
              {/* Gross */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Regular Pay</span>
                  <span className="font-medium text-slate-800">{formatCurrency(result.regularPay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Overtime Pay (1.5x)</span>
                  <span className="font-medium text-slate-800">{formatCurrency(result.otPay)}</span>
                </div>
                {result.bonus > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Bonus</span>
                    <span className="font-medium text-slate-800">{formatCurrency(result.bonus)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-2">
                  <span className="text-slate-700">Gross Pay</span>
                  <span className="text-slate-900">{formatCurrency(result.grossPay)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Deductions</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Federal + FICA Taxes</span>
                  <span className="text-red-600">-{formatCurrency(result.federalTax)}</span>
                </div>
                {result.healthInsurance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Health Insurance</span>
                    <span className="text-red-600">-{formatCurrency(result.healthInsurance)}</span>
                  </div>
                )}
                {result.retirement401k > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">401k</span>
                    <span className="text-red-600">-{formatCurrency(result.retirement401k)}</span>
                  </div>
                )}
                {result.otherDeductions > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Other Deductions</span>
                    <span className="text-red-600">-{formatCurrency(result.otherDeductions)}</span>
                  </div>
                )}
              </div>

              {/* Net */}
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm text-green-700 font-medium">Net Pay</p>
                <p className="text-4xl font-bold text-green-800 mt-1">{formatCurrency(result.netPay)}</p>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Tax estimates only — verify with a qualified accountant
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

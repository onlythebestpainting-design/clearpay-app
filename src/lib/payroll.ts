import type { FilingStatus, PayrollCalculation } from '@/types'

// 2024 federal income tax withholding — simplified percentage method
// For a proper implementation, integrate IRS Publication 15-T tables
function estimateFederalTax(grossPay: number, filingStatus: FilingStatus): number {
  const annualized = grossPay * 26 // assume bi-weekly for annualization

  let taxableIncome: number
  if (filingStatus === 'single' || filingStatus === 'married_separately') {
    taxableIncome = Math.max(0, annualized - 14600)
  } else {
    taxableIncome = Math.max(0, annualized - 29200)
  }

  let annualTax = 0
  if (filingStatus === 'single' || filingStatus === 'married_separately') {
    if (taxableIncome <= 11600) annualTax = taxableIncome * 0.1
    else if (taxableIncome <= 47150) annualTax = 1160 + (taxableIncome - 11600) * 0.12
    else if (taxableIncome <= 100525) annualTax = 5426 + (taxableIncome - 47150) * 0.22
    else if (taxableIncome <= 191950) annualTax = 17168.5 + (taxableIncome - 100525) * 0.24
    else if (taxableIncome <= 243725) annualTax = 39110.5 + (taxableIncome - 191950) * 0.32
    else if (taxableIncome <= 609350) annualTax = 55678.5 + (taxableIncome - 243725) * 0.35
    else annualTax = 183647.25 + (taxableIncome - 609350) * 0.37
  } else {
    // married_jointly or head_of_household — simplified
    if (taxableIncome <= 23200) annualTax = taxableIncome * 0.1
    else if (taxableIncome <= 94300) annualTax = 2320 + (taxableIncome - 23200) * 0.12
    else if (taxableIncome <= 201050) annualTax = 10852 + (taxableIncome - 94300) * 0.22
    else if (taxableIncome <= 383900) annualTax = 34337 + (taxableIncome - 201050) * 0.24
    else if (taxableIncome <= 487450) annualTax = 78221 + (taxableIncome - 383900) * 0.32
    else if (taxableIncome <= 731200) annualTax = 111357 + (taxableIncome - 487450) * 0.35
    else annualTax = 196669.5 + (taxableIncome - 731200) * 0.37
  }

  return Math.max(0, annualTax / 26)
}

// FICA taxes
function estimateSocialSecurity(grossPay: number, ytdGross: number): number {
  const ssWageCap = 168600 // 2024 Social Security wage base
  const remaining = Math.max(0, ssWageCap - ytdGross)
  return Math.min(grossPay, remaining) * 0.062
}

function estimateMedicare(grossPay: number): number {
  return grossPay * 0.0145
}

export interface PayrollInputs {
  regularHours: number
  overtimeHours: number
  hourlyRate: number
  bonus: number
  filingStatus: FilingStatus
  healthInsurance: number
  retirement401kPct: number
  otherDeductions: number
  ytdGross?: number
}

export function calculatePayroll(inputs: PayrollInputs): PayrollCalculation {
  const {
    regularHours,
    overtimeHours,
    hourlyRate,
    bonus,
    filingStatus,
    healthInsurance,
    retirement401kPct,
    otherDeductions,
    ytdGross = 0,
  } = inputs

  const regularPay = regularHours * hourlyRate
  const otPay = overtimeHours * hourlyRate * 1.5
  const grossPay = regularPay + otPay + bonus

  const federalTax = estimateFederalTax(grossPay, filingStatus)
  const socialSecurity = estimateSocialSecurity(grossPay, ytdGross)
  const medicare = estimateMedicare(grossPay)
  const stateTax = grossPay * 0.05 // placeholder — varies by state
  const retirement = grossPay * (retirement401kPct / 100)

  const totalDeductions = healthInsurance + retirement + otherDeductions
  const totalTax = federalTax + socialSecurity + medicare + stateTax

  const netPay = Math.max(0, grossPay - totalTax - totalDeductions)

  return {
    regularPay: round2(regularPay),
    otPay: round2(otPay),
    bonus: round2(bonus),
    grossPay: round2(grossPay),
    federalTax: round2(federalTax + socialSecurity + medicare + stateTax),
    stateTax: round2(stateTax),
    healthInsurance: round2(healthInsurance),
    retirement401k: round2(retirement),
    otherDeductions: round2(otherDeductions),
    netPay: round2(netPay),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

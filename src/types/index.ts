export type UserRole = 'owner' | 'admin' | 'viewer'
export type BusinessStatus = 'ready' | 'pending' | 'blocked' | 'under_review'
export type PayPeriod = 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly'
export type IntakeMethod = 'email_attachment' | 'manual_entry' | 'file_upload'
export type PayType = 'hourly' | 'salaried' | 'part-time'
export type FilingStatus = 'single' | 'married_jointly' | 'married_separately' | 'head_of_household'
export type EmployeeStatus = 'active' | 'inactive'
export type PayrollRunStatus = 'draft' | 'pending_approval' | 'approved' | 'locked'
export type BonusType = 'admin' | 'employee'
export type HourSource = 'email' | 'manual' | 'file_upload' | 'n8n_webhook'
export type NotificationType =
  | 'missed_submission'
  | 'overtime_flag'
  | 'anomaly'
  | 'bonus_eligible'
  | 'payroll_ready'
  | 'payroll_locked'
  | 'new_device_login'

export interface Account {
  id: string
  company_name: string
  owner_id: string
  plan: string
  created_at: string
}

export interface AccountMember {
  id: string
  account_id: string
  user_id: string
  role: UserRole
  assigned_businesses: string[]
  invited_at: string
  accepted_at: string | null
  email?: string
}

export interface Business {
  id: string
  account_id: string
  name: string
  industry: string
  pay_period: PayPeriod
  employee_count: number
  default_rate: number
  intake_method: IntakeMethod
  status: BusinessStatus
  color: string
  created_at: string
}

export interface Employee {
  id: string
  business_id: string
  account_id: string
  full_name: string
  pay_type: PayType
  rate: number
  filing_status: FilingStatus
  start_date: string
  status: EmployeeStatus
  created_at: string
  ytd_gross?: number
  ytd_tax_withheld?: number
  ytd_net?: number
}

export interface AdminStaff {
  id: string
  business_id: string
  account_id: string
  role_name: string
  pay_type: PayType
  rate: number
  standard_hours: number
  created_at: string
}

export interface DeductionProfile {
  id: string
  employee_id: string
  account_id: string
  type: string
  amount: number
  percentage: number
  created_at: string
}

export interface RateChangeHistory {
  id: string
  employee_id: string
  account_id: string
  old_rate: number
  new_rate: number
  changed_by: string
  changed_at: string
}

export interface HoursEntry {
  id: string
  employee_id: string
  business_id: string
  account_id: string
  pay_period_start: string
  pay_period_end: string
  regular_hours: number
  overtime_hours: number
  source: HourSource
  submitted_at: string
}

export interface PayrollRun {
  id: string
  business_id: string
  account_id: string
  pay_period_start: string
  pay_period_end: string
  status: PayrollRunStatus
  total_gross: number
  total_net: number
  locked_at: string | null
  locked_by: string | null
}

export interface PayrollLineItem {
  id: string
  payroll_run_id: string
  employee_id: string
  account_id: string
  regular_pay: number
  ot_pay: number
  bonus: number
  gross: number
  deductions: number
  tax: number
  net: number
}

export interface BonusRecord {
  id: string
  business_id: string
  account_id: string
  type: BonusType
  pay_period: string
  amount_per_person: number
  headcount: number
  total: number
  applied_by: string
  applied_at: string
}

export interface AuditLog {
  id: string
  account_id: string
  user_id: string
  user_email: string
  business_id: string | null
  action: string
  table_name: string
  record_id: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string
  user_agent: string
  created_at: string
}

export interface Notification {
  id: string
  account_id: string
  user_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  account_id: string
  device_info: string
  ip_address: string
  last_active: string
  created_at: string
}

export interface PayrollCalculation {
  regularPay: number
  otPay: number
  bonus: number
  grossPay: number
  federalTax: number
  stateTax: number
  healthInsurance: number
  retirement401k: number
  otherDeductions: number
  netPay: number
}

export interface AuthUser {
  id: string
  email: string
  accountId: string
  role: UserRole
  assignedBusinesses: string[]
}

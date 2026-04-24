-- ClearPay — Initial Schema Migration
-- Run this in the Supabase SQL editor before starting the app

-- gen_random_uuid() is built-in from PostgreSQL 13+, no extension needed

-- ─────────────────────────────────────────────
-- ACCOUNTS
-- ─────────────────────────────────────────────
create table if not exists accounts (
  id          uuid primary key default gen_random_uuid(),
  company_name text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  plan        text not null default 'starter',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- ACCOUNT MEMBERS
-- ─────────────────────────────────────────────
create table if not exists account_members (
  id                  uuid primary key default gen_random_uuid(),
  account_id          uuid not null references accounts(id) on delete cascade,
  user_id             uuid references auth.users(id) on delete set null,
  email               text not null,
  role                text not null check (role in ('owner','admin','viewer')),
  assigned_businesses uuid[] not null default '{}',
  invited_at          timestamptz not null default now(),
  accepted_at         timestamptz,
  invite_token        text,
  unique(account_id, email)
);

-- ─────────────────────────────────────────────
-- BUSINESSES
-- ─────────────────────────────────────────────
create table if not exists businesses (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references accounts(id) on delete cascade,
  name           text not null,
  industry       text not null default '',
  pay_period     text not null check (pay_period in ('weekly','bi-weekly','semi-monthly','monthly')),
  employee_count integer not null default 0,
  default_rate   numeric(10,2) not null default 0,
  intake_method  text not null check (intake_method in ('email_attachment','manual_entry','file_upload')),
  status         text not null default 'pending' check (status in ('ready','pending','blocked','under_review')),
  color          text not null default '#6366f1',
  archived       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- EMPLOYEES
-- ─────────────────────────────────────────────
create table if not exists employees (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references businesses(id) on delete cascade,
  account_id     uuid not null references accounts(id) on delete cascade,
  full_name      text not null,
  pay_type       text not null check (pay_type in ('hourly','salaried','part-time')),
  rate           numeric(10,2) not null default 0,
  filing_status  text not null check (filing_status in ('single','married_jointly','married_separately','head_of_household')),
  start_date     date not null default current_date,
  status         text not null default 'active' check (status in ('active','inactive')),
  ytd_gross      numeric(12,2) not null default 0,
  ytd_tax_withheld numeric(12,2) not null default 0,
  ytd_net        numeric(12,2) not null default 0,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- ADMIN STAFF
-- ─────────────────────────────────────────────
create table if not exists admin_staff (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references businesses(id) on delete cascade,
  account_id     uuid not null references accounts(id) on delete cascade,
  role_name      text not null,
  pay_type       text not null check (pay_type in ('hourly','salaried','part-time')),
  rate           numeric(10,2) not null default 0,
  standard_hours numeric(5,2) not null default 40,
  ytd_gross      numeric(12,2) not null default 0,
  ytd_tax_withheld numeric(12,2) not null default 0,
  ytd_net        numeric(12,2) not null default 0,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- DEDUCTION PROFILES
-- ─────────────────────────────────────────────
create table if not exists deduction_profiles (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  account_id  uuid not null references accounts(id) on delete cascade,
  type        text not null,
  amount      numeric(10,2) not null default 0,
  percentage  numeric(5,4) not null default 0,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- RATE CHANGE HISTORY
-- ─────────────────────────────────────────────
create table if not exists rate_change_history (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  account_id  uuid not null references accounts(id) on delete cascade,
  old_rate    numeric(10,2) not null,
  new_rate    numeric(10,2) not null,
  changed_by  uuid not null references auth.users(id),
  changed_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- HOURS ENTRIES
-- ─────────────────────────────────────────────
create table if not exists hours_entries (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references employees(id) on delete cascade,
  business_id      uuid not null references businesses(id) on delete cascade,
  account_id       uuid not null references accounts(id) on delete cascade,
  pay_period_start date not null,
  pay_period_end   date not null,
  regular_hours    numeric(6,2) not null default 0,
  overtime_hours   numeric(6,2) not null default 0,
  source           text not null check (source in ('email','manual','file_upload','n8n_webhook')),
  submitted_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PAYROLL RUNS
-- ─────────────────────────────────────────────
create table if not exists payroll_runs (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  account_id       uuid not null references accounts(id) on delete cascade,
  pay_period_start date not null,
  pay_period_end   date not null,
  status           text not null default 'draft' check (status in ('draft','pending_approval','approved','locked')),
  total_gross      numeric(14,2) not null default 0,
  total_net        numeric(14,2) not null default 0,
  locked_at        timestamptz,
  locked_by        uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PAYROLL LINE ITEMS
-- ─────────────────────────────────────────────
create table if not exists payroll_line_items (
  id             uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references payroll_runs(id) on delete cascade,
  employee_id    uuid not null references employees(id) on delete cascade,
  account_id     uuid not null references accounts(id) on delete cascade,
  regular_pay    numeric(12,2) not null default 0,
  ot_pay         numeric(12,2) not null default 0,
  bonus          numeric(12,2) not null default 0,
  gross          numeric(12,2) not null default 0,
  deductions     numeric(12,2) not null default 0,
  tax            numeric(12,2) not null default 0,
  net            numeric(12,2) not null default 0,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- BONUS RECORDS
-- ─────────────────────────────────────────────
create table if not exists bonus_records (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references businesses(id) on delete cascade,
  account_id        uuid not null references accounts(id) on delete cascade,
  type              text not null check (type in ('admin','employee')),
  pay_period        text not null,
  amount_per_person numeric(10,2) not null default 0,
  headcount         integer not null default 0,
  total             numeric(14,2) not null default 0,
  applied_by        uuid not null references auth.users(id),
  applied_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AUDIT LOG — immutable, no update/delete RLS
-- ─────────────────────────────────────────────
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  user_id     uuid not null references auth.users(id),
  user_email  text not null,
  business_id uuid references businesses(id) on delete set null,
  action      text not null,
  table_name  text not null,
  record_id   text not null,
  old_value   jsonb,
  new_value   jsonb,
  ip_address  text not null default '',
  user_agent  text not null default '',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- REPORT SCHEDULES
-- ─────────────────────────────────────────────
create table if not exists report_schedules (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  report_type text not null,
  business_id uuid references businesses(id) on delete cascade,
  frequency   text not null check (frequency in ('weekly','monthly','quarterly')),
  last_run    timestamptz,
  next_run    timestamptz,
  email_to    text not null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  account_id  uuid not null references accounts(id) on delete cascade,
  device_info text not null default '',
  ip_address  text not null default '',
  last_active timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- FAILED LOGIN ATTEMPTS — immutable
-- ─────────────────────────────────────────────
create table if not exists failed_login_attempts (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  ip_address   text not null,
  attempted_at timestamptz not null default now()
);

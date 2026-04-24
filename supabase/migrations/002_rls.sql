-- ClearPay — Row Level Security Policies
-- Run AFTER 001_tables.sql

-- ─────────────────────────────────────────────
-- Helper function: get current user's account_id
-- ─────────────────────────────────────────────
create or replace function get_user_account_id()
returns uuid
language sql
security definer
stable
as $$
  select account_id
  from account_members
  where user_id = auth.uid()
    and accepted_at is not null
  limit 1;
$$;

-- ─────────────────────────────────────────────
-- Helper function: check if user has access to a business
-- ─────────────────────────────────────────────
create or replace function user_can_access_business(bid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from account_members am
    join accounts a on a.id = am.account_id
    where am.user_id = auth.uid()
      and am.accepted_at is not null
      and (
        am.role = 'owner'
        or bid = any(am.assigned_businesses)
      )
      and am.account_id = (
        select account_id from businesses where id = bid
      )
  );
$$;

-- ═══════════════════════════════════════════════
-- ACCOUNTS
-- ═══════════════════════════════════════════════
alter table accounts enable row level security;

create policy "accounts_select" on accounts
  for select using (
    id = get_user_account_id()
  );

create policy "accounts_insert" on accounts
  for insert with check (owner_id = auth.uid());

create policy "accounts_update" on accounts
  for update using (id = get_user_account_id())
  with check (id = get_user_account_id());

-- Only owner can delete account (handled at application layer + this policy)
create policy "accounts_delete" on accounts
  for delete using (owner_id = auth.uid());

-- ═══════════════════════════════════════════════
-- ACCOUNT MEMBERS
-- ═══════════════════════════════════════════════
alter table account_members enable row level security;

create policy "account_members_select" on account_members
  for select using (account_id = get_user_account_id());

create policy "account_members_insert" on account_members
  for insert with check (account_id = get_user_account_id());

create policy "account_members_update" on account_members
  for update using (account_id = get_user_account_id())
  with check (account_id = get_user_account_id());

create policy "account_members_delete" on account_members
  for delete using (account_id = get_user_account_id());

-- ═══════════════════════════════════════════════
-- BUSINESSES
-- ═══════════════════════════════════════════════
alter table businesses enable row level security;

create policy "businesses_select" on businesses
  for select using (account_id = get_user_account_id());

create policy "businesses_insert" on businesses
  for insert with check (account_id = get_user_account_id());

create policy "businesses_update" on businesses
  for update using (account_id = get_user_account_id())
  with check (account_id = get_user_account_id());

create policy "businesses_delete" on businesses
  for delete using (account_id = get_user_account_id());

-- ═══════════════════════════════════════════════
-- EMPLOYEES (also business-scoped)
-- ═══════════════════════════════════════════════
alter table employees enable row level security;

create policy "employees_select" on employees
  for select using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "employees_insert" on employees
  for insert with check (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "employees_update" on employees
  for update using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "employees_delete" on employees
  for delete using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

-- ═══════════════════════════════════════════════
-- ADMIN STAFF
-- ═══════════════════════════════════════════════
alter table admin_staff enable row level security;

create policy "admin_staff_select" on admin_staff
  for select using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "admin_staff_insert" on admin_staff
  for insert with check (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "admin_staff_update" on admin_staff
  for update using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "admin_staff_delete" on admin_staff
  for delete using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

-- ═══════════════════════════════════════════════
-- DEDUCTION PROFILES
-- ═══════════════════════════════════════════════
alter table deduction_profiles enable row level security;

create policy "deduction_profiles_select" on deduction_profiles
  for select using (account_id = get_user_account_id());

create policy "deduction_profiles_insert" on deduction_profiles
  for insert with check (account_id = get_user_account_id());

create policy "deduction_profiles_update" on deduction_profiles
  for update using (account_id = get_user_account_id());

create policy "deduction_profiles_delete" on deduction_profiles
  for delete using (account_id = get_user_account_id());

-- ═══════════════════════════════════════════════
-- RATE CHANGE HISTORY
-- ═══════════════════════════════════════════════
alter table rate_change_history enable row level security;

create policy "rate_change_history_select" on rate_change_history
  for select using (account_id = get_user_account_id());

create policy "rate_change_history_insert" on rate_change_history
  for insert with check (account_id = get_user_account_id());

-- No update or delete — immutable history

-- ═══════════════════════════════════════════════
-- HOURS ENTRIES
-- ═══════════════════════════════════════════════
alter table hours_entries enable row level security;

create policy "hours_entries_select" on hours_entries
  for select using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "hours_entries_insert" on hours_entries
  for insert with check (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "hours_entries_update" on hours_entries
  for update using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "hours_entries_delete" on hours_entries
  for delete using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

-- ═══════════════════════════════════════════════
-- PAYROLL RUNS
-- ═══════════════════════════════════════════════
alter table payroll_runs enable row level security;

create policy "payroll_runs_select" on payroll_runs
  for select using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "payroll_runs_insert" on payroll_runs
  for insert with check (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "payroll_runs_update" on payroll_runs
  for update using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
    and status != 'locked'
  );

-- No delete on locked payroll runs — enforced at application layer

-- ═══════════════════════════════════════════════
-- PAYROLL LINE ITEMS
-- ═══════════════════════════════════════════════
alter table payroll_line_items enable row level security;

create policy "payroll_line_items_select" on payroll_line_items
  for select using (account_id = get_user_account_id());

create policy "payroll_line_items_insert" on payroll_line_items
  for insert with check (account_id = get_user_account_id());

create policy "payroll_line_items_update" on payroll_line_items
  for update using (account_id = get_user_account_id());

-- ═══════════════════════════════════════════════
-- BONUS RECORDS
-- ═══════════════════════════════════════════════
alter table bonus_records enable row level security;

create policy "bonus_records_select" on bonus_records
  for select using (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

create policy "bonus_records_insert" on bonus_records
  for insert with check (
    account_id = get_user_account_id()
    and user_can_access_business(business_id)
  );

-- ═══════════════════════════════════════════════
-- AUDIT LOG — insert + select only, NO update/delete
-- ═══════════════════════════════════════════════
alter table audit_log enable row level security;

create policy "audit_log_select" on audit_log
  for select using (account_id = get_user_account_id());

create policy "audit_log_insert" on audit_log
  for insert with check (
    account_id = get_user_account_id()
    and user_id = auth.uid()
  );

-- ═══════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════
alter table notifications enable row level security;

create policy "notifications_select" on notifications
  for select using (user_id = auth.uid());

create policy "notifications_insert" on notifications
  for insert with check (account_id = get_user_account_id());

create policy "notifications_update" on notifications
  for update using (user_id = auth.uid());

-- ═══════════════════════════════════════════════
-- REPORT SCHEDULES
-- ═══════════════════════════════════════════════
alter table report_schedules enable row level security;

create policy "report_schedules_select" on report_schedules
  for select using (account_id = get_user_account_id());

create policy "report_schedules_insert" on report_schedules
  for insert with check (account_id = get_user_account_id());

create policy "report_schedules_update" on report_schedules
  for update using (account_id = get_user_account_id());

create policy "report_schedules_delete" on report_schedules
  for delete using (account_id = get_user_account_id());

-- ═══════════════════════════════════════════════
-- SESSIONS
-- ═══════════════════════════════════════════════
alter table sessions enable row level security;

create policy "sessions_select" on sessions
  for select using (user_id = auth.uid());

create policy "sessions_insert" on sessions
  for insert with check (user_id = auth.uid());

create policy "sessions_update" on sessions
  for update using (user_id = auth.uid());

create policy "sessions_delete" on sessions
  for delete using (user_id = auth.uid());

-- ═══════════════════════════════════════════════
-- FAILED LOGIN ATTEMPTS — service role only (no user RLS)
-- ═══════════════════════════════════════════════
alter table failed_login_attempts enable row level security;
-- No select/insert/update/delete policies for regular users
-- This table is accessed exclusively via service role key on the server

-- ClearPay — Performance Indexes

-- accounts
create index if not exists idx_accounts_owner_id on accounts(owner_id);

-- account_members
create index if not exists idx_account_members_account_id on account_members(account_id);
create index if not exists idx_account_members_user_id on account_members(user_id);
create index if not exists idx_account_members_email on account_members(email);

-- businesses
create index if not exists idx_businesses_account_id on businesses(account_id);
create index if not exists idx_businesses_status on businesses(status);

-- employees
create index if not exists idx_employees_account_id on employees(account_id);
create index if not exists idx_employees_business_id on employees(business_id);
create index if not exists idx_employees_status on employees(status);

-- admin_staff
create index if not exists idx_admin_staff_account_id on admin_staff(account_id);
create index if not exists idx_admin_staff_business_id on admin_staff(business_id);

-- deduction_profiles
create index if not exists idx_deduction_profiles_employee_id on deduction_profiles(employee_id);
create index if not exists idx_deduction_profiles_account_id on deduction_profiles(account_id);

-- rate_change_history
create index if not exists idx_rate_change_history_employee_id on rate_change_history(employee_id);
create index if not exists idx_rate_change_history_account_id on rate_change_history(account_id);

-- hours_entries
create index if not exists idx_hours_entries_account_id on hours_entries(account_id);
create index if not exists idx_hours_entries_business_id on hours_entries(business_id);
create index if not exists idx_hours_entries_employee_id on hours_entries(employee_id);
create index if not exists idx_hours_entries_pay_period on hours_entries(pay_period_start, pay_period_end);

-- payroll_runs
create index if not exists idx_payroll_runs_account_id on payroll_runs(account_id);
create index if not exists idx_payroll_runs_business_id on payroll_runs(business_id);
create index if not exists idx_payroll_runs_status on payroll_runs(status);

-- payroll_line_items
create index if not exists idx_payroll_line_items_payroll_run_id on payroll_line_items(payroll_run_id);
create index if not exists idx_payroll_line_items_account_id on payroll_line_items(account_id);

-- bonus_records
create index if not exists idx_bonus_records_account_id on bonus_records(account_id);
create index if not exists idx_bonus_records_business_id on bonus_records(business_id);

-- audit_log
create index if not exists idx_audit_log_account_id on audit_log(account_id);
create index if not exists idx_audit_log_user_id on audit_log(user_id);
create index if not exists idx_audit_log_business_id on audit_log(business_id);
create index if not exists idx_audit_log_created_at on audit_log(created_at desc);
create index if not exists idx_audit_log_action on audit_log(action);

-- notifications
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_account_id on notifications(account_id);
create index if not exists idx_notifications_read on notifications(read);

-- sessions
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_account_id on sessions(account_id);
create index if not exists idx_sessions_last_active on sessions(last_active);

-- failed_login_attempts
create index if not exists idx_failed_logins_email on failed_login_attempts(email);
create index if not exists idx_failed_logins_ip on failed_login_attempts(ip_address);
create index if not exists idx_failed_logins_attempted_at on failed_login_attempts(attempted_at);

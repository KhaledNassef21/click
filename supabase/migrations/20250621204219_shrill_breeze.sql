/*
  # إنشاء قاعدة بيانات ERP متكاملة

  1. الجداول الأساسية
    - companies (الشركات)
    - users (المستخدمين)
    - user_roles (أدوار المستخدمين)
    - permissions (الصلاحيات)
    - settings (الإعدادات)

  2. المحاسبة
    - chart_of_accounts (دليل الحسابات)
    - journal_entries (القيود اليومية)
    - journal_entry_lines (بنود القيود)
    - fiscal_years (السنوات المالية)
    - accounting_periods (الفترات المحاسبية)

  3. العملاء والموردين
    - customers (العملاء)
    - suppliers (الموردين)
    - contractors (مقاولي الباطن)

  4. الفواتير والمدفوعات
    - invoices (الفواتير)
    - invoice_items (بنود الفواتير)
    - payments (المدفوعات)
    - vouchers (سندات القبض والصرف)
    - checks (الشيكات)

  5. المشاريع وإدارة التكاليف
    - projects (المشاريع)
    - project_phases (مراحل المشاريع)
    - cost_centers (مراكز التكلفة)
    - expenses (المصروفات)

  6. الموارد البشرية
    - employees (الموظفين)
    - departments (الأقسام)
    - payroll (كشوف الرواتب)
    - attendance (الحضور والانصراف)

  7. المخزون والأصول
    - inventory_items (أصناف المخزون)
    - inventory_transactions (حركات المخزون)
    - fixed_assets (الأصول الثابتة)
    - asset_depreciation (إهلاك الأصول)

  8. الخزينة والبنوك
    - bank_accounts (الحسابات البنكية)
    - cash_accounts (حسابات النقدية)
    - bank_transactions (المعاملات البنكية)

  9. التقارير والتحليلات
    - reports (التقارير)
    - report_templates (قوالب التقارير)
    - dashboards (لوحات المعلومات)

  10. الأمان والمراجعة
    - audit_logs (سجلات المراجعة)
    - user_sessions (جلسات المستخدمين)
    - system_logs (سجلات النظام)

  11. الدوال المساعدة
    - create_exec_sql_function (إنشاء دالة تنفيذ SQL)
    - exec_sql (تنفيذ SQL ديناميكي)
    - check_column_exists (فحص وجود العمود)
*/

-- إنشاء الشركات
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  arabic_name text,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  tax_number text,
  commercial_register text,
  currency text DEFAULT 'SAR',
  fiscal_year_start date DEFAULT '2024-01-01',
  country text DEFAULT 'Saudi Arabia',
  city text,
  postal_code text,
  industry text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  arabic_name text,
  phone text,
  avatar_url text,
  role text DEFAULT 'user',
  department text,
  employee_id text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  email_verified boolean DEFAULT false,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء الأدوار والصلاحيات
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  arabic_name text,
  description text,
  permissions jsonb DEFAULT '{}',
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- إنشاء الإعدادات
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  category text NOT NULL,
  key text NOT NULL,
  value jsonb,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, category, key)
);

-- دليل الحسابات (وفقاً للمعايير الدولية)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  account_subtype text,
  parent_id uuid REFERENCES chart_of_accounts(id),
  level integer DEFAULT 1,
  is_header boolean DEFAULT false,
  is_active boolean DEFAULT true,
  balance_type text DEFAULT 'debit' CHECK (balance_type IN ('debit', 'credit')),
  opening_balance decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  description text,
  tax_account boolean DEFAULT false,
  bank_account boolean DEFAULT false,
  cash_account boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- السنوات المالية
CREATE TABLE IF NOT EXISTS fiscal_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- الفترات المحاسبية
CREATE TABLE IF NOT EXISTS accounting_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year_id uuid REFERENCES fiscal_years(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- القيود اليومية
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  entry_number text NOT NULL,
  entry_date date NOT NULL,
  reference text,
  description text NOT NULL,
  total_amount decimal(15,2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_by uuid REFERENCES users(id),
  posted_by uuid REFERENCES users(id),
  posted_at timestamptz,
  reversed_by uuid REFERENCES users(id),
  reversed_at timestamptz,
  reversal_reason text,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, entry_number)
);

-- بنود القيود اليومية
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid REFERENCES chart_of_accounts(id),
  description text,
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  project_id uuid,
  cost_center_id uuid,
  line_number integer,
  created_at timestamptz DEFAULT now()
);

-- العملاء
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  customer_code text,
  name text NOT NULL,
  arabic_name text,
  email text,
  phone text,
  mobile text,
  address text,
  city text,
  country text,
  postal_code text,
  tax_number text,
  commercial_register text,
  contact_person text,
  contact_email text,
  contact_phone text,
  credit_limit decimal(15,2) DEFAULT 0,
  payment_terms integer DEFAULT 30,
  currency text DEFAULT 'SAR',
  account_id uuid REFERENCES chart_of_accounts(id),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, customer_code)
);

-- الموردين
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  supplier_code text,
  name text NOT NULL,
  arabic_name text,
  email text,
  phone text,
  mobile text,
  address text,
  city text,
  country text,
  postal_code text,
  tax_number text,
  commercial_register text,
  contact_person text,
  contact_email text,
  contact_phone text,
  payment_terms integer DEFAULT 30,
  currency text DEFAULT 'SAR',
  account_id uuid REFERENCES chart_of_accounts(id),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, supplier_code)
);

-- مقاولي الباطن
CREATE TABLE IF NOT EXISTS contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  contractor_code text,
  name text NOT NULL,
  arabic_name text,
  email text,
  phone text,
  mobile text,
  address text,
  city text,
  country text,
  specialization text,
  license_number text,
  license_expiry date,
  tax_number text,
  account_id uuid REFERENCES chart_of_accounts(id),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, contractor_code)
);

-- الأقسام
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  arabic_name text,
  description text,
  manager_id uuid,
  parent_id uuid REFERENCES departments(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- الموظفين
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  employee_code text,
  user_id uuid REFERENCES users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  arabic_name text,
  email text,
  phone text,
  mobile text,
  address text,
  national_id text,
  passport_number text,
  birth_date date,
  hire_date date NOT NULL,
  termination_date date,
  department_id uuid REFERENCES departments(id),
  position text,
  salary decimal(15,2),
  salary_type text DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'annual')),
  bank_account text,
  iban text,
  emergency_contact text,
  emergency_phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, employee_code)
);

-- مراكز التكلفة
CREATE TABLE IF NOT EXISTS cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  description text,
  parent_id uuid REFERENCES cost_centers(id),
  manager_id uuid REFERENCES employees(id),
  budget decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- المشاريع
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  project_code text,
  name text NOT NULL,
  arabic_name text,
  description text,
  customer_id uuid REFERENCES customers(id),
  project_manager_id uuid REFERENCES employees(id),
  start_date date,
  end_date date,
  estimated_end_date date,
  budget decimal(15,2),
  contract_value decimal(15,2),
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  progress_percentage decimal(5,2) DEFAULT 0,
  location text,
  cost_center_id uuid REFERENCES cost_centers(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, project_code)
);

-- مراحل المشاريع
CREATE TABLE IF NOT EXISTS project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  budget decimal(15,2),
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  progress_percentage decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  customer_id uuid REFERENCES customers(id),
  project_id uuid REFERENCES projects(id),
  invoice_date date NOT NULL,
  due_date date,
  subtotal decimal(15,2) NOT NULL,
  tax_amount decimal(15,2) DEFAULT 0,
  discount_amount decimal(15,2) DEFAULT 0,
  total_amount decimal(15,2) NOT NULL,
  paid_amount decimal(15,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),
  currency text DEFAULT 'SAR',
  exchange_rate decimal(10,4) DEFAULT 1,
  notes text,
  terms text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, invoice_number)
);

-- بنود الفواتير
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,3) NOT NULL,
  unit_price decimal(15,2) NOT NULL,
  discount_percentage decimal(5,2) DEFAULT 0,
  tax_percentage decimal(5,2) DEFAULT 0,
  line_total decimal(15,2) NOT NULL,
  account_id uuid REFERENCES chart_of_accounts(id),
  project_id uuid REFERENCES projects(id),
  line_number integer,
  created_at timestamptz DEFAULT now()
);

-- المدفوعات
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  payment_number text NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('receipt', 'payment')),
  payment_date date NOT NULL,
  amount decimal(15,2) NOT NULL,
  currency text DEFAULT 'SAR',
  exchange_rate decimal(10,4) DEFAULT 1,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other')),
  reference_number text,
  description text,
  customer_id uuid REFERENCES customers(id),
  supplier_id uuid REFERENCES suppliers(id),
  contractor_id uuid REFERENCES contractors(id),
  bank_account_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, payment_number)
);

-- سندات القبض والصرف
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  voucher_number text NOT NULL,
  voucher_type text NOT NULL CHECK (voucher_type IN ('receipt', 'payment')),
  voucher_date date NOT NULL,
  amount decimal(15,2) NOT NULL,
  description text NOT NULL,
  customer_id uuid REFERENCES customers(id),
  supplier_id uuid REFERENCES suppliers(id),
  payment_method text NOT NULL,
  reference_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'cancelled')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, voucher_number)
);

-- الشيكات
CREATE TABLE IF NOT EXISTS checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  check_number text NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('received', 'issued')),
  check_date date NOT NULL,
  due_date date,
  amount decimal(15,2) NOT NULL,
  payee text NOT NULL,
  bank_name text NOT NULL,
  account_number text,
  customer_id uuid REFERENCES customers(id),
  supplier_id uuid REFERENCES suppliers(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, check_number)
);

-- الحسابات البنكية
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  iban text,
  swift_code text,
  currency text DEFAULT 'SAR',
  opening_balance decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  account_id uuid REFERENCES chart_of_accounts(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, account_number)
);

-- المعاملات البنكية
CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  description text NOT NULL,
  reference_number text,
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  balance decimal(15,2),
  transaction_type text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- أصناف المخزون
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  item_code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  description text,
  category text,
  unit_of_measure text,
  cost_price decimal(15,2) DEFAULT 0,
  selling_price decimal(15,2) DEFAULT 0,
  quantity_on_hand decimal(10,3) DEFAULT 0,
  minimum_quantity decimal(10,3) DEFAULT 0,
  maximum_quantity decimal(10,3),
  reorder_point decimal(10,3),
  location text,
  barcode text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, item_code)
);

-- حركات المخزون
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer')),
  quantity decimal(10,3) NOT NULL,
  unit_cost decimal(15,2),
  total_cost decimal(15,2),
  reference_number text,
  description text,
  project_id uuid REFERENCES projects(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- الأصول الثابتة
CREATE TABLE IF NOT EXISTS fixed_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  asset_code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  description text,
  category text,
  purchase_date date,
  purchase_cost decimal(15,2) NOT NULL,
  salvage_value decimal(15,2) DEFAULT 0,
  useful_life_years integer,
  depreciation_method text DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'units_of_production')),
  accumulated_depreciation decimal(15,2) DEFAULT 0,
  book_value decimal(15,2),
  location text,
  serial_number text,
  supplier_id uuid REFERENCES suppliers(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, asset_code)
);

-- إهلاك الأصول
CREATE TABLE IF NOT EXISTS asset_depreciation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES fixed_assets(id) ON DELETE CASCADE,
  depreciation_date date NOT NULL,
  depreciation_amount decimal(15,2) NOT NULL,
  accumulated_depreciation decimal(15,2) NOT NULL,
  book_value decimal(15,2) NOT NULL,
  journal_entry_id uuid REFERENCES journal_entries(id),
  created_at timestamptz DEFAULT now()
);

-- المصروفات
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  expense_number text,
  expense_date date NOT NULL,
  description text NOT NULL,
  amount decimal(15,2) NOT NULL,
  category text,
  account_id uuid REFERENCES chart_of_accounts(id),
  supplier_id uuid REFERENCES suppliers(id),
  contractor_id uuid REFERENCES contractors(id),
  project_id uuid REFERENCES projects(id),
  cost_center_id uuid REFERENCES cost_centers(id),
  payment_method text,
  reference_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- كشوف الرواتب
CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  payroll_period text NOT NULL,
  pay_date date NOT NULL,
  basic_salary decimal(15,2) NOT NULL,
  allowances decimal(15,2) DEFAULT 0,
  overtime decimal(15,2) DEFAULT 0,
  deductions decimal(15,2) DEFAULT 0,
  gross_salary decimal(15,2) NOT NULL,
  tax_deduction decimal(15,2) DEFAULT 0,
  insurance_deduction decimal(15,2) DEFAULT 0,
  net_salary decimal(15,2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- الحضور والانصراف
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  check_in_time timestamptz,
  check_out_time timestamptz,
  break_duration interval,
  total_hours interval,
  overtime_hours interval,
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'holiday')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- التقارير
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  arabic_name text,
  description text,
  report_type text NOT NULL,
  parameters jsonb DEFAULT '{}',
  template jsonb DEFAULT '{}',
  is_system_report boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- سجلات المراجعة
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- إنشاء الدوال المساعدة المطلوبة للتطبيق

-- دالة فحص وجود العمود
CREATE OR REPLACE FUNCTION check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = $1 
    AND column_name = $2
  );
END;
$$;

-- دالة إنشاء دالة تنفيذ SQL
CREATE OR REPLACE FUNCTION create_exec_sql_function()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إنشاء دالة exec_sql إذا لم تكن موجودة
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'exec_sql' 
    AND pg_get_function_identity_arguments(oid) = 'sql text'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      BEGIN
        EXECUTE sql;
        RETURN ''Success'';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN ''Error: '' || SQLERRM;
      END;
      $func$;
    ';
    RETURN 'exec_sql function created successfully';
  ELSE
    RETURN 'exec_sql function already exists';
  END IF;
END;
$$;

-- دالة تنفيذ SQL ديناميكي
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'Success';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- تمكين RLS على جميع الجداول
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciation ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS أساسية
CREATE POLICY "Users can access their company data" ON companies
  FOR ALL TO authenticated
  USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can access their company users" ON users
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(company_id, code);
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);

-- إنشاء دوال مساعدة
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
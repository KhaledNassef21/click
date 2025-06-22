/*
  # إنشاء جداول المصروفات وإدارة المستخدمين

  1. جداول المصروفات
    - expenses (المصروفات)
    - expense_categories (فئات المصروفات)
    - expense_attachments (مرفقات المصروفات)

  2. جداول المستخدمين والصلاحيات
    - user_roles (أدوار المستخدمين)
    - user_permissions (صلاحيات المستخدمين)
    - user_role_permissions (صلاحيات الأدوار)

  3. الأمان
    - تمكين RLS على جميع الجداول
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  4. البيانات التجريبية
    - إدراج بيانات تجريبية لفئات المصروفات
    - إدراج بيانات تجريبية للمصروفات
    - إدراج بيانات تجريبية للأدوار والصلاحيات
*/

-- إنشاء جدول فئات المصروفات
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name text NOT NULL,
  arabic_name text,
  description text,
  account_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المصروفات
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  expense_number text NOT NULL,
  expense_date date NOT NULL,
  description text NOT NULL,
  amount decimal(15,2) NOT NULL,
  category_id uuid REFERENCES expense_categories(id),
  account_id uuid,
  supplier_id uuid,
  project_id uuid,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other')),
  reference_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  currency text DEFAULT 'SAR',
  exchange_rate decimal(10,4) DEFAULT 1,
  tax_amount decimal(15,2) DEFAULT 0,
  tax_included boolean DEFAULT false,
  notes text,
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  next_recurrence_date date,
  approved_by uuid,
  approved_at timestamptz,
  paid_by uuid,
  paid_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول مرفقات المصروفات
CREATE TABLE IF NOT EXISTS expense_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  file_path text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now()
);

-- إنشاء جدول أدوار المستخدمين
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name text NOT NULL,
  arabic_name text,
  description text,
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الصلاحيات
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  description text,
  module text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- إنشاء جدول صلاحيات الأدوار
CREATE TABLE IF NOT EXISTS user_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- إنشاء جدول صلاحيات المستخدمين
CREATE TABLE IF NOT EXISTS user_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission_id uuid NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_id)
);

-- تمكين RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_user_permissions ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_expense_categories" ON expense_categories;
DROP POLICY IF EXISTS "allow_all_expenses" ON expenses;
DROP POLICY IF EXISTS "allow_all_expense_attachments" ON expense_attachments;
DROP POLICY IF EXISTS "allow_all_user_roles" ON user_roles;
DROP POLICY IF EXISTS "allow_all_user_permissions" ON user_permissions;
DROP POLICY IF EXISTS "allow_all_user_role_permissions" ON user_role_permissions;
DROP POLICY IF EXISTS "allow_all_user_user_permissions" ON user_user_permissions;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_expense_categories"
    ON expense_categories
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_expenses"
    ON expenses
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_expense_attachments"
    ON expense_attachments
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_user_roles"
    ON user_roles
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_user_permissions"
    ON user_permissions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_user_role_permissions"
    ON user_role_permissions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_user_user_permissions"
    ON user_user_permissions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON expense_categories TO anon;
GRANT ALL PRIVILEGES ON expense_categories TO authenticated;
GRANT ALL PRIVILEGES ON expenses TO anon;
GRANT ALL PRIVILEGES ON expenses TO authenticated;
GRANT ALL PRIVILEGES ON expense_attachments TO anon;
GRANT ALL PRIVILEGES ON expense_attachments TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO anon;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON user_permissions TO anon;
GRANT ALL PRIVILEGES ON user_permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_role_permissions TO anon;
GRANT ALL PRIVILEGES ON user_role_permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_user_permissions TO anon;
GRANT ALL PRIVILEGES ON user_user_permissions TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_expense_categories_company_id ON expense_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_name ON expense_categories(name);
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON expense_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_number ON expenses(expense_number);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_is_active ON expenses(is_active);

CREATE INDEX IF NOT EXISTS idx_expense_attachments_expense_id ON expense_attachments(expense_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_name ON user_roles(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_permissions_company_id ON user_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_code ON user_permissions(code);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module ON user_permissions(module);
CREATE INDEX IF NOT EXISTS idx_user_permissions_is_active ON user_permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_user_role_permissions_role_id ON user_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_permissions_permission_id ON user_role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_user_user_permissions_user_id ON user_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_user_permissions_permission_id ON user_user_permissions(permission_id);

-- إنشاء قيود فريدة
ALTER TABLE expenses ADD CONSTRAINT expenses_company_expense_number_unique 
UNIQUE (company_id, expense_number);

-- إنشاء دوال تحديث updated_at
CREATE OR REPLACE FUNCTION update_expense_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_expense_categories_updated_at_trigger
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW 
  EXECUTE FUNCTION update_expense_categories_updated_at();

CREATE TRIGGER update_expenses_updated_at_trigger
  BEFORE UPDATE ON expenses
  FOR EACH ROW 
  EXECUTE FUNCTION update_expenses_updated_at();

CREATE TRIGGER update_user_roles_updated_at_trigger
  BEFORE UPDATE ON user_roles
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_roles_updated_at();

CREATE TRIGGER update_user_permissions_updated_at_trigger
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- إدراج بيانات تجريبية لفئات المصروفات
INSERT INTO expense_categories (
  company_id,
  name,
  arabic_name,
  description,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Construction Materials',
  'مواد البناء',
  'مواد البناء والإنشاءات',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Labor',
  'أجور العمالة',
  'أجور العمال والفنيين',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Equipment Rental',
  'تأجير المعدات',
  'تأجير المعدات والآلات',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Fuel',
  'وقود',
  'وقود المركبات والمعدات',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Utilities',
  'المرافق',
  'الكهرباء والماء والاتصالات',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Office Supplies',
  'مستلزمات مكتبية',
  'قرطاسية ومستلزمات المكتب',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Maintenance',
  'صيانة',
  'صيانة المعدات والمركبات',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Travel',
  'سفر',
  'تكاليف السفر والإقامة',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Consulting',
  'استشارات',
  'خدمات الاستشارات والمهنية',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Insurance',
  'تأمين',
  'تأمين المشاريع والمعدات',
  true
);

-- إدراج بيانات تجريبية للمصروفات
INSERT INTO expenses (
  company_id,
  expense_number,
  expense_date,
  description,
  amount,
  category_id,
  payment_method,
  reference_number,
  status,
  currency,
  tax_amount,
  tax_included,
  notes,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'EXP-2024-001',
  '2024-01-10',
  'شراء مواد بناء',
  25000.00,
  (SELECT id FROM expense_categories WHERE name = 'Construction Materials' LIMIT 1),
  'bank_transfer',
  'PO-001',
  'approved',
  'SAR',
  3750.00,
  true,
  'مواد بناء لمشروع المجمع التجاري',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'EXP-2024-002',
  '2024-01-12',
  'وقود المعدات',
  3500.00,
  (SELECT id FROM expense_categories WHERE name = 'Fuel' LIMIT 1),
  'cash',
  'FUEL-001',
  'approved',
  'SAR',
  525.00,
  true,
  'وقود للمعدات في موقع المشروع',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'EXP-2024-003',
  '2024-01-15',
  'أجور العمالة',
  15000.00,
  (SELECT id FROM expense_categories WHERE name = 'Labor' LIMIT 1),
  'bank_transfer',
  'LABOR-001',
  'approved',
  'SAR',
  0.00,
  false,
  'أجور العمالة لشهر يناير',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'EXP-2024-004',
  '2024-01-18',
  'صيانة المعدات',
  5000.00,
  (SELECT id FROM expense_categories WHERE name = 'Maintenance' LIMIT 1),
  'check',
  'MAINT-001',
  'pending',
  'SAR',
  750.00,
  true,
  'صيانة دورية للمعدات',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'EXP-2024-005',
  '2024-01-20',
  'مواد كهربائية',
  8000.00,
  (SELECT id FROM expense_categories WHERE name = 'Construction Materials' LIMIT 1),
  'bank_transfer',
  'ELEC-001',
  'approved',
  'SAR',
  1200.00,
  true,
  'مواد كهربائية لمشروع المدرسة',
  true
);

-- إدراج بيانات تجريبية للأدوار
INSERT INTO user_roles (
  company_id,
  name,
  arabic_name,
  description,
  is_system_role,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'System Administrator',
  'مدير النظام',
  'Full access to all system features',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Accountant',
  'محاسب',
  'Access to accounting features',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Project Manager',
  'مدير مشروع',
  'Access to project management features',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Inventory Manager',
  'مدير المخزون',
  'Access to inventory management features',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'HR Manager',
  'مدير الموارد البشرية',
  'Access to HR management features',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Regular User',
  'مستخدم عادي',
  'Limited access to system features',
  true,
  true
);

-- إدراج بيانات تجريبية للصلاحيات
INSERT INTO user_permissions (
  company_id,
  code,
  name,
  arabic_name,
  description,
  module,
  is_active
) VALUES 
-- صلاحيات لوحة التحكم
(
  '00000000-0000-0000-0000-000000000001',
  'view_dashboard',
  'View Dashboard',
  'عرض لوحة التحكم',
  'Ability to view the dashboard',
  'dashboard',
  true
),
-- صلاحيات الفواتير
(
  '00000000-0000-0000-0000-000000000001',
  'view_invoices',
  'View Invoices',
  'عرض الفواتير',
  'Ability to view invoices',
  'invoices',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'create_invoices',
  'Create Invoices',
  'إنشاء الفواتير',
  'Ability to create new invoices',
  'invoices',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'edit_invoices',
  'Edit Invoices',
  'تعديل الفواتير',
  'Ability to edit existing invoices',
  'invoices',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'delete_invoices',
  'Delete Invoices',
  'حذف الفواتير',
  'Ability to delete invoices',
  'invoices',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_invoices',
  'Manage Invoices',
  'إدارة الفواتير',
  'Full management of invoices',
  'invoices',
  true
),
-- صلاحيات المصروفات
(
  '00000000-0000-0000-0000-000000000001',
  'view_expenses',
  'View Expenses',
  'عرض المصروفات',
  'Ability to view expenses',
  'expenses',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'create_expenses',
  'Create Expenses',
  'إنشاء المصروفات',
  'Ability to create new expenses',
  'expenses',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'edit_expenses',
  'Edit Expenses',
  'تعديل المصروفات',
  'Ability to edit existing expenses',
  'expenses',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'delete_expenses',
  'Delete Expenses',
  'حذف المصروفات',
  'Ability to delete expenses',
  'expenses',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'approve_expenses',
  'Approve Expenses',
  'اعتماد المصروفات',
  'Ability to approve expenses',
  'expenses',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_expenses',
  'Manage Expenses',
  'إدارة المصروفات',
  'Full management of expenses',
  'expenses',
  true
),
-- صلاحيات العملاء
(
  '00000000-0000-0000-0000-000000000001',
  'view_customers',
  'View Customers',
  'عرض العملاء',
  'Ability to view customers',
  'customers',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_customers',
  'Manage Customers',
  'إدارة العملاء',
  'Full management of customers',
  'customers',
  true
),
-- صلاحيات الموردين
(
  '00000000-0000-0000-0000-000000000001',
  'view_suppliers',
  'View Suppliers',
  'عرض الموردين',
  'Ability to view suppliers',
  'suppliers',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_suppliers',
  'Manage Suppliers',
  'إدارة الموردين',
  'Full management of suppliers',
  'suppliers',
  true
),
-- صلاحيات الموظفين
(
  '00000000-0000-0000-0000-000000000001',
  'view_employees',
  'View Employees',
  'عرض الموظفين',
  'Ability to view employees',
  'employees',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_employees',
  'Manage Employees',
  'إدارة الموظفين',
  'Full management of employees',
  'employees',
  true
),
-- صلاحيات المشاريع
(
  '00000000-0000-0000-0000-000000000001',
  'view_projects',
  'View Projects',
  'عرض المشاريع',
  'Ability to view projects',
  'projects',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_projects',
  'Manage Projects',
  'إدارة المشاريع',
  'Full management of projects',
  'projects',
  true
),
-- صلاحيات الحسابات
(
  '00000000-0000-0000-0000-000000000001',
  'view_accounts',
  'View Accounts',
  'عرض الحسابات',
  'Ability to view accounts',
  'accounts',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_accounts',
  'Manage Accounts',
  'إدارة الحسابات',
  'Full management of accounts',
  'accounts',
  true
),
-- صلاحيات المخزون
(
  '00000000-0000-0000-0000-000000000001',
  'view_inventory',
  'View Inventory',
  'عرض المخزون',
  'Ability to view inventory',
  'inventory',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_inventory',
  'Manage Inventory',
  'إدارة المخزون',
  'Full management of inventory',
  'inventory',
  true
),
-- صلاحيات الأصول الثابتة
(
  '00000000-0000-0000-0000-000000000001',
  'view_assets',
  'View Fixed Assets',
  'عرض الأصول الثابتة',
  'Ability to view fixed assets',
  'assets',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_assets',
  'Manage Fixed Assets',
  'إدارة الأصول الثابتة',
  'Full management of fixed assets',
  'assets',
  true
),
-- صلاحيات التقارير
(
  '00000000-0000-0000-0000-000000000001',
  'view_reports',
  'View Reports',
  'عرض التقارير',
  'Ability to view reports',
  'reports',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_reports',
  'Manage Reports',
  'إدارة التقارير',
  'Full management of reports',
  'reports',
  true
),
-- صلاحيات الإعدادات
(
  '00000000-0000-0000-0000-000000000001',
  'view_settings',
  'View Settings',
  'عرض الإعدادات',
  'Ability to view settings',
  'settings',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_settings',
  'Manage Settings',
  'إدارة الإعدادات',
  'Full management of settings',
  'settings',
  true
),
-- صلاحيات المستخدمين
(
  '00000000-0000-0000-0000-000000000001',
  'view_users',
  'View Users',
  'عرض المستخدمين',
  'Ability to view users',
  'users',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'manage_users',
  'Manage Users',
  'إدارة المستخدمين',
  'Full management of users',
  'users',
  true
);

-- إدراج بيانات تجريبية لصلاحيات الأدوار
-- مدير النظام (جميع الصلاحيات)
INSERT INTO user_role_permissions (
  role_id,
  permission_id
)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'System Administrator' LIMIT 1),
  id
FROM user_permissions;

-- محاسب
INSERT INTO user_role_permissions (
  role_id,
  permission_id
)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'Accountant' LIMIT 1),
  id
FROM user_permissions
WHERE code IN (
  'view_dashboard',
  'manage_invoices',
  'manage_expenses',
  'view_customers',
  'view_suppliers',
  'view_projects',
  'manage_accounts',
  'view_reports'
);

-- مدير مشروع
INSERT INTO user_role_permissions (
  role_id,
  permission_id
)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'Project Manager' LIMIT 1),
  id
FROM user_permissions
WHERE code IN (
  'view_dashboard',
  'view_invoices',
  'view_expenses',
  'approve_expenses',
  'view_customers',
  'view_suppliers',
  'view_employees',
  'manage_projects',
  'view_inventory',
  'view_reports'
);

-- مدير المخزون
INSERT INTO user_role_permissions (
  role_id,
  permission_id
)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'Inventory Manager' LIMIT 1),
  id
FROM user_permissions
WHERE code IN (
  'view_dashboard',
  'view_expenses',
  'view_suppliers',
  'manage_inventory',
  'view_reports'
);

-- مدير الموارد البشرية
INSERT INTO user_role_permissions (
  role_id,
  permission_id
)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'HR Manager' LIMIT 1),
  id
FROM user_permissions
WHERE code IN (
  'view_dashboard',
  'view_expenses',
  'manage_employees',
  'view_reports'
);

-- مستخدم عادي
INSERT INTO user_role_permissions (
  role_id,
  permission_id
)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'Regular User' LIMIT 1),
  id
FROM user_permissions
WHERE code IN (
  'view_dashboard',
  'view_reports'
);

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_categories') THEN
    RAISE NOTICE 'جدول فئات المصروفات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول فئات المصروفات';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
    RAISE NOTICE 'جدول المصروفات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول المصروفات';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_attachments') THEN
    RAISE NOTICE 'جدول مرفقات المصروفات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول مرفقات المصروفات';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    RAISE NOTICE 'جدول أدوار المستخدمين تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول أدوار المستخدمين';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_permissions') THEN
    RAISE NOTICE 'جدول صلاحيات المستخدمين تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول صلاحيات المستخدمين';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_role_permissions') THEN
    RAISE NOTICE 'جدول صلاحيات الأدوار تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول صلاحيات الأدوار';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_user_permissions') THEN
    RAISE NOTICE 'جدول صلاحيات المستخدمين تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول صلاحيات المستخدمين';
  END IF;
END $$;
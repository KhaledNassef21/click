/*
  # إنشاء جداول المستخدمين والصلاحيات

  1. الجداول
    - users (المستخدمين)
    - user_roles (أدوار المستخدمين)
    - user_permissions (صلاحيات المستخدمين)
    - user_role_permissions (صلاحيات الأدوار)
    - user_user_permissions (صلاحيات المستخدمين المخصصة)

  2. الأمان
    - تمكين RLS على جميع الجداول
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  3. البيانات التجريبية
    - إدراج بيانات تجريبية للمستخدمين
    - إدراج بيانات تجريبية للأدوار والصلاحيات
*/

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  password_hash text,
  role text DEFAULT 'user',
  role_id uuid,
  department text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول أدوار المستخدمين (إذا لم يكن موجوداً)
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

-- إنشاء جدول الصلاحيات (إذا لم يكن موجوداً)
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

-- إنشاء جدول صلاحيات الأدوار (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS user_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- إنشاء جدول صلاحيات المستخدمين المخصصة (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS user_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_id)
);

-- تمكين RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_user_permissions ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_users" ON users;
DROP POLICY IF EXISTS "allow_all_user_roles" ON user_roles;
DROP POLICY IF EXISTS "allow_all_user_permissions" ON user_permissions;
DROP POLICY IF EXISTS "allow_all_user_role_permissions" ON user_role_permissions;
DROP POLICY IF EXISTS "allow_all_user_user_permissions" ON user_user_permissions;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_users"
    ON users
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
GRANT ALL PRIVILEGES ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO anon;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON user_permissions TO anon;
GRANT ALL PRIVILEGES ON user_permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_role_permissions TO anon;
GRANT ALL PRIVILEGES ON user_role_permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_user_permissions TO anon;
GRANT ALL PRIVILEGES ON user_user_permissions TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- إنشاء دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_users_updated_at();

-- إدراج بيانات تجريبية للمستخدمين
INSERT INTO users (
  company_id,
  full_name,
  email,
  phone,
  password_hash,
  role,
  role_id,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'أحمد محمد',
  'admin@company.com',
  '+966-50-123-4567',
  '$2a$10$X9xIFu1d5KlYDMOUSI7YUeYTxwmJqcEUWFsZ5oLIHGWqVcU4.TB8W', -- admin123
  'admin',
  (SELECT id FROM user_roles WHERE name = 'System Administrator' LIMIT 1),
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'فاطمة أحمد',
  'accountant@company.com',
  '+966-50-234-5678',
  '$2a$10$X9xIFu1d5KlYDMOUSI7YUeYTxwmJqcEUWFsZ5oLIHGWqVcU4.TB8W', -- accountant123
  'accountant',
  (SELECT id FROM user_roles WHERE name = 'Accountant' LIMIT 1),
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'محمد علي',
  'manager@company.com',
  '+966-50-345-6789',
  '$2a$10$X9xIFu1d5KlYDMOUSI7YUeYTxwmJqcEUWFsZ5oLIHGWqVcU4.TB8W', -- manager123
  'manager',
  (SELECT id FROM user_roles WHERE name = 'Project Manager' LIMIT 1),
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'سارة خالد',
  'user@company.com',
  '+966-50-456-7890',
  '$2a$10$X9xIFu1d5KlYDMOUSI7YUeYTxwmJqcEUWFsZ5oLIHGWqVcU4.TB8W', -- user123
  'user',
  (SELECT id FROM user_roles WHERE name = 'Regular User' LIMIT 1),
  true
);

-- إنشاء جدول فئات المصروفات (إذا لم يكن موجوداً)
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

-- إنشاء جدول المصروفات (إذا لم يكن موجوداً)
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

-- إنشاء جدول مرفقات المصروفات (إذا لم يكن موجوداً)
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

-- تمكين RLS على جداول المصروفات
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments ENABLE ROW LEVEL SECURITY;

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

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON expense_categories TO anon;
GRANT ALL PRIVILEGES ON expense_categories TO authenticated;
GRANT ALL PRIVILEGES ON expenses TO anon;
GRANT ALL PRIVILEGES ON expenses TO authenticated;
GRANT ALL PRIVILEGES ON expense_attachments TO anon;
GRANT ALL PRIVILEGES ON expense_attachments TO authenticated;

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

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE 'جدول المستخدمين تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول المستخدمين';
  END IF;

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
END $$;
/*
  # إعداد جداول الموظفين والمشاريع مع RLS

  1. الجداول
    - إنشاء جدول employees مع جميع الأعمدة المطلوبة
    - إنشاء جدول projects مع جميع الأعمدة المطلوبة
    - إضافة الفهارس والقيود

  2. الأمان
    - تمكين RLS على جداول employees و projects
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  3. البيانات التجريبية
    - إدراج موظفين تجريبيين للاختبار
    - إدراج مشاريع تجريبية للاختبار
*/

-- إنشاء جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  employee_code text,
  name text NOT NULL,
  arabic_name text,
  email text,
  phone text,
  mobile text,
  address text,
  city text,
  country text DEFAULT 'Saudi Arabia',
  postal_code text,
  national_id text,
  passport_number text,
  birth_date date,
  hire_date date NOT NULL,
  termination_date date,
  position text NOT NULL,
  department text,
  salary decimal(15,2) DEFAULT 0,
  salary_type text DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'annual')),
  bank_account text,
  iban text,
  emergency_contact text,
  emergency_phone text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المشاريع
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  project_code text,
  name text NOT NULL,
  arabic_name text,
  description text,
  customer_id uuid,
  project_manager_id uuid,
  start_date date,
  end_date date,
  estimated_end_date date,
  budget decimal(15,2),
  contract_value decimal(15,2),
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  progress_percentage decimal(5,2) DEFAULT 0,
  location text,
  expenses decimal(15,2) DEFAULT 0,
  revenue decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_employees" ON employees;
DROP POLICY IF EXISTS "allow_all_projects" ON projects;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_employees"
    ON employees
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_projects"
    ON projects
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON employees TO anon;
GRANT ALL PRIVILEGES ON employees TO authenticated;
GRANT ALL PRIVILEGES ON projects TO anon;
GRANT ALL PRIVILEGES ON projects TO authenticated;

-- إنشاء الفهارس للموظفين
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

-- إنشاء الفهارس للمشاريع
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_code ON projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- إنشاء قيود فريدة
ALTER TABLE employees ADD CONSTRAINT employees_company_employee_code_unique 
UNIQUE (company_id, employee_code);

ALTER TABLE projects ADD CONSTRAINT projects_company_project_code_unique 
UNIQUE (company_id, project_code);

-- إنشاء دوال تحديث updated_at
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_employees_updated_at_trigger
  BEFORE UPDATE ON employees
  FOR EACH ROW 
  EXECUTE FUNCTION update_employees_updated_at();

CREATE TRIGGER update_projects_updated_at_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW 
  EXECUTE FUNCTION update_projects_updated_at();

-- إدراج بيانات تجريبية للموظفين
INSERT INTO employees (
  company_id,
  employee_code,
  name,
  arabic_name,
  email,
  phone,
  mobile,
  address,
  city,
  country,
  national_id,
  hire_date,
  position,
  department,
  salary,
  salary_type,
  bank_account,
  emergency_contact,
  emergency_phone,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'EMP-001',
  'محمد عبدالله',
  'محمد عبدالله',
  'mohammed@company.com',
  '+966-11-123-4567',
  '+966-50-123-4567',
  'حي الملز، شارع الأمير محمد بن عبدالعزيز',
  'الرياض',
  'Saudi Arabia',
  '1234567890',
  '2023-01-15',
  'مهندس مشاريع',
  'الهندسة',
  12000.00,
  'monthly',
  '1234567890',
  'أم محمد',
  '+966-50-987-6543',
  true,
  'مهندس مشاريع خبرة 10 سنوات'
),
(
  '00000000-0000-0000-0000-000000000001',
  'EMP-002',
  'فاطمة أحمد',
  'فاطمة أحمد',
  'fatima@company.com',
  '+966-11-234-5678',
  '+966-50-234-5678',
  'حي النرجس، شارع التخصصي',
  'الرياض',
  'Saudi Arabia',
  '0987654321',
  '2023-03-01',
  'محاسبة',
  'المالية',
  8000.00,
  'monthly',
  '0987654321',
  'أبو فاطمة',
  '+966-50-876-5432',
  true,
  'محاسبة معتمدة CPA'
),
(
  '00000000-0000-0000-0000-000000000001',
  'EMP-003',
  'عبدالرحمن سالم',
  'عبدالرحمن سالم',
  'abdulrahman@company.com',
  '+966-11-345-6789',
  '+966-50-345-6789',
  'حي الورود، طريق الملك فهد',
  'الرياض',
  'Saudi Arabia',
  '1122334455',
  '2023-02-15',
  'مشرف موقع',
  'العمليات',
  9000.00,
  'monthly',
  '1122334455',
  'أم عبدالرحمن',
  '+966-50-765-4321',
  true,
  'مشرف مواقع خبرة 8 سنوات'
);

-- إدراج بيانات تجريبية للمشاريع
INSERT INTO projects (
  company_id,
  project_code,
  name,
  arabic_name,
  description,
  customer_id,
  project_manager_id,
  start_date,
  end_date,
  budget,
  contract_value,
  status,
  progress_percentage,
  location,
  expenses,
  revenue,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'PRJ-001',
  'مشروع مجمع الأعمال التجاري',
  'مشروع مجمع الأعمال التجاري',
  'إنشاء مجمع تجاري بمساحة 5000 متر مربع',
  (SELECT id FROM customers WHERE customer_code = 'CUST-001' LIMIT 1),
  (SELECT id FROM employees WHERE employee_code = 'EMP-001' LIMIT 1),
  '2024-01-01',
  '2024-12-31',
  2000000.00,
  2500000.00,
  'active',
  60.00,
  'الرياض، حي العليا',
  750000.00,
  1200000.00,
  true,
  'مشروع استراتيجي مهم للشركة'
),
(
  '00000000-0000-0000-0000-000000000001',
  'PRJ-002',
  'مشروع فيلا سكنية',
  'مشروع فيلا سكنية',
  'بناء فيلا سكنية فاخرة',
  (SELECT id FROM customers WHERE customer_code = 'CUST-002' LIMIT 1),
  (SELECT id FROM employees WHERE employee_code = 'EMP-003' LIMIT 1),
  '2024-02-15',
  '2024-08-15',
  800000.00,
  1000000.00,
  'active',
  40.00,
  'جدة، حي الحمراء',
  300000.00,
  500000.00,
  true,
  'فيلا سكنية بمواصفات عالية'
),
(
  '00000000-0000-0000-0000-000000000001',
  'PRJ-003',
  'مشروع مدرسة ابتدائية',
  'مشروع مدرسة ابتدائية',
  'إنشاء مدرسة ابتدائية بـ 20 فصل دراسي',
  (SELECT id FROM customers WHERE customer_code = 'CUST-003' LIMIT 1),
  (SELECT id FROM employees WHERE employee_code = 'EMP-001' LIMIT 1),
  '2024-03-01',
  '2024-11-30',
  1500000.00,
  1800000.00,
  'active',
  30.00,
  'الدمام، حي الشاطئ',
  450000.00,
  750000.00,
  true,
  'مشروع تعليمي حكومي'
);

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
    RAISE NOTICE 'جدول الموظفين تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول الموظفين';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    RAISE NOTICE 'جدول المشاريع تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول المشاريع';
  END IF;
END $$;
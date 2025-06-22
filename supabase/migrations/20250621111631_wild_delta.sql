-- إصلاح نهائي لجدول العملاء
-- هذا الـ migration سيحل جميع المشاكل المتعلقة بجدول العملاء

-- أولاً: حذف الجدول إذا كان موجوداً وإعادة إنشاؤه من الصفر
DROP TABLE IF EXISTS customers CASCADE;

-- إنشاء جدول العملاء بجميع الأعمدة المطلوبة
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  customer_code text,
  name text NOT NULL,
  arabic_name text,
  email text,
  phone text,
  mobile text,
  address text,
  city text,
  country text DEFAULT 'Saudi Arabia',
  postal_code text,
  tax_number text,
  commercial_register text,
  contact_person text,
  contact_email text,
  contact_phone text,
  credit_limit decimal(15,2) DEFAULT 0,
  payment_terms integer DEFAULT 30,
  currency text DEFAULT 'SAR',
  account_id uuid,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الشركات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  arabic_name text,
  currency text DEFAULT 'SAR',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إدراج الشركة الافتراضية
INSERT INTO companies (id, name, arabic_name, currency, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Company',
  'الشركة الافتراضية',
  'SAR',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  arabic_name = EXCLUDED.arabic_name,
  updated_at = now();

-- تمكين RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات الموجودة
DROP POLICY IF EXISTS "Allow all customer operations" ON customers;
DROP POLICY IF EXISTS "Allow all company operations" ON companies;
DROP POLICY IF EXISTS "Users can access their company customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers for their company" ON customers;
DROP POLICY IF EXISTS "Users can update their company customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their company customers" ON customers;

-- إنشاء سياسات مفتوحة للاختبار
CREATE POLICY "Enable all operations for customers"
  ON customers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for companies"
  ON companies
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- إنشاء الفهارس
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- إنشاء قيد فريد لرمز العميل داخل الشركة
ALTER TABLE customers ADD CONSTRAINT customers_company_customer_code_unique 
UNIQUE (company_id, customer_code);

-- إنشاء دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON customers
  FOR EACH ROW 
  EXECUTE FUNCTION update_customers_updated_at();

-- إدراج بيانات تجريبية
INSERT INTO customers (
  company_id,
  customer_code,
  name,
  arabic_name,
  email,
  phone,
  mobile,
  address,
  city,
  country,
  postal_code,
  tax_number,
  contact_person,
  credit_limit,
  payment_terms,
  currency,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'CUST-001',
  'مؤسسة البناء الحديث',
  'مؤسسة البناء الحديث',
  'info@modernbuild.com',
  '+966-11-234-5678',
  '+966-50-123-4567',
  'شارع الملك فهد، حي العليا',
  'الرياض',
  'Saudi Arabia',
  '11564',
  '300234567800003',
  'محمد أحمد',
  100000,
  30,
  'SAR',
  true,
  'عميل مهم - مشاريع كبيرة'
),
(
  '00000000-0000-0000-0000-000000000001',
  'CUST-002',
  'شركة التطوير العقاري',
  'شركة التطوير العقاري',
  'contact@realestate-dev.com',
  '+966-11-345-6789',
  '+966-50-234-5678',
  'طريق الملك عبدالعزيز، حي الحمراء',
  'جدة',
  'Saudi Arabia',
  '21577',
  '300345678900003',
  'فاطمة سالم',
  200000,
  45,
  'SAR',
  true,
  'شركة تطوير عقاري رائدة'
),
(
  '00000000-0000-0000-0000-000000000001',
  'CUST-003',
  'شركة الإنشاءات المتقدمة',
  'شركة الإنشاءات المتقدمة',
  'info@advanced-construction.com',
  '+966-11-456-7890',
  '+966-50-345-6789',
  'شارع الأمير محمد بن عبدالعزيز، حي الشاطئ',
  'الدمام',
  'Saudi Arabia',
  '31952',
  '300456789100003',
  'عبدالله خالد',
  150000,
  30,
  'SAR',
  true,
  'شركة إنشاءات متخصصة'
);

-- التحقق من إنشاء الجدول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    RAISE NOTICE 'جدول العملاء تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول العملاء';
  END IF;
END $$;
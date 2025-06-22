/*
  # إعداد جدول الموردين مع RLS

  1. الجداول
    - إنشاء جدول suppliers مع جميع الأعمدة المطلوبة
    - إضافة الفهارس والقيود

  2. الأمان
    - تمكين RLS على جدول suppliers
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  3. البيانات التجريبية
    - إدراج موردين تجريبيين للاختبار
*/

-- إنشاء جدول الموردين
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  supplier_code text,
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
  payment_terms integer DEFAULT 30,
  currency text DEFAULT 'SAR',
  account_id uuid,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_suppliers" ON suppliers;

-- إنشاء سياسة مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_suppliers"
    ON suppliers
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON suppliers TO anon;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);

-- إنشاء قيد فريد لرمز المورد داخل الشركة
ALTER TABLE suppliers ADD CONSTRAINT suppliers_company_supplier_code_unique 
UNIQUE (company_id, supplier_code);

-- إنشاء دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_suppliers_updated_at_trigger
  BEFORE UPDATE ON suppliers
  FOR EACH ROW 
  EXECUTE FUNCTION update_suppliers_updated_at();

-- إدراج بيانات تجريبية
INSERT INTO suppliers (
  company_id,
  supplier_code,
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
  payment_terms,
  currency,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'SUPP-001',
  'مصنع الخرسانة المتقدم',
  'مصنع الخرسانة المتقدم',
  'sales@concrete-factory.com',
  '+966-11-456-7890',
  '+966-50-456-7890',
  'المنطقة الصناعية الأولى، شارع الصناعة',
  'الرياض',
  'Saudi Arabia',
  '11564',
  '300345678900003',
  'سالم محمد',
  30,
  'SAR',
  true,
  'مورد رئيسي للخرسانة والمواد الإنشائية'
),
(
  '00000000-0000-0000-0000-000000000001',
  'SUPP-002',
  'شركة الحديد والصلب',
  'شركة الحديد والصلب',
  'orders@steel-company.com',
  '+966-11-567-8901',
  '+966-50-567-8901',
  'المنطقة الصناعية الثانية، طريق الملك فهد',
  'الدمام',
  'Saudi Arabia',
  '31952',
  '300456789100003',
  'أحمد علي',
  45,
  'SAR',
  true,
  'مورد الحديد والمواد المعدنية'
),
(
  '00000000-0000-0000-0000-000000000001',
  'SUPP-003',
  'مؤسسة المواد الكهربائية',
  'مؤسسة المواد الكهربائية',
  'info@electrical-supplies.com',
  '+966-11-678-9012',
  '+966-50-678-9012',
  'حي الصناعية، شارع التقنية',
  'جدة',
  'Saudi Arabia',
  '21577',
  '300567890200003',
  'خالد عبدالرحمن',
  15,
  'SAR',
  true,
  'مورد المواد والمعدات الكهربائية'
);

-- التحقق من إنشاء الجدول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
    RAISE NOTICE 'جدول الموردين تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول الموردين';
  END IF;
END $$;
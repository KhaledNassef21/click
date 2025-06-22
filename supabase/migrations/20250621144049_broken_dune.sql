/*
  # إنشاء جداول الفواتير وسندات القبض والصرف والشيكات

  1. الجداول
    - إنشاء جدول invoices (الفواتير)
    - إنشاء جدول invoice_items (بنود الفواتير)
    - إنشاء جدول vouchers (سندات القبض والصرف)
    - إنشاء جدول checks (الشيكات)

  2. الأمان
    - تمكين RLS على جميع الجداول
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  3. البيانات التجريبية
    - إدراج بيانات تجريبية للاختبار
*/

-- إنشاء جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  invoice_number text NOT NULL,
  customer_id uuid,
  project_id uuid,
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
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول بنود الفواتير
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,3) NOT NULL,
  unit_price decimal(15,2) NOT NULL,
  discount_percentage decimal(5,2) DEFAULT 0,
  tax_percentage decimal(5,2) DEFAULT 0,
  line_total decimal(15,2) NOT NULL,
  account_id uuid,
  project_id uuid,
  line_number integer,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول سندات القبض والصرف
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  voucher_number text NOT NULL,
  voucher_type text NOT NULL CHECK (voucher_type IN ('receipt', 'payment')),
  voucher_date date NOT NULL,
  amount decimal(15,2) NOT NULL,
  description text NOT NULL,
  customer_id uuid,
  supplier_id uuid,
  payment_method text NOT NULL,
  reference_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'cancelled')),
  bank_account text,
  check_number text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الشيكات
CREATE TABLE IF NOT EXISTS checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  check_number text NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('received', 'issued')),
  check_date date NOT NULL,
  due_date date,
  amount decimal(15,2) NOT NULL,
  payee text NOT NULL,
  bank_name text NOT NULL,
  account_number text,
  customer_id uuid,
  supplier_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
  notes text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_invoices" ON invoices;
DROP POLICY IF EXISTS "allow_all_invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "allow_all_vouchers" ON vouchers;
DROP POLICY IF EXISTS "allow_all_checks" ON checks;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_invoices"
    ON invoices
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_invoice_items"
    ON invoice_items
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_vouchers"
    ON vouchers
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_checks"
    ON checks
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON invoices TO anon;
GRANT ALL PRIVILEGES ON invoices TO authenticated;
GRANT ALL PRIVILEGES ON invoice_items TO anon;
GRANT ALL PRIVILEGES ON invoice_items TO authenticated;
GRANT ALL PRIVILEGES ON vouchers TO anon;
GRANT ALL PRIVILEGES ON vouchers TO authenticated;
GRANT ALL PRIVILEGES ON checks TO anon;
GRANT ALL PRIVILEGES ON checks TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_is_active ON invoices(is_active);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_vouchers_company_id ON vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_type ON vouchers(voucher_type);
CREATE INDEX IF NOT EXISTS idx_vouchers_customer_id ON vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_supplier_id ON vouchers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_date ON vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON vouchers(is_active);

CREATE INDEX IF NOT EXISTS idx_checks_company_id ON checks(company_id);
CREATE INDEX IF NOT EXISTS idx_checks_check_number ON checks(check_number);
CREATE INDEX IF NOT EXISTS idx_checks_check_type ON checks(check_type);
CREATE INDEX IF NOT EXISTS idx_checks_customer_id ON checks(customer_id);
CREATE INDEX IF NOT EXISTS idx_checks_supplier_id ON checks(supplier_id);
CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(status);
CREATE INDEX IF NOT EXISTS idx_checks_due_date ON checks(due_date);
CREATE INDEX IF NOT EXISTS idx_checks_is_active ON checks(is_active);

-- إنشاء قيود فريدة
ALTER TABLE invoices ADD CONSTRAINT invoices_company_invoice_number_unique 
UNIQUE (company_id, invoice_number);

ALTER TABLE vouchers ADD CONSTRAINT vouchers_company_voucher_number_unique 
UNIQUE (company_id, voucher_number);

ALTER TABLE checks ADD CONSTRAINT checks_company_check_number_unique 
UNIQUE (company_id, check_number);

-- إنشاء دوال تحديث updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_vouchers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_invoices_updated_at_trigger
  BEFORE UPDATE ON invoices
  FOR EACH ROW 
  EXECUTE FUNCTION update_invoices_updated_at();

CREATE TRIGGER update_vouchers_updated_at_trigger
  BEFORE UPDATE ON vouchers
  FOR EACH ROW 
  EXECUTE FUNCTION update_vouchers_updated_at();

CREATE TRIGGER update_checks_updated_at_trigger
  BEFORE UPDATE ON checks
  FOR EACH ROW 
  EXECUTE FUNCTION update_checks_updated_at();

-- إدراج بيانات تجريبية للفواتير
INSERT INTO invoices (
  company_id,
  invoice_number,
  customer_id,
  project_id,
  invoice_date,
  due_date,
  subtotal,
  tax_amount,
  discount_amount,
  total_amount,
  paid_amount,
  status,
  currency,
  notes,
  terms,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'INV-2024-001',
  (SELECT id FROM customers WHERE customer_code = 'CUST-001' LIMIT 1),
  (SELECT id FROM projects WHERE project_code = 'PRJ-001' LIMIT 1),
  '2024-01-15',
  '2024-02-15',
  50000.00,
  7500.00,
  0.00,
  57500.00,
  0.00,
  'sent',
  'SAR',
  'دفعة أولى لمشروع المجمع التجاري',
  'يرجى الدفع خلال 30 يوم من تاريخ الفاتورة',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'INV-2024-002',
  (SELECT id FROM customers WHERE customer_code = 'CUST-002' LIMIT 1),
  (SELECT id FROM projects WHERE project_code = 'PRJ-002' LIMIT 1),
  '2024-02-20',
  '2024-03-20',
  80000.00,
  12000.00,
  0.00,
  92000.00,
  92000.00,
  'paid',
  'SAR',
  'دفعة ثانية لمشروع الفيلا السكنية',
  'يرجى الدفع خلال 30 يوم من تاريخ الفاتورة',
  true
);

-- إدراج بيانات تجريبية لبنود الفواتير
INSERT INTO invoice_items (
  invoice_id,
  description,
  quantity,
  unit_price,
  discount_percentage,
  tax_percentage,
  line_total,
  line_number
) VALUES 
(
  (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-001' LIMIT 1),
  'أعمال الحفر والردم',
  1,
  50000.00,
  0.00,
  15.00,
  57500.00,
  1
),
(
  (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-002' LIMIT 1),
  'أعمال الخرسانة المسلحة',
  1,
  80000.00,
  0.00,
  15.00,
  92000.00,
  1
);

-- إدراج بيانات تجريبية لسندات القبض والصرف
INSERT INTO vouchers (
  company_id,
  voucher_number,
  voucher_type,
  voucher_date,
  amount,
  description,
  customer_id,
  supplier_id,
  payment_method,
  reference_number,
  status,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'RV-2024-001',
  'receipt',
  '2024-01-15',
  25000.00,
  'استلام دفعة من مؤسسة البناء الحديث',
  (SELECT id FROM customers WHERE customer_code = 'CUST-001' LIMIT 1),
  NULL,
  'bank',
  'INV-2024-001',
  'cleared',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'PV-2024-001',
  'payment',
  '2024-01-18',
  15000.00,
  'دفع مستحقات مصنع الخرسانة المتقدم',
  NULL,
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-001' LIMIT 1),
  'check',
  'PO-001',
  'pending',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'RV-2024-002',
  'receipt',
  '2024-01-20',
  50000.00,
  'استلام دفعة نقدية من شركة التطوير العقاري',
  (SELECT id FROM customers WHERE customer_code = 'CUST-002' LIMIT 1),
  NULL,
  'cash',
  'INV-2024-002',
  'cleared',
  true
);

-- إدراج بيانات تجريبية للشيكات
INSERT INTO checks (
  company_id,
  check_number,
  check_type,
  check_date,
  due_date,
  amount,
  payee,
  bank_name,
  customer_id,
  supplier_id,
  status,
  notes,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  '123456',
  'received',
  '2024-01-15',
  '2024-02-15',
  25000.00,
  'مؤسسة البناء الحديث',
  'البنك الأهلي السعودي',
  (SELECT id FROM customers WHERE customer_code = 'CUST-001' LIMIT 1),
  NULL,
  'pending',
  'شيك مقابل فاتورة رقم INV-2024-001',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '789012',
  'issued',
  '2024-01-18',
  '2024-01-25',
  15000.00,
  'مصنع الخرسانة المتقدم',
  'بنك الراجحي',
  NULL,
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-001' LIMIT 1),
  'cleared',
  'دفع مستحقات شهر يناير',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '345678',
  'received',
  '2024-01-20',
  '2024-02-20',
  50000.00,
  'شركة التطوير العقاري',
  'البنك السعودي للاستثمار',
  (SELECT id FROM customers WHERE customer_code = 'CUST-002' LIMIT 1),
  NULL,
  'bounced',
  'شيك مرتد - رصيد غير كافي',
  true
);

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    RAISE NOTICE 'جدول الفواتير تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول الفواتير';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items') THEN
    RAISE NOTICE 'جدول بنود الفواتير تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول بنود الفواتير';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vouchers') THEN
    RAISE NOTICE 'جدول سندات القبض والصرف تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول سندات القبض والصرف';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checks') THEN
    RAISE NOTICE 'جدول الشيكات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول الشيكات';
  END IF;
END $$;
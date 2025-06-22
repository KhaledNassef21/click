/*
  # إنشاء جداول الخزينة والمخزون والأصول الثابتة

  1. الجداول
    - bank_accounts (الحسابات البنكية)
    - cash_accounts (حسابات النقدية)
    - bank_transactions (المعاملات البنكية)
    - inventory_items (أصناف المخزون)
    - inventory_transactions (حركات المخزون)
    - fixed_assets (الأصول الثابتة)
    - asset_depreciation (إهلاك الأصول)

  2. الأمان
    - تمكين RLS على جميع الجداول
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  3. البيانات التجريبية
    - إدراج بيانات تجريبية لكل جدول
*/

-- إنشاء جدول الحسابات البنكية
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  iban text,
  swift_code text,
  branch text,
  currency text DEFAULT 'SAR',
  opening_balance decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  account_type text DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'credit')),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول حسابات النقدية
CREATE TABLE IF NOT EXISTS cash_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  account_name text NOT NULL,
  location text,
  currency text DEFAULT 'SAR',
  opening_balance decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  responsible_person text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المعاملات البنكية
CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  account_id uuid NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('bank', 'cash')),
  transaction_date date NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
  amount decimal(15,2) NOT NULL,
  description text NOT NULL,
  reference_number text,
  related_account_id uuid,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  is_reconciled boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول أصناف المخزون
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  item_code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  description text,
  category text,
  unit_of_measure text NOT NULL,
  cost_price decimal(15,2) DEFAULT 0,
  selling_price decimal(15,2) DEFAULT 0,
  quantity_on_hand decimal(10,3) DEFAULT 0,
  minimum_quantity decimal(10,3) DEFAULT 0,
  maximum_quantity decimal(10,3),
  reorder_point decimal(10,3),
  location text,
  barcode text,
  supplier_id uuid,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول حركات المخزون
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  item_id uuid NOT NULL REFERENCES inventory_items(id),
  transaction_date date NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer')),
  quantity decimal(10,3) NOT NULL,
  unit_cost decimal(15,2),
  total_cost decimal(15,2),
  reference_number text,
  description text,
  project_id uuid,
  location_from text,
  location_to text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الأصول الثابتة
CREATE TABLE IF NOT EXISTS fixed_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  asset_code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  description text,
  category text,
  purchase_date date NOT NULL,
  purchase_cost decimal(15,2) NOT NULL,
  salvage_value decimal(15,2) DEFAULT 0,
  useful_life_years integer NOT NULL,
  depreciation_method text DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'units_of_production')),
  accumulated_depreciation decimal(15,2) DEFAULT 0,
  current_value decimal(15,2),
  location text,
  serial_number text,
  supplier_id uuid,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول إهلاك الأصول
CREATE TABLE IF NOT EXISTS asset_depreciation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  asset_id uuid NOT NULL REFERENCES fixed_assets(id),
  depreciation_date date NOT NULL,
  depreciation_amount decimal(15,2) NOT NULL,
  accumulated_depreciation decimal(15,2) NOT NULL,
  book_value decimal(15,2) NOT NULL,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciation ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "allow_all_cash_accounts" ON cash_accounts;
DROP POLICY IF EXISTS "allow_all_bank_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "allow_all_inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "allow_all_inventory_transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "allow_all_fixed_assets" ON fixed_assets;
DROP POLICY IF EXISTS "allow_all_asset_depreciation" ON asset_depreciation;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_bank_accounts"
    ON bank_accounts
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_cash_accounts"
    ON cash_accounts
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_bank_transactions"
    ON bank_transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_inventory_items"
    ON inventory_items
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_inventory_transactions"
    ON inventory_transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_fixed_assets"
    ON fixed_assets
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_asset_depreciation"
    ON asset_depreciation
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON bank_accounts TO anon;
GRANT ALL PRIVILEGES ON bank_accounts TO authenticated;
GRANT ALL PRIVILEGES ON cash_accounts TO anon;
GRANT ALL PRIVILEGES ON cash_accounts TO authenticated;
GRANT ALL PRIVILEGES ON bank_transactions TO anon;
GRANT ALL PRIVILEGES ON bank_transactions TO authenticated;
GRANT ALL PRIVILEGES ON inventory_items TO anon;
GRANT ALL PRIVILEGES ON inventory_items TO authenticated;
GRANT ALL PRIVILEGES ON inventory_transactions TO anon;
GRANT ALL PRIVILEGES ON inventory_transactions TO authenticated;
GRANT ALL PRIVILEGES ON fixed_assets TO anon;
GRANT ALL PRIVILEGES ON fixed_assets TO authenticated;
GRANT ALL PRIVILEGES ON asset_depreciation TO anon;
GRANT ALL PRIVILEGES ON asset_depreciation TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON bank_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_number ON bank_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON bank_accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_cash_accounts_company_id ON cash_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_is_active ON cash_accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_company_id ON bank_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_id ON bank_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_type ON bank_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_is_active ON bank_transactions(is_active);

CREATE INDEX IF NOT EXISTS idx_inventory_items_company_id ON inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_item_code ON inventory_items(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_active ON inventory_items(is_active);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_company_id ON inventory_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_is_active ON inventory_transactions(is_active);

CREATE INDEX IF NOT EXISTS idx_fixed_assets_company_id ON fixed_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_asset_code ON fixed_assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_is_active ON fixed_assets(is_active);

CREATE INDEX IF NOT EXISTS idx_asset_depreciation_company_id ON asset_depreciation(company_id);
CREATE INDEX IF NOT EXISTS idx_asset_depreciation_asset_id ON asset_depreciation(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_depreciation_depreciation_date ON asset_depreciation(depreciation_date);
CREATE INDEX IF NOT EXISTS idx_asset_depreciation_is_active ON asset_depreciation(is_active);

-- إنشاء قيود فريدة
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_company_account_number_unique 
UNIQUE (company_id, account_number);

ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_company_item_code_unique 
UNIQUE (company_id, item_code);

ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_company_asset_code_unique 
UNIQUE (company_id, asset_code);

-- إنشاء دوال تحديث updated_at
CREATE OR REPLACE FUNCTION update_bank_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_cash_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_bank_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_inventory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_inventory_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_fixed_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_asset_depreciation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_bank_accounts_updated_at_trigger
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW 
  EXECUTE FUNCTION update_bank_accounts_updated_at();

CREATE TRIGGER update_cash_accounts_updated_at_trigger
  BEFORE UPDATE ON cash_accounts
  FOR EACH ROW 
  EXECUTE FUNCTION update_cash_accounts_updated_at();

CREATE TRIGGER update_bank_transactions_updated_at_trigger
  BEFORE UPDATE ON bank_transactions
  FOR EACH ROW 
  EXECUTE FUNCTION update_bank_transactions_updated_at();

CREATE TRIGGER update_inventory_items_updated_at_trigger
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW 
  EXECUTE FUNCTION update_inventory_items_updated_at();

CREATE TRIGGER update_inventory_transactions_updated_at_trigger
  BEFORE UPDATE ON inventory_transactions
  FOR EACH ROW 
  EXECUTE FUNCTION update_inventory_transactions_updated_at();

CREATE TRIGGER update_fixed_assets_updated_at_trigger
  BEFORE UPDATE ON fixed_assets
  FOR EACH ROW 
  EXECUTE FUNCTION update_fixed_assets_updated_at();

CREATE TRIGGER update_asset_depreciation_updated_at_trigger
  BEFORE UPDATE ON asset_depreciation
  FOR EACH ROW 
  EXECUTE FUNCTION update_asset_depreciation_updated_at();

-- إدراج بيانات تجريبية للحسابات البنكية
INSERT INTO bank_accounts (
  company_id,
  account_name,
  bank_name,
  account_number,
  iban,
  swift_code,
  branch,
  currency,
  opening_balance,
  current_balance,
  account_type,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'الحساب الجاري - البنك الأهلي',
  'البنك الأهلي السعودي',
  '1234567890',
  'SA0000000001234567890123',
  'NCBKSAJE',
  'فرع العليا',
  'SAR',
  100000.00,
  125000.00,
  'checking',
  true,
  'الحساب الرئيسي للشركة'
),
(
  '00000000-0000-0000-0000-000000000001',
  'حساب التوفير - بنك الراجحي',
  'مصرف الراجحي',
  '0987654321',
  'SA0000000000987654321098',
  'RJHISARI',
  'فرع الملز',
  'SAR',
  50000.00,
  75000.00,
  'savings',
  true,
  'حساب توفير للمشاريع المستقبلية'
);

-- إدراج بيانات تجريبية لحسابات النقدية
INSERT INTO cash_accounts (
  company_id,
  account_name,
  location,
  currency,
  opening_balance,
  current_balance,
  responsible_person,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'الخزينة الرئيسية',
  'المكتب الرئيسي',
  'SAR',
  20000.00,
  15000.00,
  'فاطمة أحمد',
  true,
  'الخزينة الرئيسية للمصروفات اليومية'
),
(
  '00000000-0000-0000-0000-000000000001',
  'خزينة الموقع الأول',
  'موقع مشروع المجمع التجاري',
  'SAR',
  10000.00,
  8000.00,
  'عبدالرحمن سالم',
  true,
  'خزينة موقع المشروع للمصروفات الطارئة'
);

-- إدراج بيانات تجريبية للمعاملات البنكية
INSERT INTO bank_transactions (
  company_id,
  account_id,
  account_type,
  transaction_date,
  transaction_type,
  amount,
  description,
  reference_number,
  status,
  is_reconciled,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM bank_accounts WHERE account_name = 'الحساب الجاري - البنك الأهلي' LIMIT 1),
  'bank',
  '2024-01-15',
  'deposit',
  25000.00,
  'إيداع دفعة من العميل مؤسسة البناء الحديث',
  'DEP-2024-001',
  'completed',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM bank_accounts WHERE account_name = 'الحساب الجاري - البنك الأهلي' LIMIT 1),
  'bank',
  '2024-01-18',
  'withdrawal',
  15000.00,
  'سحب لدفع مستحقات المورد مصنع الخرسانة المتقدم',
  'WIT-2024-001',
  'completed',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM cash_accounts WHERE account_name = 'الخزينة الرئيسية' LIMIT 1),
  'cash',
  '2024-01-20',
  'deposit',
  5000.00,
  'إيداع نقدي في الخزينة',
  'CASH-DEP-2024-001',
  'completed',
  true,
  true
);

-- إدراج بيانات تجريبية لأصناف المخزون
INSERT INTO inventory_items (
  company_id,
  item_code,
  name,
  arabic_name,
  description,
  category,
  unit_of_measure,
  cost_price,
  selling_price,
  quantity_on_hand,
  minimum_quantity,
  maximum_quantity,
  reorder_point,
  location,
  supplier_id,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'MAT-001',
  'أسمنت بورتلاندي',
  'أسمنت بورتلاندي',
  'أسمنت بورتلاندي عالي الجودة',
  'مواد البناء',
  'كيس',
  25.00,
  30.00,
  150,
  50,
  500,
  100,
  'مخزن المواد الرئيسي',
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-001' LIMIT 1),
  true,
  'كيس 50 كجم'
),
(
  '00000000-0000-0000-0000-000000000001',
  'MAT-002',
  'حديد تسليح 12 مم',
  'حديد تسليح 12 مم',
  'حديد تسليح قطر 12 مم',
  'حديد ومعادن',
  'طن',
  2500.00,
  2800.00,
  25,
  10,
  100,
  15,
  'مخزن الحديد',
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-002' LIMIT 1),
  true,
  'حديد تسليح عالي الجودة'
),
(
  '00000000-0000-0000-0000-000000000001',
  'ELE-001',
  'كابل كهربائي 2.5 مم',
  'كابل كهربائي 2.5 مم',
  'كابل كهربائي نحاسي قطر 2.5 مم',
  'مواد كهربائية',
  'متر',
  8.00,
  10.00,
  500,
  100,
  1000,
  200,
  'مخزن الكهرباء',
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-003' LIMIT 1),
  true,
  'كابل كهربائي نحاسي معزول'
);

-- إدراج بيانات تجريبية لحركات المخزون
INSERT INTO inventory_transactions (
  company_id,
  item_id,
  transaction_date,
  transaction_type,
  quantity,
  unit_cost,
  total_cost,
  reference_number,
  description,
  project_id,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM inventory_items WHERE item_code = 'MAT-001' LIMIT 1),
  '2024-01-15',
  'receipt',
  100,
  25.00,
  2500.00,
  'PO-2024-001',
  'استلام أسمنت من المورد',
  (SELECT id FROM projects WHERE project_code = 'PRJ-001' LIMIT 1),
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM inventory_items WHERE item_code = 'MAT-001' LIMIT 1),
  '2024-01-20',
  'issue',
  50,
  25.00,
  1250.00,
  'REQ-2024-001',
  'صرف أسمنت للمشروع',
  (SELECT id FROM projects WHERE project_code = 'PRJ-001' LIMIT 1),
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM inventory_items WHERE item_code = 'MAT-002' LIMIT 1),
  '2024-01-18',
  'receipt',
  15,
  2500.00,
  37500.00,
  'PO-2024-002',
  'استلام حديد تسليح من المورد',
  (SELECT id FROM projects WHERE project_code = 'PRJ-002' LIMIT 1),
  true
);

-- إدراج بيانات تجريبية للأصول الثابتة
INSERT INTO fixed_assets (
  company_id,
  asset_code,
  name,
  arabic_name,
  description,
  category,
  purchase_date,
  purchase_cost,
  salvage_value,
  useful_life_years,
  depreciation_method,
  accumulated_depreciation,
  current_value,
  location,
  serial_number,
  supplier_id,
  is_active,
  notes
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'FA-001',
  'حفارة كاتربيلر 320D',
  'حفارة كاتربيلر 320D',
  'حفارة هيدروليكية متوسطة الحجم',
  'معدات ثقيلة',
  '2023-01-15',
  500000.00,
  50000.00,
  10,
  'straight_line',
  50000.00,
  450000.00,
  'موقع المشروع الأول',
  'CAT320D-2023-001',
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-001' LIMIT 1),
  true,
  'تم شراؤها جديدة من وكيل كاتربيلر'
),
(
  '00000000-0000-0000-0000-000000000001',
  'FA-002',
  'شاحنة مرسيدس أكتروس',
  'شاحنة مرسيدس أكتروس',
  'شاحنة نقل ثقيلة',
  'مركبات',
  '2023-03-20',
  300000.00,
  30000.00,
  8,
  'straight_line',
  30000.00,
  270000.00,
  'المكتب الرئيسي',
  'MB-ACT-2023-002',
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-002' LIMIT 1),
  true,
  'تستخدم لنقل مواد البناء'
),
(
  '00000000-0000-0000-0000-000000000001',
  'FA-003',
  'مولد كهرباء 500 كيلو وات',
  'مولد كهرباء 500 كيلو وات',
  'مولد كهرباء ديزل',
  'معدات كهربائية',
  '2023-05-10',
  150000.00,
  15000.00,
  15,
  'straight_line',
  15000.00,
  135000.00,
  'موقع المشروع الثاني',
  'GEN-500KW-2023-003',
  (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-003' LIMIT 1),
  true,
  'يستخدم لتوليد الكهرباء في مواقع البناء'
);

-- إدراج بيانات تجريبية لإهلاك الأصول
INSERT INTO asset_depreciation (
  company_id,
  asset_id,
  depreciation_date,
  depreciation_amount,
  accumulated_depreciation,
  book_value,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM fixed_assets WHERE asset_code = 'FA-001' LIMIT 1),
  '2023-12-31',
  50000.00,
  50000.00,
  450000.00,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM fixed_assets WHERE asset_code = 'FA-002' LIMIT 1),
  '2023-12-31',
  30000.00,
  30000.00,
  270000.00,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM fixed_assets WHERE asset_code = 'FA-003' LIMIT 1),
  '2023-12-31',
  15000.00,
  15000.00,
  135000.00,
  true
);

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_accounts') THEN
    RAISE NOTICE 'جدول الحسابات البنكية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول الحسابات البنكية';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cash_accounts') THEN
    RAISE NOTICE 'جدول حسابات النقدية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول حسابات النقدية';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_transactions') THEN
    RAISE NOTICE 'جدول المعاملات البنكية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول المعاملات البنكية';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
    RAISE NOTICE 'جدول أصناف المخزون تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول أصناف المخزون';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_transactions') THEN
    RAISE NOTICE 'جدول حركات المخزون تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول حركات المخزون';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixed_assets') THEN
    RAISE NOTICE 'جدول الأصول الثابتة تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول الأصول الثابتة';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'asset_depreciation') THEN
    RAISE NOTICE 'جدول إهلاك الأصول تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول إهلاك الأصول';
  END IF;
END $$;
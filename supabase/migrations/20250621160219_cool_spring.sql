/*
  # Chart of Accounts System with International Standards

  1. Tables
    - chart_of_accounts (دليل الحسابات)
    - account_groups (مجموعات الحسابات)
    - account_types (أنواع الحسابات)
    - account_movements (حركات الحسابات)

  2. Security
    - Enable RLS on all tables
    - Create policies for data access

  3. Functions
    - Functions for account balance calculation
    - Functions for account hierarchy management
*/

-- إنشاء جدول أنواع الحسابات
CREATE TABLE IF NOT EXISTS account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  balance_type text NOT NULL CHECK (balance_type IN ('debit', 'credit')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- إنشاء جدول مجموعات الحسابات
CREATE TABLE IF NOT EXISTS account_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  account_type_id uuid NOT NULL REFERENCES account_types(id),
  parent_id uuid REFERENCES account_groups(id),
  level integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- إنشاء جدول دليل الحسابات
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  code text NOT NULL,
  name text NOT NULL,
  arabic_name text,
  account_type_id uuid NOT NULL REFERENCES account_types(id),
  account_group_id uuid REFERENCES account_groups(id),
  parent_id uuid REFERENCES chart_of_accounts(id),
  level integer DEFAULT 1,
  is_header boolean DEFAULT false,
  is_active boolean DEFAULT true,
  balance_type text NOT NULL CHECK (balance_type IN ('debit', 'credit')),
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

-- إنشاء جدول حركات الحسابات
CREATE TABLE IF NOT EXISTS account_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  account_id uuid NOT NULL REFERENCES chart_of_accounts(id),
  transaction_date date NOT NULL,
  source text NOT NULL, -- journal_entry, invoice, payment, etc.
  source_id uuid NOT NULL,
  description text NOT NULL,
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  balance decimal(15,2) NOT NULL,
  currency text DEFAULT 'SAR',
  exchange_rate decimal(10,4) DEFAULT 1,
  is_opening_balance boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_movements ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_account_types" ON account_types;
DROP POLICY IF EXISTS "allow_all_account_groups" ON account_groups;
DROP POLICY IF EXISTS "allow_all_chart_of_accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "allow_all_account_movements" ON account_movements;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_account_types"
    ON account_types
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_account_groups"
    ON account_groups
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_chart_of_accounts"
    ON chart_of_accounts
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_account_movements"
    ON account_movements
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON account_types TO anon;
GRANT ALL PRIVILEGES ON account_types TO authenticated;
GRANT ALL PRIVILEGES ON account_groups TO anon;
GRANT ALL PRIVILEGES ON account_groups TO authenticated;
GRANT ALL PRIVILEGES ON chart_of_accounts TO anon;
GRANT ALL PRIVILEGES ON chart_of_accounts TO authenticated;
GRANT ALL PRIVILEGES ON account_movements TO anon;
GRANT ALL PRIVILEGES ON account_movements TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_account_types_company_id ON account_types(company_id);
CREATE INDEX IF NOT EXISTS idx_account_types_code ON account_types(code);
CREATE INDEX IF NOT EXISTS idx_account_types_is_active ON account_types(is_active);

CREATE INDEX IF NOT EXISTS idx_account_groups_company_id ON account_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_account_groups_code ON account_groups(code);
CREATE INDEX IF NOT EXISTS idx_account_groups_account_type_id ON account_groups(account_type_id);
CREATE INDEX IF NOT EXISTS idx_account_groups_parent_id ON account_groups(parent_id);
CREATE INDEX IF NOT EXISTS idx_account_groups_is_active ON account_groups(is_active);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_account_type_id ON chart_of_accounts(account_type_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_account_group_id ON chart_of_accounts(account_group_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_is_active ON chart_of_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_is_header ON chart_of_accounts(is_header);

CREATE INDEX IF NOT EXISTS idx_account_movements_company_id ON account_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_account_movements_account_id ON account_movements(account_id);
CREATE INDEX IF NOT EXISTS idx_account_movements_transaction_date ON account_movements(transaction_date);
CREATE INDEX IF NOT EXISTS idx_account_movements_source ON account_movements(source);
CREATE INDEX IF NOT EXISTS idx_account_movements_source_id ON account_movements(source_id);
CREATE INDEX IF NOT EXISTS idx_account_movements_is_active ON account_movements(is_active);

-- إنشاء دوال تحديث updated_at
CREATE OR REPLACE FUNCTION update_account_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_account_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_chart_of_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_account_movements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_account_types_updated_at_trigger
  BEFORE UPDATE ON account_types
  FOR EACH ROW 
  EXECUTE FUNCTION update_account_types_updated_at();

CREATE TRIGGER update_account_groups_updated_at_trigger
  BEFORE UPDATE ON account_groups
  FOR EACH ROW 
  EXECUTE FUNCTION update_account_groups_updated_at();

CREATE TRIGGER update_chart_of_accounts_updated_at_trigger
  BEFORE UPDATE ON chart_of_accounts
  FOR EACH ROW 
  EXECUTE FUNCTION update_chart_of_accounts_updated_at();

CREATE TRIGGER update_account_movements_updated_at_trigger
  BEFORE UPDATE ON account_movements
  FOR EACH ROW 
  EXECUTE FUNCTION update_account_movements_updated_at();

-- دالة لتحديث أرصدة الحسابات الأب
CREATE OR REPLACE FUNCTION update_parent_account_balances()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_id uuid;
  v_balance_change decimal(15,2);
  v_balance_type text;
BEGIN
  -- Get parent ID and balance type
  SELECT parent_id, balance_type INTO v_parent_id, v_balance_type
  FROM chart_of_accounts
  WHERE id = NEW.id;
  
  -- Calculate balance change
  IF v_balance_type = 'debit' THEN
    v_balance_change := NEW.current_balance - COALESCE(OLD.current_balance, 0);
  ELSE
    v_balance_change := NEW.current_balance - COALESCE(OLD.current_balance, 0);
  END IF;
  
  -- Update parent balance recursively
  WHILE v_parent_id IS NOT NULL LOOP
    UPDATE chart_of_accounts
    SET current_balance = current_balance + v_balance_change
    WHERE id = v_parent_id;
    
    -- Get next parent
    SELECT parent_id INTO v_parent_id
    FROM chart_of_accounts
    WHERE id = v_parent_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث أرصدة الحسابات الأب
CREATE TRIGGER update_parent_account_balances_trigger
  AFTER UPDATE OF current_balance ON chart_of_accounts
  FOR EACH ROW
  WHEN (NEW.current_balance IS DISTINCT FROM OLD.current_balance)
  EXECUTE FUNCTION update_parent_account_balances();

-- دالة لإنشاء حركة حساب
CREATE OR REPLACE FUNCTION create_account_movement(
  p_company_id uuid,
  p_account_id uuid,
  p_transaction_date date,
  p_source text,
  p_source_id uuid,
  p_description text,
  p_debit_amount decimal(15,2),
  p_credit_amount decimal(15,2),
  p_currency text DEFAULT 'SAR',
  p_exchange_rate decimal DEFAULT 1,
  p_is_opening_balance boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  v_account_balance decimal(15,2);
  v_balance_type text;
  v_balance_change decimal(15,2);
  v_movement_id uuid;
BEGIN
  -- Get current account balance and balance type
  SELECT current_balance, balance_type INTO v_account_balance, v_balance_type
  FROM chart_of_accounts
  WHERE id = p_account_id;
  
  -- Calculate balance change based on account type
  IF v_balance_type = 'debit' THEN
    v_balance_change := p_debit_amount - p_credit_amount;
  ELSE
    v_balance_change := p_credit_amount - p_debit_amount;
  END IF;
  
  -- Calculate new balance
  v_account_balance := v_account_balance + v_balance_change;
  
  -- Insert movement record
  INSERT INTO account_movements (
    company_id,
    account_id,
    transaction_date,
    source,
    source_id,
    description,
    debit_amount,
    credit_amount,
    balance,
    currency,
    exchange_rate,
    is_opening_balance,
    is_active
  ) VALUES (
    p_company_id,
    p_account_id,
    p_transaction_date,
    p_source,
    p_source_id,
    p_description,
    p_debit_amount,
    p_credit_amount,
    v_account_balance,
    p_currency,
    p_exchange_rate,
    p_is_opening_balance,
    true
  ) RETURNING id INTO v_movement_id;
  
  -- Update account balance
  UPDATE chart_of_accounts
  SET current_balance = v_account_balance,
      updated_at = now()
  WHERE id = p_account_id;
  
  RETURN v_movement_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating account movement: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- إدراج بيانات تجريبية لأنواع الحسابات (وفقاً للمعايير الدولية)
INSERT INTO account_types (
  company_id,
  code,
  name,
  arabic_name,
  balance_type,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  '1',
  'Assets',
  'الأصول',
  'debit',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '2',
  'Liabilities',
  'الخصوم',
  'credit',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '3',
  'Equity',
  'حقوق الملكية',
  'credit',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '4',
  'Revenue',
  'الإيرادات',
  'credit',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '5',
  'Expenses',
  'المصروفات',
  'debit',
  true
);

-- إدراج بيانات تجريبية لمجموعات الحسابات
INSERT INTO account_groups (
  company_id,
  code,
  name,
  arabic_name,
  account_type_id,
  level,
  is_active
) VALUES 
-- مجموعات الأصول
(
  '00000000-0000-0000-0000-000000000001',
  '11',
  'Current Assets',
  'الأصول المتداولة',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '12',
  'Non-Current Assets',
  'الأصول غير المتداولة',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
-- مجموعات الخصوم
(
  '00000000-0000-0000-0000-000000000001',
  '21',
  'Current Liabilities',
  'الخصوم المتداولة',
  (SELECT id FROM account_types WHERE code = '2' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '22',
  'Non-Current Liabilities',
  'الخصوم غير المتداولة',
  (SELECT id FROM account_types WHERE code = '2' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
-- مجموعات حقوق الملكية
(
  '00000000-0000-0000-0000-000000000001',
  '31',
  'Capital',
  'رأس المال',
  (SELECT id FROM account_types WHERE code = '3' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '32',
  'Retained Earnings',
  'الأرباح المحتجزة',
  (SELECT id FROM account_types WHERE code = '3' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
-- مجموعات الإيرادات
(
  '00000000-0000-0000-0000-000000000001',
  '41',
  'Operating Revenue',
  'إيرادات التشغيل',
  (SELECT id FROM account_types WHERE code = '4' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '42',
  'Non-Operating Revenue',
  'إيرادات غير تشغيلية',
  (SELECT id FROM account_types WHERE code = '4' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
-- مجموعات المصروفات
(
  '00000000-0000-0000-0000-000000000001',
  '51',
  'Operating Expenses',
  'مصروفات التشغيل',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '52',
  'Non-Operating Expenses',
  'مصروفات غير تشغيلية',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true
);

-- إدراج بيانات تجريبية لدليل الحسابات
INSERT INTO chart_of_accounts (
  company_id,
  code,
  name,
  arabic_name,
  account_type_id,
  account_group_id,
  level,
  is_header,
  is_active,
  balance_type,
  opening_balance,
  current_balance,
  description
) VALUES 
-- الأصول المتداولة
(
  '00000000-0000-0000-0000-000000000001',
  '1000',
  'Cash and Cash Equivalents',
  'النقدية وما في حكمها',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '11' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true,
  true,
  'debit',
  0,
  0,
  'Cash and bank accounts'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1001',
  'Cash on Hand',
  'النقدية في الصندوق',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '11' AND company_id = '00000000-0000-0000-0000-000000000001'),
  2,
  false,
  true,
  'debit',
  50000,
  50000,
  'Cash in company safe'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1002',
  'Bank Accounts',
  'الحسابات البنكية',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '11' AND company_id = '00000000-0000-0000-0000-000000000001'),
  2,
  true,
  true,
  'debit',
  0,
  0,
  'All bank accounts'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1002.1',
  'Main Bank Account',
  'الحساب البنكي الرئيسي',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '11' AND company_id = '00000000-0000-0000-0000-000000000001'),
  3,
  false,
  true,
  'debit',
  125000,
  125000,
  'Main operating account'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1100',
  'Accounts Receivable',
  'الذمم المدينة',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '11' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  75000,
  75000,
  'Customer receivables'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1200',
  'Inventory',
  'المخزون',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '11' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  100000,
  100000,
  'Inventory of goods'
),
-- الأصول غير المتداولة
(
  '00000000-0000-0000-0000-000000000001',
  '1300',
  'Fixed Assets',
  'الأصول الثابتة',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '12' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true,
  true,
  'debit',
  0,
  0,
  'Long-term tangible assets'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1301',
  'Buildings',
  'المباني',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '12' AND company_id = '00000000-0000-0000-0000-000000000001'),
  2,
  false,
  true,
  'debit',
  500000,
  500000,
  'Company buildings'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1302',
  'Equipment',
  'المعدات',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '12' AND company_id = '00000000-0000-0000-0000-000000000001'),
  2,
  false,
  true,
  'debit',
  200000,
  200000,
  'Machinery and equipment'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1303',
  'Vehicles',
  'المركبات',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '12' AND company_id = '00000000-0000-0000-0000-000000000001'),
  2,
  false,
  true,
  'debit',
  150000,
  150000,
  'Company vehicles'
),
(
  '00000000-0000-0000-0000-000000000001',
  '1400',
  'Accumulated Depreciation',
  'مجمع الإهلاك',
  (SELECT id FROM account_types WHERE code = '1' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '12' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  true,
  true,
  'credit',
  100000,
  100000,
  'Accumulated depreciation of fixed assets'
),
-- الخصوم المتداولة
(
  '00000000-0000-0000-0000-000000000001',
  '2000',
  'Accounts Payable',
  'الذمم الدائنة',
  (SELECT id FROM account_types WHERE code = '2' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '21' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  35000,
  35000,
  'Supplier payables'
),
(
  '00000000-0000-0000-0000-000000000001',
  '2100',
  'Accrued Expenses',
  'المصروفات المستحقة',
  (SELECT id FROM account_types WHERE code = '2' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '21' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  15000,
  15000,
  'Accrued but unpaid expenses'
),
(
  '00000000-0000-0000-0000-000000000001',
  '2200',
  'VAT Payable',
  'ضريبة القيمة المضافة المستحقة',
  (SELECT id FROM account_types WHERE code = '2' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '21' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  7500,
  7500,
  'VAT collected from customers'
),
-- الخصوم غير المتداولة
(
  '00000000-0000-0000-0000-000000000001',
  '2300',
  'Long-term Loans',
  'القروض طويلة الأجل',
  (SELECT id FROM account_types WHERE code = '2' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '22' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  200000,
  200000,
  'Bank loans with term > 1 year'
),
-- حقوق الملكية
(
  '00000000-0000-0000-0000-000000000001',
  '3000',
  'Capital',
  'رأس المال',
  (SELECT id FROM account_types WHERE code = '3' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '31' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  500000,
  500000,
  'Owner capital'
),
(
  '00000000-0000-0000-0000-000000000001',
  '3100',
  'Retained Earnings',
  'الأرباح المحتجزة',
  (SELECT id FROM account_types WHERE code = '3' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '32' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  150000,
  150000,
  'Accumulated profits'
),
-- الإيرادات
(
  '00000000-0000-0000-0000-000000000001',
  '4000',
  'Project Revenues',
  'إيرادات المشاريع',
  (SELECT id FROM account_types WHERE code = '4' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '41' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  200000,
  200000,
  'Revenue from projects'
),
(
  '00000000-0000-0000-0000-000000000001',
  '4100',
  'Service Revenues',
  'إيرادات الخدمات',
  (SELECT id FROM account_types WHERE code = '4' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '41' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  50000,
  50000,
  'Revenue from services'
),
(
  '00000000-0000-0000-0000-000000000001',
  '4200',
  'Other Revenues',
  'إيرادات أخرى',
  (SELECT id FROM account_types WHERE code = '4' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '42' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'credit',
  10000,
  10000,
  'Miscellaneous revenues'
),
-- المصروفات
(
  '00000000-0000-0000-0000-000000000001',
  '5000',
  'Project Expenses',
  'مصروفات المشاريع',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '51' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  120000,
  120000,
  'Direct project expenses'
),
(
  '00000000-0000-0000-0000-000000000001',
  '5100',
  'Salaries and Wages',
  'الرواتب والأجور',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '51' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  80000,
  80000,
  'Employee salaries'
),
(
  '00000000-0000-0000-0000-000000000001',
  '5200',
  'Rent Expense',
  'مصروف الإيجار',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '51' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  24000,
  24000,
  'Office and warehouse rent'
),
(
  '00000000-0000-0000-0000-000000000001',
  '5300',
  'Utilities',
  'المرافق',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '51' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  12000,
  12000,
  'Electricity, water, internet'
),
(
  '00000000-0000-0000-0000-000000000001',
  '5400',
  'Depreciation Expense',
  'مصروف الإهلاك',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '51' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  30000,
  30000,
  'Depreciation of fixed assets'
),
(
  '00000000-0000-0000-0000-000000000001',
  '5500',
  'Financial Expenses',
  'المصروفات المالية',
  (SELECT id FROM account_types WHERE code = '5' AND company_id = '00000000-0000-0000-0000-000000000001'),
  (SELECT id FROM account_groups WHERE code = '52' AND company_id = '00000000-0000-0000-0000-000000000001'),
  1,
  false,
  true,
  'debit',
  5000,
  5000,
  'Bank fees and interest'
);

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_types') THEN
    RAISE NOTICE 'جدول أنواع الحسابات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول أنواع الحسابات';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_groups') THEN
    RAISE NOTICE 'جدول مجموعات الحسابات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول مجموعات الحسابات';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chart_of_accounts') THEN
    RAISE NOTICE 'جدول دليل الحسابات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول دليل الحسابات';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_movements') THEN
    RAISE NOTICE 'جدول حركات الحسابات تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول حركات الحسابات';
  END IF;
END $$;
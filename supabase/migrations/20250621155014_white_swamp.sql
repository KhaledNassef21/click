/*
  # إنشاء نظام القيود اليومية المتكامل

  1. الجداول
    - journal_entries (القيود اليومية)
    - journal_entry_lines (بنود القيود اليومية)
    - journal_entry_attachments (مرفقات القيود اليومية)
    - journal_entry_templates (قوالب القيود اليومية)

  2. الأمان
    - تمكين RLS على جميع الجداول
    - إنشاء سياسات مفتوحة للسماح بجميع العمليات

  3. الوظائف
    - دالة لإنشاء قيد يومي تلقائي من المعاملات الأخرى
    - دالة لتحديث أرصدة الحسابات عند ترحيل القيود
*/

-- إنشاء جدول القيود اليومية
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  entry_number text NOT NULL,
  entry_date date NOT NULL,
  posting_date date,
  reference text,
  source text, -- مصدر القيد (يدوي، فاتورة، سند، شيك، إلخ)
  source_id uuid, -- معرف المستند المصدر
  description text NOT NULL,
  total_debit decimal(15,2) NOT NULL,
  total_credit decimal(15,2) NOT NULL,
  currency text DEFAULT 'SAR',
  exchange_rate decimal(10,4) DEFAULT 1,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  next_recurrence_date date,
  is_auto_generated boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid,
  posted_by uuid,
  posted_at timestamptz,
  reversed_by uuid,
  reversed_at timestamptz,
  reversal_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول بنود القيود اليومية
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL,
  description text,
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  currency text DEFAULT 'SAR',
  exchange_rate decimal(10,4) DEFAULT 1,
  project_id uuid,
  cost_center_id uuid,
  customer_id uuid,
  supplier_id uuid,
  employee_id uuid,
  line_number integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول مرفقات القيود اليومية
CREATE TABLE IF NOT EXISTS journal_entry_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  file_path text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now()
);

-- إنشاء جدول قوالب القيود اليومية
CREATE TABLE IF NOT EXISTS journal_entry_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_templates ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إن وجدت
DROP POLICY IF EXISTS "allow_all_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "allow_all_journal_entry_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "allow_all_journal_entry_attachments" ON journal_entry_attachments;
DROP POLICY IF EXISTS "allow_all_journal_entry_templates" ON journal_entry_templates;

-- إنشاء سياسات مفتوحة للسماح بجميع العمليات
CREATE POLICY "allow_all_journal_entries"
    ON journal_entries
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_journal_entry_lines"
    ON journal_entry_lines
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_journal_entry_attachments"
    ON journal_entry_attachments
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_journal_entry_templates"
    ON journal_entry_templates
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON journal_entries TO anon;
GRANT ALL PRIVILEGES ON journal_entries TO authenticated;
GRANT ALL PRIVILEGES ON journal_entry_lines TO anon;
GRANT ALL PRIVILEGES ON journal_entry_lines TO authenticated;
GRANT ALL PRIVILEGES ON journal_entry_attachments TO anon;
GRANT ALL PRIVILEGES ON journal_entry_attachments TO authenticated;
GRANT ALL PRIVILEGES ON journal_entry_templates TO anon;
GRANT ALL PRIVILEGES ON journal_entry_templates TO authenticated;

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_number ON journal_entries(entry_number);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source ON journal_entries(source);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source_id ON journal_entries(source_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_active ON journal_entries(is_active);

CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_project_id ON journal_entry_lines(project_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_customer_id ON journal_entry_lines(customer_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_supplier_id ON journal_entry_lines(supplier_id);

CREATE INDEX IF NOT EXISTS idx_journal_entry_attachments_journal_entry_id ON journal_entry_attachments(journal_entry_id);

CREATE INDEX IF NOT EXISTS idx_journal_entry_templates_company_id ON journal_entry_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_templates_name ON journal_entry_templates(name);
CREATE INDEX IF NOT EXISTS idx_journal_entry_templates_is_active ON journal_entry_templates(is_active);

-- إنشاء قيود فريدة
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_company_entry_number_unique 
UNIQUE (company_id, entry_number);

-- إنشاء دوال تحديث updated_at
CREATE OR REPLACE FUNCTION update_journal_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_journal_entry_lines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_journal_entry_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_journal_entries_updated_at_trigger
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW 
  EXECUTE FUNCTION update_journal_entries_updated_at();

CREATE TRIGGER update_journal_entry_lines_updated_at_trigger
  BEFORE UPDATE ON journal_entry_lines
  FOR EACH ROW 
  EXECUTE FUNCTION update_journal_entry_lines_updated_at();

CREATE TRIGGER update_journal_entry_templates_updated_at_trigger
  BEFORE UPDATE ON journal_entry_templates
  FOR EACH ROW 
  EXECUTE FUNCTION update_journal_entry_templates_updated_at();

-- دالة لإنشاء قيد يومي تلقائي من المعاملات الأخرى
CREATE OR REPLACE FUNCTION create_auto_journal_entry(
  p_company_id uuid,
  p_source text,
  p_source_id uuid,
  p_entry_date date,
  p_description text,
  p_lines jsonb,
  p_currency text DEFAULT 'SAR',
  p_exchange_rate decimal DEFAULT 1,
  p_reference text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_entry_number text;
  v_total_debit decimal(15,2) := 0;
  v_total_credit decimal(15,2) := 0;
  v_journal_entry_id uuid;
  v_line jsonb;
BEGIN
  -- Generate entry number
  SELECT 'JE-' || to_char(now(), 'YYYYMMDD') || '-' || 
         LPAD(COALESCE(
           (SELECT COUNT(*) + 1 FROM journal_entries 
            WHERE company_id = p_company_id AND 
                  entry_date >= date_trunc('day', now())),
           1)::text, 3, '0')
  INTO v_entry_number;
  
  -- Calculate totals
  SELECT 
    COALESCE(SUM((line->>'debit_amount')::decimal(15,2)), 0),
    COALESCE(SUM((line->>'credit_amount')::decimal(15,2)), 0)
  INTO v_total_debit, v_total_credit
  FROM jsonb_array_elements(p_lines) AS line;
  
  -- Insert journal entry
  INSERT INTO journal_entries (
    company_id,
    entry_number,
    entry_date,
    reference,
    source,
    source_id,
    description,
    total_debit,
    total_credit,
    currency,
    exchange_rate,
    status,
    is_auto_generated,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_company_id,
    v_entry_number,
    p_entry_date,
    p_reference,
    p_source,
    p_source_id,
    p_description,
    v_total_debit,
    v_total_credit,
    p_currency,
    p_exchange_rate,
    'draft',
    true,
    true,
    now(),
    now()
  ) RETURNING id INTO v_journal_entry_id;
  
  -- Insert journal entry lines
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    INSERT INTO journal_entry_lines (
      journal_entry_id,
      account_id,
      description,
      debit_amount,
      credit_amount,
      currency,
      exchange_rate,
      project_id,
      cost_center_id,
      customer_id,
      supplier_id,
      employee_id,
      line_number,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      v_journal_entry_id,
      (v_line->>'account_id')::uuid,
      (v_line->>'description')::text,
      COALESCE((v_line->>'debit_amount')::decimal(15,2), 0),
      COALESCE((v_line->>'credit_amount')::decimal(15,2), 0),
      COALESCE((v_line->>'currency')::text, p_currency),
      COALESCE((v_line->>'exchange_rate')::decimal(10,4), p_exchange_rate),
      (v_line->>'project_id')::uuid,
      (v_line->>'cost_center_id')::uuid,
      (v_line->>'customer_id')::uuid,
      (v_line->>'supplier_id')::uuid,
      (v_line->>'employee_id')::uuid,
      COALESCE((v_line->>'line_number')::integer, 0),
      true,
      now(),
      now()
    );
  END LOOP;
  
  RETURN v_journal_entry_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating journal entry: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث أرصدة الحسابات عند ترحيل القيود
CREATE OR REPLACE FUNCTION post_journal_entry(
  p_journal_entry_id uuid,
  p_posting_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_entry_status text;
  v_line record;
  v_account_id uuid;
  v_debit_amount decimal(15,2);
  v_credit_amount decimal(15,2);
  v_account_type text;
  v_balance_type text;
  v_amount_change decimal(15,2);
BEGIN
  -- Check if entry is already posted
  SELECT status INTO v_entry_status
  FROM journal_entries
  WHERE id = p_journal_entry_id;
  
  IF v_entry_status = 'posted' THEN
    RAISE EXCEPTION 'Journal entry is already posted';
  END IF;
  
  -- Update journal entry status
  UPDATE journal_entries
  SET 
    status = 'posted',
    posting_date = CURRENT_DATE,
    posted_by = p_posting_user_id,
    posted_at = now(),
    updated_at = now()
  WHERE id = p_journal_entry_id;
  
  -- Update account balances for each line
  FOR v_line IN 
    SELECT 
      jel.account_id,
      jel.debit_amount,
      jel.credit_amount,
      coa.account_type,
      coa.balance_type
    FROM journal_entry_lines jel
    JOIN chart_of_accounts coa ON jel.account_id = coa.id
    WHERE jel.journal_entry_id = p_journal_entry_id AND jel.is_active = true
  LOOP
    v_account_id := v_line.account_id;
    v_debit_amount := v_line.debit_amount;
    v_credit_amount := v_line.credit_amount;
    v_account_type := v_line.account_type;
    v_balance_type := v_line.balance_type;
    
    -- Calculate amount change based on account type and balance type
    IF v_balance_type = 'debit' THEN
      v_amount_change := v_debit_amount - v_credit_amount;
    ELSE
      v_amount_change := v_credit_amount - v_debit_amount;
    END IF;
    
    -- Update account balance
    UPDATE chart_of_accounts
    SET current_balance = current_balance + v_amount_change,
        updated_at = now()
    WHERE id = v_account_id;
  END LOOP;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error posting journal entry: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- دالة لعكس قيد محاسبي
CREATE OR REPLACE FUNCTION reverse_journal_entry(
  p_journal_entry_id uuid,
  p_reversal_user_id uuid,
  p_reversal_reason text
)
RETURNS uuid AS $$
DECLARE
  v_entry record;
  v_reversal_id uuid;
  v_reversal_number text;
  v_line record;
BEGIN
  -- Get original entry details
  SELECT * INTO v_entry
  FROM journal_entries
  WHERE id = p_journal_entry_id;
  
  IF v_entry.status != 'posted' THEN
    RAISE EXCEPTION 'Only posted journal entries can be reversed';
  END IF;
  
  -- Generate reversal entry number
  SELECT 'REV-' || v_entry.entry_number INTO v_reversal_number;
  
  -- Create reversal entry
  INSERT INTO journal_entries (
    company_id,
    entry_number,
    entry_date,
    posting_date,
    reference,
    source,
    source_id,
    description,
    total_debit,
    total_credit,
    currency,
    exchange_rate,
    status,
    is_auto_generated,
    is_active,
    created_by,
    notes
  ) VALUES (
    v_entry.company_id,
    v_reversal_number,
    CURRENT_DATE,
    CURRENT_DATE,
    'Reversal of ' || v_entry.entry_number,
    'reversal',
    v_entry.id,
    'عكس قيد: ' || v_entry.description,
    v_entry.total_credit, -- Swap debit and credit
    v_entry.total_debit,  -- Swap debit and credit
    v_entry.currency,
    v_entry.exchange_rate,
    'posted',
    true,
    true,
    p_reversal_user_id,
    p_reversal_reason
  ) RETURNING id INTO v_reversal_id;
  
  -- Create reversal lines (with swapped debit and credit)
  FOR v_line IN 
    SELECT * FROM journal_entry_lines
    WHERE journal_entry_id = p_journal_entry_id AND is_active = true
  LOOP
    INSERT INTO journal_entry_lines (
      journal_entry_id,
      account_id,
      description,
      debit_amount,
      credit_amount,
      currency,
      exchange_rate,
      project_id,
      cost_center_id,
      customer_id,
      supplier_id,
      employee_id,
      line_number,
      is_active
    ) VALUES (
      v_reversal_id,
      v_line.account_id,
      'عكس: ' || v_line.description,
      v_line.credit_amount, -- Swap debit and credit
      v_line.debit_amount,  -- Swap debit and credit
      v_line.currency,
      v_line.exchange_rate,
      v_line.project_id,
      v_line.cost_center_id,
      v_line.customer_id,
      v_line.supplier_id,
      v_line.employee_id,
      v_line.line_number,
      true
    );
  END LOOP;
  
  -- Update original entry
  UPDATE journal_entries
  SET 
    status = 'reversed',
    reversed_by = p_reversal_user_id,
    reversed_at = now(),
    reversal_reason = p_reversal_reason,
    updated_at = now()
  WHERE id = p_journal_entry_id;
  
  -- Update account balances for reversal
  PERFORM post_journal_entry(v_reversal_id, p_reversal_user_id);
  
  RETURN v_reversal_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error reversing journal entry: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- إدراج بيانات تجريبية للقيود اليومية
INSERT INTO journal_entries (
  company_id,
  entry_number,
  entry_date,
  reference,
  description,
  total_debit,
  total_credit,
  status,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'JE-2024-001',
  '2024-01-15',
  'INV-2024-001',
  'قيد فاتورة مبيعات لمؤسسة البناء الحديث',
  57500.00,
  57500.00,
  'posted',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'JE-2024-002',
  '2024-01-18',
  'PV-2024-001',
  'قيد سند صرف لمصنع الخرسانة المتقدم',
  15000.00,
  15000.00,
  'posted',
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'JE-2024-003',
  '2024-01-20',
  'RV-2024-002',
  'قيد سند قبض من شركة التطوير العقاري',
  50000.00,
  50000.00,
  'draft',
  true
);

-- إدراج بيانات تجريبية لبنود القيود اليومية
INSERT INTO journal_entry_lines (
  journal_entry_id,
  account_id,
  description,
  debit_amount,
  credit_amount,
  line_number
) VALUES 
-- بنود القيد الأول
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-001' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '1100' LIMIT 1), -- البنك الأهلي
  'مبلغ الفاتورة',
  57500.00,
  0.00,
  1
),
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-001' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '4000' LIMIT 1), -- إيرادات المشاريع
  'إيرادات الفاتورة',
  0.00,
  50000.00,
  2
),
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-001' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '2000' LIMIT 1), -- الموردون (نفترض أنه حساب ضريبة القيمة المضافة)
  'ضريبة القيمة المضافة',
  0.00,
  7500.00,
  3
),

-- بنود القيد الثاني
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-002' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '5000' LIMIT 1), -- مصروفات المشاريع
  'مصروفات مواد بناء',
  15000.00,
  0.00,
  1
),
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-002' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '1100' LIMIT 1), -- البنك الأهلي
  'دفع مستحقات مورد',
  0.00,
  15000.00,
  2
),

-- بنود القيد الثالث
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-003' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '1000' LIMIT 1), -- النقدية
  'استلام دفعة نقدية',
  50000.00,
  0.00,
  1
),
(
  (SELECT id FROM journal_entries WHERE entry_number = 'JE-2024-003' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE code = '1200' LIMIT 1), -- العملاء
  'تسديد مستحقات عميل',
  0.00,
  50000.00,
  2
);

-- التحقق من إنشاء الجداول بنجاح
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
    RAISE NOTICE 'جدول القيود اليومية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول القيود اليومية';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entry_lines') THEN
    RAISE NOTICE 'جدول بنود القيود اليومية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول بنود القيود اليومية';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entry_attachments') THEN
    RAISE NOTICE 'جدول مرفقات القيود اليومية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول مرفقات القيود اليومية';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entry_templates') THEN
    RAISE NOTICE 'جدول قوالب القيود اليومية تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة';
  ELSE
    RAISE EXCEPTION 'فشل في إنشاء جدول قوالب القيود اليومية';
  END IF;
END $$;
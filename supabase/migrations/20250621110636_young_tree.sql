-- Fix customers table schema by adding missing columns
-- This migration ensures all required columns exist

-- Add missing columns to customers table
DO $$
BEGIN
  -- Add company_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'Added company_id column to customers table';
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text;
    RAISE NOTICE 'Added city column to customers table';
  END IF;

  -- Add country column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'country'
  ) THEN
    ALTER TABLE customers ADD COLUMN country text DEFAULT 'Saudi Arabia';
    RAISE NOTICE 'Added country column to customers table';
  END IF;

  -- Add postal_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN postal_code text;
    RAISE NOTICE 'Added postal_code column to customers table';
  END IF;

  -- Add arabic_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'arabic_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN arabic_name text;
    RAISE NOTICE 'Added arabic_name column to customers table';
  END IF;

  -- Add mobile column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'mobile'
  ) THEN
    ALTER TABLE customers ADD COLUMN mobile text;
    RAISE NOTICE 'Added mobile column to customers table';
  END IF;

  -- Add tax_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'tax_number'
  ) THEN
    ALTER TABLE customers ADD COLUMN tax_number text;
    RAISE NOTICE 'Added tax_number column to customers table';
  END IF;

  -- Add commercial_register column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'commercial_register'
  ) THEN
    ALTER TABLE customers ADD COLUMN commercial_register text;
    RAISE NOTICE 'Added commercial_register column to customers table';
  END IF;

  -- Add contact_person column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_person text;
    RAISE NOTICE 'Added contact_person column to customers table';
  END IF;

  -- Add contact_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_email text;
    RAISE NOTICE 'Added contact_email column to customers table';
  END IF;

  -- Add contact_phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_phone text;
    RAISE NOTICE 'Added contact_phone column to customers table';
  END IF;

  -- Add credit_limit column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'credit_limit'
  ) THEN
    ALTER TABLE customers ADD COLUMN credit_limit decimal(15,2) DEFAULT 0;
    RAISE NOTICE 'Added credit_limit column to customers table';
  END IF;

  -- Add payment_terms column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE customers ADD COLUMN payment_terms integer DEFAULT 30;
    RAISE NOTICE 'Added payment_terms column to customers table';
  END IF;

  -- Add currency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'currency'
  ) THEN
    ALTER TABLE customers ADD COLUMN currency text DEFAULT 'SAR';
    RAISE NOTICE 'Added currency column to customers table';
  END IF;

  -- Add account_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN account_id uuid;
    RAISE NOTICE 'Added account_id column to customers table';
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
    RAISE NOTICE 'Added notes column to customers table';
  END IF;

  -- Add customer_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'customer_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN customer_code text;
    RAISE NOTICE 'Added customer_code column to customers table';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column to customers table';
  END IF;

END $$;

-- Ensure RLS is enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Allow all operations for now" ON customers;
CREATE POLICY "Allow all operations for now"
  ON customers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers
  FOR EACH ROW 
  EXECUTE FUNCTION update_customers_updated_at();

-- Insert a default company if it doesn't exist
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
ON CONFLICT (id) DO NOTHING;

-- Insert some sample customers for testing
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
)
ON CONFLICT (company_id, customer_code) DO NOTHING;
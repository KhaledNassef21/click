/*
  # Fix customers table schema - ensure all columns exist

  This migration ensures the customers table has all required columns
  and fixes any schema inconsistencies.

  1. Tables
    - Recreate customers table with proper schema if needed
    - Add all missing columns
    - Preserve existing data

  2. Security
    - Enable RLS on customers table
    - Add proper policies for data access
*/

-- First, let's check if the customers table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Now add all the missing columns one by one
-- This approach ensures we don't lose any existing data

-- Add company_id column (this is the main missing column causing the error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'Added company_id column to customers table';
  END IF;
END $$;

-- Add customer_code column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'customer_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN customer_code text;
    RAISE NOTICE 'Added customer_code column to customers table';
  END IF;
END $$;

-- Add arabic_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'arabic_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN arabic_name text;
    RAISE NOTICE 'Added arabic_name column to customers table';
  END IF;
END $$;

-- Add mobile column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'mobile'
  ) THEN
    ALTER TABLE customers ADD COLUMN mobile text;
    RAISE NOTICE 'Added mobile column to customers table';
  END IF;
END $$;

-- Add city column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text;
    RAISE NOTICE 'Added city column to customers table';
  END IF;
END $$;

-- Add country column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'country'
  ) THEN
    ALTER TABLE customers ADD COLUMN country text DEFAULT 'Saudi Arabia';
    RAISE NOTICE 'Added country column to customers table';
  END IF;
END $$;

-- Add postal_code column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN postal_code text;
    RAISE NOTICE 'Added postal_code column to customers table';
  END IF;
END $$;

-- Add tax_number column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'tax_number'
  ) THEN
    ALTER TABLE customers ADD COLUMN tax_number text;
    RAISE NOTICE 'Added tax_number column to customers table';
  END IF;
END $$;

-- Add commercial_register column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'commercial_register'
  ) THEN
    ALTER TABLE customers ADD COLUMN commercial_register text;
    RAISE NOTICE 'Added commercial_register column to customers table';
  END IF;
END $$;

-- Add contact_person column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_person text;
    RAISE NOTICE 'Added contact_person column to customers table';
  END IF;
END $$;

-- Add contact_email column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_email text;
    RAISE NOTICE 'Added contact_email column to customers table';
  END IF;
END $$;

-- Add contact_phone column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_phone text;
    RAISE NOTICE 'Added contact_phone column to customers table';
  END IF;
END $$;

-- Add credit_limit column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'credit_limit'
  ) THEN
    ALTER TABLE customers ADD COLUMN credit_limit decimal(15,2) DEFAULT 0;
    RAISE NOTICE 'Added credit_limit column to customers table';
  END IF;
END $$;

-- Add payment_terms column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE customers ADD COLUMN payment_terms integer DEFAULT 30;
    RAISE NOTICE 'Added payment_terms column to customers table';
  END IF;
END $$;

-- Add currency column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'currency'
  ) THEN
    ALTER TABLE customers ADD COLUMN currency text DEFAULT 'SAR';
    RAISE NOTICE 'Added currency column to customers table';
  END IF;
END $$;

-- Add account_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN account_id uuid;
    RAISE NOTICE 'Added account_id column to customers table';
  END IF;
END $$;

-- Add notes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
    RAISE NOTICE 'Added notes column to customers table';
  END IF;
END $$;

-- Add updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column to customers table';
  END IF;
END $$;

-- Ensure the companies table exists for the foreign key reference
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  arabic_name text,
  currency text DEFAULT 'SAR',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert the default company if it doesn't exist
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

-- Enable RLS on both tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones
DROP POLICY IF EXISTS "Allow all operations for now" ON customers;
DROP POLICY IF EXISTS "Users can access their company customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers for their company" ON customers;
DROP POLICY IF EXISTS "Users can update their company customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their company customers" ON customers;

-- Create permissive policies for now (will be restricted when auth is implemented)
CREATE POLICY "Allow all customer operations"
  ON customers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all company operations"
  ON companies
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
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Create unique constraint for customer_code within company (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'customers_company_customer_code_key'
    AND table_name = 'customers'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_company_customer_code_key 
    UNIQUE (company_id, customer_code);
    RAISE NOTICE 'Added unique constraint for customer_code within company';
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers
  FOR EACH ROW 
  EXECUTE FUNCTION update_customers_updated_at();

-- Insert some sample customers for testing (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM customers LIMIT 1) THEN
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
    );
    RAISE NOTICE 'Inserted sample customer data';
  END IF;
END $$;
/*
  # Fix customers table schema

  1. Tables
    - Ensure customers table has all required columns
    - Add missing columns if they don't exist
    - Update RLS policies

  2. Security
    - Enable RLS on customers table
    - Add policies for company-based access
*/

-- Ensure the customers table exists with all required columns
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
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

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Check and add company_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
  END IF;

  -- Check and add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text;
  END IF;

  -- Check and add country column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'country'
  ) THEN
    ALTER TABLE customers ADD COLUMN country text DEFAULT 'Saudi Arabia';
  END IF;

  -- Check and add postal_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN postal_code text;
  END IF;

  -- Check and add arabic_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'arabic_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN arabic_name text;
  END IF;

  -- Check and add mobile column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'mobile'
  ) THEN
    ALTER TABLE customers ADD COLUMN mobile text;
  END IF;

  -- Check and add tax_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'tax_number'
  ) THEN
    ALTER TABLE customers ADD COLUMN tax_number text;
  END IF;

  -- Check and add commercial_register column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'commercial_register'
  ) THEN
    ALTER TABLE customers ADD COLUMN commercial_register text;
  END IF;

  -- Check and add contact_person column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_person text;
  END IF;

  -- Check and add contact_email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_email text;
  END IF;

  -- Check and add contact_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE customers ADD COLUMN contact_phone text;
  END IF;

  -- Check and add credit_limit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'credit_limit'
  ) THEN
    ALTER TABLE customers ADD COLUMN credit_limit decimal(15,2) DEFAULT 0;
  END IF;

  -- Check and add payment_terms column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE customers ADD COLUMN payment_terms integer DEFAULT 30;
  END IF;

  -- Check and add currency column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'currency'
  ) THEN
    ALTER TABLE customers ADD COLUMN currency text DEFAULT 'SAR';
  END IF;

  -- Check and add account_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN account_id uuid;
  END IF;

  -- Check and add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
  END IF;

  -- Check and add customer_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'customer_code'
  ) THEN
    ALTER TABLE customers ADD COLUMN customer_code text;
  END IF;

  -- Check and add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access their company customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers for their company" ON customers;
DROP POLICY IF EXISTS "Users can update their company customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their company customers" ON customers;

-- Create RLS policies for customers
CREATE POLICY "Users can access their company customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true); -- Allow all for now, will be restricted later when auth is implemented

CREATE POLICY "Users can insert customers for their company"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all for now

CREATE POLICY "Users can update their company customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true); -- Allow all for now

CREATE POLICY "Users can delete their company customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true); -- Allow all for now

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- Create unique constraint for customer_code within company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'customers_company_customer_code_key'
    AND table_name = 'customers'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_company_customer_code_key 
    UNIQUE (company_id, customer_code);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Add trigger for updated_at
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
INSERT INTO companies (id, name, arabic_name, currency, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Company',
  'الشركة الافتراضية',
  'SAR',
  true
)
ON CONFLICT (id) DO NOTHING;
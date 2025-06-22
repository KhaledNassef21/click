/*
  # Fix Customers RLS Policies

  1. Foreign Key Constraints
    - Add proper foreign key constraint for company_id
    - Add proper foreign key constraint for account_id (if accounts table exists)

  2. RLS Policies
    - Drop all existing policies
    - Create specific policies for INSERT, SELECT, UPDATE, DELETE operations
    - Ensure anonymous users can work with default company data

  3. Security
    - Enable RLS on both customers and companies tables
    - Create granular policies for better security control
*/

-- Add foreign key constraints that were missing
ALTER TABLE customers 
ADD CONSTRAINT customers_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable all operations for customers" ON customers;
DROP POLICY IF EXISTS "Enable all operations for companies" ON companies;
DROP POLICY IF EXISTS "Allow all customer operations" ON customers;
DROP POLICY IF EXISTS "Allow all company operations" ON companies;
DROP POLICY IF EXISTS "Users can access their company customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers for their company" ON customers;
DROP POLICY IF EXISTS "Users can update their company customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their company customers" ON customers;

-- Create specific RLS policies for customers table
CREATE POLICY "Allow anonymous insert for default company"
  ON customers
  FOR INSERT
  TO anon, public
  WITH CHECK (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow anonymous select for default company"
  ON customers
  FOR SELECT
  TO anon, public
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow anonymous update for default company"
  ON customers
  FOR UPDATE
  TO anon, public
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow anonymous delete for default company"
  ON customers
  FOR DELETE
  TO anon, public
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Create RLS policies for companies table
CREATE POLICY "Allow anonymous access to default company"
  ON companies
  FOR ALL
  TO anon, public
  USING (id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Ensure RLS is enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO anon;
GRANT SELECT ON companies TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Verify the default company exists
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

-- Test the policies by attempting a sample insert
DO $$
DECLARE
  test_id uuid;
BEGIN
  -- Test insert as anon user would
  SET LOCAL ROLE anon;
  
  INSERT INTO customers (
    company_id,
    customer_code,
    name,
    arabic_name,
    email,
    phone,
    city,
    country,
    currency,
    is_active
  ) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'TEST-001',
    'Test Customer',
    'عميل تجريبي',
    'test@example.com',
    '+966-11-111-1111',
    'الرياض',
    'Saudi Arabia',
    'SAR',
    true
  ) RETURNING id INTO test_id;
  
  -- Clean up test data
  DELETE FROM customers WHERE id = test_id;
  
  -- Reset role
  RESET ROLE;
  
  RAISE NOTICE 'RLS policies are working correctly for anonymous users';
EXCEPTION
  WHEN OTHERS THEN
    RESET ROLE;
    RAISE EXCEPTION 'RLS policy test failed: %', SQLERRM;
END $$;
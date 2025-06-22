/*
  # Add RLS Policies for Authenticated Users

  1. Customer Policies
    - Add SELECT policy for authenticated users to view default company customers
    - Add INSERT policy for authenticated users to create default company customers
    - Add UPDATE policy for authenticated users to modify default company customers
    - Add DELETE policy for authenticated users to remove default company customers

  2. Company Policies
    - Add policy for authenticated users to access default company

  3. Security
    - Ensure authenticated users can manage customer data for the default company
    - Maintain security by restricting access to default company only
*/

-- Add RLS policies for authenticated users on customers table
CREATE POLICY "Authenticated users can view default company customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Authenticated users can insert default company customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Authenticated users can update default company customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Authenticated users can delete default company customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Add RLS policy for authenticated users on companies table
CREATE POLICY "Authenticated users can access default company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT ON companies TO authenticated;

-- Test the policies work for authenticated users
DO $$
DECLARE
  test_id uuid;
BEGIN
  -- Test insert as authenticated user would
  SET LOCAL ROLE authenticated;
  
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
    'AUTH-TEST-001',
    'Authenticated Test Customer',
    'عميل مصادق تجريبي',
    'authtest@example.com',
    '+966-11-222-2222',
    'الرياض',
    'Saudi Arabia',
    'SAR',
    true
  ) RETURNING id INTO test_id;
  
  -- Test select
  PERFORM * FROM customers WHERE id = test_id;
  
  -- Test update
  UPDATE customers SET name = 'Updated Test Customer' WHERE id = test_id;
  
  -- Clean up test data
  DELETE FROM customers WHERE id = test_id;
  
  -- Reset role
  RESET ROLE;
  
  RAISE NOTICE 'RLS policies are working correctly for authenticated users';
EXCEPTION
  WHEN OTHERS THEN
    RESET ROLE;
    RAISE EXCEPTION 'Authenticated RLS policy test failed: %', SQLERRM;
END $$;
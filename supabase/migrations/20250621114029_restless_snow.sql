/*
  # Fix customers table permissions

  1. Grant table-level permissions
    - Grant SELECT, INSERT, UPDATE, DELETE permissions on customers table to anon role
    - Grant USAGE permission on public schema to anon role
    - Grant similar permissions on companies table to ensure consistency

  2. Security
    - Maintains existing RLS policies
    - Only grants necessary permissions for basic CRUD operations
*/

-- Grant schema usage to anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions on customers table to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon;

-- Grant table permissions on companies table to anon role (for consistency)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO anon;

-- Grant permissions on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure the permissions are properly applied
DO $$
BEGIN
  -- Check if permissions were granted successfully
  IF EXISTS (
    SELECT 1 FROM information_schema.table_privileges 
    WHERE grantee = 'anon' 
    AND table_name = 'customers' 
    AND privilege_type = 'INSERT'
  ) THEN
    RAISE NOTICE 'تم منح الصلاحيات بنجاح للمستخدم anon على جدول العملاء';
  ELSE
    RAISE WARNING 'قد تكون هناك مشكلة في منح الصلاحيات';
  END IF;
END $$;
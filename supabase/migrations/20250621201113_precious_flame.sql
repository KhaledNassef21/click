/*
  # Fix Users Table Structure and Permissions

  1. Table Structure
    - Add role_id column to users table if it doesn't exist
    - Add foreign key constraint to link users to user_roles
    - Update existing users to link to their roles

  2. Security
    - Ensure RLS policies are properly set up
    - Grant necessary permissions

  3. Data Integrity
    - Fix user permissions relationships
    - Ensure proper data structure for user management
*/

-- Add role_id column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE users ADD COLUMN role_id uuid;
    RAISE NOTICE 'Added role_id column to users table';
  ELSE
    RAISE NOTICE 'role_id column already exists in users table';
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES user_roles(id);
    RAISE NOTICE 'Added foreign key constraint for role_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists for role_id';
  END IF;
END $$;

-- Update existing users to link to their roles based on the role text field
UPDATE users 
SET role_id = (
  SELECT ur.id 
  FROM user_roles ur 
  WHERE 
    (users.role = 'admin' AND ur.name = 'System Administrator') OR
    (users.role = 'accountant' AND ur.name = 'Accountant') OR
    (users.role = 'manager' AND ur.name = 'Project Manager') OR
    (users.role = 'user' AND ur.name = 'Regular User')
  LIMIT 1
)
WHERE role_id IS NULL AND role IS NOT NULL;

-- Create a function to get user permissions by user ID
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid)
RETURNS TABLE (
  permission_id uuid,
  permission_code text,
  permission_name text,
  permission_module text
) AS $$
BEGIN
  RETURN QUERY
  -- Get permissions from user's role
  SELECT DISTINCT
    p.id AS permission_id,
    p.code AS permission_code,
    p.name AS permission_name,
    p.module AS permission_module
  FROM
    users u
    JOIN user_roles r ON u.role_id = r.id
    JOIN user_role_permissions rp ON r.id = rp.role_id
    JOIN user_permissions p ON rp.permission_id = p.id
  WHERE
    u.id = p_user_id
    AND p.is_active = true
  UNION
  -- Get direct user permissions
  SELECT
    p.id AS permission_id,
    p.code AS permission_code,
    p.name AS permission_name,
    p.module AS permission_module
  FROM
    user_user_permissions up
    JOIN user_permissions p ON up.permission_id = p.id
  WHERE
    up.user_id = p_user_id
    AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Ensure all necessary tables exist and have proper structure
DO $$
BEGIN
  -- Check if user_user_permissions table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_user_permissions') THEN
    CREATE TABLE user_user_permissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      permission_id uuid NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, permission_id)
    );
    RAISE NOTICE 'Created user_user_permissions table';
  END IF;

  -- Check if user_role_permissions table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_role_permissions') THEN
    CREATE TABLE user_role_permissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
      permission_id uuid NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(role_id, permission_id)
    );
    RAISE NOTICE 'Created user_role_permissions table';
  END IF;
END $$;

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_user_permissions ENABLE ROW LEVEL SECURITY;

-- Create open policies for all tables (for development)
DROP POLICY IF EXISTS "allow_all_users" ON users;
CREATE POLICY "allow_all_users"
    ON users
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_user_roles" ON user_roles;
CREATE POLICY "allow_all_user_roles"
    ON user_roles
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_user_permissions" ON user_permissions;
CREATE POLICY "allow_all_user_permissions"
    ON user_permissions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_user_role_permissions" ON user_role_permissions;
CREATE POLICY "allow_all_user_role_permissions"
    ON user_role_permissions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_user_user_permissions" ON user_user_permissions;
CREATE POLICY "allow_all_user_user_permissions"
    ON user_user_permissions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant all privileges to public roles
GRANT ALL PRIVILEGES ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO anon;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON user_permissions TO anon;
GRANT ALL PRIVILEGES ON user_permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_role_permissions TO anon;
GRANT ALL PRIVILEGES ON user_role_permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_user_permissions TO anon;
GRANT ALL PRIVILEGES ON user_user_permissions TO authenticated;

-- Verify the migration was successful
DO $$
DECLARE
  role_id_exists boolean;
  users_count integer;
  users_with_role_id_count integer;
BEGIN
  -- Check if role_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) INTO role_id_exists;

  IF role_id_exists THEN
    RAISE NOTICE '✅ role_id column exists in users table';
    
    -- Count users
    SELECT COUNT(*) INTO users_count FROM users;
    SELECT COUNT(*) INTO users_with_role_id_count FROM users WHERE role_id IS NOT NULL;
    
    RAISE NOTICE 'Total users: %', users_count;
    RAISE NOTICE 'Users with role_id: %', users_with_role_id_count;
    
    IF users_count > 0 AND users_with_role_id_count > 0 THEN
      RAISE NOTICE '✅ Users have been linked to roles successfully';
    ELSE
      RAISE NOTICE '⚠️ No users or no users with role_id - may need to add sample data';
    END IF;
  ELSE
    RAISE EXCEPTION '❌ Failed to add role_id column';
  END IF;
END $$;
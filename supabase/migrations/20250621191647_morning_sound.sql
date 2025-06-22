/*
  # إضافة عمود role_id إلى جدول المستخدمين

  1. التحديثات
    - إضافة عمود role_id إلى جدول users
    - إضافة foreign key constraint لربط role_id بجدول user_roles
    - تحديث البيانات الموجودة لربط المستخدمين بأدوارهم

  2. الأمان
    - الحفاظ على RLS والسياسات الموجودة
*/

-- إضافة عمود role_id إلى جدول users إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE users ADD COLUMN role_id uuid;
    RAISE NOTICE 'تم إضافة عمود role_id إلى جدول users';
  ELSE
    RAISE NOTICE 'عمود role_id موجود بالفعل في جدول users';
  END IF;
END $$;

-- التأكد من وجود جدول user_roles قبل إضافة foreign key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    -- إضافة foreign key constraint إذا لم يكن موجوداً
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'users_role_id_fkey' 
      AND table_name = 'users'
    ) THEN
      ALTER TABLE users ADD CONSTRAINT users_role_id_fkey 
      FOREIGN KEY (role_id) REFERENCES user_roles(id);
      RAISE NOTICE 'تم إضافة foreign key constraint لعمود role_id';
    ELSE
      RAISE NOTICE 'foreign key constraint موجود بالفعل لعمود role_id';
    END IF;

    -- تحديث البيانات الموجودة لربط المستخدمين بأدوارهم بناءً على عمود role
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
  ELSE
    RAISE NOTICE 'جدول user_roles غير موجود - سيتم تخطي إضافة foreign key';
  END IF;
END $$;

-- التحقق من نجاح العملية
DO $$
DECLARE
  role_id_exists boolean;
  users_count integer;
  users_with_role_id_count integer;
BEGIN
  -- التحقق من وجود عمود role_id
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) INTO role_id_exists;

  IF role_id_exists THEN
    RAISE NOTICE '✅ عمود role_id موجود في جدول users';
    
    -- عد المستخدمين
    SELECT COUNT(*) INTO users_count FROM users;
    SELECT COUNT(*) INTO users_with_role_id_count FROM users WHERE role_id IS NOT NULL;
    
    RAISE NOTICE 'إجمالي المستخدمين: %', users_count;
    RAISE NOTICE 'المستخدمين مع role_id: %', users_with_role_id_count;
    
    IF users_count = users_with_role_id_count THEN
      RAISE NOTICE '✅ جميع المستخدمين لديهم role_id';
    ELSE
      RAISE NOTICE '⚠️ بعض المستخدمين لا يملكون role_id - هذا طبيعي إذا لم يكن لديهم أدوار محددة';
    END IF;
  ELSE
    RAISE EXCEPTION '❌ فشل في إضافة عمود role_id';
  END IF;
END $$;
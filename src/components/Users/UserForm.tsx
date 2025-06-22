import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DatabaseUser, 
  DatabaseUserRole, 
  DatabaseUserPermission, 
  userService 
} from '../../lib/supabaseClient';
import { X, Save, User, Mail, Phone, Shield, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserFormProps {
  user?: DatabaseUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
  loading?: boolean;
  roles: DatabaseUserRole[];
  permissions: DatabaseUserPermission[];
}

const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false,
  roles,
  permissions
}) => {
  const { state } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    password: '',
    confirm_password: '',
    is_active: true,
    permissions: [] as string[]
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [permissionsByModule, setPermissionsByModule] = useState<{[key: string]: DatabaseUserPermission[]}>({});

  useEffect(() => {
    if (user) {
      console.log('🔄 تحميل بيانات المستخدم للتعديل:', user.name);
      
      // Get user permissions
      const getUserPermissions = async () => {
        try {
          const userPermissions = await userService.getUserPermissions(user.id);
          
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role_id: user.role_id || '',
            password: '',
            confirm_password: '',
            is_active: user.is_active,
            permissions: userPermissions.map(p => p.id)
          });
        } catch (error) {
          console.error('Error loading user permissions:', error);
          
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role_id: user.role_id || '',
            password: '',
            confirm_password: '',
            is_active: user.is_active,
            permissions: []
          });
        }
      };
      
      getUserPermissions();
    } else {
      console.log('🆕 إعداد فورم مستخدم جديد');
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '',
        confirm_password: '',
        is_active: true,
        permissions: []
      });
    }
    
    // Group permissions by module
    const groupedPermissions: {[key: string]: DatabaseUserPermission[]} = {};
    permissions.forEach(permission => {
      if (!groupedPermissions[permission.module]) {
        groupedPermissions[permission.module] = [];
      }
      groupedPermissions[permission.module].push(permission);
    });
    setPermissionsByModule(groupedPermissions);
    
    setErrors({});
  }, [user, isOpen, permissions]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المستخدم مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (!user) { // Only validate password for new users
      if (!formData.password) {
        newErrors.password = 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 8) {
        newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      }
      
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'كلمات المرور غير متطابقة';
      }
    }
    
    if (!formData.role_id) {
      newErrors.role_id = 'الدور مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleChange = async (roleId: string) => {
    try {
      // Get role permissions
      const rolePermissions = await userService.getRolePermissions(roleId);
      
      setFormData({
        ...formData,
        role_id: roleId,
        permissions: rolePermissions.map(p => p.permission_id)
      });
    } catch (error) {
      console.error('Error loading role permissions:', error);
      
      setFormData({
        ...formData,
        role_id: roleId
      });
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    const newPermissions = [...formData.permissions];
    
    if (newPermissions.includes(permissionId)) {
      // Remove permission
      const index = newPermissions.indexOf(permissionId);
      newPermissions.splice(index, 1);
    } else {
      // Add permission
      newPermissions.push(permissionId);
    }
    
    setFormData({
      ...formData,
      permissions: newPermissions
    });
  };

  const handleModulePermissionsChange = (module: string, checked: boolean) => {
    const modulePermissions = permissionsByModule[module].map(p => p.id);
    let newPermissions = [...formData.permissions];
    
    if (checked) {
      // Add all module permissions
      modulePermissions.forEach(permissionId => {
        if (!newPermissions.includes(permissionId)) {
          newPermissions.push(permissionId);
        }
      });
    } else {
      // Remove all module permissions
      newPermissions = newPermissions.filter(id => !modulePermissions.includes(id));
    }
    
    setFormData({
      ...formData,
      permissions: newPermissions
    });
  };

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = permissionsByModule[module].map(p => p.id);
    return modulePermissions.every(id => formData.permissions.includes(id));
  };

  const isModulePartiallySelected = (module: string) => {
    const modulePermissions = permissionsByModule[module].map(p => p.id);
    return modulePermissions.some(id => formData.permissions.includes(id)) && 
           !modulePermissions.every(id => formData.permissions.includes(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ المستخدم...');
      
      // Prepare user data for database
      const userData = {
        company_id: '00000000-0000-0000-0000-000000000001',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role_id: formData.role_id,
        password: formData.password,
        is_active: formData.is_active,
        permissions: formData.permissions
      };

      console.log('📋 بيانات المستخدم المرسلة:', {
        name: userData.name,
        email: userData.email,
        role_id: userData.role_id,
        is_new: !user
      });

      // Call the onSave function passed from parent component
      await onSave(userData);
      
      console.log('✅ تم حفظ المستخدم بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المستخدم:', error);
      toast.error(`حدث خطأ في حفظ المستخدم: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline ml-1" />
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="أدخل اسم المستخدم"
                  required
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="example@email.com"
                  required
                  disabled={loading}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-XX-XXX-XXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline ml-1" />
                  الدور *
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`w-full px-4 py-2 border ${errors.role_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  disabled={loading}
                >
                  <option value="">اختر الدور</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.arabic_name || role.name}
                    </option>
                  ))}
                </select>
                {errors.role_id && <p className="mt-1 text-sm text-red-500">{errors.role_id}</p>}
              </div>

              {!user && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline ml-1" />
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="أدخل كلمة المرور"
                        required={!user}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline ml-1" />
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        className={`w-full px-4 py-2 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="أعد إدخال كلمة المرور"
                        required={!user}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirm_password && <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>}
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="mr-2 text-sm font-medium text-gray-700">
                  مستخدم نشط
                </label>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الصلاحيات</h3>
            
            <div className="space-y-6">
              {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id={`module-${module}`}
                      checked={isModuleFullySelected(module)}
                      onChange={(e) => handleModulePermissionsChange(module, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                      ref={el => {
                        if (el) {
                          el.indeterminate = isModulePartiallySelected(module);
                        }
                      }}
                    />
                    <label htmlFor={`module-${module}`} className="mr-2 text-md font-semibold text-gray-900">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                    {modulePermissions.map(permission => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={loading}
                        />
                        <label htmlFor={permission.id} className="mr-2 text-sm font-medium text-gray-700">
                          {permission.arabic_name || permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{user ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
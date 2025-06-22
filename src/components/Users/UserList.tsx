import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import UserForm from './UserForm';
import { 
  userService, 
  DatabaseUser, 
  DatabaseUserRole, 
  DatabaseUserPermission 
} from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [roles, setRoles] = useState<DatabaseUserRole[]>([]);
  const [permissions, setPermissions] = useState<DatabaseUserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load users from database
  const loadData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل المستخدمين...');
      
      // Test connection first
      const isConnected = await userService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await userService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول المستخدمين غير صحيح - يرجى تطبيق migrations');
      }

      // Get all users
      const usersData = await userService.getUsers('00000000-0000-0000-0000-000000000001');
      setUsers(usersData);
      
      // Get all roles
      const rolesData = await userService.getUserRoles('00000000-0000-0000-0000-000000000001');
      setRoles(rolesData);
      
      // Get all permissions
      const permissionsData = await userService.getUserPermissions('00000000-0000-0000-0000-000000000001');
      setPermissions(permissionsData);
      
      // Update users in global state
      dispatch({ type: 'SET_USERS', payload: usersData });
      
      if (usersData.length === 0) {
        toast.success('تم تحميل قائمة المستخدمين بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${usersData.length} مستخدم بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل المستخدمين:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل المستخدمين');
      toast.error('حدث خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = filterRole === 'all' || user.role_id === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Get role name
  const getRoleName = (roleId?: string) => {
    if (!roleId) return '';
    const role = roles.find(r => r.id === roleId);
    return role ? (role.arabic_name || role.name) : '';
  };

  // Get role color
  const getRoleColor = (roleId?: string) => {
    if (!roleId) return 'bg-gray-100 text-gray-800';
    
    const role = roles.find(r => r.id === roleId);
    if (!role) return 'bg-gray-100 text-gray-800';
    
    const roleName = role.name.toLowerCase();
    
    if (roleName.includes('admin')) {
      return 'bg-red-100 text-red-800';
    } else if (roleName.includes('accountant')) {
      return 'bg-green-100 text-green-800';
    } else if (roleName.includes('manager')) {
      return 'bg-blue-100 text-blue-800';
    } else if (roleName.includes('inventory')) {
      return 'bg-purple-100 text-purple-800';
    } else if (roleName.includes('hr')) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle edit user
  const handleEdit = (user: DatabaseUser) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  // Handle save user
  const handleSave = async (userData: any) => {
    try {
      setActionLoading('save');
      
      if (selectedUser) {
        // Update existing user
        await userService.updateUser(selectedUser.id, userData);
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        // Add new user
        await userService.addUser(userData);
        toast.success('تم إضافة المستخدم بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowForm(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المستخدم:', error);
      toast.error(`حدث خطأ في حفظ المستخدم: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user: DatabaseUser) => {
    const newStatus = !user.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا المستخدم؟`)) {
      try {
        setActionLoading(user.id);
        
        await userService.updateUser(user.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} المستخدم بنجاح`);
        await loadData(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} المستخدم:`, error);
        toast.error(`حدث خطأ في ${actionText} المستخدم: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Delete user
  const handleDelete = async (user: DatabaseUser) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(user.id);
        
        await userService.deleteUser(user.id);
        
        toast.success('تم حذف المستخدم بنجاح');
        await loadData();
      } catch (error: any) {
        console.error('❌ خطأ في حذف المستخدم:', error);
        toast.error(`حدث خطأ في حذف المستخدم: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Reset password
  const handleResetPassword = async (user: DatabaseUser) => {
    const newPassword = prompt('أدخل كلمة المرور الجديدة (8 أحرف على الأقل):');
    if (!newPassword) return;
    
    if (newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    try {
      setActionLoading(user.id);
      
      await userService.resetPassword(user.id, newPassword);
      
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في إعادة تعيين كلمة المرور:', error);
      toast.error(`حدث خطأ في إعادة تعيين كلمة المرور: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل المستخدمين...</span>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في الاتصال</h3>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
            <p className="text-sm text-gray-500">
              تأكد من تطبيق migrations قاعدة البيانات في Supabase Dashboard
            </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Database className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  يرجى تطبيق migration الجديد: 20250623110000_expenses_management.sql
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة المستخدمين والصلاحيات</h1>
          <p className="text-gray-600">إدارة مستخدمي النظام وصلاحياتهم مع قاعدة البيانات</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button 
            onClick={() => setShowForm(true)}
            disabled={actionLoading === 'save'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
          >
            {actionLoading === 'save' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">المستخدمين النشطين</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">المستخدمين غير النشطين</p>
              <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.is_active).length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">مدراء النظام</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => {
                  const role = roles.find(r => r.id === u.role_id);
                  return role && role.name.toLowerCase().includes('admin');
                }).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">تصفية</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأدوار</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.arabic_name || role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصلاحيات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg ml-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                        {!user.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 ml-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 ml-2" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role_id)}`}>
                        {getRoleName(user.role_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      عرض الصلاحيات
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={actionLoading === user.id}
                        className={`p-1 rounded transition-colors ${
                          user.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={user.is_active ? 'إلغاء تفعيل المستخدم' : 'تفعيل المستخدم'}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : user.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleEdit(user)}
                        disabled={actionLoading === user.id}
                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                        title="تعديل المستخدم"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user)}
                        disabled={actionLoading === user.id}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50"
                        title="إعادة تعيين كلمة المرور"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
                        disabled={actionLoading === user.id}
                        className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستخدمين</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة مستخدم جديد</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة مستخدم جديد
            </button>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={selectedUser}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedUser(null);
          }}
          onSave={handleSave}
          loading={actionLoading === 'save'}
          roles={roles}
          permissions={permissions}
        />
      )}
    </div>
  );
};

export default UserList;
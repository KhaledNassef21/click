import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, UserCheck, Eye, Edit, Trash2, Phone, Mail, MapPin, Calendar, DollarSign, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import { employeeService, DatabaseEmployee } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const EmployeeList: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DatabaseEmployee | null>(null);
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load employees from database
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل الموظفين...');
      
      // Test connection first
      const isConnected = await employeeService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await employeeService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول الموظفين غير صحيح - يرجى تطبيق migrations');
      }

      // Get all employees (including inactive ones for management)
      let data: DatabaseEmployee[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all employees regardless of active status for management
        const { data: allEmployees, error } = await employeeService.supabase
          .from('employees')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allEmployees || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب الموظفين حسب الشركة، محاولة جلب جميع الموظفين...');
        // If company-based query fails, try to get all employees
        data = await employeeService.getAllEmployees();
      }
      
      setEmployees(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة الموظفين بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} موظف بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل الموظفين:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل الموظفين');
      toast.error('حدث خطأ في تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && employee.is_active) ||
                         (filterStatus === 'inactive' && !employee.is_active);
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalSalaries = employees.filter(e => e.is_active).reduce((sum, employee) => sum + (employee.salary || 0), 0);
  const activeEmployees = employees.filter(e => e.is_active).length;
  const inactiveEmployees = employees.filter(e => !e.is_active).length;
  const departments = [...new Set(employees.filter(e => e.department).map(e => e.department))];

  const handleEdit = (employee: DatabaseEmployee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleSave = async (employeeData: any) => {
    try {
      setActionLoading('save');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedEmployee) {
        // Update existing employee in database
        console.log('🔄 تحديث الموظف في قاعدة البيانات:', selectedEmployee.id);
        await employeeService.updateEmployee(selectedEmployee.id, employeeData);
        toast.success('تم تحديث الموظف بنجاح في قاعدة البيانات');
      } else {
        // Add new employee to database
        console.log('➕ إضافة موظف جديد إلى قاعدة البيانات');
        const newEmployeeData = {
          ...employeeData,
          company_id: companyId,
          employee_code: employeeData.employee_code || `EMP-${Date.now()}`,
          salary_type: employeeData.salary_type || 'monthly',
          is_active: true
        };
        
        await employeeService.addEmployee(newEmployeeData);
        toast.success('تم إضافة الموظف بنجاح إلى قاعدة البيانات');
      }
      
      // Reload employees from database
      await loadEmployees();
      setShowForm(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الموظف:', error);
      toast.error(`حدث خطأ في حفظ الموظف: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle employee active status (soft delete/activate)
  const handleToggleStatus = async (employee: DatabaseEmployee) => {
    const newStatus = !employee.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا الموظف؟`)) {
      try {
        setActionLoading(employee.id);
        console.log(`🔄 ${actionText} الموظف في قاعدة البيانات:`, employee.id);
        
        await employeeService.updateEmployee(employee.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} الموظف بنجاح`);
        await loadEmployees(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} الموظف:`, error);
        toast.error(`حدث خطأ في ${actionText} الموظف: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive employees)
  const handlePermanentDelete = async (employee: DatabaseEmployee) => {
    if (employee.is_active) {
      toast.error('لا يمكن حذف موظف نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذا الموظف؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(employee.id);
        console.log('🗑️ حذف نهائي للموظف من قاعدة البيانات:', employee.id);
        
        // Permanent delete from database
        const { error } = await employeeService.supabase
          .from('employees')
          .delete()
          .eq('id', employee.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف الموظف نهائياً من قاعدة البيانات');
        await loadEmployees();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadEmployees();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل الموظفين...</span>
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
                  يرجى تطبيق migration الجديد: 20250621140000_employees_projects_setup.sql
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الموظفين</h1>
          <p className="text-gray-600">إدارة بيانات الموظفين والرواتب مع قاعدة البيانات</p>
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
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الموظفين النشطون</p>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الرواتب</p>
              <p className="text-2xl font-bold text-purple-600">{totalSalaries.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">متوسط الراتب</p>
              <p className="text-2xl font-bold text-orange-600">
                {activeEmployees > 0 ? (totalSalaries / activeEmployees).toLocaleString() : 0} ر.س
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
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
                placeholder="البحث في الموظفين..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الموظفين</option>
              <option value="active">الموظفين النشطون</option>
              <option value="inactive">الموظفين غير النشطين</option>
            </select>
            
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأقسام</option>
              {departments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنصب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الراتب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ التوظيف
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
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className={`hover:bg-gray-50 transition-colors ${!employee.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${employee.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <UserCheck className={`w-5 h-5 ${employee.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className={`font-medium ${employee.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {employee.name}
                          {!employee.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                        </div>
                        {employee.employee_code && (
                          <div className="text-sm text-gray-500">كود الموظف: {employee.employee_code}</div>
                        )}
                        {employee.national_id && (
                          <div className="text-sm text-gray-500">الهوية: {employee.national_id}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.position}</div>
                    {employee.department && (
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {employee.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 ml-2" />
                          {employee.email}
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 ml-2" />
                          {employee.phone}
                        </div>
                      )}
                      {employee.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 ml-2" />
                          {employee.city ? `${employee.city}` : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {employee.salary ? employee.salary.toLocaleString() : 0} ر.س
                    </div>
                    <div className="text-xs text-gray-500">
                      {employee.salary_type === 'monthly' && 'شهري'}
                      {employee.salary_type === 'annual' && 'سنوي'}
                      {employee.salary_type === 'daily' && 'يومي'}
                      {employee.salary_type === 'hourly' && 'بالساعة'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      {new Date(employee.hire_date).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleStatus(employee)}
                        disabled={actionLoading === employee.id}
                        className={`p-1 rounded transition-colors ${
                          employee.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={employee.is_active ? 'إلغاء تفعيل الموظف' : 'تفعيل الموظف'}
                      >
                        {actionLoading === employee.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : employee.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="عرض تفاصيل الموظف"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(employee)}
                        disabled={actionLoading !== null}
                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                        title="تعديل الموظف"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!employee.is_active && (
                        <button 
                          onClick={() => handlePermanentDelete(employee)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="حذف نهائي (للموظفين غير النشطين فقط)"
                        >
                          {actionLoading === employee.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && !loading && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد موظفين</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة موظفك الأول</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة موظف جديد
            </button>
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      <EmployeeForm
        employee={selectedEmployee}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedEmployee(null);
        }}
        onSave={handleSave}
        loading={actionLoading === 'save'}
      />
    </div>
  );
};

export default EmployeeList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  ToggleLeft, 
  ToggleRight,
  Tag,
  Truck,
  Briefcase
} from 'lucide-react';
import { 
  expenseService, 
  DatabaseExpense, 
  DatabaseExpenseCategory 
} from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ExpenseList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expenses, setExpenses] = useState<DatabaseExpense[]>([]);
  const [categories, setCategories] = useState<DatabaseExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load expenses from database
  const loadExpenses = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل المصروفات...');
      
      // Test connection first
      const isConnected = await expenseService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await expenseService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول المصروفات غير صحيح - يرجى تطبيق migrations');
      }

      // Get all expenses
      const data = await expenseService.getExpenses('00000000-0000-0000-0000-000000000001');
      setExpenses(data);
      
      // Get all categories
      const categoriesData = await expenseService.getExpenseCategories('00000000-0000-0000-0000-000000000001');
      setCategories(categoriesData);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة المصروفات بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} مصروف بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل المصروفات:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل المصروفات');
      toast.error('حدث خطأ في تحميل المصروفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Filter expenses based on search term, status, and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.expense_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.reference_number && expense.reference_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
    
    const matchesCategory = filterCategory === 'all' || expense.category_id === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'معتمد';
      case 'pending':
        return 'في الانتظار';
      case 'rejected':
        return 'مرفوض';
      case 'paid':
        return 'مدفوع';
      default:
        return status;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'paid':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get category name
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.arabic_name || category.name) : '';
  };

  // Get supplier name
  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return '';
    const supplier = state.suppliers.find(s => s.id === supplierId);
    return supplier?.name || '';
  };

  // Get project name
  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = state.projects.find(p => p.id === projectId);
    return project?.name || '';
  };

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = filteredExpenses.filter(e => e.status === 'approved' || e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingCount = filteredExpenses.filter(e => e.status === 'pending').length;

  // View expense
  const handleView = (expense: DatabaseExpense) => {
    navigate(`/expenses/${expense.id}`);
  };

  // Edit expense
  const handleEdit = (expense: DatabaseExpense) => {
    navigate(`/expenses/${expense.id}`);
  };

  // Toggle expense active status
  const handleToggleStatus = async (expense: DatabaseExpense) => {
    const newStatus = !expense.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا المصروف؟`)) {
      try {
        setActionLoading(expense.id);
        
        await expenseService.updateExpense(expense.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} المصروف بنجاح`);
        await loadExpenses(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} المصروف:`, error);
        toast.error(`حدث خطأ في ${actionText} المصروف: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Delete expense
  const handleDelete = async (expense: DatabaseExpense) => {
    if (expense.status !== 'pending') {
      toast.error('لا يمكن حذف المصروفات المعتمدة أو المدفوعة');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      try {
        setActionLoading(expense.id);
        
        await expenseService.deleteExpense(expense.id);
        
        toast.success('تم حذف المصروف بنجاح');
        await loadExpenses();
      } catch (error: any) {
        console.error('❌ خطأ في حذف المصروف:', error);
        toast.error(`حدث خطأ في حذف المصروف: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Approve expense
  const handleApprove = async (expense: DatabaseExpense) => {
    if (expense.status !== 'pending') {
      toast.error('يمكن اعتماد المصروفات في حالة الانتظار فقط');
      return;
    }
    
    try {
      setActionLoading(expense.id);
      
      await expenseService.approveExpense(expense.id, state.user?.id);
      
      toast.success('تم اعتماد المصروف بنجاح');
      await loadExpenses();
    } catch (error: any) {
      console.error('❌ خطأ في اعتماد المصروف:', error);
      toast.error(`حدث خطأ في اعتماد المصروف: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject expense
  const handleReject = async (expense: DatabaseExpense) => {
    if (expense.status !== 'pending') {
      toast.error('يمكن رفض المصروفات في حالة الانتظار فقط');
      return;
    }
    
    const reason = prompt('أدخل سبب رفض المصروف:');
    if (!reason) return;
    
    try {
      setActionLoading(expense.id);
      
      await expenseService.rejectExpense(expense.id, state.user?.id, reason);
      
      toast.success('تم رفض المصروف بنجاح');
      await loadExpenses();
    } catch (error: any) {
      console.error('❌ خطأ في رفض المصروف:', error);
      toast.error(`حدث خطأ في رفض المصروف: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = () => {
    loadExpenses();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل المصروفات...</span>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة المصروفات</h1>
          <p className="text-gray-600">إدارة مصروفات الشركة والمشاريع مع قاعدة البيانات</p>
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
            onClick={() => navigate('/expenses/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">المصروفات المعتمدة</p>
              <p className="text-2xl font-bold text-green-600">{approvedAmount.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">في الانتظار</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">عدد المصروفات</p>
              <p className="text-2xl font-bold text-purple-600">{filteredExpenses.length}</p>
              <p className="text-sm text-yellow-600">{pendingCount} في الانتظار</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
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
                placeholder="البحث في المصروفات..."
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
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="approved">معتمد</option>
              <option value="rejected">مرفوض</option>
              <option value="paid">مدفوع</option>
            </select>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.arabic_name || category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المورد/المشروع
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
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className={`hover:bg-gray-50 transition-colors ${!expense.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      {new Date(expense.expense_date).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg ml-3">
                        <Receipt className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {expense.description}
                          {!expense.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                        </div>
                        {expense.reference_number && (
                          <div className="text-sm text-gray-500">المرجع: {expense.reference_number}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 ml-2" />
                      {getCategoryName(expense.category_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-red-600">
                      <DollarSign className="w-4 h-4 ml-1" />
                      {expense.amount.toLocaleString()} {expense.currency}
                    </div>
                    {expense.tax_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        شامل ضريبة: {expense.tax_amount.toLocaleString()} {expense.currency}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {expense.supplier_id && (
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 ml-1" />
                          {getSupplierName(expense.supplier_id)}
                        </div>
                      )}
                      {expense.project_id && (
                        <div className="flex items-center mt-1">
                          <Briefcase className="w-4 h-4 ml-1" />
                          {getProjectName(expense.project_id)}
                        </div>
                      )}
                      {!expense.supplier_id && !expense.project_id && (
                        <span className="text-gray-400">غير محدد</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusIcon(expense.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                        {getStatusText(expense.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleView(expense)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="عرض المصروف"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {expense.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleEdit(expense)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="تعديل المصروف"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleApprove(expense)}
                            disabled={actionLoading === expense.id}
                            className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                            title="اعتماد المصروف"
                          >
                            {actionLoading === expense.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button 
                            onClick={() => handleReject(expense)}
                            disabled={actionLoading === expense.id}
                            className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                            title="رفض المصروف"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(expense)}
                            disabled={actionLoading === expense.id}
                            className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                            title="حذف المصروف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleToggleStatus(expense)}
                        disabled={actionLoading === expense.id}
                        className={`p-1 rounded transition-colors ${
                          expense.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={expense.is_active ? 'إلغاء تفعيل المصروف' : 'تفعيل المصروف'}
                      >
                        {actionLoading === expense.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : expense.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && !loading && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد مصروفات</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة مصروف جديد</p>
            <button 
              onClick={() => navigate('/expenses/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة مصروف جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
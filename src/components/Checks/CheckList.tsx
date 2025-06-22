import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, CreditCard, Eye, Edit, Trash2, Calendar, DollarSign, User, CheckCircle, Clock, XCircle, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import { checkService, DatabaseCheck } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const CheckList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [checks, setChecks] = useState<DatabaseCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load checks from database
  const loadChecks = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل الشيكات...');
      
      // Test connection first
      const isConnected = await checkService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await checkService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول الشيكات غير صحيح - يرجى تطبيق migrations');
      }

      // Get all checks (including inactive ones for management)
      let data: DatabaseCheck[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all checks regardless of active status for management
        const { data: allChecks, error } = await checkService.supabase
          .from('checks')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allChecks || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب الشيكات حسب الشركة، محاولة جلب جميع الشيكات...');
        // If company-based query fails, try to get all checks
        data = await checkService.getAllChecks();
      }
      
      setChecks(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة الشيكات بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} شيك بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل الشيكات:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل الشيكات');
      toast.error('حدث خطأ في تحميل الشيكات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecks();
  }, []);

  const filteredChecks = checks.filter(check => {
    const matchesSearch = check.check_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.bank_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || check.check_type === filterType;
    const matchesStatus = filterStatus === 'all' || check.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'received':
        return 'شيك مقبوض';
      case 'issued':
        return 'شيك مدفوع';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cleared':
        return 'مقبوض';
      case 'pending':
        return 'في الانتظار';
      case 'bounced':
        return 'مرتد';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cleared':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'bounced':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '';
    const customer = state.customers.find(c => c.id === customerId);
    return customer?.name || '';
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return '';
    const supplier = state.suppliers.find(s => s.id === supplierId);
    return supplier?.name || '';
  };

  const totalReceived = filteredChecks.filter(c => c.check_type === 'received' && c.status === 'cleared').reduce((sum, c) => sum + c.amount, 0);
  const totalIssued = filteredChecks.filter(c => c.check_type === 'issued' && c.status === 'cleared').reduce((sum, c) => sum + c.amount, 0);
  const pendingChecks = filteredChecks.filter(c => c.status === 'pending').length;
  const bouncedChecks = filteredChecks.filter(c => c.status === 'bounced').length;

  const handleEdit = (check: DatabaseCheck) => {
    navigate(`/checks/${check.id}`);
  };

  const handleView = (check: DatabaseCheck) => {
    navigate(`/checks/${check.id}`);
  };

  // Toggle check active status (soft delete/activate)
  const handleToggleStatus = async (check: DatabaseCheck) => {
    const newStatus = !check.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا الشيك؟`)) {
      try {
        setActionLoading(check.id);
        console.log(`🔄 ${actionText} الشيك في قاعدة البيانات:`, check.id);
        
        await checkService.updateCheck(check.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} الشيك بنجاح`);
        await loadChecks(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} الشيك:`, error);
        toast.error(`حدث خطأ في ${actionText} الشيك: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive checks)
  const handlePermanentDelete = async (check: DatabaseCheck) => {
    if (check.is_active) {
      toast.error('لا يمكن حذف شيك نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذا الشيك؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(check.id);
        console.log('🗑️ حذف نهائي للشيك من قاعدة البيانات:', check.id);
        
        // Permanent delete from database
        const { error } = await checkService.supabase
          .from('checks')
          .delete()
          .eq('id', check.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف الشيك نهائياً من قاعدة البيانات');
        await loadChecks();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadChecks();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الشيكات</h1>
          <p className="text-gray-600">إدارة الشيكات المقبوضة والمدفوعة مع قاعدة البيانات</p>
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
            onClick={() => navigate('/checks/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-5 h-5" />
            <span>شيك جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الشيكات المقبوضة</p>
              <p className="text-2xl font-bold text-green-600">{totalReceived.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الشيكات المدفوعة</p>
              <p className="text-2xl font-bold text-blue-600">{totalIssued.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">في الانتظار</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingChecks}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">شيكات مرتدة</p>
              <p className="text-2xl font-bold text-red-600">{bouncedChecks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
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
                placeholder="البحث في الشيكات..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="received">شيكات مقبوضة</option>
              <option value="issued">شيكات مدفوعة</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="cleared">مقبوض</option>
              <option value="bounced">مرتد</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checks Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الشيك
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستفيد/الدافع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البنك
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الاستحقاق
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
              {filteredChecks.map((check) => (
                <tr key={check.id} className={`hover:bg-gray-50 transition-colors ${!check.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${check.check_type === 'received' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <CreditCard className={`w-5 h-5 ${check.check_type === 'received' ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="font-medium text-gray-900">
                        {check.check_number}
                        {!check.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(check.check_type)}`}>
                      {getTypeText(check.check_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="w-4 h-4 ml-2" />
                      {check.payee}
                      {check.customer_id && (
                        <span className="text-xs text-gray-500 mr-2">({getCustomerName(check.customer_id)})</span>
                      )}
                      {check.supplier_id && (
                        <span className="text-xs text-gray-500 mr-2">({getSupplierName(check.supplier_id)})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {check.bank_name}
                    {check.account_number && (
                      <div className="text-xs text-gray-500">{check.account_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${check.check_type === 'received' ? 'text-green-600' : 'text-blue-600'}`}>
                      {check.amount.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      {check.due_date ? new Date(check.due_date).toLocaleDateString('ar-SA') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusIcon(check.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                        {getStatusText(check.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleView(check)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(check)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(check)}
                        disabled={actionLoading === check.id}
                        className={`p-1 rounded transition-colors ${
                          check.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={check.is_active ? 'إلغاء تفعيل الشيك' : 'تفعيل الشيك'}
                      >
                        {actionLoading === check.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : check.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      {!check.is_active && (
                        <button 
                          onClick={() => handlePermanentDelete(check)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="حذف نهائي (للشيكات غير النشطة فقط)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredChecks.length === 0 && !loading && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد شيكات</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة شيك جديد</p>
            <button 
              onClick={() => navigate('/checks/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة شيك جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckList;
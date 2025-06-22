import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, Receipt, Eye, Edit, Trash2, Calendar, DollarSign, User, CheckCircle, Clock, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import { voucherService, DatabaseVoucher } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const VoucherList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [vouchers, setVouchers] = useState<DatabaseVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load vouchers from database
  const loadVouchers = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل السندات...');
      
      // Test connection first
      const isConnected = await voucherService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await voucherService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول السندات غير صحيح - يرجى تطبيق migrations');
      }

      // Get all vouchers (including inactive ones for management)
      let data: DatabaseVoucher[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all vouchers regardless of active status for management
        const { data: allVouchers, error } = await voucherService.supabase
          .from('vouchers')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allVouchers || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب السندات حسب الشركة، محاولة جلب جميع السندات...');
        // If company-based query fails, try to get all vouchers
        data = await voucherService.getAllVouchers();
      }
      
      setVouchers(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة السندات بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} سند بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل السندات:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل السندات');
      toast.error('حدث خطأ في تحميل السندات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || voucher.voucher_type === filterType;
    const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'سند قبض';
      case 'payment':
        return 'سند صرف';
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cleared':
        return 'مقبوض/مدفوع';
      case 'pending':
        return 'في الانتظار';
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

  const getPartyName = (voucher: DatabaseVoucher) => {
    if (voucher.customer_id) {
      return getCustomerName(voucher.customer_id);
    } else if (voucher.supplier_id) {
      return getSupplierName(voucher.supplier_id);
    }
    return '';
  };

  const totalReceipts = filteredVouchers.filter(v => v.voucher_type === 'receipt').reduce((sum, v) => sum + v.amount, 0);
  const totalPayments = filteredVouchers.filter(v => v.voucher_type === 'payment').reduce((sum, v) => sum + v.amount, 0);

  const handleEdit = (voucher: DatabaseVoucher) => {
    if (voucher.voucher_type === 'receipt') {
      navigate(`/vouchers/receipt/${voucher.id}`);
    } else {
      navigate(`/vouchers/payment/${voucher.id}`);
    }
  };

  const handleView = (voucher: DatabaseVoucher) => {
    if (voucher.voucher_type === 'receipt') {
      navigate(`/vouchers/receipt/${voucher.id}`);
    } else {
      navigate(`/vouchers/payment/${voucher.id}`);
    }
  };

  // Toggle voucher active status (soft delete/activate)
  const handleToggleStatus = async (voucher: DatabaseVoucher) => {
    const newStatus = !voucher.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا السند؟`)) {
      try {
        setActionLoading(voucher.id);
        console.log(`🔄 ${actionText} السند في قاعدة البيانات:`, voucher.id);
        
        await voucherService.updateVoucher(voucher.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} السند بنجاح`);
        await loadVouchers(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} السند:`, error);
        toast.error(`حدث خطأ في ${actionText} السند: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive vouchers)
  const handlePermanentDelete = async (voucher: DatabaseVoucher) => {
    if (voucher.is_active) {
      toast.error('لا يمكن حذف سند نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذا السند؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(voucher.id);
        console.log('🗑️ حذف نهائي للسند من قاعدة البيانات:', voucher.id);
        
        // Permanent delete from database
        const { error } = await voucherService.supabase
          .from('vouchers')
          .delete()
          .eq('id', voucher.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف السند نهائياً من قاعدة البيانات');
        await loadVouchers();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadVouchers();
  };

  const handleAddVoucher = (type: string) => {
    if (type === 'receipt') {
      navigate('/vouchers/receipt/new');
    } else {
      navigate('/vouchers/payment/new');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل السندات...</span>
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
                  يرجى تطبيق migration الجديد: 20250621150000_invoices_vouchers_checks.sql
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">سندات القبض والصرف</h1>
          <p className="text-gray-600">إدارة المقبوضات والمدفوعات مع قاعدة البيانات</p>
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
          <div className="relative group">
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-5 h-5" />
              <span>سند جديد</span>
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
              <button
                onClick={() => handleAddVoucher('receipt')}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                سند قبض جديد
              </button>
              <button
                onClick={() => handleAddVoucher('payment')}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                سند صرف جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي السندات</p>
              <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">سندات القبض</p>
              <p className="text-2xl font-bold text-green-600">{totalReceipts.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Receipt className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">سندات الصرف</p>
              <p className="text-2xl font-bold text-red-600">{totalPayments.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">صافي التدفق</p>
              <p className={`text-2xl font-bold ${totalReceipts - totalPayments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(totalReceipts - totalPayments).toLocaleString()} ر.س
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
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
                placeholder="البحث في السندات..."
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
              <option value="receipt">سندات القبض</option>
              <option value="payment">سندات الصرف</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="cleared">مقبوض/مدفوع</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم السند
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الطرف
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
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className={`hover:bg-gray-50 transition-colors ${!voucher.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      {new Date(voucher.voucher_date).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${voucher.voucher_type === 'receipt' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Receipt className={`w-5 h-5 ${voucher.voucher_type === 'receipt' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div className="font-medium text-gray-900">
                        {voucher.voucher_number}
                        {!voucher.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(voucher.voucher_type)}`}>
                      {getTypeText(voucher.voucher_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{voucher.description}</div>
                    {voucher.reference_number && (
                      <div className="text-sm text-gray-500">المرجع: {voucher.reference_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${voucher.voucher_type === 'receipt' ? 'text-green-600' : 'text-red-600'}`}>
                      {voucher.amount.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 ml-2" />
                      {getPartyName(voucher)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusIcon(voucher.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(voucher.status)}`}>
                        {getStatusText(voucher.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleView(voucher)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(voucher)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(voucher)}
                        disabled={actionLoading === voucher.id}
                        className={`p-1 rounded transition-colors ${
                          voucher.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={voucher.is_active ? 'إلغاء تفعيل السند' : 'تفعيل السند'}
                      >
                        {actionLoading === voucher.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : voucher.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      {!voucher.is_active && (
                        <button 
                          onClick={() => handlePermanentDelete(voucher)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="حذف نهائي (للسندات غير النشطة فقط)"
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

        {filteredVouchers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد سندات</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة سند قبض أو صرف جديد</p>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <button 
                onClick={() => handleAddVoucher('receipt')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                سند قبض جديد
              </button>
              <button 
                onClick={() => handleAddVoucher('payment')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                سند صرف جديد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherList;
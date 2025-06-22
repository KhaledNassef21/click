import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, Users, Eye, Edit, Trash2, Phone, Mail, MapPin, CreditCard, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import CustomerForm from './CustomerForm';
import { customerService, DatabaseCustomer } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const CustomerList: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<DatabaseCustomer | null>(null);
  const [customers, setCustomers] = useState<DatabaseCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load customers from database
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل العملاء...');
      
      // Test connection first
      const isConnected = await customerService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await customerService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول العملاء غير صحيح - يرجى تطبيق migrations');
      }

      // Get all customers (including inactive ones for management)
      let data: DatabaseCustomer[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all customers regardless of active status for management
        const { data: allCustomers, error } = await customerService.supabase
          .from('customers')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allCustomers || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب العملاء حسب الشركة، محاولة جلب جميع العملاء...');
        // If company-based query fails, try to get all customers
        data = await customerService.getAllCustomers();
      }
      
      setCustomers(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة العملاء بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} عميل بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل العملاء:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل العملاء');
      toast.error('حدث خطأ في تحميل العملاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm) ||
                         customer.customer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.is_active) ||
                         (filterStatus === 'inactive' && !customer.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const totalBalance = customers.reduce((sum, customer) => sum + (customer.credit_limit || 0), 0);
  const activeCustomers = customers.filter(c => c.is_active).length;
  const inactiveCustomers = customers.filter(c => !c.is_active).length;

  const handleEdit = (customer: DatabaseCustomer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleSave = async (customerData: any) => {
    try {
      setActionLoading('save');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedCustomer) {
        // Update existing customer in database
        console.log('🔄 تحديث العميل في قاعدة البيانات:', selectedCustomer.id);
        await customerService.updateCustomer(selectedCustomer.id, customerData);
        toast.success('تم تحديث العميل بنجاح في قاعدة البيانات');
      } else {
        // Add new customer to database
        console.log('➕ إضافة عميل جديد إلى قاعدة البيانات');
        const newCustomerData = {
          ...customerData,
          company_id: companyId,
          customer_code: customerData.customer_code || `CUST-${Date.now()}`,
          currency: customerData.currency || 'SAR',
          payment_terms: customerData.payment_terms || 30,
          is_active: true
        };
        
        await customerService.addCustomer(newCustomerData);
        toast.success('تم إضافة العميل بنجاح إلى قاعدة البيانات');
      }
      
      // Reload customers from database
      await loadCustomers();
      setShowForm(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ العميل:', error);
      toast.error(`حدث خطأ في حفظ العميل: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle customer active status (soft delete/activate)
  const handleToggleStatus = async (customer: DatabaseCustomer) => {
    const newStatus = !customer.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا العميل؟`)) {
      try {
        setActionLoading(customer.id);
        console.log(`🔄 ${actionText} العميل في قاعدة البيانات:`, customer.id);
        
        await customerService.updateCustomer(customer.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} العميل بنجاح`);
        await loadCustomers(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} العميل:`, error);
        toast.error(`حدث خطأ في ${actionText} العميل: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive customers)
  const handlePermanentDelete = async (customer: DatabaseCustomer) => {
    if (customer.is_active) {
      toast.error('لا يمكن حذف عميل نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذا العميل؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(customer.id);
        console.log('🗑️ حذف نهائي للعميل من قاعدة البيانات:', customer.id);
        
        // Permanent delete from database
        const { error } = await customerService.supabase
          .from('customers')
          .delete()
          .eq('id', customer.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف العميل نهائياً من قاعدة البيانات');
        await loadCustomers();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadCustomers();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل العملاء...</span>
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
                  يرجى تطبيق migration الجديد: 20250621115057_tiny_limit.sql
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة العملاء</h1>
          <p className="text-gray-600">إدارة بيانات العملاء وحساباتهم مع قاعدة البيانات</p>
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
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">العملاء النشطون</p>
              <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">العملاء غير النشطين</p>
              <p className="text-2xl font-bold text-red-600">{inactiveCustomers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي حدود الائتمان</p>
              <p className="text-2xl font-bold text-purple-600">{totalBalance.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
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
                placeholder="البحث في العملاء..."
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
              <option value="all">جميع العملاء</option>
              <option value="active">العملاء النشطون</option>
              <option value="inactive">العملاء غير النشطين</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حد الائتمان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شروط الدفع
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${!customer.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${customer.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Users className={`w-5 h-5 ${customer.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className={`font-medium ${customer.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {customer.name}
                          {!customer.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                        </div>
                        {customer.customer_code && (
                          <div className="text-sm text-gray-500">كود العميل: {customer.customer_code}</div>
                        )}
                        {customer.tax_number && (
                          <div className="text-sm text-gray-500">الرقم الضريبي: {customer.tax_number}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 ml-2" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 ml-2" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 ml-2" />
                          {customer.city ? `${customer.city}, ${customer.address}` : customer.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-purple-600">
                      {customer.credit_limit ? `${customer.credit_limit.toLocaleString()} ر.س` : 'غير محدد'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.payment_terms ? `${customer.payment_terms} يوم` : 'غير محدد'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        disabled={actionLoading === customer.id}
                        className={`p-1 rounded transition-colors ${
                          customer.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={customer.is_active ? 'إلغاء تفعيل العميل' : 'تفعيل العميل'}
                      >
                        {actionLoading === customer.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : customer.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="عرض تفاصيل العميل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(customer)}
                        disabled={actionLoading !== null}
                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                        title="تعديل العميل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!customer.is_active && (
                        <button 
                          onClick={() => handlePermanentDelete(customer)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="حذف نهائي (للعملاء غير النشطين فقط)"
                        >
                          {actionLoading === customer.id ? (
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

        {filteredCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة عميلك الأول</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة عميل جديد
            </button>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        customer={selectedCustomer}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSave}
        loading={actionLoading === 'save'}
      />
    </div>
  );
};

export default CustomerList;
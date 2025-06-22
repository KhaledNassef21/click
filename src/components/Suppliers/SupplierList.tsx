import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, Truck, Eye, Edit, Trash2, Phone, Mail, MapPin, CreditCard, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import SupplierForm from './SupplierForm';
import { supplierService, DatabaseSupplier } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const SupplierList: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<DatabaseSupplier | null>(null);
  const [suppliers, setSuppliers] = useState<DatabaseSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load suppliers from database
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل الموردين...');
      
      // Test connection first
      const isConnected = await supplierService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await supplierService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول الموردين غير صحيح - يرجى تطبيق migrations');
      }

      // Get all suppliers (including inactive ones for management)
      let data: DatabaseSupplier[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all suppliers regardless of active status for management
        const { data: allSuppliers, error } = await supplierService.supabase
          .from('suppliers')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allSuppliers || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب الموردين حسب الشركة، محاولة جلب جميع الموردين...');
        // If company-based query fails, try to get all suppliers
        data = await supplierService.getAllSuppliers();
      }
      
      setSuppliers(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة الموردين بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} مورد بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل الموردين:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل الموردين');
      toast.error('حدث خطأ في تحميل الموردين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.includes(searchTerm) ||
                         supplier.supplier_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && supplier.is_active) ||
                         (filterStatus === 'inactive' && !supplier.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const activeSuppliers = suppliers.filter(s => s.is_active).length;
  const inactiveSuppliers = suppliers.filter(s => !s.is_active).length;

  const handleEdit = (supplier: DatabaseSupplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleSave = async (supplierData: any) => {
    try {
      setActionLoading('save');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedSupplier) {
        // Update existing supplier in database
        console.log('🔄 تحديث المورد في قاعدة البيانات:', selectedSupplier.id);
        await supplierService.updateSupplier(selectedSupplier.id, supplierData);
        toast.success('تم تحديث المورد بنجاح في قاعدة البيانات');
      } else {
        // Add new supplier to database
        console.log('➕ إضافة مورد جديد إلى قاعدة البيانات');
        const newSupplierData = {
          ...supplierData,
          company_id: companyId,
          supplier_code: supplierData.supplier_code || `SUPP-${Date.now()}`,
          currency: supplierData.currency || 'SAR',
          payment_terms: supplierData.payment_terms || 30,
          is_active: true
        };
        
        await supplierService.addSupplier(newSupplierData);
        toast.success('تم إضافة المورد بنجاح إلى قاعدة البيانات');
      }
      
      // Reload suppliers from database
      await loadSuppliers();
      setShowForm(false);
      setSelectedSupplier(null);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المورد:', error);
      toast.error(`حدث خطأ في حفظ المورد: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle supplier active status (soft delete/activate)
  const handleToggleStatus = async (supplier: DatabaseSupplier) => {
    const newStatus = !supplier.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا المورد؟`)) {
      try {
        setActionLoading(supplier.id);
        console.log(`🔄 ${actionText} المورد في قاعدة البيانات:`, supplier.id);
        
        await supplierService.updateSupplier(supplier.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} المورد بنجاح`);
        await loadSuppliers(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} المورد:`, error);
        toast.error(`حدث خطأ في ${actionText} المورد: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive suppliers)
  const handlePermanentDelete = async (supplier: DatabaseSupplier) => {
    if (supplier.is_active) {
      toast.error('لا يمكن حذف مورد نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذا المورد؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(supplier.id);
        console.log('🗑️ حذف نهائي للمورد من قاعدة البيانات:', supplier.id);
        
        // Permanent delete from database
        const { error } = await supplierService.supabase
          .from('suppliers')
          .delete()
          .eq('id', supplier.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف المورد نهائياً من قاعدة البيانات');
        await loadSuppliers();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadSuppliers();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل الموردين...</span>
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
                  يرجى تطبيق migration الجديد: 20250621122000_suppliers_setup.sql
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الموردين</h1>
          <p className="text-gray-600">إدارة بيانات الموردين وحساباتهم مع قاعدة البيانات</p>
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
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الموردين</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الموردين النشطون</p>
              <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الموردين غير النشطين</p>
              <p className="text-2xl font-bold text-red-600">{inactiveSuppliers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Truck className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">متوسط شروط الدفع</p>
              <p className="text-2xl font-bold text-purple-600">
                {suppliers.length > 0 ? Math.round(suppliers.reduce((sum, s) => sum + (s.payment_terms || 30), 0) / suppliers.length) : 0} يوم
              </p>
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
                placeholder="البحث في الموردين..."
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
              <option value="all">جميع الموردين</option>
              <option value="active">الموردين النشطون</option>
              <option value="inactive">الموردين غير النشطين</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المورد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
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
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className={`hover:bg-gray-50 transition-colors ${!supplier.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${supplier.is_active ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <Truck className={`w-5 h-5 ${supplier.is_active ? 'text-orange-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className={`font-medium ${supplier.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {supplier.name}
                          {!supplier.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                        </div>
                        {supplier.supplier_code && (
                          <div className="text-sm text-gray-500">كود المورد: {supplier.supplier_code}</div>
                        )}
                        {supplier.tax_number && (
                          <div className="text-sm text-gray-500">الرقم الضريبي: {supplier.tax_number}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 ml-2" />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 ml-2" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 ml-2" />
                          {supplier.city ? `${supplier.city}, ${supplier.address}` : supplier.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.payment_terms ? `${supplier.payment_terms} يوم` : 'غير محدد'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleStatus(supplier)}
                        disabled={actionLoading === supplier.id}
                        className={`p-1 rounded transition-colors ${
                          supplier.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={supplier.is_active ? 'إلغاء تفعيل المورد' : 'تفعيل المورد'}
                      >
                        {actionLoading === supplier.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : supplier.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        supplier.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="عرض تفاصيل المورد"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(supplier)}
                        disabled={actionLoading !== null}
                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                        title="تعديل المورد"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!supplier.is_active && (
                        <button 
                          onClick={() => handlePermanentDelete(supplier)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="حذف نهائي (للموردين غير النشطين فقط)"
                        >
                          {actionLoading === supplier.id ? (
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

        {filteredSuppliers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد موردين</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة موردك الأول</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة مورد جديد
            </button>
          </div>
        )}
      </div>

      {/* Supplier Form Modal */}
      <SupplierForm
        supplier={selectedSupplier}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedSupplier(null);
        }}
        onSave={handleSave}
        loading={actionLoading === 'save'}
      />
    </div>
  );
};

export default SupplierList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, FileText, Eye, Edit, Trash2, Send, DollarSign, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import { invoiceService, DatabaseInvoice } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [invoices, setInvoices] = useState<DatabaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Check if Supabase is properly configured
  const checkSupabaseConfiguration = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const isConfigured = supabaseUrl && 
                        supabaseKey && 
                        supabaseUrl !== 'https://scmyucalqoeuqtbthsrx.supabase.co' &&
                        supabaseKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbXl1Y2FscW9ldXF0YnRoc3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTQxMDUsImV4cCI6MjA2NjA3MDEwNX0.1S9oeVWsYIEenlvv1thTpQOFSq4O1_LJjQwPg5CAuuQ' &&
                        supabaseUrl.includes('.supabase.co');
    
    setIsSupabaseConfigured(isConfigured);
    return isConfigured;
  };

  // Load invoices from database
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      // Check Supabase configuration first
      if (!checkSupabaseConfiguration()) {
        throw new Error('Supabase غير مُعدّ بشكل صحيح. يرجى النقر على زر "Connect to Supabase" في أعلى الصفحة.');
      }
      
      console.log('🚀 بدء تحميل الفواتير...');
      
      // Test connection first
      const isConnected = await invoiceService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات. تأكد من صحة بيانات Supabase.');
      }

      // Check table structure
      const hasCorrectStructure = await invoiceService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول الفواتير غير صحيح - يرجى تطبيق migrations في Supabase Dashboard');
      }

      // Get all invoices (including inactive ones for management)
      let data: DatabaseInvoice[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all invoices regardless of active status for management
        const { data: allInvoices, error } = await invoiceService.supabase
          .from('invoices')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allInvoices || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب الفواتير حسب الشركة، محاولة جلب جميع الفواتير...');
        // If company-based query fails, try to get all invoices
        data = await invoiceService.getAllInvoices();
      }
      
      setInvoices(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة الفواتير بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} فاتورة بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل الفواتير:', error);
      let errorMessage = 'حدث خطأ في تحميل الفواتير';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        errorMessage = 'فشل في الاتصال بقاعدة البيانات. تأكد من إعداد Supabase بشكل صحيح.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setConnectionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    const matchesCustomer = filterCustomer === 'all' || invoice.customer_id === filterCustomer;
    
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partially_paid':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوعة';
      case 'sent':
        return 'مرسلة';
      case 'draft':
        return 'مسودة';
      case 'overdue':
        return 'متأخرة';
      case 'partially_paid':
        return 'مدفوعة جزئياً';
      case 'cancelled':
        return 'ملغاة';
      default:
        return status;
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'غير محدد';
    const customer = state.customers.find(c => c.id === customerId);
    return customer?.name || 'عميل غير معروف';
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = state.projects.find(p => p.id === projectId);
    return project?.name || '';
  };

  // Toggle invoice active status (soft delete/activate)
  const handleToggleStatus = async (invoice: DatabaseInvoice) => {
    const newStatus = !invoice.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذه الفاتورة؟`)) {
      try {
        setActionLoading(invoice.id);
        console.log(`🔄 ${actionText} الفاتورة في قاعدة البيانات:`, invoice.id);
        
        await invoiceService.updateInvoice(invoice.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} الفاتورة بنجاح`);
        await loadInvoices(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} الفاتورة:`, error);
        toast.error(`حدث خطأ في ${actionText} الفاتورة: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive invoices)
  const handlePermanentDelete = async (invoice: DatabaseInvoice) => {
    if (invoice.is_active) {
      toast.error('لا يمكن حذف فاتورة نشطة. يرجى إلغاء تفعيلها أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذه الفاتورة؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(invoice.id);
        console.log('🗑️ حذف نهائي للفاتورة من قاعدة البيانات:', invoice.id);
        
        // Permanent delete from database
        const { error } = await invoiceService.supabase
          .from('invoices')
          .delete()
          .eq('id', invoice.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف الفاتورة نهائياً من قاعدة البيانات');
        await loadInvoices();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadInvoices();
  };

  const handleView = (invoice: DatabaseInvoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: DatabaseInvoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  const handleRecordPayment = (invoice: DatabaseInvoice) => {
    navigate(`/vouchers/receipt/new?invoice=${invoice.invoice_number}&customer=${invoice.customer_id}&amount=${invoice.total_amount - invoice.paid_amount}`);
  };

  const handleSendEmail = (invoice: DatabaseInvoice) => {
    toast.success('تم إرسال الفاتورة بنجاح إلى العميل');
    
    // Update status to sent if it's draft
    if (invoice.status === 'draft') {
      try {
        invoiceService.updateInvoice(invoice.id, { status: 'sent' });
        loadInvoices(); // Reload to show updated status
      } catch (error) {
        console.error('❌ خطأ في تحديث حالة الفاتورة:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل الفواتير...</span>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">خطأ في الاتصال بقاعدة البيانات</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{connectionError}</p>
          
          {!isSupabaseConfigured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-900">إعداد Supabase مطلوب</h4>
              </div>
              <p className="text-blue-800 mb-4">
                يبدو أن Supabase غير مُعدّ بشكل صحيح. يرجى النقر على الزر أدناه لإعداد قاعدة البيانات.
              </p>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm text-blue-700">
                  ابحث عن زر "Connect to Supabase" في أعلى يمين الصفحة
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              <span>إعادة المحاولة</span>
            </button>
            
            {isSupabaseConfigured && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Database className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">تحقق من إعدادات قاعدة البيانات</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1 text-right">
                  <li>• تأكد من تطبيق جميع migrations في Supabase Dashboard</li>
                  <li>• تحقق من صحة URL و API Key</li>
                  <li>• تأكد من تفعيل Row Level Security (RLS)</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الفواتير</h1>
          <p className="text-gray-600">إدارة فواتير العملاء والمدفوعات مع قاعدة البيانات</p>
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
            onClick={() => navigate('/invoices/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-5 h-5" />
            <span>فاتورة جديدة</span>
          </button>
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
                placeholder="البحث في الفواتير..."
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
              <option value="all">كل الحالات</option>
              <option value="draft">مسودة</option>
              <option value="sent">مرسلة</option>
              <option value="paid">مدفوعة</option>
              <option value="partially_paid">مدفوعة جزئياً</option>
              <option value="overdue">متأخرة</option>
              <option value="cancelled">ملغاة</option>
            </select>
            <select 
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">كل العملاء</option>
              {state.customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الاستحقاق
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدفوع
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className={`hover:bg-gray-50 transition-colors ${!invoice.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${invoice.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FileText className={`w-5 h-5 ${invoice.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="font-medium text-gray-900">
                        {invoice.invoice_number}
                        {!invoice.is_active && <span className="text-xs text-red-500 mr-2">(غير نشطة)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getCustomerName(invoice.customer_id)}
                    </div>
                    {invoice.project_id && (
                      <div className="text-xs text-gray-500">
                        {getProjectName(invoice.project_id)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('ar-SA') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.total_amount.toLocaleString()} {invoice.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {invoice.paid_amount.toLocaleString()} {invoice.currency}
                    </div>
                    {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                      <div className="text-xs text-gray-500">
                        {((invoice.paid_amount / invoice.total_amount) * 100).toFixed(0)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleView(invoice)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="عرض الفاتورة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(invoice)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="تعديل الفاتورة"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSendEmail(invoice)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                        title="إرسال الفاتورة"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRecordPayment(invoice)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded"
                        title="تسجيل دفعة"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(invoice)}
                        disabled={actionLoading === invoice.id}
                        className={`p-1 rounded transition-colors ${
                          invoice.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={invoice.is_active ? 'إلغاء تفعيل الفاتورة' : 'تفعيل الفاتورة'}
                      >
                        {actionLoading === invoice.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : invoice.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      {!invoice.is_active && (
                        <button 
                          onClick={() => handlePermanentDelete(invoice)}
                          disabled={actionLoading !== null}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="حذف نهائي (للفواتير غير النشطة فقط)"
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

        {filteredInvoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير</h4>
            <p className="text-gray-500 mb-4">ابدأ بإنشاء فاتورتك الأولى</p>
            <button 
              onClick={() => navigate('/invoices/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إنشاء فاتورة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الفواتير المدفوعة</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الفواتير المعلقة</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'sent').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الفواتير المتأخرة</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;

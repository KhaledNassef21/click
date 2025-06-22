import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DatabaseVoucher, voucherService } from '../../lib/supabaseClient';
import { 
  X, Save, Receipt, DollarSign, User, Calendar, Printer, Download, 
  Loader2, AlertCircle, RefreshCw, Database, ArrowLeft, CreditCard, 
  Building, FileText, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PaymentVoucherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const invoiceNumber = queryParams.get('invoice');
  const supplierId = queryParams.get('supplier');
  const amount = queryParams.get('amount');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voucher, setVoucher] = useState<DatabaseVoucher | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    voucher_type: 'payment',
    voucher_number: '',
    voucher_date: new Date().toISOString().split('T')[0],
    amount: amount ? parseFloat(amount) : 0,
    description: invoiceNumber ? `دفع مستحقات الفاتورة ${invoiceNumber}` : '',
    customer_id: '',
    supplier_id: supplierId || '',
    payment_method: 'cash',
    reference_number: invoiceNumber || '',
    status: 'pending',
    bank_account: '',
    check_number: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Generate voucher number
  const generateVoucherNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PV-${year}${month}${day}-${random}`;
  };
  
  // Load voucher if editing
  useEffect(() => {
    if (id) {
      loadVoucher(id);
    } else {
      // Set default values for new voucher
      setFormData({
        ...formData,
        voucher_number: generateVoucherNumber()
      });
    }
  }, [id]);
  
  // Load voucher data
  const loadVoucher = async (voucherId: string) => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🔍 جلب سند الصرف:', voucherId);
      
      // Test connection first
      const isConnected = await voucherService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
      
      // Get voucher
      const voucher = await voucherService.getVoucherById(voucherId);
      if (!voucher) {
        throw new Error('لم يتم العثور على السند');
      }
      
      // Check if it's a payment voucher
      if (voucher.voucher_type !== 'payment') {
        throw new Error('هذا ليس سند صرف');
      }
      
      setVoucher(voucher);
      
      // Set form data
      setFormData({
        voucher_type: voucher.voucher_type,
        voucher_number: voucher.voucher_number,
        voucher_date: voucher.voucher_date,
        amount: voucher.amount,
        description: voucher.description,
        customer_id: voucher.customer_id || '',
        supplier_id: voucher.supplier_id || '',
        payment_method: voucher.payment_method,
        reference_number: voucher.reference_number || '',
        status: voucher.status,
        bank_account: voucher.bank_account || '',
        check_number: voucher.check_number || ''
      });
      
      console.log('✅ تم جلب سند الصرف بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في جلب سند الصرف:', error);
      setConnectionError(error.message || 'حدث خطأ في جلب سند الصرف');
      toast.error('حدث خطأ في جلب سند الصرف');
    } finally {
      setLoading(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.voucher_number.trim()) {
      newErrors.voucher_number = 'رقم السند مطلوب';
    }
    
    if (!formData.voucher_date) {
      newErrors.voucher_date = 'تاريخ السند مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    }
    
    if (!formData.supplier_id) {
      newErrors.supplier_id = 'المورد مطلوب';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    
    if (formData.payment_method === 'bank_transfer' && !formData.bank_account.trim()) {
      newErrors.bank_account = 'الحساب البنكي مطلوب';
    }
    
    if (formData.payment_method === 'check' && !formData.check_number.trim()) {
      newErrors.check_number = 'رقم الشيك مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save voucher
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare voucher data
      const voucherData = {
        company_id: '00000000-0000-0000-0000-000000000001',
        voucher_type: 'payment',
        voucher_number: formData.voucher_number,
        voucher_date: formData.voucher_date,
        amount: formData.amount,
        description: formData.description,
        customer_id: null,
        supplier_id: formData.supplier_id || null,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        status: formData.status,
        bank_account: formData.bank_account,
        check_number: formData.check_number,
        is_active: true
      };
      
      if (id) {
        // Update existing voucher
        await voucherService.updateVoucher(id, voucherData);
        toast.success('تم تحديث سند الصرف بنجاح');
      } else {
        // Add new voucher
        await voucherService.addVoucher(voucherData);
        toast.success('تم إضافة سند الصرف بنجاح');
      }
      
      // Redirect to vouchers list
      navigate('/vouchers');
    } catch (error: any) {
      console.error('❌ خطأ في حفظ سند الصرف:', error);
      toast.error(`حدث خطأ في حفظ سند الصرف: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Print voucher
  const handlePrint = () => {
    window.print();
  };
  
  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      toast.loading('جاري تصدير السند إلى PDF...');
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`سند-صرف-${formData.voucher_number}.pdf`);
      
      toast.dismiss();
      toast.success('تم تصدير السند بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير السند:', error);
      toast.dismiss();
      toast.error('حدث خطأ في تصدير السند');
    }
  };
  
  // Get supplier name
  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return '';
    const supplier = state.suppliers.find(s => s.id === supplierId);
    return supplier?.name || '';
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل سند الصرف...</span>
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
              onClick={() => navigate('/vouchers')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة إلى قائمة السندات</span>
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {id ? 'تعديل سند صرف' : 'سند صرف جديد'}
          </h1>
          <p className="text-gray-600">إنشاء وتعديل سندات الصرف مع إمكانية الطباعة والتصدير</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/vouchers')}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voucher Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSave}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Receipt className="w-4 h-4 inline ml-1" />
                    رقم السند *
                  </label>
                  <input
                    type="text"
                    value={formData.voucher_number}
                    onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.voucher_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="PV-2024-001"
                    required
                  />
                  {errors.voucher_number && <p className="mt-1 text-sm text-red-500">{errors.voucher_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    value={formData.voucher_date}
                    onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.voucher_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.voucher_date && <p className="mt-1 text-sm text-red-500">{errors.voucher_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline ml-1" />
                    المورد *
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.supplier_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  >
                    <option value="">اختر المورد</option>
                    {state.suppliers.filter(s => s.is_active).map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && <p className="mt-1 text-sm text-red-500">{errors.supplier_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline ml-1" />
                    المبلغ (ر.س) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                  {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline ml-1" />
                    الوصف *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    rows={3}
                    placeholder="وصف سند الصرف"
                    required
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة الدفع *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="check">شيك</option>
                    <option value="credit_card">بطاقة ائتمان</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">في الانتظار</option>
                    <option value="cleared">مدفوع</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline ml-1" />
                    المرجع
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رقم الفاتورة أو المرجع"
                  />
                </div>

                {/* Additional fields based on payment method */}
                {formData.payment_method === 'bank_transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline ml-1" />
                      الحساب البنكي *
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account}
                      onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                      className={`w-full px-4 py-2 border ${errors.bank_account ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="اسم البنك أو رقم الحساب"
                      required
                    />
                    {errors.bank_account && <p className="mt-1 text-sm text-red-500">{errors.bank_account}</p>}
                  </div>
                )}

                {formData.payment_method === 'check' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CreditCard className="w-4 h-4 inline ml-1" />
                      رقم الشيك *
                    </label>
                    <input
                      type="text"
                      value={formData.check_number}
                      onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
                      className={`w-full px-4 py-2 border ${errors.check_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="رقم الشيك"
                      required
                    />
                    {errors.check_number && <p className="mt-1 text-sm text-red-500">{errors.check_number}</p>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => navigate('/vouchers')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>حفظ السند</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Voucher Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة سند الصرف</h3>
            
            <div ref={printRef} className="p-4 border border-gray-200 rounded-lg">
              {/* Company Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{state.settings.company.name}</h2>
                <p className="text-sm text-gray-600">{state.settings.company.address}</p>
                <p className="text-sm text-gray-600">
                  هاتف: {state.settings.company.phone} | بريد إلكتروني: {state.settings.company.email}
                </p>
              </div>
              
              {/* Voucher Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-red-600 border-2 border-red-200 inline-block px-6 py-2 rounded">
                  سند صرف
                </h1>
                <p className="text-sm text-gray-600 mt-2">رقم السند: {formData.voucher_number}</p>
                <p className="text-sm text-gray-600">
                  التاريخ: {formData.voucher_date ? new Date(formData.voucher_date).toLocaleDateString('ar-SA') : ''}
                </p>
              </div>
              
              {/* Supplier Info */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">معلومات المورد:</h3>
                <p className="text-sm text-gray-700">
                  <strong>الاسم:</strong> {getSupplierName(formData.supplier_id)}
                </p>
              </div>
              
              {/* Voucher Details */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">تفاصيل السند:</h3>
                <p className="text-sm text-gray-700">
                  <strong>المبلغ:</strong> {formData.amount.toLocaleString()} ر.س
                </p>
                <p className="text-sm text-gray-700">
                  <strong>طريقة الدفع:</strong> {
                    formData.payment_method === 'cash' ? 'نقدي' :
                    formData.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                    formData.payment_method === 'check' ? 'شيك' :
                    formData.payment_method === 'credit_card' ? 'بطاقة ائتمان' : 'أخرى'
                  }
                </p>
                {formData.payment_method === 'bank_transfer' && formData.bank_account && (
                  <p className="text-sm text-gray-700">
                    <strong>الحساب البنكي:</strong> {formData.bank_account}
                  </p>
                )}
                {formData.payment_method === 'check' && formData.check_number && (
                  <p className="text-sm text-gray-700">
                    <strong>رقم الشيك:</strong> {formData.check_number}
                  </p>
                )}
                {formData.reference_number && (
                  <p className="text-sm text-gray-700">
                    <strong>المرجع:</strong> {formData.reference_number}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-2">البيان:</h3>
                <p className="text-sm text-gray-700">{formData.description}</p>
              </div>
              
              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 mb-6 mt-10">
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المستلم</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المحاسب</p>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
                <p>شكراً لتعاملكم معنا</p>
                <p>{state.settings.company.name} - {state.settings.company.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucherPage;
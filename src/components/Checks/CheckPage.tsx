import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DatabaseCheck, checkService } from '../../lib/supabaseClient';
import { 
  X, Save, CreditCard, DollarSign, User, Calendar, Building, Printer, 
  Download, Loader2, AlertCircle, RefreshCw, Database, ArrowLeft, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const CheckPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [check, setCheck] = useState<DatabaseCheck | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    check_type: 'received',
    check_number: '',
    check_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    payee: '',
    bank_name: '',
    account_number: '',
    status: 'pending',
    customer_id: '',
    supplier_id: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Load check if editing
  useEffect(() => {
    if (id) {
      loadCheck(id);
    }
  }, [id]);
  
  // Load check data
  const loadCheck = async (checkId: string) => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🔍 جلب الشيك:', checkId);
      
      // Test connection first
      const isConnected = await checkService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
      
      // Get check
      const check = await checkService.getCheckById(checkId);
      if (!check) {
        throw new Error('لم يتم العثور على الشيك');
      }
      
      setCheck(check);
      
      // Set form data
      setFormData({
        check_type: check.check_type,
        check_number: check.check_number,
        check_date: check.check_date,
        due_date: check.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: check.amount,
        payee: check.payee,
        bank_name: check.bank_name,
        account_number: check.account_number || '',
        status: check.status,
        customer_id: check.customer_id || '',
        supplier_id: check.supplier_id || '',
        notes: check.notes || ''
      });
      
      console.log('✅ تم جلب الشيك بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في جلب الشيك:', error);
      setConnectionError(error.message || 'حدث خطأ في جلب الشيك');
      toast.error('حدث خطأ في جلب الشيك');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle check type change
  const handleCheckTypeChange = (type: string) => {
    setFormData({
      ...formData,
      check_type: type,
      // Reset the party based on type
      customer_id: type === 'received' ? formData.customer_id : '',
      supplier_id: type === 'issued' ? formData.supplier_id : ''
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.check_number.trim()) {
      newErrors.check_number = 'رقم الشيك مطلوب';
    }
    
    if (!formData.check_date) {
      newErrors.check_date = 'تاريخ الشيك مطلوب';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'تاريخ الاستحقاق مطلوب';
    }
    
    if (!formData.payee.trim()) {
      newErrors.payee = 'اسم المستفيد/الدافع مطلوب';
    }
    
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'اسم البنك مطلوب';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    
    if (formData.check_type === 'received' && !formData.customer_id) {
      newErrors.customer_id = 'العميل مطلوب للشيكات المقبوضة';
    }
    
    if (formData.check_type === 'issued' && !formData.supplier_id) {
      newErrors.supplier_id = 'المورد مطلوب للشيكات المدفوعة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save check
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare check data
      const checkData = {
        company_id: '00000000-0000-0000-0000-000000000001',
        check_type: formData.check_type,
        check_number: formData.check_number,
        check_date: formData.check_date,
        due_date: formData.due_date,
        amount: formData.amount,
        payee: formData.payee,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        customer_id: formData.check_type === 'received' ? formData.customer_id : null,
        supplier_id: formData.check_type === 'issued' ? formData.supplier_id : null,
        status: formData.status,
        notes: formData.notes,
        is_active: true
      };
      
      if (id) {
        // Update existing check
        await checkService.updateCheck(id, checkData);
        toast.success('تم تحديث الشيك بنجاح');
      } else {
        // Add new check
        await checkService.addCheck(checkData);
        toast.success('تم إضافة الشيك بنجاح');
      }
      
      // Redirect to checks list
      navigate('/checks');
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الشيك:', error);
      toast.error(`حدث خطأ في حفظ الشيك: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Print check
  const handlePrint = () => {
    window.print();
  };
  
  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      toast.loading('جاري تصدير الشيك إلى PDF...');
      
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
      pdf.save(`شيك-${formData.check_number}.pdf`);
      
      toast.dismiss();
      toast.success('تم تصدير الشيك بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير الشيك:', error);
      toast.dismiss();
      toast.error('حدث خطأ في تصدير الشيك');
    }
  };
  
  // Get customer name
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '';
    const customer = state.customers.find(c => c.id === customerId);
    return customer?.name || '';
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
          <span className="text-gray-600">جاري تحميل الشيك...</span>
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
              onClick={() => navigate('/checks')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة إلى قائمة الشيكات</span>
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
            {id ? 'تعديل الشيك' : 'شيك جديد'}
          </h1>
          <p className="text-gray-600">إنشاء وتعديل الشيكات مع إمكانية الطباعة والتصدير</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/checks')}
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
        {/* Check Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSave}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الشيك *
                  </label>
                  <div className="flex space-x-4 space-x-reverse">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="received"
                        name="check_type"
                        value="received"
                        checked={formData.check_type === 'received'}
                        onChange={() => handleCheckTypeChange('received')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="received" className="mr-2 text-sm font-medium text-gray-700">
                        شيك مقبوض
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="issued"
                        name="check_type"
                        value="issued"
                        checked={formData.check_type === 'issued'}
                        onChange={() => handleCheckTypeChange('issued')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="issued" className="mr-2 text-sm font-medium text-gray-700">
                        شيك مدفوع
                      </label>
                    </div>
                  </div>
                </div>

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
                    placeholder="123456"
                    required
                  />
                  {errors.check_number && <p className="mt-1 text-sm text-red-500">{errors.check_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    تاريخ الشيك *
                  </label>
                  <input
                    type="date"
                    value={formData.check_date}
                    onChange={(e) => setFormData({ ...formData, check_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.check_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.check_date && <p className="mt-1 text-sm text-red-500">{errors.check_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    تاريخ الاستحقاق *
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.due_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.due_date && <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline ml-1" />
                    {formData.check_type === 'received' ? 'الدافع' : 'المستفيد'} *
                  </label>
                  <input
                    type="text"
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.payee ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="اسم الشخص أو الشركة"
                    required
                  />
                  {errors.payee && <p className="mt-1 text-sm text-red-500">{errors.payee}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline ml-1" />
                    البنك *
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.bank_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="اسم البنك"
                    required
                  />
                  {errors.bank_name && <p className="mt-1 text-sm text-red-500">{errors.bank_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الحساب
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رقم الحساب (اختياري)"
                  />
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
                    <option value="cleared">مقبوض</option>
                    <option value="bounced">مرتد</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>

                {/* Customer/Supplier Selection */}
                {formData.check_type === 'received' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline ml-1" />
                      العميل *
                    </label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className={`w-full px-4 py-2 border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    >
                      <option value="">اختر العميل</option>
                      {state.customers.filter(c => c.is_active).map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    {errors.customer_id && <p className="mt-1 text-sm text-red-500">{errors.customer_id}</p>}
                  </div>
                )}

                {formData.check_type === 'issued' && (
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
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => navigate('/checks')}
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
                    <span>حفظ الشيك</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Check Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة الشيك</h3>
            
            <div ref={printRef} className="p-4 border border-gray-200 rounded-lg">
              {/* Company Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{state.settings.company.name}</h2>
                <p className="text-sm text-gray-600">{state.settings.company.address}</p>
                <p className="text-sm text-gray-600">
                  هاتف: {state.settings.company.phone} | بريد إلكتروني: {state.settings.company.email}
                </p>
              </div>
              
              {/* Check Title */}
              <div className="text-center mb-6">
                <h1 className={`text-2xl font-bold ${formData.check_type === 'received' ? 'text-green-600 border-2 border-green-200' : 'text-blue-600 border-2 border-blue-200'} inline-block px-6 py-2 rounded`}>
                  {formData.check_type === 'received' ? 'شيك مقبوض' : 'شيك مدفوع'}
                </h1>
                <p className="text-sm text-gray-600 mt-2">رقم الشيك: {formData.check_number}</p>
              </div>
              
              {/* Check Details */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">تفاصيل الشيك:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm text-gray-700">
                    <strong>تاريخ الشيك:</strong> {formData.check_date ? new Date(formData.check_date).toLocaleDateString('ar-SA') : ''}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>تاريخ الاستحقاق:</strong> {formData.due_date ? new Date(formData.due_date).toLocaleDateString('ar-SA') : ''}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>المبلغ:</strong> {formData.amount.toLocaleString()} ر.س
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>البنك:</strong> {formData.bank_name}
                  </p>
                  {formData.account_number && (
                    <p className="text-sm text-gray-700 col-span-2">
                      <strong>رقم الحساب:</strong> {formData.account_number}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Party Info */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                {formData.check_type === 'received' ? (
                  <>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">معلومات العميل:</h3>
                    <p className="text-sm text-gray-700">
                      <strong>العميل:</strong> {getCustomerName(formData.customer_id)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>الدافع:</strong> {formData.payee}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">معلومات المورد:</h3>
                    <p className="text-sm text-gray-700">
                      <strong>المورد:</strong> {getSupplierName(formData.supplier_id)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>المستفيد:</strong> {formData.payee}
                    </p>
                  </>
                )}
              </div>
              
              {/* Status */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">حالة الشيك:</h3>
                <p className="text-sm text-gray-700">
                  <strong>الحالة:</strong> {
                    formData.status === 'pending' ? 'في الانتظار' :
                    formData.status === 'cleared' ? 'مقبوض' :
                    formData.status === 'bounced' ? 'مرتد' :
                    formData.status === 'cancelled' ? 'ملغي' : formData.status
                  }
                </p>
              </div>
              
              {/* Notes */}
              {formData.notes && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">ملاحظات:</h3>
                  <p className="text-sm text-gray-700">{formData.notes}</p>
                </div>
              )}
              
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

export default CheckPage;
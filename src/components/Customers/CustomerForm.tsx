import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseCustomer } from '../../lib/supabaseClient';
import { X, Save, User, Mail, Phone, MapPin, CreditCard, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerFormProps {
  customer?: DatabaseCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: any) => void;
  loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    arabic_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    postal_code: '',
    tax_number: '',
    commercial_register: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    credit_limit: 0,
    payment_terms: 30,
    currency: 'SAR',
    notes: '',
    is_active: true,
    customer_code: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (customer) {
      console.log('🔄 تحميل بيانات العميل للتعديل:', customer.name);
      setFormData({
        name: customer.name || '',
        arabic_name: customer.arabic_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        mobile: customer.mobile || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || 'Saudi Arabia',
        postal_code: customer.postal_code || '',
        tax_number: customer.tax_number || '',
        commercial_register: customer.commercial_register || '',
        contact_person: customer.contact_person || '',
        contact_email: customer.contact_email || '',
        contact_phone: customer.contact_phone || '',
        credit_limit: customer.credit_limit || 0,
        payment_terms: customer.payment_terms || 30,
        currency: customer.currency || 'SAR',
        notes: customer.notes || '',
        is_active: customer.is_active,
        customer_code: customer.customer_code || ''
      });
    } else {
      console.log('🆕 إعداد فورم عميل جديد');
      // Reset form for new customer
      setFormData({
        name: '',
        arabic_name: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        country: 'Saudi Arabia',
        postal_code: '',
        tax_number: '',
        commercial_register: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        credit_limit: 0,
        payment_terms: 30,
        currency: 'SAR',
        notes: '',
        is_active: true,
        customer_code: ''
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم العميل مطلوب';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'بريد شخص الاتصال غير صالح';
    }
    
    if (formData.credit_limit < 0) {
      newErrors.credit_limit = 'حد الائتمان لا يمكن أن يكون سالباً';
    }
    
    if (formData.payment_terms < 0) {
      newErrors.payment_terms = 'شروط الدفع لا يمكن أن تكون سالبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCustomerCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CUST-${timestamp}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ العميل...');
      
      // Prepare customer data for database
      const customerData = {
        ...formData,
        // Generate customer code if not provided and it's a new customer
        customer_code: formData.customer_code || (!customer ? generateCustomerCode() : undefined),
        // Ensure required fields have default values
        currency: formData.currency || 'SAR',
        payment_terms: formData.payment_terms || 30,
        credit_limit: formData.credit_limit || 0,
        country: formData.country || 'Saudi Arabia'
      };

      console.log('📋 بيانات العميل المرسلة:', {
        name: customerData.name,
        email: customerData.email,
        customer_code: customerData.customer_code,
        is_new: !customer
      });

      // Call the onSave function passed from parent component
      await onSave(customerData);
      
      console.log('✅ تم حفظ العميل بنجاح');
      
      // Reset form if it's a new customer
      if (!customer) {
        setFormData({
          name: '',
          arabic_name: '',
          email: '',
          phone: '',
          mobile: '',
          address: '',
          city: '',
          country: 'Saudi Arabia',
          postal_code: '',
          tax_number: '',
          commercial_register: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          credit_limit: 0,
          payment_terms: 30,
          currency: 'SAR',
          notes: '',
          is_active: true,
          customer_code: ''
        });
      }
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ العميل:', error);
      toast.error(`حدث خطأ في حفظ العميل: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? 'تعديل العميل' : 'إضافة عميل جديد'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline ml-1" />
                  اسم العميل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="أدخل اسم العميل"
                  required
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالعربية
                </label>
                <input
                  type="text"
                  value={formData.arabic_name}
                  onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الاسم بالعربية"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز العميل
                </label>
                <input
                  type="text"
                  value={formData.customer_code}
                  onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="سيتم إنشاؤه تلقائياً إذا ترك فارغاً"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {!formData.customer_code && !customer && "سيتم إنشاء رمز تلقائياً"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="example@email.com"
                  disabled={loading}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-11-XXX-XXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-5X-XXX-XXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline ml-1" />
                  الرقم الضريبي
                </label>
                <input
                  type="text"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="300XXXXXXXXX003"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السجل التجاري
                </label>
                <input
                  type="text"
                  value={formData.commercial_register}
                  onChange={(e) => setFormData({ ...formData, commercial_register: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1010XXXXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الرياض"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البلد
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="Saudi Arabia">المملكة العربية السعودية</option>
                  <option value="UAE">الإمارات العربية المتحدة</option>
                  <option value="Kuwait">الكويت</option>
                  <option value="Qatar">قطر</option>
                  <option value="Bahrain">البحرين</option>
                  <option value="Oman">عمان</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرمز البريدي
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  العنوان
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="أدخل العنوان الكامل"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات شخص الاتصال</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم شخص الاتصال
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم شخص الاتصال"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بريد شخص الاتصال
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.contact_email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="contact@email.com"
                  disabled={loading}
                />
                {errors.contact_email && <p className="mt-1 text-sm text-red-500">{errors.contact_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هاتف شخص الاتصال
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-5X-XXX-XXXX"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات المالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline ml-1" />
                  حد الائتمان (ر.س)
                </label>
                <input
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.credit_limit ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
                {errors.credit_limit && <p className="mt-1 text-sm text-red-500">{errors.credit_limit}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شروط الدفع (يوم)
                </label>
                <input
                  type="number"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) || 30 })}
                  className={`w-full px-4 py-2 border ${errors.payment_terms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="30"
                  min="0"
                  disabled={loading}
                />
                {errors.payment_terms && <p className="mt-1 text-sm text-red-500">{errors.payment_terms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes and Status */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملاحظات إضافية عن العميل"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="mr-2 text-sm font-medium text-gray-700">
                  عميل نشط
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{customer ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
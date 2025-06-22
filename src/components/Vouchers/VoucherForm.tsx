import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseVoucher } from '../../lib/supabaseClient';
import { X, Save, Receipt, DollarSign, User, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoucherFormProps {
  voucher?: DatabaseVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: any) => void;
  loading?: boolean;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ voucher, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    voucher_type: 'receipt',
    voucher_number: '',
    voucher_date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    customer_id: '',
    supplier_id: '',
    payment_method: 'cash',
    reference_number: '',
    status: 'pending',
    bank_account: '',
    check_number: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (voucher) {
      console.log('🔄 تحميل بيانات السند للتعديل:', voucher.voucher_number);
      setFormData({
        voucher_type: voucher.voucher_type || 'receipt',
        voucher_number: voucher.voucher_number || '',
        voucher_date: voucher.voucher_date || new Date().toISOString().split('T')[0],
        amount: voucher.amount || 0,
        description: voucher.description || '',
        customer_id: voucher.customer_id || '',
        supplier_id: voucher.supplier_id || '',
        payment_method: voucher.payment_method || 'cash',
        reference_number: voucher.reference_number || '',
        status: voucher.status || 'pending',
        bank_account: voucher.bank_account || '',
        check_number: voucher.check_number || ''
      });
    } else {
      console.log('🆕 إعداد فورم سند جديد');
      // Reset form for new voucher
      setFormData({
        voucher_type: 'receipt',
        voucher_number: generateVoucherNumber('receipt'),
        voucher_date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        customer_id: '',
        supplier_id: '',
        payment_method: 'cash',
        reference_number: '',
        status: 'pending',
        bank_account: '',
        check_number: ''
      });
    }
    setErrors({});
  }, [voucher, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.voucher_number.trim()) {
      newErrors.voucher_number = 'رقم السند مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    
    if (formData.voucher_type === 'receipt' && !formData.customer_id) {
      newErrors.customer_id = 'يجب اختيار العميل لسند القبض';
    }
    
    if (formData.voucher_type === 'payment' && !formData.supplier_id) {
      newErrors.supplier_id = 'يجب اختيار المورد لسند الصرف';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateVoucherNumber = (type: string) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    if (type === 'receipt') {
      return `RV-${year}${month}${day}-${random}`;
    } else {
      return `PV-${year}${month}${day}-${random}`;
    }
  };

  const handleVoucherTypeChange = (type: string) => {
    setFormData({
      ...formData,
      voucher_type: type,
      voucher_number: generateVoucherNumber(type),
      // Reset the party based on type
      customer_id: type === 'receipt' ? formData.customer_id : '',
      supplier_id: type === 'payment' ? formData.supplier_id : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ السند...');
      
      // Prepare voucher data for database
      const voucherData = {
        ...formData,
        // Convert empty strings to null for UUID fields
        customer_id: formData.customer_id || null,
        supplier_id: formData.supplier_id || null
      };

      console.log('📋 بيانات السند المرسلة:', {
        voucher_number: voucherData.voucher_number,
        voucher_type: voucherData.voucher_type,
        amount: voucherData.amount,
        customer_id: voucherData.customer_id,
        supplier_id: voucherData.supplier_id,
        is_new: !voucher
      });

      // Call the onSave function passed from parent component
      await onSave(voucherData);
      
      console.log('✅ تم حفظ السند بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ السند:', error);
      toast.error(`حدث خطأ في حفظ السند: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {voucher ? 'تعديل السند' : 'سند جديد'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع السند *
              </label>
              <div className="flex space-x-4 space-x-reverse">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="receipt"
                    name="voucher_type"
                    value="receipt"
                    checked={formData.voucher_type === 'receipt'}
                    onChange={() => handleVoucherTypeChange('receipt')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="receipt" className="mr-2 text-sm font-medium text-gray-700">
                    سند قبض
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="payment"
                    name="voucher_type"
                    value="payment"
                    checked={formData.voucher_type === 'payment'}
                    onChange={() => handleVoucherTypeChange('payment')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="payment" className="mr-2 text-sm font-medium text-gray-700">
                    سند صرف
                  </label>
                </div>
              </div>
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
                disabled={loading}
              />
              {errors.voucher_date && <p className="mt-1 text-sm text-red-500">{errors.voucher_date}</p>}
            </div>

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
                placeholder={formData.voucher_type === 'receipt' ? 'RV-2024-001' : 'PV-2024-001'}
                required
                disabled={loading}
              />
              {errors.voucher_number && <p className="mt-1 text-sm text-red-500">{errors.voucher_number}</p>}
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
                min="0"
                required
                disabled={loading}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                rows={3}
                placeholder="وصف السند"
                required
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Customer/Supplier Selection */}
            {formData.voucher_type === 'receipt' ? (
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
                  disabled={loading}
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline ml-1" />
                  المورد *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.supplier_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  disabled={loading}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
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
                disabled={loading}
              >
                <option value="pending">في الانتظار</option>
                <option value="cleared">مقبوض/مدفوع</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المرجع
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رقم الفاتورة أو المرجع"
                disabled={loading}
              />
            </div>

            {/* Additional fields based on payment method */}
            {formData.payment_method === 'bank_transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحساب البنكي
                </label>
                <input
                  type="text"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم البنك أو رقم الحساب"
                  disabled={loading}
                />
              </div>
            )}

            {formData.payment_method === 'check' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الشيك
                </label>
                <input
                  type="text"
                  value={formData.check_number}
                  onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="رقم الشيك"
                  disabled={loading}
                />
              </div>
            )}
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
              <span>{voucher ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherForm;